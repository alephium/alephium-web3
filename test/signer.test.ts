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

import { NodeProvider, SignerProviderWrapper } from '@alephium/web3'
import { testPrivateKey } from '@alephium/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

describe('signer', () => {
  it('should wrap a signer', async () => {
    const fakeNodeProvider = new NodeProvider('https://8.8.8.8')
    const signer = new PrivateKeyWallet(testPrivateKey, fakeNodeProvider)
    const build = signer.buildTransferTx({
      signerAddress: signer.address,
      destinations: [{ address: signer.address, attoAlphAmount: 1e18 }]
    })
    expect(build).rejects.toThrow(/\[Node API Error\]/)

    const signer1 = new SignerProviderWrapper(signer, new NodeProvider('http://127.0.0.1:22973'))
    await signer1.buildTransferTx({
      signerAddress: signer.address,
      destinations: [{ address: signer.address, attoAlphAmount: 1e18 }]
    })
  })
})
