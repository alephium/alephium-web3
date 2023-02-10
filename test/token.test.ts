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

import { web3, Project } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'
import { NodeWallet } from '@alephium/web3-wallet'
import { TokenTest } from '../.generated/TokenTest'

describe('contract', function () {
  let signer: NodeWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    signer = await testNodeWallet()
    await Project.build({ errorOnWarnings: false })
  })

  it('should get token infos', async () => {
    const symbol = Buffer.from('TT', 'utf8').toString('hex')
    const name = Buffer.from('TestToken', 'utf8').toString('hex')
    const decimals = 18n
    const totalSupply = 1n << 128n
    const tokenTest = await TokenTest.deploy(signer, symbol, name, decimals, totalSupply)

    expect(await tokenTest.getSymbolCall()).toEqual(symbol)
    expect(await tokenTest.getNameCall()).toEqual(name)
    expect(await tokenTest.getDecimalsCall()).toEqual(decimals)
    expect(await tokenTest.getTotalSupplyCall()).toEqual(totalSupply)
  })
})
