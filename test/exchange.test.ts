/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { getSigners, getSigner } from '@alephium/web3-test'
import {
  Address,
  web3,
  ONE_ALPH,
  DUST_AMOUNT,
  NodeProvider,
  isDepositALPHTransaction,
  getDepositAddress,
  prettifyAttoAlphAmount,
  Subscription,
  node,
  sleep
} from '@alephium/web3'
import { waitTxConfirmed } from '@alephium/cli'
import { randomInt } from 'crypto'

class User {
  private readonly wallet: PrivateKeyWallet
  readonly address: Address
  private depositTxs: string[]
  private depositAmount: bigint

  constructor(wallet: PrivateKeyWallet) {
    this.wallet = wallet
    this.address = wallet.address
    this.depositTxs = []
    this.depositAmount = 0n
  }

  async deposit(toAddress: Address, amount: bigint) {
    const result = await this.wallet.signAndSubmitTransferTx({
      signerAddress: this.wallet.address,
      destinations: [{ address: toAddress, attoAlphAmount: amount }]
    })
    await waitTxConfirmed(web3.getCurrentNodeProvider(), result.txId, 1, 1000)
    this.depositTxs.push(result.txId)
    this.depositAmount += amount
  }

  getDepositTxs(): string[] {
    return this.depositTxs
  }

  getDepositAmount(): bigint {
    return this.depositAmount
  }
}

class Exchange extends Subscription<node.BlockEntry> {
  readonly nodeProvider: NodeProvider
  readonly wallet: PrivateKeyWallet
  private depositTxs: { txId: string; from: Address }[]
  readonly fromGroup: number
  private fromBlockHeight: number

  constructor(nodeProvider: NodeProvider, wallet: PrivateKeyWallet, fromGroup: number, fromBlockHeight: number) {
    super({
      pollingInterval: 1000,
      messageCallback: () => Promise.resolve(),
      errorCallback: (err) => {
        console.error(err)
        return Promise.resolve()
      }
    })
    this.nodeProvider = nodeProvider
    this.wallet = wallet
    this.depositTxs = []
    this.fromGroup = fromGroup
    this.fromBlockHeight = fromBlockHeight
    this.startPolling()
  }

  async handleBlock(block: node.BlockEntry): Promise<void> {
    block.transactions.forEach((tx) => {
      if (isDepositALPHTransaction(tx, this.wallet.address)) {
        const from = getDepositAddress(tx)
        this.depositTxs.push({ txId: tx.unsigned.txId, from })
      }
    })
    return Promise.resolve()
  }

  override startPolling(): void {
    this.eventEmitter.on('tick', async () => {
      await this.polling()
    })
    this.eventEmitter.emit('tick')
  }

  override async polling(): Promise<void> {
    try {
      const chainInfo = await this.nodeProvider.blockflow.getBlockflowChainInfo({
        fromGroup: this.fromGroup,
        toGroup: this.wallet.group
      })
      if (this.cancelled) {
        return
      }

      while (this.fromBlockHeight <= chainInfo.currentHeight) {
        const result = await this.nodeProvider.blockflow.getBlockflowHashes({
          fromGroup: this.fromGroup,
          toGroup: this.wallet.group,
          height: this.fromBlockHeight
        })
        const block = await this.nodeProvider.blockflow.getBlockflowBlocksBlockHash(result.headers[0])
        await this.handleBlock(block)
        this.fromBlockHeight += 1
      }
      this.task = setTimeout(() => this.eventEmitter.emit('tick'), this.pollingInterval)
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }

  getDepositTxs(): { txId: string; from: Address }[] {
    return this.depositTxs
  }
}

describe('exchange', function () {
  function randomBigInt(min: bigint, max: bigint): bigint {
    const amount = max - min
    const length = amount.toString().length
    let multiplier = ''
    while (multiplier.length < length) {
      multiplier += Math.random().toString().split('.')[1]
    }
    multiplier = multiplier.slice(0, length)
    return (amount * BigInt(multiplier)) / 10n ** BigInt(length) + min
  }

  async function getGasFee(txIds: string[]): Promise<bigint> {
    const nodeProvider = web3.getCurrentNodeProvider()
    let totalGasFee = 0n
    for (const txId of txIds) {
      const transaction = await nodeProvider.transactions.getTransactionsDetailsTxid(txId)
      const gasFee = BigInt(transaction.unsigned.gasAmount) * BigInt(transaction.unsigned.gasPrice)
      totalGasFee += gasFee
    }
    return totalGasFee
  }

  it('should test exchange', async () => {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    web3.setCurrentNodeProvider(nodeProvider)
    const initialBalance = ONE_ALPH * 100n
    const users = (await getSigners(20, initialBalance)).map((key) => new User(key))

    const exchangeWallet = await getSigner(initialBalance)
    const chainInfo = await nodeProvider.blockflow.getBlockflowChainInfo({ fromGroup: 0, toGroup: 0 })
    const exchange = new Exchange(nodeProvider, exchangeWallet, 0, chainInfo.currentHeight + 1)

    const totalTxNumber = 100
    let txCount = 0
    while (txCount < totalTxNumber) {
      const user = users[randomInt(0, 20)]
      const balance = BigInt((await nodeProvider.addresses.getAddressesAddressBalance(user.address)).balance)
      if (balance < ONE_ALPH || balance - ONE_ALPH < DUST_AMOUNT) {
        continue
      }

      const depositAmount = randomBigInt(DUST_AMOUNT, (balance - ONE_ALPH) / 2n)
      console.log(`deposit ${prettifyAttoAlphAmount(depositAmount)} from ${user.address}`)
      await user.deposit(exchangeWallet.address, depositAmount)
      txCount += 1
    }

    async function waitForCollectTxs() {
      const depositTxs = exchange.getDepositTxs()
      if (depositTxs.length < totalTxNumber) {
        await sleep(1000)
        await waitForCollectTxs()
      }
      return
    }

    await waitForCollectTxs()
    exchange.unsubscribe()

    // check deposit txs
    const depositTxs = exchange.getDepositTxs()
    expect(depositTxs.length).toEqual(totalTxNumber)
    for (const user of users) {
      const txsByUser = depositTxs.filter((tx) => tx.from === user.address).map((tx) => tx.txId)
      expect(txsByUser).toEqual(user.getDepositTxs())
    }

    // check balances
    let totalDepositAmount = 0n
    for (const user of users) {
      const depositAmount = user.getDepositAmount()
      totalDepositAmount += user.getDepositAmount()
      const txsByUser = user.getDepositTxs()
      const gasFee = await getGasFee(txsByUser)
      const balance = await nodeProvider.addresses.getAddressesAddressBalance(user.address)
      expect(BigInt(balance.balance)).toEqual(initialBalance - depositAmount - gasFee)
    }
    const exchangeBalance = await nodeProvider.addresses.getAddressesAddressBalance(exchangeWallet.address)
    expect(BigInt(exchangeBalance.balance)).toEqual(initialBalance + totalDepositAmount)
  }, 300000)
})
