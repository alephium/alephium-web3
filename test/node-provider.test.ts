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

import { stringToHex } from '@alephium/web3'
import { getSigner, testAddress, testNodeWallet, testWalletName } from '@alephium/web3-test'
import { MapTest, NFTTest, NFTTestStd, TokenTest, TokenTestStd } from '../artifacts/ts'
import { web3, NodeProvider } from '../packages/web3/src'

describe('node provider', () => {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  const nodeProvider = web3.getCurrentNodeProvider()
  beforeAll(async () => {
    await testNodeWallet()
  })

  it('remote node provider should forward requests', async () => {
    const request = nodeProvider.request
    const remoteNodeProvider = NodeProvider.Remote(request)
    console.log(await remoteNodeProvider.wallets.getWallets())
    console.log(await remoteNodeProvider.wallets.getWalletsWalletNameAddressesAddress(testWalletName, testAddress))
    console.log(await remoteNodeProvider.infos.getInfosVersion())
  })

  it('proxied node provider should clone the source provider', () => {
    const sourceFunc0 = nodeProvider.wallets.getWallets.toString()
    const proxy = NodeProvider.Proxy(nodeProvider)
    const proxyFunc0 = proxy.wallets.getWallets.toString()
    expect(proxyFunc0).toEqual(sourceFunc0)
    proxy.wallets.getWallets = () => Promise.reject('')
    const sourceFunc1 = nodeProvider.wallets.getWallets.toString()
    const proxyFunc1 = proxy.wallets.getWallets.toString()
    expect(sourceFunc1).toEqual(sourceFunc0)
    expect(sourceFunc1).not.toEqual(`() => Promise.reject('')`)
    expect(proxyFunc1).not.toEqual(proxyFunc0)
    expect(proxyFunc1).not.toEqual(sourceFunc1)
    expect(proxyFunc1).toEqual(`() => Promise.reject('')`)
  })

  it('should guess the token type', async () => {
    const signer = await getSigner()

    const symbol = Buffer.from('TT', 'utf8').toString('hex')
    const name = Buffer.from('TestToken', 'utf8').toString('hex')
    const decimals = 18n
    const totalSupply = 1n << 128n
    const tokenInitialFields = { symbol, name, decimals, totalSupply }
    const tokenTest1 = (await TokenTest.deploy(signer, { initialFields: tokenInitialFields })).contractInstance
    expect(await nodeProvider.guessStdTokenType(tokenTest1.contractId)).toEqual('fungible')
    const tokenTest2 = (await TokenTestStd.deploy(signer, { initialFields: tokenInitialFields })).contractInstance
    expect(await nodeProvider.guessStdTokenType(tokenTest2.contractId)).toEqual('fungible')

    const nftUri = stringToHex('https://cryptopunks.app/cryptopunks/details/1')
    const nftInitialFields = { uri: nftUri, nftIndex: 0n, collectionId: '' }
    const nftTest1 = (await NFTTest.deploy(signer, { initialFields: nftInitialFields })).contractInstance
    expect(await nodeProvider.guessStdTokenType(nftTest1.contractId)).toEqual('non-fungible')
    const nftTest2 = (await NFTTestStd.deploy(signer, { initialFields: nftInitialFields })).contractInstance
    expect(await nodeProvider.guessStdTokenType(nftTest2.contractId)).toEqual('non-fungible')

    const mapTest = (await MapTest.deploy(signer, { initialFields: {} })).contractInstance
    expect(await nodeProvider.guessStdTokenType(mapTest.contractId)).toBeUndefined
  })
})
