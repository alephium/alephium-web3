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

import { Codec, createCodec, Decoder, Encoder } from './codec'
import { byteArray } from './byteArray'

const maskMode = 0x3f
const maskRest = 0xc0
const maskModeNeg = 0xffffffc0

interface FixedWidth {
  prefix: number
  negPrefix: number
}

const singleByte = <FixedWidth>{
  prefix: 0x00, // 0b00000000
  negPrefix: 0xc0 // 0b11000000
}

const twoByte = <FixedWidth>{
  prefix: 0x40, // 0b01000000
  negPrefix: 0x80 // 0b10000000
}

const fourByte = <FixedWidth>{
  prefix: 0x80, // 0b10000000
  negPrefix: 0x40 // 0b01000000
}

const multiByte = <FixedWidth>{
  prefix: 0xc0 // 0b11000000
}

/*
 * unsigned integers are encoded with the first two most significant bits denoting the mode:
 * - 0b00: single-byte mode; [0, 2**6)
 * - 0b01: two-byte mode; [0, 2**14)
 * - 0b10: four-byte mode; [0, 2**30)
 * - 0b11: multi-byte mode: [0, 2**536)
 */

export class Unsigned {
  static oneByteBound = 0x40 // 0b01000000
  static twoByteBound = Unsigned.oneByteBound << 8
  static fourByteBound = Unsigned.oneByteBound << (8 * 3)
}

/*
 * signed integers are encoded with the first two most significant bits denoting the mode:
 * - 0b00: single-byte mode; [-2**5, 2**5)
 * - 0b01: two-byte mode; [-2**13, 2**13)
 * - 0b10: four-byte mode; [-2**29, 2**29)
 * - 0b11: multi-byte mode: [-2**535, 2**535)
 */
export class Signed {
  static signFlag = 0x20 // 0b00100000
  static oneByteBound = 0x20 // 0b00100000
  static twoByteBound = Signed.oneByteBound << 8
  static fourByteBound = Signed.oneByteBound << (8 * 3)

  static compactDec: Decoder<number | bigint> = byteArray<number | bigint>((bytes) => {
    let result: number | bigint = 0
    if (bytes.length == 0) {
      throw incompleteData(1, 0)
    } else {
      const isPositive = (bytes[bytes.pos] & Signed.signFlag) == 0
      if (isPositive) {
        switch (bytes[bytes.pos] & maskRest) {
          case singleByte.prefix:
            result = Number(bytes[bytes.pos])
            bytes.pos++
            break
          case twoByte.prefix:
            result = Number(((bytes[bytes.pos] & maskMode) << 8) | (bytes[bytes.pos + 1] & 0xff))
            bytes.pos += 2
            break
          case fourByte.prefix:
            const value =
              ((bytes[bytes.pos] & maskMode) << 24) |
              ((bytes[bytes.pos + 1] & 0xff) << 16) |
              ((bytes[bytes.pos + 2] & 0xff) << 8) |
              (bytes[bytes.pos + 3] & 0xff)
            result = Number(value)
            bytes.pos += 4
            break
          default:
            // multi byte
            const expectedLen = (bytes[bytes.pos] & maskMode) + 4
            bytes.pos += 1
            const data = bytes.slice(bytes.pos, bytes.pos + expectedLen)
            bytes.pos += expectedLen
            result = BigInt('0x' + Buffer.from(data).toString('hex'))
        }
      } else {
        switch (bytes[bytes.pos] & maskRest) {
          case singleByte.prefix:
            result = Number(bytes[bytes.pos] | maskModeNeg)
            bytes.pos++
            break
          case twoByte.prefix:
            result = Number(((bytes[bytes.pos] | maskModeNeg) << 8) | (bytes[bytes.pos + 1] & 0xff))
            bytes.pos += 2
            break
          case fourByte.prefix:
            const value =
              ((bytes[bytes.pos] | maskModeNeg) << 24) |
              ((bytes[bytes.pos + 1] & 0xff) << 16) |
              ((bytes[bytes.pos + 2] & 0xff) << 8) |
              (bytes[bytes.pos + 3] & 0xff)
            result = Number(value)
            bytes.pos += 4
            break
          default:
            const expectedLen = (bytes[bytes.pos] & maskMode) + 4
            bytes.pos += 1
            const data = bytes.slice(bytes.pos, bytes.pos + expectedLen)
            bytes.pos += expectedLen
            result = BigInt(Buffer.from(data).toString('hex'))
        }
      }
    }
    return result
  })

  static compactEnc: Encoder<number | bigint> = (input) => {
    const n = Number(input)
    if (n >= -0x20000000 && n < 0x20000000) {
      if (n >= 0) {
        if (n < Signed.oneByteBound) {
          return new Int8Array([n + singleByte.prefix])
        } else if (n < Signed.twoByteBound) {
          return new Int8Array([(n >> 8) + twoByte.prefix, n])
        } else if (n < Signed.fourByteBound) {
          return new Int8Array([(n >> 24) + fourByte.prefix, n >> 16, n >> 8, n])
        } else {
          return new Int8Array([multiByte.prefix, n >> 24, n >> 16, n >> 8, n])
        }
      } else {
        if (n >= -Signed.oneByteBound) {
          return new Int8Array([n ^ singleByte.negPrefix])
        } else if (n >= -Signed.twoByteBound) {
          return new Int8Array([(n >> 8) ^ twoByte.negPrefix, n])
        } else if (n >= -Signed.fourByteBound) {
          return new Int8Array([(n >> 24) ^ fourByte.negPrefix, n >> 16, n >> 8, n])
        } else {
          return new Int8Array([multiByte.prefix, n >> 24, n >> 16, n >> 8, n])
        }
      }
    } else {
      const n = BigInt(input)
      if (n >= 0) {
        return BigIntToBytes(n, true, false)
      } else {
        return BigIntToBytes(~n, true, true)
      }
    }
  }

  static compact: Codec<number | bigint> = createCodec(Signed.compactEnc, Signed.compactDec)
}

function checkSize(bs: Uint8Array, expected: number): Uint8Array {
  if (bs.length >= expected) {
    return bs
  } else {
    throw incompleteData(expected, bs.length)
  }
}

interface CodecError {
  message: string
}

function incompleteData(expected: number, got: number): CodecError {
  return {
    message: `Too few bytes: expected ${expected}, got ${got}`
  }
}

// n should be positive
export function BigIntToBytes(n: bigint, signed: boolean, notBit: boolean): Int8Array {
  let hex = n.toString(16)
  if (hex.length % 2 === 1) {
    hex = '0' + hex
  } else if (signed && hex[0] >= '8') {
    hex = '00' + hex // add the byte for sign
  }

  const byteLength = hex.length / 2
  const bytes = new Int8Array(byteLength + 1)
  for (let index = 0; index < byteLength; index++) {
    const offset = index * 2
    const byte = parseInt(hex.slice(offset, offset + 2), 16)
    bytes[`${index + 1}`] = notBit ? ~byte : byte
  }

  bytes[0] = byteLength - 4 + multiByte.prefix
  return bytes
}
