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
import { PrivateKeyWallet, deriveHDWalletPrivateKey } from '@alephium/web3-wallet'
import * as bip39 from 'bip39'

class TippingBot {
  private readonly nodeProvider: NodeProvider // This can be initialized with node url + api key in a real application
  private readonly mnemonic: string // This should be stored securely in a real application
  private readonly userPathIndexes: Map<string, number> // This should be stored in a database in a real application

  constructor(nodeProvider: NodeProvider, mnemonic: string) {
    this.nodeProvider = nodeProvider
    this.mnemonic = mnemonic
    this.userPathIndexes = new Map()
  }

  addUser(userAddress: string) {
    if (this.userPathIndexes.has(userAddress)) {
      throw new Error(`User ${userAddress} already exists`)
    }

    const pathIndex = this.userPathIndexes.size
    this.userPathIndexes.set(userAddress, pathIndex)
  }

  getUserWallet(userId: string): PrivateKeyWallet {
    const pathIndex = this.userPathIndexes.get(userId)
    if (pathIndex === undefined) {
      throw new Error(`User ${userId} does not exist`)
    }

    const privateKey = deriveHDWalletPrivateKey(this.mnemonic, 'default', pathIndex)
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

  async sendTip(fromUserId: string, toUserId: string, amount: number) {
    const fromUserWallet = this.getUserWallet(fromUserId)
    const toUserAddress = this.getUserAddress(toUserId)

    const attoAlphAmount = convertAlphAmountWithDecimals(amount)
    if (attoAlphAmount === undefined) {
      throw new Error(`Invalid amount ${amount}`)
    }

    await fromUserWallet.signAndSubmitTransferTx({
      signerAddress: fromUserWallet.address,
      destinations: [{ address: toUserAddress, attoAlphAmount }]
    })
  }
}

describe('tippingbot', function () {
  it('should work', async function () {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    const mnemonic = bip39.generateMnemonic()
    const tippingBot = new TippingBot(nodeProvider, mnemonic)

    console.log(`Mnemonic: ${mnemonic}`)

    const users = ['user0', 'user1', 'user2']
    for (const user of users) {
      tippingBot.addUser(user)
    }

    // deposit 1 ALPH for each user
    const testWallet = await testNodeWallet()
    for (const user of users) {
      await testWallet.signAndSubmitTransferTx({
        signerAddress: (await testWallet.getSelectedAccount()).address,
        destinations: [
          { address: tippingBot.getUserAddress(user), attoAlphAmount: convertAlphAmountWithDecimals('1.0')! }
        ]
      })
    }

    // check user balance
    for (const user of users) {
      const balance = await tippingBot.getUserBalance(user)
      expect(balance).toEqual(1.0)
    }

    // tip 0.1 ALPH from user0 to user1
    await tippingBot.sendTip('user0', 'user1', 0.1)
    // tip 0.2 ALPH from user0 to user2
    await tippingBot.sendTip('user0', 'user2', 0.2)
    // tip 0.3 ALPH from user1 to user2
    await tippingBot.sendTip('user1', 'user2', 0.3)

    // check user balance
    const balance0 = await tippingBot.getUserBalance('user0')
    const balance1 = await tippingBot.getUserBalance('user1')
    const balance2 = await tippingBot.getUserBalance('user2')
    expect(balance0).toEqual(1.0 - 0.1 - 0.2 - DEFAULT_GAS_ALPH_AMOUNT * 2)
    expect(balance1).toEqual(1.0 - 0.2 - DEFAULT_GAS_ALPH_AMOUNT)
    expect(balance2).toEqual(1.0 + 0.2 + 0.3)
  })
})
