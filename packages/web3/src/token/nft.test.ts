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

import { validateNFTCollectionUriMetaData, validateNFTTokenUriMetaData, validateNFTBaseUri } from './nft'

describe('NFT Metadata Validation', () => {
  describe('Token URI Metadata', () => {
    const validMetadataWithoutAttributes = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/'
    }

    const validMetadataWithAttributes = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/',
      attributes: [
        { trait_type: 'color', value: 'blue' },
        { trait_type: 'size', value: 100 },
        { trait_type: 'valid', value: true }
      ]
    }

    it('validates metadata without attributes', () => {
      expect(validateNFTTokenUriMetaData(validMetadataWithoutAttributes)).toEqual(validMetadataWithoutAttributes)
    })

    it('validates metadata with attributes', () => {
      expect(validateNFTTokenUriMetaData(validMetadataWithAttributes)).toEqual(validMetadataWithAttributes)
    })

    it('throws an error for empty description', () => {
      const metadata = { ...validMetadataWithoutAttributes, description: '' }
      expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
    })

    it('throws an error for empty name', () => {
      const metadata = { ...validMetadataWithoutAttributes, name: '' }
      expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
    })

    it('throws an error for missing required fields', () => {
      const metadata = { description: 'NFT description', image: 'https://example.com/' }
      expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
    })

    it('throws an error for invalid field names', () => {
      const metadata = { ...validMetadataWithoutAttributes, url: 'https://example.com/' }
      expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
    })

    it('throws an error for non-JSON input', () => {
      expect(() => validateNFTTokenUriMetaData('not-a-json')).toThrow(Error)
    })

    describe('Attributes Validation', () => {
      it('throws an error for invalid attributes type', () => {
        const metadata = { ...validMetadataWithAttributes, attributes: 'not-an-array' }
        expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
      })

      it('throws an error for invalid attribute value type', () => {
        const metadata = { ...validMetadataWithAttributes, attributes: [{ trait_type: 'color', value: [] }] }
        expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
      })

      it('throws an error for invalid attribute trait_type type', () => {
        const metadata = { ...validMetadataWithAttributes, attributes: [{ trait_type: 1, value: 'blue' }] }
        expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
      })

      it('throws an error for additional unexpected fields in attributes', () => {
        const metadata = {
          ...validMetadataWithAttributes,
          attributes: [{ trait_type: 'color', extra: 'blue', value: 'blue' }]
        }
        expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
      })

      it('throws an error for empty trait_type and value', () => {
        const metadata = { ...validMetadataWithAttributes, attributes: [{ trait_type: '', value: '' }] }
        expect(() => validateNFTTokenUriMetaData(metadata)).toThrow(Error)
      })
    })
  })

  describe('Collection URI Metadata', () => {
    const validCollectionMetadata = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/'
    }

    it('validates collection metadata', () => {
      expect(validateNFTCollectionUriMetaData(validCollectionMetadata)).toEqual(validCollectionMetadata)
    })

    it('throws an error for metadata with attributes', () => {
      const metadata = {
        ...validCollectionMetadata,
        attributes: [{ trait_type: 'color', value: 'blue' }]
      }
      expect(() => validateNFTCollectionUriMetaData(metadata)).toThrow(Error)
    })

    it('throws an error for missing required fields', () => {
      const metadata = { name: 'NFT name', image: 'https://example.com/' }
      expect(() => validateNFTCollectionUriMetaData(metadata)).toThrow(Error)
    })

    it('throws an error for empty name or description', () => {
      const metadata = { ...validCollectionMetadata, name: '' }
      expect(() => validateNFTCollectionUriMetaData(metadata)).toThrow(Error)

      const metadataWithEmptyDescription = { ...validCollectionMetadata, description: '' }
      expect(() => validateNFTCollectionUriMetaData(metadataWithEmptyDescription)).toThrow(Error)
    })
  })
})

describe('NFT Base URI Validation', () => {
  const validUri = 'https://ipfs.io/ipfs/QmU7N7JMP3sF3YpSZ1v2G763BE8hHoaH7e6jJmxiu6N6Sh/'

  it('validates a valid base URI with a specified token count', async () => {
    const expectedTokens = [
      {
        name: 'Tom',
        description: 'Tom is a grumpy brown male cat',
        image: 'https://ipfs.io/ipfs/QmPUSyTUkWNiMotLusWauo6wnFb9sPnh4bgwU5c5JQT4vS/0'
      },
      {
        name: 'Leslie',
        description: 'Leslie is a grumpy grey female cat',
        image: 'https://ipfs.io/ipfs/QmPUSyTUkWNiMotLusWauo6wnFb9sPnh4bgwU5c5JQT4vS/1'
      }
    ]
    await expect(validateNFTBaseUri(validUri, 2)).resolves.toEqual(expectedTokens)
  })

  it('validates with fewer tokens than the URI provides', async () => {
    const expectedTokens = [
      {
        name: 'Tom',
        description: 'Tom is a grumpy brown male cat',
        image: 'https://ipfs.io/ipfs/QmPUSyTUkWNiMotLusWauo6wnFb9sPnh4bgwU5c5JQT4vS/0'
      }
    ]
    await expect(validateNFTBaseUri(validUri, 1)).resolves.toEqual(expectedTokens)
  })

  it('throws an error for invalid token count', async () => {
    await expect(validateNFTBaseUri(validUri, 0)).rejects.toThrow(Error)
    await expect(validateNFTBaseUri(validUri, -1)).rejects.toThrow(Error)
    await expect(validateNFTBaseUri(validUri, 1.1)).rejects.toThrow(Error)
  })

  it('throws an error for invalid base URI', async () => {
    const invalidUri = 'https://ipfs.io/ipfs/invalid'
    await expect(validateNFTBaseUri(invalidUri, 2)).rejects.toThrow(Error)
  })

  it('throws an error if attributes contains non-object items', () => {
    const metadata = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/',
      attributes: ['not-an-object', 42, true] // Invalid entries
    }

    expect(() => validateNFTTokenUriMetaData(metadata)).toThrowError("Field 'attributes' should be an array of objects")
  })

  it('does not throw an error if attributes contains only objects', () => {
    const metadata = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/',
      attributes: [
        { trait_type: 'color', value: 'blue' },
        { trait_type: 'size', value: 10 }
      ] // Valid entries
    }

    expect(() => validateNFTTokenUriMetaData(metadata)).not.toThrow()
  })
})
