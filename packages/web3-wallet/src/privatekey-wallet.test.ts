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
import { PrivateKeyWallet } from './privatekey-wallet'

describe('privatekey wallet', () => {
  it('test the length of private key', () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    for (let i = 0; i < 100; i++) {
      const wallet = PrivateKeyWallet.Random()
      expect(wallet.privateKey.length).toEqual(64)
    }
  })
})
