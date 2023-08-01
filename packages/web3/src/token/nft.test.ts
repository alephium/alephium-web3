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

import { validateNFTCollectionUriMetadata, validateNFTTokenUriMetadata, validateNFTBaseUri } from './nft'

describe('nft', function () {
  it('should validate NFT and NFT collection metadata', () => {
    const validWithoutAttributes = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/'
    }

    expect(validateNFTTokenUriMetadata(validWithoutAttributes)).toEqual(validWithoutAttributes)
    expect(validateNFTCollectionUriMetadata(validWithoutAttributes)).toEqual(validWithoutAttributes)

    const validWithAttributes = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/',
      attributes: [
        {
          trait_type: 'color',
          value: 'blue'
        },
        {
          trait_type: 'size',
          value: 100
        },
        {
          trait_type: 'valid',
          value: true
        }
      ]
    }

    expect(validateNFTTokenUriMetadata(validWithAttributes)).toEqual(validWithAttributes)
    expect(() => validateNFTCollectionUriMetadata(validWithAttributes)).toThrow(Error)

    const withEmptyDescription = {
      name: 'NFT name',
      description: '',
      image: 'https://example.com/'
    }
    expect(() => validateNFTTokenUriMetadata(withEmptyDescription)).toThrow(Error)
    expect(() => validateNFTCollectionUriMetadata(withEmptyDescription)).toThrow(Error)

    const withEmptyName = {
      name: '',
      description: 'NFT description',
      image: 'https://example.com/'
    }
    expect(() => validateNFTTokenUriMetadata(withEmptyName)).toThrow(Error)
    expect(() => validateNFTCollectionUriMetadata(withEmptyName)).toThrow(Error)

    const withWrongField = {
      name: 'NFT name',
      description: '',
      url: 'https://example.com/'
    }
    expect(() => validateNFTTokenUriMetadata(withWrongField)).toThrow(Error)
    expect(() => validateNFTCollectionUriMetadata(withWrongField)).toThrow(Error)

    const withMissingDescription = {
      name: 'NFT name',
      image: 'https://example.com/'
    }
    expect(validateNFTTokenUriMetadata(withMissingDescription)).toEqual(withMissingDescription)
    expect(() => validateNFTCollectionUriMetadata(withMissingDescription)).toThrow(Error)

    const withMissingName = {
      description: 'NFT description',
      image: 'https://example.com/'
    }
    expect(() => validateNFTTokenUriMetadata(withMissingName)).toThrow(Error)
    expect(() => validateNFTCollectionUriMetadata(withMissingName)).toThrow(Error)

    const notAJson = 'not-a-json'
    expect(() => validateNFTTokenUriMetadata(notAJson)).toThrow(Error)
    expect(() => validateNFTCollectionUriMetadata(notAJson)).toThrow(Error)

    const withWrongAttributesType = {
      ...validWithAttributes,
      attributes: 'not-an-array'
    }
    expect(() => validateNFTTokenUriMetadata(withWrongAttributesType)).toThrow(Error)

    const withWrongAttributesValueType = {
      ...validWithAttributes,
      attributes: [{ trait_type: 'color', value: [] }]
    }
    expect(() => validateNFTTokenUriMetadata(withWrongAttributesValueType)).toThrow(Error)

    const withWrongAttributesTraitType = {
      ...validWithAttributes,
      attributes: [{ trait_type: 1, value: 'blue' }]
    }
    expect(() => validateNFTTokenUriMetadata(withWrongAttributesTraitType)).toThrow(Error)

    const withWrongAttributesField = {
      ...validWithAttributes,
      attributes: [{ trait_type: 'color', trait_type_2: 'color', value: 'blue' }]
    }
    expect(() => validateNFTTokenUriMetadata(withWrongAttributesField)).toThrow(Error)

    const withWrongEmptyAttributesField = {
      ...validWithAttributes,
      attributes: [{ trait_type: '', value: '' }]
    }
    expect(() => validateNFTTokenUriMetadata(withWrongEmptyAttributesField)).toThrow(Error)
  })

  it('should validate NFT collection token base URL', async () => {
    const validUri = 'https://ipfs.io/ipfs/QmU7N7JMP3sF3YpSZ1v2G763BE8hHoaH7e6jJmxiu6N6Sh/'
    expect(await validateNFTBaseUri(validUri, 2)).toEqual([
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
    ])

    expect(await validateNFTBaseUri(validUri, 1)).toEqual([
      {
        name: 'Tom',
        description: 'Tom is a grumpy brown male cat',
        image: 'https://ipfs.io/ipfs/QmPUSyTUkWNiMotLusWauo6wnFb9sPnh4bgwU5c5JQT4vS/0'
      }
    ])

    expect(async () => await validateNFTBaseUri(validUri, 3)).rejects.toThrow(Error)
    expect(async () => await validateNFTBaseUri(validUri, 0)).rejects.toThrow(Error)
    expect(async () => await validateNFTBaseUri(validUri, -5)).rejects.toThrow(Error)
    expect(async () => await validateNFTBaseUri(validUri, 1.1)).rejects.toThrow(Error)

    const invalidUri = 'https://ipfs.io/ipfs/invalid'
    expect(async () => await validateNFTBaseUri(invalidUri, 2)).rejects.toThrow(Error)
  })
})
