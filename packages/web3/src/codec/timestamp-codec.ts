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
import { Codec, assert } from './codec'
import { Reader } from './reader'

export class TimestampCodec extends Codec<bigint> {
  static max = 1n << 64n

  encode(input: bigint): Uint8Array {
    assert(input >= 0n && input < TimestampCodec.max, `Invalid timestamp: ${input}`)

    const byteArray = new Uint8Array(8)
    for (let index = 0; index < 8; index += 1) {
      byteArray[`${index}`] = Number((input >> BigInt((7 - index) * 8)) & BigInt(0xff))
    }

    return byteArray
  }

  _decode(input: Reader): bigint {
    const bytes = input.consumeBytes(8)
    return BigInt(`0x${binToHex(bytes)}`)
  }
}

export const timestampCodec = new TimestampCodec()
