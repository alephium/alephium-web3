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
import { Codec, assert } from './codec'
import { Reader } from './reader'

export class LongCodec extends Codec<bigint> {
  encode(input: bigint): Uint8Array {
    const byteArray = new Uint8Array(8)

    assert(byteArray.length <= 8, 'Length should be less than or equal to 8')
    for (let index = 0; index < byteArray.length; index++) {
      const byte = input & BigInt(0xff)
      byteArray[byteArray.length - index - 1] = Number(byte)
      input >>= BigInt(8)
    }

    return byteArray
  }

  _decode(input: Reader): bigint {
    const bytes = input.consumeBytes(8)
    let int64 = BigInt(0)
    let pow = BigInt(1)

    for (let i = bytes.length - 1; i >= 0; i--) {
      int64 += BigInt(bytes[i]) * pow
      pow *= BigInt(256)
    }

    // Determine if the number is negative (check the sign bit of the first byte)
    if (bytes[0] & 0x80) {
      int64 -= BigInt(1) << BigInt(64)
    }

    return int64
  }
}

export const longCodec = new LongCodec()
