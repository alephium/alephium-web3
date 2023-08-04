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

import { web3 } from '@alephium/web3'
import { randomBytes } from 'crypto'
import { NodeWallet } from './node-wallet'
import { testNodeWallet } from '@alephium/web3-test'

describe('node wallet', () => {
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    await testNodeWallet()
  })

  it('should transfer (1)', async () => {
    const wallet = new NodeWallet('alephium-web3-test-only-wallet')
    const accounts = await wallet.getAccounts()
    const toAccount = accounts[0]
    for (const fromAccount of accounts) {
      await wallet.setSelectedAccount(fromAccount.address)
      await wallet.signTransferTx({
        signerAddress: fromAccount.address,
        destinations: [{ address: toAccount.address, attoAlphAmount: BigInt(1e18) }]
      })
    }
  })

  it('should transfer (2)', async () => {
    const wallet = new NodeWallet('alephium-web3-test-only-wallet')
    const accounts = await wallet.getAccounts()
    const toAccount = accounts[0]
    for (const fromAccount of accounts) {
      await wallet.setSelectedAccount(fromAccount.address)
      const tx = await wallet.buildTransferTx({
        signerAddress: fromAccount.address,
        destinations: [{ address: toAccount.address, attoAlphAmount: BigInt(1e18) }]
      })
      await wallet.signAndSubmitUnsignedTx({ unsignedTx: tx.unsignedTx, signerAddress: fromAccount.address })
    }
  })

  it('should change selected address', async () => {
    const provider = web3.getCurrentNodeProvider()

    const walletName = randomBytes(32).toString('hex')
    await provider.wallets.postWallets({ walletName: walletName, password: 'test', isMiner: true })

    const nodeWallet = new NodeWallet(walletName)
    const accounts = await nodeWallet.getAccounts()
    expect(accounts.length).toEqual(4)

    for (const account of accounts) {
      await nodeWallet.setSelectedAccount(account.address)
      expect(await (await nodeWallet.getSelectedAccount()).address).toEqual(account.address)
    }
    for (let i = 0; i < 4; i++) {
      const account = accounts[`${i}`]
      await nodeWallet.setSelectedAccount(account.address)
      expect(await (await nodeWallet.getSelectedAccount()).address).toEqual(account.address)
    }
  })
})
