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
import { FakeTokenTest } from '../artifacts/ts'
import { TokenTest } from '../artifacts/ts/TokenTest'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { getSigner } from '@alephium/web3-test'

describe('contract', function () {
  let signer: PrivateKeyWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    signer = await getSigner()
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

  it('should send issued token to `issuedTokenTo` address when specified', async () => {
    const issueTokenAmount = 10n
    const tokenTest = (
      await TokenTest.deploy(signer, { initialFields, issueTokenAmount, issueTokenTo: signer.address })
    ).contractInstance

    const tokenId = tokenTest.contractId

    const contractState = await tokenTest.fetchState()
    const contractTokenBalance = contractState.asset.tokens!.find((token) => token.id === tokenId)
    expect(contractTokenBalance).toBeUndefined()

    const signerBalance = await web3.getCurrentNodeProvider().addresses.getAddressesAddressBalance(signer.address)
    const signerTokenBalance = signerBalance.tokenBalances!.find((token) => token.id === tokenId)
    expect(BigInt(signerTokenBalance!.amount)).toEqual(issueTokenAmount)
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

  it('should check contract initial fields', async () => {
    const invalidInitialFields0 = {
      ...initialFields,
      name: 'TF'
    }
    await expect(TokenTest.deploy(signer, { initialFields: invalidInitialFields0 })).rejects.toThrowError(
      'Failed to build bytecode for contract TokenTest, error: Error: Invalid name, error: Invalid hex-string: TF'
    )

    const invalidInitialFields1 = {
      ...initialFields,
      symbol: 'TokenFaucet'
    }
    await expect(TokenTest.deploy(signer, { initialFields: invalidInitialFields1 })).rejects.toThrowError(
      'Failed to build bytecode for contract TokenTest, error: Error: Invalid symbol, error: Invalid hex-string: TokenFaucet'
    )
  })
})
