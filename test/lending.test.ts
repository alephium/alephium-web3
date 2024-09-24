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

import { NodeProvider, convertAlphAmountWithDecimals, number256ToNumber, DEFAULT_GAS_ALPH_AMOUNT } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'
import { PrivateKeyWallet, deriveHDWalletPrivateKeyForGroup } from '@alephium/web3-wallet'
import * as bip39 from 'bip39'

class LendingBot {
  private readonly nodeProvider: NodeProvider // This can be initialized with node url + api key in a real application
  private readonly mnemonic: string // This should be stored securely in a real application
  readonly userGroups: Map<string, number>

  constructor(nodeProvider: NodeProvider, mnemonic: string) {
    this.nodeProvider = nodeProvider
    this.mnemonic = mnemonic
    this.userGroups = new Map()
  }

  addUser(userId: string): PrivateKeyWallet {
    if (this.userGroups.has(userId)) {
      throw new Error(`User ${userId} already exists`)
    }

    const groupNumber = this.userGroups.size
    this.userGroups.set(userId, groupNumber)
    return this.getUserWallet(userId)
  }

  getUserWallet(userId: string): PrivateKeyWallet {
    const groupNumber = this.userGroups.get(userId)
    if (groupNumber === undefined) {
      throw new Error(`User ${userId} does not exist`)
    }

    const [privateKey, _addressIndex] = deriveHDWalletPrivateKeyForGroup(this.mnemonic, groupNumber, 'default')
    return new PrivateKeyWallet({ privateKey, nodeProvider: this.nodeProvider })
  }

  getUserAddress(userId: string) {
    return this.getUserWallet(userId).address
  }

  async getUserBalance(userId: string) {
    const userWallet = this.getUserWallet(userId)
    const balance = await userWallet.nodeProvider.addresses.getAddressesAddressBalance(userWallet.address)
    return number256ToNumber(balance.balance, 18)
  }

  async transfer(fromUserId: string, toUserData: [string, number][]) {
    const fromUserWallet = this.getUserWallet(fromUserId)

    const destinations = toUserData.map(([user, amount]) => ({
      address: this.getUserAddress(user),
      attoAlphAmount: convertAlphAmountWithDecimals(amount)!
    }))

    await fromUserWallet.signAndSubmitMultiGroupTransferTx({
      signerAddress: fromUserWallet.address,
      destinations: destinations
    })
  }
}

jest.setTimeout(15_000)

async function track<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now()
  const result = await fn()
  const end = Date.now()
  console.log(`${label} completed in ${(end - start)} milliseconds`)
  return result
}

describe('lendingbot', function () {
  it('should work', async function () {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    const mnemonic = bip39.generateMnemonic()
    const lendingBot = new LendingBot(nodeProvider, mnemonic)

    // deposit 1 ALPH for each user
    const testWallet = await testNodeWallet()
    const signerAddress = (await testWallet.getSelectedAccount()).address

    const users = ['user0', 'user1', 'user2']
    const destinations = users.map((user) => ({
      address: lendingBot.addUser(user).address,
      attoAlphAmount: convertAlphAmountWithDecimals('1.0')!
    }))

    await track('Distributing alphs among users', async () => {
      await testWallet.signAndSubmitMultiGroupTransferTx({
        signerAddress,
        destinations
      })
    })

    await track('Check user balances', async () => {
      for (const user of users) {
        const balance = await lendingBot.getUserBalance(user)
        expect(balance).toEqual(1.0)
      }
    })

    await track('user0 lends to user1 and user2', async () => {
      await lendingBot.transfer('user0', [
        ['user1', 0.1],
        ['user2', 0.2]
      ])
    })

    await track('user1 lends to user2', async () => {
      await lendingBot.transfer('user1', [
        ['user2', 0.3]
      ])
    })

    await track('Check user balances', async () => {
      const balance0 = await lendingBot.getUserBalance('user0')
      const balance1 = await lendingBot.getUserBalance('user1')
      const balance2 = await lendingBot.getUserBalance('user2')

      expect(balance0).toEqual(1.0 - 0.1 - 0.2 - DEFAULT_GAS_ALPH_AMOUNT * 2)
      expect(balance1).toEqual(1.0 + 0.1 - 0.3 - DEFAULT_GAS_ALPH_AMOUNT)
      expect(balance2).toEqual(1.0 + 0.2 + 0.3)
    })

    await track('user1 returns to user0', async () => {
      await lendingBot.transfer('user1', [
        ['user0', 0.1],
      ])
    })

    await track('user2 returns to user0 and user1', async () => {
      await lendingBot.transfer('user2', [
        ['user0', 0.2],
        ['user1', 0.3]
      ])
    })

    await track('Check user balances', async () => {
      const finalBalance0 = await lendingBot.getUserBalance('user0')
      const finalBalance1 = await lendingBot.getUserBalance('user1')
      const finalBalance2 = await lendingBot.getUserBalance('user2')
      expect(finalBalance0).toEqual(1.0 - 0.1 - 0.2 + 0.1 + 0.2 - DEFAULT_GAS_ALPH_AMOUNT * 2)
      expect(finalBalance1).toEqual(1.0 + 0.1 - 0.3 - 0.1 + 0.3 - DEFAULT_GAS_ALPH_AMOUNT * 2)
      expect(finalBalance2).toEqual(1.0 + 0.2 + 0.3 - 0.2 - 0.3 - DEFAULT_GAS_ALPH_AMOUNT * 2)

      console.log('Final balances', { finalBalance0, finalBalance1, finalBalance2 })
    })

  })
})
