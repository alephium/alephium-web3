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

import { compactSignedIntCodec, compactUnsignedIntCodec } from './compact-int-codec'
import { randomBytes } from 'crypto'

describe('Encode & decode compact int', function () {
  it('should encode & decode i32', function () {
    const testCodec = new TestCodec(
      (number) => compactSignedIntCodec.encodeI32(number),
      (buffer) => compactSignedIntCodec.decodeI32(buffer),
      () => (Math.random() * 0xffffffff) | 0
    )

    const min = -(2 ** 31)
    const max = 2 ** 31 - 1

    for (let i = 0; i < 10; i++) {
      testCodec.success(testCodec.generateRandom())
    }

    testCodec.success(0)
    testCodec.success(max)
    testCodec.success(min)
    testCodec.success(-371166845)
    testCodec.fail(max + 1)
    testCodec.fail(min - 1)
    testCodec.fail(2 ** 50)
  })

  it('should encode & decode u32', function () {
    const testCodec = new TestCodec(
      (number) => compactUnsignedIntCodec.encodeU32(number),
      (buffer) => compactUnsignedIntCodec.decodeU32(buffer),
      () => (Math.random() * 0xffffffff) >>> 0
    )

    const min = 0
    const max = 2 ** 32 - 1

    for (let i = 0; i < 10; i++) {
      testCodec.success(testCodec.generateRandom())
    }

    testCodec.success(3186864367)
    testCodec.success(0)
    testCodec.success(max)
    testCodec.success(min)
    testCodec.fail(max + 1)
    testCodec.fail(2 ** 50)
  })

  it('should encode & decode u256', function () {
    const testCodec = new TestCodec(
      (number) => compactUnsignedIntCodec.encodeU256(number),
      (buffer) => compactUnsignedIntCodec.decodeU256(buffer),
      () => BigInt('0x' + randomBytes(32).toString('hex'))
    )

    for (let i = 0; i < 10; i++) {
      testCodec.success(testCodec.generateRandom())
    }

    testCodec.success(9520219607152041471n)
    testCodec.success(2n ** 255n - 1n)
    testCodec.success(0n)
    testCodec.throws(-14134776518227075000000000000000000000000000000000000000000000000000000000n)
    testCodec.throws(2n ** 256n)
    testCodec.throws(2n ** 300n)
  })

  class TestCodec {
    constructor(
      private encode: (number) => Buffer,
      private decode: (Buffer) => number | bigint,
      private random: () => number | bigint
    ) {}

    success(value: number | bigint) {
      const encoded = this.encode(value)
      const decoded = this.decode(encoded)
      expect(decoded).toEqual(value)
    }

    fail(value: number | bigint) {
      const encoded = this.encode(value)
      const decoded = this.decode(encoded)
      expect(decoded).not.toEqual(value)
    }

    throws(value: number | bigint) {
      expect(() => this.encode(value)).toThrow(Error)
    }

    generateRandom(): number | bigint {
      return this.random()
    }
  }
})
