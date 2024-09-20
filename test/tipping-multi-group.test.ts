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

class MultiGroupTippingBot {
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

  async sendTips(fromUserId: string, toUserData: [string, number][]) {
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

describe('tippingbot', function () {
  it('should work', async function () {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    const mnemonic = bip39.generateMnemonic()
    const tippingBot = new MultiGroupTippingBot(nodeProvider, mnemonic)

    // deposit 1 ALPH for each user
    const testWallet = await testNodeWallet()
    const signerAddress = (await testWallet.getSelectedAccount()).address

    const users = ['user0', 'user1', 'user2']
    const destinations = users.map((user) => ({
      address: tippingBot.addUser(user).address,
      attoAlphAmount: convertAlphAmountWithDecimals('1.0')!
    }))

    await testWallet.signAndSubmitMultiGroupTransferTx({
      signerAddress,
      destinations
    })

    // check user balance
    for (const user of users) {
      const balance = await tippingBot.getUserBalance(user)
      expect(balance).toEqual(1.0)
    }

    await tippingBot.sendTips('user0', [
      ['user1', 0.1],
      ['user2', 0.2]
    ])
    await tippingBot.sendTips('user1', [
      ['user2', 0.3]
    ])

    // check user balance
    const balance0 = await tippingBot.getUserBalance('user0')
    const balance1 = await tippingBot.getUserBalance('user1')
    const balance2 = await tippingBot.getUserBalance('user2')
    expect(balance0).toEqual(1.0 - 0.1 - 0.2 - DEFAULT_GAS_ALPH_AMOUNT * 2)
    expect(balance1).toEqual(1.0 - 0.2 - DEFAULT_GAS_ALPH_AMOUNT)
    expect(balance2).toEqual(1.0 + 0.2 + 0.3)
  })
})
