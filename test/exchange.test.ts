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

import { PrivateKeyWallet, deriveHDWalletPrivateKey } from '@alephium/web3-wallet'
import { getSigners, transfer, testPrivateKey } from '@alephium/web3-test'
import {
  Address,
  web3,
  ONE_ALPH,
  NodeProvider,
  isSimpleALPHTransferTx,
  prettifyAttoAlphAmount,
  Subscription,
  node,
  sleep,
  TOTAL_NUMBER_OF_GROUPS,
  ALPH_TOKEN_ID,
  DEFAULT_GAS_AMOUNT,
  DEFAULT_GAS_PRICE,
  getSenderAddress,
  getALPHDepositInfo
} from '@alephium/web3'
import { waitTxConfirmed } from '@alephium/cli'
import { EventEmitter } from 'stream'
import * as bip39 from 'bip39'

const WithdrawFee = ONE_ALPH
const DefaultTransferFee = BigInt(DEFAULT_GAS_AMOUNT) * DEFAULT_GAS_PRICE

class User {
  private readonly wallet: PrivateKeyWallet
  readonly address: Address
  readonly userId: string
  private depositTxs: string[]
  private depositAmount: bigint

  constructor(wallet: PrivateKeyWallet) {
    this.userId = wallet.address
    this.wallet = wallet
    this.address = wallet.address
    this.depositTxs = []
    this.depositAmount = 0n
  }

  async deposit(exchange: Exchange, amount: bigint) {
    const toAddress = exchange.getDepositAddress(this.userId)
    console.log(`deposit ${prettifyAttoAlphAmount(amount)} to ${toAddress}`)
    return transfer(this.wallet, toAddress, ALPH_TOKEN_ID, amount).then((result) => {
      this.depositTxs.push(result.txId)
      this.depositAmount += amount
      return result
    })
  }

  getDepositTxs(): string[] {
    return this.depositTxs
  }

  getDepositAmount(): bigint {
    return this.depositAmount
  }
}

class BlockPoller extends Subscription<node.BlockEntry> {
  readonly nodeProvider: NodeProvider
  readonly fromGroup: number
  readonly toGroup: number
  private fromBlockHeight: number

  constructor(
    nodeProvider: NodeProvider,
    fromGroup: number,
    toGroup: number,
    callback: (block: node.BlockEntry) => Promise<void>,
    fromBlockHeight: number
  ) {
    super({
      pollingInterval: 1000,
      messageCallback: callback,
      errorCallback: (err) => {
        console.error(err)
        return Promise.resolve()
      }
    })
    this.nodeProvider = nodeProvider
    this.fromGroup = fromGroup
    this.toGroup = toGroup
    this.fromBlockHeight = fromBlockHeight
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
        toGroup: this.toGroup
      })
      if (this.cancelled) {
        return
      }

      while (this.fromBlockHeight <= chainInfo.currentHeight) {
        const result = await this.nodeProvider.blockflow.getBlockflowHashes({
          fromGroup: this.fromGroup,
          toGroup: this.toGroup,
          height: this.fromBlockHeight
        })
        const block = await this.nodeProvider.blockflow.getBlockflowBlocksBlockHash(result.headers[0])
        await this.messageCallback(block)
        this.fromBlockHeight += 1
      }
      this.task = setTimeout(() => this.eventEmitter.emit('tick'), this.pollingInterval)
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }
}

class Exchange {
  readonly nodeProvider: NodeProvider
  readonly wallet: PrivateKeyWallet
  private depositTxs: { txId: string; from: Address }[]
  private withdrawTxs: { txId: string; to: Address }[]
  private eventEmitter: EventEmitter
  private hotAddressMnemonic: string
  private hotAddressPathIndexes: Map<string, number>
  private hotAddresses: Address[]

  constructor(nodeProvider: NodeProvider) {
    this.nodeProvider = nodeProvider
    this.depositTxs = []
    this.withdrawTxs = []
    this.eventEmitter = new EventEmitter()
    this.hotAddressMnemonic = bip39.generateMnemonic()
    this.wallet = this.getWalletByPathIndex(0)
    this.hotAddressPathIndexes = new Map()
    this.hotAddresses = []
  }

  async handleDepositTx(tx: node.Transaction, depositAmount: bigint) {
    const from = getSenderAddress(tx)
    const pathIndex = this.getPathIndex(from)
    const wallet = this.getWalletByPathIndex(pathIndex)
    const result = await transfer(wallet, this.wallet.address, ALPH_TOKEN_ID, BigInt(depositAmount))
    await waitTxConfirmed(this.nodeProvider, result.txId, 1, 1000)
    this.depositTxs.push({ txId: tx.unsigned.txId, from })
  }

  async handleBlock(block: node.BlockEntry) {
    for (const tx of block.transactions) {
      if (isSimpleALPHTransferTx(tx)) {
        const { targetAddress, depositAmount } = getALPHDepositInfo(tx)
        if (this.hotAddresses.includes(targetAddress)) {
          await this.handleDepositTx(tx, depositAmount)
        }
      }
    }
  }

  async startPolling(): Promise<void> {
    this.eventEmitter.on('block', (block) => this.handleBlock(block))
    const callback = (block: node.BlockEntry) => {
      this.eventEmitter.emit('block', block)
      return Promise.resolve()
    }
    for (let fromGroup = 0; fromGroup < TOTAL_NUMBER_OF_GROUPS; fromGroup++) {
      for (let toGroup = 0; toGroup < TOTAL_NUMBER_OF_GROUPS; toGroup++) {
        const chainInfo = await this.nodeProvider.blockflow.getBlockflowChainInfo({
          fromGroup: fromGroup,
          toGroup: toGroup
        })
        const poller = new BlockPoller(this.nodeProvider, fromGroup, toGroup, callback, chainInfo.currentHeight + 1)
        poller.startPolling()
      }
    }
  }

  getDepositTxs(): { txId: string; from: Address }[] {
    return this.depositTxs
  }

  registerUser(userId: string) {
    if (this.hotAddressPathIndexes.has(userId)) {
      throw new Error(`User ${userId} already exists`)
    }

    const pathIndex = this.hotAddressPathIndexes.size + 1
    this.hotAddressPathIndexes.set(userId, pathIndex)
    const wallet = this.getWalletByPathIndex(pathIndex)
    this.hotAddresses.push(wallet.address)
  }

  private getWalletByPathIndex(pathIndex: number): PrivateKeyWallet {
    const privateKey = deriveHDWalletPrivateKey(this.hotAddressMnemonic, 'default', pathIndex)
    return new PrivateKeyWallet({ privateKey, nodeProvider: this.nodeProvider })
  }

  private getPathIndex(userId: string): number {
    const pathIndex = this.hotAddressPathIndexes.get(userId)
    if (pathIndex === undefined) {
      throw new Error(`User ${userId} does not exist`)
    }
    return pathIndex
  }

  getDepositAddress(userId: string): string {
    const pathIndex = this.getPathIndex(userId)
    const wallet = this.getWalletByPathIndex(pathIndex)
    return wallet.address
  }

  async withdraw(user: User, amount: bigint) {
    const withdrawAmount = amount - WithdrawFee
    const result = await transfer(this.wallet, user.address, ALPH_TOKEN_ID, withdrawAmount)
    await waitTxConfirmed(this.nodeProvider, result.txId, 1, 1000)
    this.withdrawTxs.push({ txId: result.txId, to: user.address })
  }

  getWithdrawTxs(): { txId: string; to: Address }[] {
    return this.withdrawTxs
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

  async function waitTxsConfirmed(txIds: string[]): Promise<void> {
    const nodeProvider = web3.getCurrentNodeProvider()
    for (const txId of txIds) {
      await waitTxConfirmed(nodeProvider, txId, 1, 1000)
    }
  }

  it('should test exchange', async () => {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    web3.setCurrentNodeProvider(nodeProvider)
    const initialBalance = ONE_ALPH * 100n
    const userNumPerGroup = 10
    const userNum = userNumPerGroup * TOTAL_NUMBER_OF_GROUPS

    const exchange = new Exchange(nodeProvider)
    await transfer(
      new PrivateKeyWallet({ privateKey: testPrivateKey }),
      exchange.wallet.address,
      ALPH_TOKEN_ID,
      initialBalance
    )

    const users: User[] = []
    for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
      const signers = await getSigners(userNumPerGroup, initialBalance, group)
      for (const signer of signers) {
        exchange.registerUser(signer.address)
        const depositAddress = exchange.getDepositAddress(signer.address)
        const result = await transfer(signer, depositAddress, ALPH_TOKEN_ID, ONE_ALPH)
        await waitTxConfirmed(nodeProvider, result.txId, 1, 1000)
        users.push(new User(signer))
      }
    }

    await exchange.startPolling()

    const depositTimes = 5
    for (let i = 0; i < depositTimes; i++) {
      const promises0 = users.map((user) => {
        const amount = randomBigInt(ONE_ALPH, ONE_ALPH * 10n)
        return user.deposit(exchange, amount)
      })

      const results0 = await Promise.all(promises0)
      await waitTxsConfirmed(results0.map((result) => result.txId))
    }

    const totalTxNumber = depositTimes * userNumPerGroup * TOTAL_NUMBER_OF_GROUPS
    async function waitForCollectTxs() {
      const depositTxs = exchange.getDepositTxs()
      if (depositTxs.length < totalTxNumber) {
        await sleep(1000)
        await waitForCollectTxs()
      }
      return
    }
    await waitForCollectTxs()

    // check deposit txs
    console.log(`checking deposit txs...`)
    const depositTxs = exchange.getDepositTxs()
    expect(depositTxs.length).toEqual(totalTxNumber)
    for (const user of users) {
      const txsByUser = depositTxs.filter((tx) => tx.from === user.address).map((tx) => tx.txId)
      expect(txsByUser).toEqual(user.getDepositTxs())
    }

    // check balances
    console.log(`checking balances...`)
    let totalDepositAmount = 0n
    for (const user of users) {
      const depositAmount = user.getDepositAmount()
      totalDepositAmount += depositAmount
      const txsByUser = user.getDepositTxs()
      const gasFee = await getGasFee(txsByUser)
      const userBalance = await nodeProvider.addresses.getAddressesAddressBalance(user.address)
      expect(BigInt(userBalance.balance)).toEqual(
        initialBalance - depositAmount - gasFee - ONE_ALPH - DefaultTransferFee
      )
    }
    const exchangeBalance0 = await nodeProvider.addresses.getAddressesAddressBalance(exchange.wallet.address)
    expect(BigInt(exchangeBalance0.balance)).toEqual(initialBalance + totalDepositAmount)

    // withdraw
    console.log(`withdrawing...`)
    for (const user of users) {
      const depositAmount = user.getDepositAmount()
      await exchange.withdraw(user, depositAmount)
    }

    // check balances
    console.log(`check balances...`)
    for (const user of users) {
      const txsByUser = user.getDepositTxs()
      const gasFee = await getGasFee(txsByUser)
      const balance = await nodeProvider.addresses.getAddressesAddressBalance(user.address)
      expect(BigInt(balance.balance)).toEqual(initialBalance - gasFee - WithdrawFee - ONE_ALPH - DefaultTransferFee)
    }

    const gasFee = await getGasFee(exchange.getWithdrawTxs().map((tx) => tx.txId))
    const exchangeBalance = await nodeProvider.addresses.getAddressesAddressBalance(exchange.wallet.address)
    expect(BigInt(exchangeBalance.balance)).toEqual(initialBalance - gasFee + ONE_ALPH * BigInt(userNum))
  }, 300000)
})
