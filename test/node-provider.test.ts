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

import { testAddress, testWalletName } from '@alephium/web3-test'
import { web3, NodeProvider } from '../packages/web3/src'

describe('remote node provider', () => {
  it('forward requests', async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    const nodeProvider = web3.getCurrentNodeProvider()
    const request = nodeProvider.request
    const remoteNodeProvider = NodeProvider.Remote(request)
    console.log(await remoteNodeProvider.wallets.getWallets())
    console.log(await remoteNodeProvider.wallets.getWalletsWalletNameAddressesAddress(testWalletName, testAddress))
    console.log(await remoteNodeProvider.infos.getInfosVersion())
  })
})
