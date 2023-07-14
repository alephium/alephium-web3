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

import 'cross-fetch/polyfill'

export interface NFTMetadata {
  name: string
  description?: string
  image: string
  attributes?: [
    {
      trait_type: string
      value: string | number | boolean
    }
  ]
}

// JSON Schema for the NFT Collection metadata, which is pointed to by
// the value returned from the `getCollectionUri` method of the NFT Collection
// Contract
export interface NFTCollectionMetadata {
  name: string
  description: string
  image: string
}

export const validNFTMetadataFields = ['name', 'description', 'image', 'attributes']
export const validNFTMetadataAttributesFields = ['trait_type', 'value']
export const validNFTMetadataAttributeTypes = ['string', 'number', 'boolean']
export const validNFTCollectionMetadataFields = ['name', 'description', 'image']

export function validateNFTMetadata(metadata: any): NFTMetadata {
  Object.keys(metadata).forEach((key) => {
    if (!validNFTMetadataFields.includes(key)) {
      throw new Error(`Invalid field ${key}, only ${validNFTMetadataFields} are allowed`)
    }
  })

  const name = validateNonEmptyString(metadata, 'name')
  const description = validateNonEmptyStringIfExists(metadata, 'description')
  const image = validateNonEmptyString(metadata, 'image')
  const attributes = validateNFTMetadataAttributes(metadata['attributes'])

  return { name, description, image, attributes }
}

export function validateNFTCollectionMetadata(metadata: any): NFTCollectionMetadata {
  Object.keys(metadata).forEach((key) => {
    if (!validNFTCollectionMetadataFields.includes(key)) {
      throw new Error(`Invalid field ${key}, only ${validNFTCollectionMetadataFields} are allowed`)
    }
  })

  const name = validateNonEmptyString(metadata, 'name')
  const description = validateNonEmptyString(metadata, 'description')
  const image = validateNonEmptyString(metadata, 'image')

  return { name, description, image }
}

export async function validateTokenBaseUriForPreDesignedCollection(
  tokenBaseUri: string,
  maxSupply: number
): Promise<NFTMetadata[]> {
  if (isInteger(maxSupply) && maxSupply > 0) {
    const nftMetadataz: NFTMetadata[] = []

    for (let i = 0; i < maxSupply; i++) {
      const nftMetadata = await fetchNFTMetadata(tokenBaseUri, i)
      const validatedNFTMetadata = validateNFTMetadata(nftMetadata)
      nftMetadataz.push(validatedNFTMetadata)
    }

    return nftMetadataz
  } else {
    throw new Error('maxSupply should be a positive integer')
  }
}

function validateNFTMetadataAttributes(attributes: any): NFTMetadata['attributes'] {
  if (!!attributes) {
    if (!Array.isArray(attributes)) {
      throw new Error(`Field 'attributes' should be an array`)
    }

    attributes.forEach((item) => {
      if (typeof item !== 'object') {
        throw new Error(`Field 'attributes' should be an array of objects`)
      }

      Object.keys(item).forEach((key) => {
        if (!validNFTMetadataAttributesFields.includes(key)) {
          throw new Error(`Invalid field ${key} for attributes, only ${validNFTMetadataAttributesFields} are allowed`)
        }
      })

      validateNonEmptyString(item, 'trait_type')
      validateNonEmptyAttributeValue(item, 'value')
    })
  }

  return attributes as NFTMetadata['attributes']
}

function validateNonEmptyString(obj: object, field: string): string {
  const value = obj[`${field}`]
  if (!(typeof value === 'string' && value !== '')) {
    throw new Error(`JSON field '${field}' is not a non empty string`)
  }

  return value
}

function validateNonEmptyStringIfExists(obj: object, field: string): string {
  const value = obj[`${field}`]
  if (value !== undefined && !(typeof value === 'string' && value !== '')) {
    throw new Error(`JSON field '${field}' is not a non empty string`)
  }

  return value
}

function validateNonEmptyAttributeValue(obj: object, field: string): string | number | boolean {
  const value = obj[`${field}`]
  if (!((typeof value === 'string' && value !== '') || typeof value === 'number' || typeof value === 'boolean')) {
    throw new Error(`Attribute value should be a non empty string, number or boolean`)
  }

  return value
}

async function fetchNFTMetadata(tokenBaseUri: string, index: number) {
  try {
    return await (await fetch(`${tokenBaseUri}${index}`)).json()
  } catch (e) {
    throw new Error(`Error fetching NFT metadata from ${tokenBaseUri}${index}: ${e}`)
  }
}

function isInteger(num: number) {
  return num === parseInt(num.toString(), 10)
}
