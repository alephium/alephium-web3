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

import { validateNFTCollectionMetadata, validateNFTMetadata, validateTokenBaseUriForPreDesignedCollection } from './nft'

describe('nft', function () {
  it('should validate NFT and NFT collection metadata', () => {
    const valid = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/'
    }

    expect(validateNFTMetadata(valid)).toEqual(valid)
    expect(validateNFTCollectionMetadata(valid)).toEqual(valid)

    const withEmptyField = {
      name: 'NFT name',
      description: '',
      image: 'https://example.com/'
    }
    expect(() => validateNFTMetadata(withEmptyField)).toThrow(Error)
    expect(() => validateNFTCollectionMetadata(withEmptyField)).toThrow(Error)

    const withWrongField = {
      name: 'NFT name',
      description: '',
      url: 'https://example.com/'
    }
    expect(() => validateNFTMetadata(withWrongField)).toThrow(Error)
    expect(() => validateNFTCollectionMetadata(withWrongField)).toThrow(Error)

    const withMissingField = {
      name: 'NFT name',
      image: 'https://example.com/'
    }
    expect(() => validateNFTMetadata(withMissingField)).toThrow(Error)
    expect(() => validateNFTCollectionMetadata(withMissingField)).toThrow(Error)

    const notAJson = 'not-a-json'
    expect(() => validateNFTMetadata(notAJson)).toThrow(Error)
    expect(() => validateNFTCollectionMetadata(notAJson)).toThrow(Error)
  })

  it('should validate NFT collection token base URL', async () => {
    const validUri = 'https://ipfs.io/ipfs/QmU7N7JMP3sF3YpSZ1v2G763BE8hHoaH7e6jJmxiu6N6Sh/'
    expect(await validateTokenBaseUriForPreDesignedCollection(validUri, 2)).toEqual([
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

    expect(await validateTokenBaseUriForPreDesignedCollection(validUri, 1)).toEqual([
      {
        name: 'Tom',
        description: 'Tom is a grumpy brown male cat',
        image: 'https://ipfs.io/ipfs/QmPUSyTUkWNiMotLusWauo6wnFb9sPnh4bgwU5c5JQT4vS/0'
      }
    ])

    expect(async () => await validateTokenBaseUriForPreDesignedCollection(validUri, 3)).rejects.toThrow(Error)
    expect(async () => await validateTokenBaseUriForPreDesignedCollection(validUri, 0)).rejects.toThrow(Error)
    expect(async () => await validateTokenBaseUriForPreDesignedCollection(validUri, 1.0)).rejects.toThrow(Error)
    expect(async () => await validateTokenBaseUriForPreDesignedCollection(validUri, -5)).rejects.toThrow(Error)
    expect(async () => await validateTokenBaseUriForPreDesignedCollection(validUri, 1.1)).rejects.toThrow(Error)

    const invalidUri = 'https://ipfs.io/ipfs/invalid'
    expect(async () => await validateTokenBaseUriForPreDesignedCollection(invalidUri, 2)).rejects.toThrow(Error)
  })
})
