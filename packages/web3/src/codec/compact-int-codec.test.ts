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

import { compactSignedIntCodec } from './compact-int-codec'

describe('Encode & decode compact int', function () {
    it('should encode & decode i32', function () {
      const min = -(2 ** 31)
      const max = 2 ** 31 - 1

      for (let i = 0; i < 10; i++) {
        successI32(getRandomInt32())
      }

      successI32(0)
      successI32(max)
      successI32(min)
      successI32(-371166845)
      failI32(max + 1)
      failI32(min - 1)
      failI32(2 ** 50)
    })

    function successI32(value: number) {
      const encoded = compactSignedIntCodec.encodeI32(value)
      const decoded = compactSignedIntCodec.decodeI32(encoded)
      expect(decoded).toEqual(value)
    }

    function failI32(value: number) {
      const encoded = compactSignedIntCodec.encodeI32(value)
      const decoded = compactSignedIntCodec.decodeI32(encoded)
      expect(decoded).not.toEqual(value)
    }

    function getRandomInt32(): number {
      return (Math.random() * 0xffffffff) | 0
    }
  })
