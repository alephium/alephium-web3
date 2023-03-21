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

import { web3, Project, stringToHex, subContractId, binToHex, encodeU256 } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'
import { NodeWallet } from '@alephium/web3-wallet'
import { NFTTest } from '../artifacts/ts/NFTTest'
import { NFTCollectionTest, NFTCollectionTestInstance } from '../artifacts/ts/NFTCollectionTest'
import { MintNFTTest } from '../artifacts/ts/scripts'

describe('nft collection', function () {
  let signer: NodeWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    signer = await testNodeWallet()
    await Project.build({ errorOnWarnings: false })
  })

  it('should mint nft', async () => {
    const nftUri = stringToHex('https://cryptopunks.app/cryptopunks/details/1')
    const nftTest = (await NFTTest.deploy(signer, { initialFields: { uri: nftUri } })).instance
    expect((await nftTest.callGetTokenUriMethod()).returns).toEqual(nftUri)

    const name = stringToHex('Alelphium Punk')
    const symbol = stringToHex('AP')
    const totalSupply = 2n
    const currentTokenIndex = 0n
    const nftCollectionTest = (
      await NFTCollectionTest.deploy(signer, {
        initialFields: {
          nftTemplateId: nftTest.contractId,
          name,
          symbol,
          totalSupply,
          currentTokenIndex
        }
      })
    ).instance

    expect((await nftCollectionTest.callGetNameMethod()).returns).toEqual(name)
    expect((await nftCollectionTest.callGetSymbolMethod()).returns).toEqual(symbol)
    expect((await nftCollectionTest.callTotalSupplyMethod()).returns).toEqual(totalSupply)
    expect((await nftCollectionTest.fetchState()).fields.currentTokenIndex).toEqual(0n)

    await mintAndVerify(nftCollectionTest, nftUri, 0n)
    await mintAndVerify(nftCollectionTest, nftUri, 1n)

    // Fail when totalSupply is exceeded
    await expect(
      MintNFTTest.execute(signer, {
        initialFields: {
          nftCollectionContractId: nftCollectionTest.contractId,
          uri: nftUri
        }
      })
    ).rejects.toThrow(Error)
  })

  async function mintAndVerify(nftCollectionTest: NFTCollectionTestInstance, nftUri: string, tokenIndex: bigint) {
    await expect(nftCollectionTest.callNftByIndexMethod({ args: { index: tokenIndex } })).rejects.toThrow(Error)
    await MintNFTTest.execute(signer, {
      initialFields: {
        nftCollectionContractId: nftCollectionTest.contractId,
        uri: nftUri
      }
    })
    const nftContractId = subContractId(nftCollectionTest.contractId, binToHex(encodeU256(tokenIndex)), 0)
    expect((await nftCollectionTest.callNftByIndexMethod({ args: { index: tokenIndex } })).returns).toEqual(
      nftContractId
    )
    expect((await nftCollectionTest.fetchState()).fields.currentTokenIndex).toEqual(tokenIndex + 1n)
  }
})
