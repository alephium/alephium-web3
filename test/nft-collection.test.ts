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

import {
  web3,
  Project,
  stringToHex,
  subContractId,
  binToHex,
  encodeU256,
  ONE_ALPH,
  addressFromContractId,
  hexToString
} from '@alephium/web3'
import { NFTTest } from '../artifacts/ts/NFTTest'
import { NFTCollectionTest, NFTCollectionTestInstance } from '../artifacts/ts/NFTCollectionTest'
import { MintNFTTest } from '../artifacts/ts/scripts'
import { getSigner } from '@alephium/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

describe('nft collection', function () {
  let signer: PrivateKeyWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    signer = await getSigner()
    await Project.build({ errorOnWarnings: false })
  })

  it('should mint nft', async () => {
    const nftUri = stringToHex('https://cryptopunks.app/cryptopunks/details/1')
    const nftTest = (
      await NFTTest.deploy(signer, {
        initialFields: {
          uri: nftUri
        }
      })
    ).contractInstance

    expect((await nftTest.methods.getTokenUri()).returns).toEqual(nftUri)

    const rawCollectionUri = 'https://cryptopunks.app/cryptopunks'
    const collectionUri = stringToHex(rawCollectionUri)
    const nftCollectionTest = (
      await NFTCollectionTest.deploy(signer, {
        initialFields: {
          nftTemplateId: nftTest.contractId,
          collectionUri: collectionUri,
          totalSupply: 0n
        }
      })
    ).contractInstance
    expect((await nftCollectionTest.methods.getCollectionUri()).returns).toEqual(collectionUri)
    expect((await nftCollectionTest.methods.totalSupply()).returns).toEqual(0n)

    const nodeProvider = web3.getCurrentNodeProvider()
    const isFollowsNFTCollectionStd = await nodeProvider.guessFollowsNFTCollectionStd(nftCollectionTest.contractId)
    expect(isFollowsNFTCollectionStd).toEqual(true)
    const nftCollectionMetadata = await nodeProvider.fetchNFTCollectionMetaData(nftCollectionTest.contractId)
    expect(nftCollectionMetadata).toEqual({
      collectionUri: rawCollectionUri,
      totalSupply: 0n
    })
    for (let i = 0n; i < 10n; i++) {
      await mintAndVerify(nftCollectionTest, nftUri, i)
    }
  }, 10000)

  async function mintAndVerify(nftCollectionTest: NFTCollectionTestInstance, nftUri: string, tokenIndex: bigint) {
    await expect(nftCollectionTest.methods.nftByIndex({ args: { index: tokenIndex } })).rejects.toThrow(Error)
    await MintNFTTest.execute(signer, {
      initialFields: {
        nftCollectionContractId: nftCollectionTest.contractId,
        uri: nftUri
      },
      attoAlphAmount: 2n * ONE_ALPH
    })
    const nftContractId = subContractId(nftCollectionTest.contractId, binToHex(encodeU256(tokenIndex)), 0)
    expect((await nftCollectionTest.methods.nftByIndex({ args: { index: tokenIndex } })).returns).toEqual(nftContractId)
    const nftInstance = NFTTest.at(addressFromContractId(nftContractId))
    const nftFields = (await nftInstance.fetchState()).fields
    expect(nftFields.uri).toEqual(nftUri)
    const stdInterfaceId = await web3.getCurrentNodeProvider().guessStdInterfaceId(nftInstance.contractId)
    expect(stdInterfaceId).toEqual('0003')
    const tokenType = await web3.getCurrentNodeProvider().guessStdTokenType(nftInstance.contractId)
    expect(tokenType).toEqual('non-fungible')
    const nftMetadata = await web3.getCurrentNodeProvider().fetchNFTMetaData(nftInstance.contractId)
    expect(nftMetadata).toEqual({
      tokenUri: hexToString(nftUri)
    })
  }

  it('should check script initial fields', async () => {
    const initialFields = {
      uri: stringToHex('https://cryptopunks.app/cryptopunks/details/1'),
      nftCollectionContractId: '09fdf4189d4b5d70dc02d6e3d05b6e603f9ee78ea76af61b5b0638f88333fd00'
    }

    const invalidInitialFields0 = {
      ...initialFields,
      uri: 'https://cryptopunks.app/cryptopunks/details/1'
    }
    await expect(MintNFTTest.execute(signer, { initialFields: invalidInitialFields0 })).rejects.toThrowError(
      'Failed to build bytecode for script MintNFTTest, error: Error: Invalid uri, error: Invalid hex-string: https://cryptopunks.app/cryptopunks/details/1'
    )

    const invalidInitialFields1 = {
      ...initialFields,
      nftCollectionContractId: '09fdf4189d4b5d70dc02d6e3d05b6e603f9ee78ea76af61b5b0638f88333fdzz'
    }
    await expect(MintNFTTest.execute(signer, { initialFields: invalidInitialFields1 })).rejects.toThrowError(
      'Failed to build bytecode for script MintNFTTest, error: Error: Invalid nftCollectionContractId, error: Invalid hex-string: 09fdf4189d4b5d70dc02d6e3d05b6e603f9ee78ea76af61b5b0638f88333fdzz'
    )
  })
})
