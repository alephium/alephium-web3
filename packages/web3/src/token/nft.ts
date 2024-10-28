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
import { NFTCollectionUriMetaData, NFTTokenUriMetaData } from '../api'
import { TraceableError } from '../error'

export const validNFTTokenUriMetaDataFields = ['name', 'description', 'image', 'attributes']
export const validNFTTokenUriMetaDataAttributesFields = ['trait_type', 'value']
export const validNFTUriMetaDataAttributeTypes = ['string', 'number', 'boolean']
export const validNFTCollectionUriMetaDataFields = ['name', 'description', 'image']

export function validateNFTTokenUriMetaData(metadata: any): NFTTokenUriMetaData {
  Object.keys(metadata).forEach((key) => {
    if (!validNFTTokenUriMetaDataFields.includes(key)) {
      throw new Error(`Invalid field ${key}, only ${validNFTTokenUriMetaDataFields} are allowed`)
    }
  })

  const name = validateNonEmptyString(metadata, 'name')
  const description = validateNonEmptyStringIfExists(metadata, 'description')
  const image = validateNonEmptyString(metadata, 'image')
  const attributes = validateNFTTokenUriMetaDataAttributes(metadata['attributes'])

  return { name, description, image, attributes }
}

export function validateNFTCollectionUriMetaData(metadata: any): NFTCollectionUriMetaData {
  Object.keys(metadata).forEach((key) => {
    if (!validNFTCollectionUriMetaDataFields.includes(key)) {
      throw new Error(`Invalid field ${key}, only ${validNFTCollectionUriMetaDataFields} are allowed`)
    }
  })

  const name = validateNonEmptyString(metadata, 'name')
  const description = validateNonEmptyString(metadata, 'description')
  const image = validateNonEmptyString(metadata, 'image')

  return { name, description, image }
}

export async function validateNFTBaseUri(nftBaseUri: string, maxSupply: number): Promise<NFTTokenUriMetaData[]> {
  if (isInteger(maxSupply) && maxSupply > 0) {
    const nftMetadataz: NFTTokenUriMetaData[] = []

    for (let i = 0; i < maxSupply; i++) {
      const nftMetadata = await fetchNFTMetadata(nftBaseUri, i)
      const validatedNFTMetadata = validateNFTTokenUriMetaData(nftMetadata)
      nftMetadataz.push(validatedNFTMetadata)
    }

    return nftMetadataz
  } else {
    throw new Error('maxSupply should be a positive integer')
  }
}

function validateNFTTokenUriMetaDataAttributes(attributes: any): NFTTokenUriMetaData['attributes'] {
  if (!!attributes) {
    if (!Array.isArray(attributes)) {
      throw new Error(`Field 'attributes' should be an array`)
    }

    attributes.forEach((item) => {
      if (typeof item !== 'object') {
        throw new Error(`Field 'attributes' should be an array of objects`)
      }

      Object.keys(item).forEach((key) => {
        if (!validNFTTokenUriMetaDataAttributesFields.includes(key)) {
          throw new Error(
            `Invalid field ${key} for attributes, only ${validNFTTokenUriMetaDataAttributesFields} are allowed`
          )
        }
      })

      validateNonEmptyString(item, 'trait_type')
      validateNonEmptyAttributeValue(item, 'value')
    })
  }

  return attributes as NFTTokenUriMetaData['attributes']
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

async function fetchNFTMetadata(nftBaseUri: string, index: number) {
  try {
    return await (await fetch(`${nftBaseUri}${index}`)).json()
  } catch (e) {
    throw new TraceableError(`Error fetching NFT metadata from ${nftBaseUri}${index}`, e)
  }
}

function isInteger(num: number) {
  return num === parseInt(num.toString(), 10)
}
