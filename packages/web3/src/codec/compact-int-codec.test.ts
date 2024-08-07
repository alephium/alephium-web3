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

import { binToHex } from '../utils'
import { i256Codec, i32Codec, Signed, u256Codec, u32Codec, UnSigned } from './compact-int-codec'
import { randomBytes } from 'crypto'

describe('Encode & decode compact int', function () {
  function randomU32() {
    return ((Math.random() * 0xffffffff) | 0) >>> 0
  }

  function randomU256() {
    return BigInt(`0x${binToHex(randomBytes(32))}`)
  }

  it('should encode/decode u32 & u256', () => {
    function test(n: number) {
      expect(u32Codec.decode(u32Codec.encode(n))).toEqual(n)
      const u256 = BigInt(n)
      expect(u256Codec.decode(u256Codec.encode(u256))).toEqual(u256)
    }

    for (let i = 0; i < 32; i += 1) {
      test(2 ** i)
      test(2 ** i - 1)
      test(2 ** i + 1)
    }

    test(0)
    test(UnSigned.u32UpperBound - 1)
    expect(() => test(-1)).toThrow()
    expect(() => test(UnSigned.u32UpperBound)).toThrow()
    expect(u256Codec.decode(u256Codec.encode(0n))).toEqual(0n)
    expect(u256Codec.decode(u256Codec.encode(UnSigned.u256UpperBound - 1n))).toEqual(UnSigned.u256UpperBound - 1n)
    expect(() => u256Codec.encode(-1n)).toThrow()
    expect(() => u256Codec.encode(UnSigned.u256UpperBound)).toThrow()

    for (let i = 0; i < 10; i += 1) {
      test(randomU32())
      const u256 = randomU256()
      expect(u256Codec.decode(u256Codec.encode(u256))).toEqual(u256)
    }
  })

  it('should encode/decode i32 & i256', () => {
    function test(n: number) {
      if (n >= Signed.i32LowerBound && n < Signed.i32UpperBound) {
        expect(i32Codec.decode(i32Codec.encode(n))).toEqual(n)
      }
      const i256 = BigInt(n)
      expect(i256Codec.decode(i256Codec.encode(i256))).toEqual(i256)
    }

    for (let i = 0; i < 32; i += 1) {
      test(2 ** i)
      test(2 ** i + 1)
      test(2 ** i - 1)
      test(-(2 ** i))
      test(-(2 ** i) + 1)
      test(-(2 ** i) - 1)
    }

    expect(i32Codec.decode(i32Codec.encode(Signed.i32LowerBound))).toEqual(Signed.i32LowerBound)
    expect(i32Codec.decode(i32Codec.encode(Signed.i32UpperBound - 1))).toEqual(Signed.i32UpperBound - 1)
    expect(i256Codec.decode(i256Codec.encode(Signed.i256LowerBound))).toEqual(Signed.i256LowerBound)
    expect(i256Codec.decode(i256Codec.encode(Signed.i256UpperBound - 1n))).toEqual(Signed.i256UpperBound - 1n)

    expect(() => i32Codec.encode(Signed.i32LowerBound - 1)).toThrow()
    expect(() => i32Codec.encode(Signed.i32UpperBound)).toThrow()
    expect(() => i256Codec.encode(Signed.i256LowerBound - 1n)).toThrow()
    expect(() => i256Codec.encode(Signed.i256UpperBound)).toThrow()

    function randomI32(): number {
      return randomU32() - 2 ** 31
    }

    function randomI256(): bigint {
      return randomU256() - (1n << 255n)
    }

    for (let i = 0; i < 10; i += 1) {
      const i32 = randomI32()
      expect(i32Codec.decode(i32Codec.encode(i32))).toEqual(i32)
      expect(i256Codec.decode(i256Codec.encode(BigInt(i32)))).toEqual(BigInt(i32))
      const i256 = randomI256()
      expect(i256Codec.decode(i256Codec.encode(i256))).toEqual(i256)
    }
  })

  it('should serialize examples', () => {
    function test(bytes: Uint8Array, hex: string) {
      expect(binToHex(bytes)).toEqual(hex)
    }

    test(i256Codec.encode(0n), '00')
    test(i32Codec.encode(0), '00')
    test(i256Codec.encode(1n), '01')
    test(i32Codec.encode(1), '01')
    test(i256Codec.encode(-1n), '3f')
    test(i32Codec.encode(-1), '3f')
  })
})
