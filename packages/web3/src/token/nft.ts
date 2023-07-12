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

// JSON Schema for the NFT metadata, which is pointed to by the value
// returned from the `getTokenUri` method of the NFT contract

import assert from 'assert'
import 'cross-fetch/polyfill'

export interface NFTMetadata {
  name: string
  description: string
  image: string
}

// JSON Schema for the NFT Collection metadata, which is pointed to by
// the value returned from the `getCollectionUri` method of the NFT Collection
// Contract
export interface NFTCollectionMetadata {
  name: string
  description: string
  image: string
}

export function validateNFTMetadata(metadata: any): NFTMetadata {
  const name = validateNonEmptyString(metadata, 'name')
  const description = validateNonEmptyString(metadata, 'description')
  const image = validateNonEmptyString(metadata, 'image')

  return { name, description, image }
}

export function validateNFTCollectionMetadata(metadata: any): NFTCollectionMetadata {
  const name = validateNonEmptyString(metadata, 'name')
  const description = validateNonEmptyString(metadata, 'description')
  const image = validateNonEmptyString(metadata, 'image')

  return { name, description, image }
}

export async function validateTokenBaseUriForPreDesignedCollection(
  tokenBaseUri: string,
  maxSupply: number
): Promise<NFTMetadata[]> {
  if (Number.isInteger(maxSupply) && maxSupply > 0) {
    const nftMetadataz: NFTMetadata[] = []

    for (let i = 0; i < maxSupply; i++) {
      const nftMetadata = await (await fetch(`${tokenBaseUri}${i}`)).json()
      const validatedNFTMetadata = validateNFTMetadata(nftMetadata)
      nftMetadataz.push(validatedNFTMetadata)
    }

    return nftMetadataz
  } else {
    throw new Error('maxSupply should be a positive integer')
  }
}

function validateNonEmptyString(obj: object, field: string): string {
  const value = obj[`${field}`]
  if (!(typeof value === 'string' && value !== '')) {
    throw new Error(`JSON field '${field}' is not a non empty string`)
  }

  return value
}
