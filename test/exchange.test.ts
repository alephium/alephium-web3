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
  prettifyAttoAlphAmount
} from '@alephium/web3'
import { waitTxConfirmed } from '@alephium/cli'
import { randomInt } from 'crypto'

class Exchange {
  readonly wallet: PrivateKeyWallet
  private depositTxs: { txId: string; from: Address }[]
  private withdrawTxs: { txId: string; to: Address }[]
  private accountBalances: Map<Address, bigint>

  constructor(wallet: PrivateKeyWallet) {
    this.wallet = wallet
    this.depositTxs = []
    this.withdrawTxs = []
    this.accountBalances = new Map<Address, bigint>()
  }

  async deposit(from: PrivateKeyWallet, amount: bigint) {
    const result = await from.signAndSubmitTransferTx({
      signerAddress: from.address,
      destinations: [{ address: this.wallet.address, attoAlphAmount: amount }]
    })
    await waitTxConfirmed(web3.getCurrentNodeProvider(), result.txId, 1, 1000)
    this.depositTxs.push({ txId: result.txId, from: from.address })
    const accountBalance = this.accountBalances.get(from.address)
    if (accountBalance === undefined) {
      this.accountBalances.set(from.address, amount)
    } else {
      this.accountBalances.set(from.address, accountBalance + amount)
    }
  }

  async withdraw(to: Address) {
    const accountBalance = this.accountBalances.get(to)
    if (accountBalance === undefined) {
      return
    }
    console.log(`withdraw ${prettifyAttoAlphAmount(accountBalance)} to ${to}`)
    const result = await this.wallet.signAndSubmitTransferTx({
      signerAddress: this.wallet.address,
      destinations: [{ address: to, attoAlphAmount: accountBalance }]
    })
    await waitTxConfirmed(web3.getCurrentNodeProvider(), result.txId, 1, 1000)
    this.accountBalances.delete(to)
    this.withdrawTxs.push({ txId: result.txId, to })
  }

  async clear() {
    for (const [address, _] of this.accountBalances) {
      await this.withdraw(address)
    }
  }

  getDepositTxs(): { txId: string; from: Address }[] {
    return this.depositTxs
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

  async function getGasFee(txs: { txId: string }[]): Promise<bigint> {
    const nodeProvider = web3.getCurrentNodeProvider()
    let totalGasFee = 0n
    for (const tx of txs) {
      const transaction = await nodeProvider.transactions.getTransactionsDetailsTxid(tx.txId)
      const gasFee = BigInt(transaction.unsigned.gasAmount) * BigInt(transaction.unsigned.gasPrice)
      totalGasFee += gasFee
    }
    return totalGasFee
  }

  it('should test exchange', async () => {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    web3.setCurrentNodeProvider(nodeProvider)
    const initialBalance = ONE_ALPH * 100n
    const exchangeWallet = await getSigner(initialBalance)
    const exchange = new Exchange(exchangeWallet)
    const accounts = await getSigners(10, initialBalance)

    let txCount = 0
    while (txCount < 100) {
      const accountIndex = randomInt(0, 10)
      const account = accounts[accountIndex]
      const balance = BigInt((await nodeProvider.addresses.getAddressesAddressBalance(account.address)).balance)
      if (balance < ONE_ALPH || balance - ONE_ALPH < DUST_AMOUNT) {
        await exchange.withdraw(account.address)
        continue
      }

      const depositAmount = randomBigInt(DUST_AMOUNT, balance - ONE_ALPH)
      console.log(`deposit ${prettifyAttoAlphAmount(depositAmount)} from ${account.address}`)
      await exchange.deposit(account, depositAmount)
      txCount += 1
    }

    await exchange.clear()

    const depositTxs = exchange.getDepositTxs()
    for (const tx of depositTxs) {
      const transaction = await nodeProvider.transactions.getTransactionsDetailsTxid(tx.txId)
      expect(isDepositALPHTransaction(transaction, exchangeWallet.address)).toEqual(true)
      expect(getDepositAddress(transaction)).toEqual(tx.from)
    }

    // check exchange balance
    const withdrawTxs = exchange.getWithdrawTxs()
    const withdrawGasFee = await getGasFee(withdrawTxs)
    const exchangeBalance = await nodeProvider.addresses.getAddressesAddressBalance(exchangeWallet.address)
    expect(BigInt(exchangeBalance.balance)).toEqual(initialBalance - withdrawGasFee)

    // check account balance
    for (const account of accounts) {
      const txs = depositTxs.filter((tx) => tx.from === account.address)
      const balance = await nodeProvider.addresses.getAddressesAddressBalance(account.address)
      const gasFee = await getGasFee(txs)
      expect(BigInt(balance.balance)).toEqual(initialBalance - gasFee)
    }
  }, 300000)
})
