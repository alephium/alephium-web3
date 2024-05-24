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
import { getSigners, transfer } from '@alephium/web3-test'
import {
  Address,
  web3,
  ONE_ALPH,
  NodeProvider,
  prettifyAttoAlphAmount,
  node,
  sleep,
  TOTAL_NUMBER_OF_GROUPS,
  ALPH_TOKEN_ID,
  getALPHDepositInfo,
  groupOfAddress,
  BlockSubscription
} from '@alephium/web3'
import { waitTxConfirmed } from '@alephium/cli'
import { EventEmitter } from 'stream'
import * as bip39 from 'bip39'
import { testPrivateKey } from '@alephium/web3-test'

const WithdrawFee = ONE_ALPH

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

async function sweep(from: PrivateKeyWallet, to: Address): Promise<string[]> {
  const nodeProvider = web3.getCurrentNodeProvider()
  const sweepResult = await nodeProvider.transactions.postTransactionsSweepAddressBuild({
    fromPublicKey: from.publicKey,
    toAddress: to
  })
  const promises = sweepResult.unsignedTxs.map((tx) =>
    from.signAndSubmitUnsignedTx({ signerAddress: from.address, unsignedTx: tx.unsignedTx })
  )
  const txResults = await Promise.all(promises)
  return txResults.map((tx) => tx.txId)
}

class User {
  private readonly wallet: PrivateKeyWallet
  readonly address: Address
  readonly depositAddress: Address
  private depositTxs: string[]
  private depositGasFee: bigint | undefined

  constructor(wallet: PrivateKeyWallet, depositAddress: Address) {
    this.wallet = wallet
    this.address = wallet.address
    this.depositAddress = depositAddress
    this.depositTxs = []
    this.depositGasFee = undefined
  }

  async deposit(amount: bigint) {
    console.log(`deposit ${prettifyAttoAlphAmount(amount)} to ${this.depositAddress}`)
    return transfer(this.wallet, this.depositAddress, ALPH_TOKEN_ID, amount).then((result) => {
      this.depositTxs.push(result.txId)
      return result
    })
  }

  async getDepositGasFee() {
    if (this.depositGasFee !== undefined) {
      return this.depositGasFee
    }
    this.depositGasFee = await getGasFee(this.depositTxs)
    return this.depositGasFee
  }
}

class Exchange {
  readonly nodeProvider: NodeProvider
  readonly wallet: PrivateKeyWallet
  private depositTxs: string[]
  private withdrawTxs: string[]
  private sweepTxs: string[]
  private eventEmitter: EventEmitter
  private hotAddressMnemonic: string
  private hotAddressPathIndexes: Map<string, number>
  private hotAddresses: Address[]
  private balances: Map<string, bigint>

  constructor(nodeProvider: NodeProvider) {
    this.nodeProvider = nodeProvider
    this.depositTxs = []
    this.withdrawTxs = []
    this.sweepTxs = []
    this.eventEmitter = new EventEmitter()
    this.hotAddressMnemonic = bip39.generateMnemonic()
    this.wallet = this.getWalletByPathIndex(0)
    this.hotAddressPathIndexes = new Map()
    this.hotAddresses = []
    this.balances = new Map()
  }

  async handleDepositInfo(depositAddress: Address, depositAmount: bigint) {
    const pathIndex = this.getPathIndex(depositAddress)
    const wallet = this.getWalletByPathIndex(pathIndex)
    const sweepTxIds = await sweep(wallet, this.wallet.address)
    await waitTxsConfirmed(sweepTxIds)
    this.sweepTxs.push(...sweepTxIds)

    const userBalance = this.balances.get(depositAddress)
    if (userBalance === undefined) {
      this.balances.set(depositAddress, depositAmount)
    } else {
      this.balances.set(depositAddress, userBalance + depositAmount)
    }
  }

  async handleBlock(block: node.BlockEntry, resolver: () => void) {
    for (const tx of block.transactions) {
      const infos = getALPHDepositInfo(tx).filter((v) => this.hotAddresses.includes(v.targetAddress))
      if (infos.length > 0) {
        for (const { targetAddress, depositAmount } of infos) {
          await this.handleDepositInfo(targetAddress, depositAmount)
        }
        this.depositTxs.push(tx.unsigned.txId)
      }
    }
    resolver()
  }

  async startPolling(): Promise<void> {
    this.eventEmitter.on('block', ([block, resolver]) => this.handleBlock(block, resolver))
    const callback = async (block: node.BlockEntry) => {
      let resolver: any
      const promise = new Promise<void>((r) => (resolver = r))
      this.eventEmitter.emit('block', [block, resolver])
      return await promise
    }
    for (let fromGroup = 0; fromGroup < TOTAL_NUMBER_OF_GROUPS; fromGroup++) {
      for (let toGroup = 0; toGroup < TOTAL_NUMBER_OF_GROUPS; toGroup++) {
        const chainInfo = await this.nodeProvider.blockflow.getBlockflowChainInfo({
          fromGroup: fromGroup,
          toGroup: toGroup
        })
        const options = {
          pollingInterval: 1000,
          messageCallback: callback,
          errorCallback: (err: any) => {
            console.error(err)
          }
        }
        const subscription = new BlockSubscription(options, fromGroup, toGroup, chainInfo.currentHeight + 1)
        subscription.subscribe()
      }
    }
  }

  getDepositTxs(): string[] {
    return this.depositTxs
  }

  registerUser() {
    const pathIndex = this.hotAddressPathIndexes.size + 1
    const wallet = this.getWalletByPathIndex(pathIndex)
    this.hotAddressPathIndexes.set(wallet.address, pathIndex)
    this.hotAddresses.push(wallet.address)
    return wallet.address
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

  async withdraw(user: User, amount: bigint) {
    console.log(`withdraw ${prettifyAttoAlphAmount(amount)} to ${user.address}`)
    const balance = this.getBalance(user.depositAddress)
    if (balance < amount + WithdrawFee) {
      throw new Error('Not enough balance')
    }
    const result = await transfer(this.wallet, user.address, ALPH_TOKEN_ID, amount)
    await waitTxConfirmed(this.nodeProvider, result.txId, 1, 1000)
    this.withdrawTxs.push(result.txId)
    const remain = balance - (amount + WithdrawFee)
    if (remain === 0n) {
      this.balances.delete(user.depositAddress)
    } else {
      this.balances.set(user.depositAddress, remain)
    }
  }

  getWithdrawTxs(): string[] {
    return this.withdrawTxs
  }

  getSweepTxs(): string[] {
    return this.sweepTxs
  }

  getBalance(address: string): bigint {
    const balance = this.balances.get(address)
    return balance ?? 0n
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

  it('should test exchange', async () => {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    web3.setCurrentNodeProvider(nodeProvider)
    const initialBalance = ONE_ALPH * 100n
    const userNumPerGroup = 10
    const userNum = userNumPerGroup * TOTAL_NUMBER_OF_GROUPS

    const exchange = new Exchange(nodeProvider)

    const users: User[] = []
    for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
      const signers = await getSigners(userNumPerGroup, initialBalance, group)
      for (const signer of signers) {
        const depositAddress = exchange.registerUser()
        users.push(new User(signer, depositAddress))
      }
    }

    await exchange.startPolling()

    const depositTimes = 5
    for (let i = 0; i < depositTimes; i++) {
      const promises0 = users.map((user) => {
        const amount = randomBigInt(ONE_ALPH * 2n, ONE_ALPH * 10n)
        return user.deposit(amount)
      })

      const results0 = await Promise.all(promises0)
      await waitTxsConfirmed(results0.map((result) => result.txId))
    }

    const depositTxNumber = depositTimes * userNumPerGroup * TOTAL_NUMBER_OF_GROUPS
    async function waitForCollectTxs(txNumber: number) {
      const depositTxs = exchange.getDepositTxs()
      if (depositTxs.length < txNumber) {
        await sleep(1000)
        await waitForCollectTxs(txNumber)
      }
      return
    }

    // check deposit txs
    await waitForCollectTxs(depositTxNumber)
    console.log(`checking deposit txs...`)
    const depositTxs0 = exchange.getDepositTxs()
    expect(depositTxs0.length).toEqual(depositTxNumber)

    const testWallet = new PrivateKeyWallet({ privateKey: testPrivateKey })
    const poolReward = ONE_ALPH
    let poolRewardTxNumber = 0
    for (let i = 0; i < TOTAL_NUMBER_OF_GROUPS; i++) {
      console.log(`pool reward tx, group: ${i}`)
      const destinations = users
        .filter((u) => groupOfAddress(u.depositAddress) === i)
        .map((u) => ({
          address: u.depositAddress,
          attoAlphAmount: ONE_ALPH.toString()
        }))
      if (destinations.length > 0) {
        const result = await testWallet.signAndSubmitTransferTx({
          signerAddress: testWallet.address,
          destinations
        })
        await waitTxConfirmed(nodeProvider, result.txId, 1, 1000)
        poolRewardTxNumber += 1
      }
    }

    // check pool reward txs
    console.log(`checking pool reward txs...`)
    await waitForCollectTxs(depositTxNumber + poolRewardTxNumber)
    const depositTxs1 = exchange.getDepositTxs()
    expect(depositTxs1.length).toEqual(depositTxNumber + poolRewardTxNumber)

    // check balances
    console.log(`checking balances...`)
    let totalDepositAmount = 0n
    for (const user of users) {
      const depositAmount = exchange.getBalance(user.depositAddress)
      totalDepositAmount += depositAmount
      const gasFee = await user.getDepositGasFee()
      const userBalance = await nodeProvider.addresses.getAddressesAddressBalance(user.address)
      expect(BigInt(userBalance.balance)).toEqual(initialBalance - depositAmount - gasFee + poolReward)
    }
    const sweepTxFee = await getGasFee(exchange.getSweepTxs())
    const exchangeBalance0 = await nodeProvider.addresses.getAddressesAddressBalance(exchange.wallet.address)
    expect(BigInt(exchangeBalance0.balance)).toEqual(totalDepositAmount - sweepTxFee)

    // withdraw
    console.log(`withdrawing...`)
    const withdrawTimes = 5
    for (let index = 0; index < withdrawTimes - 1; index++) {
      for (const user of users) {
        await exchange.withdraw(user, ONE_ALPH)
        const balanceInExchange = exchange.getBalance(user.depositAddress)
        const gasFee = await user.getDepositGasFee()
        const userBalance = await nodeProvider.addresses.getAddressesAddressBalance(user.address)
        expect(BigInt(userBalance.balance)).toEqual(
          initialBalance - balanceInExchange - gasFee - WithdrawFee * BigInt(index + 1) + poolReward
        )
      }
    }

    // withdraw remain balances
    for (const user of users) {
      const balance = exchange.getBalance(user.depositAddress)
      await exchange.withdraw(user, balance - WithdrawFee)
      const userBalance = await nodeProvider.addresses.getAddressesAddressBalance(user.address)
      const gasFee = await user.getDepositGasFee()
      expect(BigInt(userBalance.balance)).toEqual(
        initialBalance - gasFee - WithdrawFee * BigInt(withdrawTimes) + poolReward
      )
    }

    const withdrawGasFee = await getGasFee(exchange.getWithdrawTxs())
    const exchangeBalance1 = await nodeProvider.addresses.getAddressesAddressBalance(exchange.wallet.address)
    const withdrawFee = BigInt(withdrawTimes) * WithdrawFee * BigInt(userNum)
    expect(BigInt(exchangeBalance1.balance)).toEqual(withdrawFee - withdrawGasFee - sweepTxFee)
  }, 300000)
})
