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

import { BigIntCodec } from './bigint-codec'
import { randomBytes } from 'crypto'

describe('Encode & decode bigint', function () {
  it('should encode and decode bigint', function () {
    for (let i = 0; i < 1000; i++) {
      const isNegative = i % 2 === 0
      const n = BigInt('0x' + randomBytes(100).toString('hex')) * (isNegative ? -1n : 1n)
      const encoded = BigIntCodec.encode(n)
      const decoded = isNegative ? BigIntCodec.decodeSigned(encoded) : BigIntCodec.decodeUnsigned(encoded)
      expect(n).toEqual(decoded)
    }
  })
})
