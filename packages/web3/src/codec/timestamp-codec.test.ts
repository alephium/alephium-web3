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
import { randomBytes } from 'crypto'
import { timestampCodec } from './timestamp-codec'
import { binToHex } from '../utils'

describe('Encode & decode timestamp', function () {
  it('should encode & decode timestamp', function () {
    function test(n: bigint) {
      expect(timestampCodec.decode(timestampCodec.encode(n))).toEqual(n)
    }

    for (let i = 0n; i < 64n; i += 1n) {
      test(1n << i)
      test((1n << i) + 1n)
      test((1n << i) - 1n)
    }

    expect(() => test(-1n)).toThrow()
    expect(() => test(1n << 64n)).toThrow()

    function randomTimestamp(): bigint {
      return BigInt(`0x${binToHex(randomBytes(8))}`)
    }

    for (let i = 0; i < 10; i += 1) {
      test(randomTimestamp())
    }

    test(0n)
    test((1n << 64n) - 1n)
  })
})
