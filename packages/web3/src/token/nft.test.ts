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

import { validateNFTMetadata } from './nft'

describe('nft', function () {
  it('should validate NFT metadata', () => {
    const valid = {
      name: 'NFT name',
      description: 'NFT description',
      image: 'https://example.com/'
    }

    const validated = validateNFTMetadata(valid)
    expect(validated).toEqual(valid)

    const withEmptyField = {
      name: 'NFT name',
      description: '',
      image: 'https://example.com/'
    }
    expect(() => validateNFTMetadata(withEmptyField)).toThrow(Error)

    const withWrongField = {
      name: 'NFT name',
      description: '',
      url: 'https://example.com/'
    }
    expect(() => validateNFTMetadata(withWrongField)).toThrow(Error)

    const withMissingField = {
      name: 'NFT name',
      image: 'https://example.com/'
    }
    expect(() => validateNFTMetadata(withMissingField)).toThrow(Error)

    const notAJson = 'not-a-json'
    expect(() => validateNFTMetadata(notAJson)).toThrow(Error)
  })
})
