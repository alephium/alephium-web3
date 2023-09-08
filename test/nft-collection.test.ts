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
import { DeprecatedNFTTest } from '../artifacts/ts/DeprecatedNFTTest'
import { WrongNFTTest } from '../artifacts/ts/WrongNFTTest'
import { NFTCollectionTest, NFTCollectionTestInstance } from '../artifacts/ts/NFTCollectionTest'
import { MintNFTTest, WithdrawNFTCollectionTest } from '../artifacts/ts/scripts'
import { getSigner, randomContractId } from '@alephium/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { NFTCollectionWithRoyaltyTest, NFTCollectionWithRoyaltyTestInstance } from '../artifacts/ts'

describe('nft collection', function() {
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
          uri: nftUri,
          nftIndex: 0n,
          collectionId: ''
        }
      })
    ).contractInstance

    expect((await nftTest.methods.getTokenUri()).returns).toEqual(nftUri)

    await testNFTCollection(nftTest.contractId, nftUri, false)
    await testNFTCollection(nftTest.contractId, nftUri, true)
  }, 20000)

  it('should throw appropriate exception for deprecated and wrong NFT contract when fetching its Metadata', async () => {
    const uri = stringToHex('https://cryptopunks.app/cryptopunks/details/1')
    const deprecatedNFTTest = (
      await DeprecatedNFTTest.deploy(signer, {
        initialFields: { uri }
      })
    ).contractInstance

    expect((await deprecatedNFTTest.methods.getTokenUri()).returns).toEqual(uri)
    await expect(signer.nodeProvider.fetchNFTMetaData(deprecatedNFTTest.contractId)).rejects.toThrowError(
      'Deprecated NFT contract'
    )

    const wrongNFTTest = (
      await WrongNFTTest.deploy(signer, {
        initialFields: {
          uri,
          nftIndex: 0n,
          collectionId: randomContractId()
        }
      })
    ).contractInstance

    expect((await wrongNFTTest.methods.getTokenUri()).returns).toEqual(uri)
    await expect(signer.nodeProvider.fetchNFTMetaData(wrongNFTTest.contractId)).rejects.toThrowError(
      'Failed to call contract, error: VM execution error'
    )
  })

  async function testNFTCollection(nftTemplateId: string, nftUri: string, royalty: boolean) {
    const rawCollectionUri = 'https://cryptopunks.app/cryptopunks'
    const collectionUri = stringToHex(rawCollectionUri)
    let nftCollectionInstance: NFTCollectionTestInstance | NFTCollectionWithRoyaltyTestInstance

    if (royalty) {
      const royaltyRate = 200n // basis points
      nftCollectionInstance = (
        await NFTCollectionWithRoyaltyTest.deploy(signer, {
          initialFields: {
            nftTemplateId,
            collectionUri: collectionUri,
            collectionOwner: signer.address,
            royaltyRate,
            totalSupply: 0n
          },
          initialAttoAlphAmount: 2n * ONE_ALPH
        })
      ).contractInstance

      expect(
        (
          await nftCollectionInstance.methods.royaltyAmount({
            args: {
              tokenId: nftTemplateId,
              salePrice: ONE_ALPH
            }
          })
        ).returns
      ).toEqual((ONE_ALPH * royaltyRate) / 10000n)
    } else {
      nftCollectionInstance = (
        await NFTCollectionTest.deploy(signer, {
          initialFields: {
            nftTemplateId,
            collectionUri: collectionUri,
            totalSupply: 0n
          }
        })
      ).contractInstance
    }

    expect((await nftCollectionInstance.methods.getCollectionUri()).returns).toEqual(collectionUri)
    expect((await nftCollectionInstance.methods.totalSupply()).returns).toEqual(0n)

    const nodeProvider = web3.getCurrentNodeProvider()
    const isFollowsNFTCollectionStd = await nodeProvider.guessFollowsNFTCollectionStd(nftCollectionInstance.contractId)
    expect(isFollowsNFTCollectionStd).toEqual(true)
    const nftCollectionMetadata = await nodeProvider.fetchNFTCollectionMetaData(nftCollectionInstance.contractId)
    expect(nftCollectionMetadata).toEqual({
      collectionUri: rawCollectionUri,
      totalSupply: 0n
    })
    for (let i = 0n; i < 10n; i++) {
      await mintAndVerify(nftCollectionInstance, nftUri, i)
    }

    if (royalty) {
      const balanceBefore = await nodeProvider.addresses.getAddressesAddressBalance(nftCollectionInstance.address)
      expect(balanceBefore.balanceHint).toEqual('2 ALPH')
      await WithdrawNFTCollectionTest.execute(signer, {
        initialFields: {
          collection: nftCollectionInstance.contractId,
          amount: ONE_ALPH
        }
      })
      const balanceAfter = await nodeProvider.addresses.getAddressesAddressBalance(nftCollectionInstance.address)
      expect(balanceAfter.balanceHint).toEqual('1 ALPH')
    }
  }

  async function mintAndVerify(
    nftCollectionTest: NFTCollectionTestInstance | NFTCollectionWithRoyaltyTestInstance,
    nftUri: string,
    tokenIndex: bigint
  ) {
    const royalty = nftCollectionTest instanceof NFTCollectionWithRoyaltyTestInstance
    await expect(nftCollectionTest.methods.nftByIndex({ args: { index: tokenIndex } })).rejects.toThrow(Error)
    await MintNFTTest.execute(signer, {
      initialFields: {
        nftCollectionContractId: nftCollectionTest.contractId,
        uri: nftUri,
        royalty
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
    const [collectionId, index] = (await nftInstance.methods.getCollectionIndex()).returns
    expect(collectionId).toEqual(nftCollectionTest.contractId)
    expect(index).toEqual(tokenIndex)
    const nftMetadata = await web3.getCurrentNodeProvider().fetchNFTMetaData(nftInstance.contractId)
    expect(nftMetadata).toEqual({
      tokenUri: hexToString(nftUri),
      nftIndex: tokenIndex,
      collectionId: nftCollectionTest.contractId
    })
  }

  it('should check script initial fields', async () => {
    const initialFields = {
      uri: stringToHex('https://cryptopunks.app/cryptopunks/details/1'),
      nftCollectionContractId: '09fdf4189d4b5d70dc02d6e3d05b6e603f9ee78ea76af61b5b0638f88333fd00',
      royalty: false
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
