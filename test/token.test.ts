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
import { FakeTokenTest } from '../artifacts/ts'
import { TokenTest } from '../artifacts/ts/TokenTest'

describe('contract', function () {
  let signer: NodeWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    signer = await testNodeWallet()
    await Project.build({ errorOnWarnings: false })
  })

  const symbol = Buffer.from('TT', 'utf8').toString('hex')
  const name = Buffer.from('TestToken', 'utf8').toString('hex')
  const decimals = 18n
  const totalSupply = 1n << 128n
  const initialFields = { symbol, name, decimals, totalSupply }

  it('should get token infos', async () => {
    const tokenTest = (await TokenTest.deploy(signer, { initialFields })).contractInstance

    expect((await tokenTest.methods.getSymbol()).returns).toEqual(symbol)
    expect((await tokenTest.methods.getName()).returns).toEqual(name)
    expect((await tokenTest.methods.getDecimals()).returns).toEqual(decimals)
    expect((await tokenTest.methods.getTotalSupply()).returns).toEqual(totalSupply)

    const stateWithStdId = await tokenTest.fetchState()
    expect(stateWithStdId.fields).toEqual({
      symbol: symbol,
      name: name,
      decimals: decimals,
      totalSupply: totalSupply,
      __stdInterfaceId: '414c50480001'
    })

    const stdInterfaceId = await web3.getCurrentNodeProvider().guessStdInterfaceId(tokenTest.contractId)
    expect(stdInterfaceId).toEqual('0001')
  })

  it('should multicall', async () => {
    const tokenTest = (await TokenTest.deploy(signer, { initialFields })).contractInstance
    const result = await tokenTest.multicall({
      getSymbol: {},
      getName: {},
      getDecimals: {},
      getTotalSupply: {}
    })
    expect(result.getSymbol.returns).toEqual(symbol)
    expect(result.getName.returns).toEqual(name)
    expect(result.getDecimals.returns).toEqual(decimals)
    expect(result.getTotalSupply.returns).toEqual(totalSupply)

    const tokenType = await web3.getCurrentNodeProvider().guessStdTokenType(tokenTest.contractId)
    expect(tokenType).toEqual('fungible')

    const metadata = await web3.getCurrentNodeProvider().fetchFungibleTokenMetaData(tokenTest.contractId)
    expect(metadata.symbol).toEqual(symbol)
    expect(metadata.name).toEqual(name)
    expect(metadata.decimals).toEqual(Number(decimals))
    expect(metadata.totalSupply).toEqual(totalSupply)
  })

  it('should test the contract of unimplemented fungible token', async () => {
    const fakeToken = (await FakeTokenTest.deploy(signer, { initialFields: { a: 0n } })).contractInstance
    const state = await fakeToken.fetchState()
    expect(state.fields).toEqual({ a: 0n })
  })
})
