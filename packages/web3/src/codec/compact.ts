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

import { Decoder, Encoder } from './codec'
import { ByteArray, byteArray } from './byteArray'

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

export const multiByte = <FixedWidth>{
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
  static readonly u256UpperBound = BigInt(1) << BigInt(256)

  static decode256: Decoder<bigint> = byteArray<bigint>((bytes) => {
    if (isMulti(bytes)) {
      return Unsigned.decode256Part(bytes)
    }
    return BigInt(Unsigned.decodeInt(bytes))
  })

  static decode256Part = (bytes: ByteArray) => {
    //TODO
    const expectedLen = (bytes[bytes.pos] & maskMode) + 4
    bytes.pos += 1
    const data = bytes.slice(bytes.pos, bytes.pos + expectedLen)
    bytes.pos += expectedLen
    return BigInt('0x' + Buffer.from(data).toString('hex'))
  }

  static decodeInt = (bytes: ByteArray) => {
    let result = 0
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
    }
    return result
  }
  static decode32: Decoder<number> = byteArray<number>((bytes) => {
    if (isMulti(bytes)) {
      const value = toInt(bytes.slice(bytes.pos + 1, bytes.pos + 5))
      bytes.pos += 5
      return value
    }
    return Unsigned.decodeInt(bytes)
  })

  static encode32: Encoder<number> = (n: number) => {
    if (n < 0) {
      throw Error(`number for uint: ${n}`)
    } else if (n < Unsigned.oneByteBound) {
      return new Int8Array([n + singleByte.prefix])
    } else if (n < Unsigned.twoByteBound) {
      return new Int8Array([(n >> 8) + twoByte.prefix, n])
    } else if (n < Unsigned.fourByteBound) {
      return new Int8Array([(n >> 24) + fourByte.prefix, n >> 16, n >> 8, n])
    } else {
      return new Int8Array([multiByte.prefix, n >> 24, n >> 16, n >> 8, n])
    }
  }

  static encode256: Encoder<bigint> = (input: bigint) => {
    if (input < Unsigned.fourByteBound) {
      return Unsigned.encode32(Number(input))
    } else if (input < Unsigned.u256UpperBound) {
      return BigIntToBytes(input, false, false)
    } else {
      throw Error(`Too large number for U256: ${input}`)
    }
  }
}

export function toInt(bytes: Int8Array): number {
  return ((bytes[0] & 0xff) << 24) | ((bytes[1] & 0xff) << 16) | ((bytes[2] & 0xff) << 8) | (bytes[3] & 0xff)
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
  static decodeInt: Decoder<number> = byteArray((bytes) => {
    if (isMulti(bytes)) {
      const value = toInt(bytes.slice(bytes.pos + 1, bytes.pos + 5))
      bytes.pos += 5
      return value
    } else {
      return Signed.decode(bytes)
    }
  })

  static decode = (bytes: ByteArray): number => {
    const isPositive = (bytes[bytes.pos] & Signed.signFlag) == 0
    if (isPositive) {
      return Signed.decodePositiveInt(bytes)
    } else {
      return Signed.decodeNegativeInt(bytes)
    }
  }

  static decodePositiveInt = Unsigned.decodeInt
  static decodeNegativeInt = (bytes: ByteArray) => {
    let result = 0
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
    }
    return result
  }

  static decode256: Decoder<bigint> = byteArray<bigint>((bytes) => {
    if (isMulti(bytes)) {
      return Unsigned.decode256Part(bytes)
    }
    return BigInt(Signed.decode(bytes))
  })

  static encode256: Encoder<bigint> = (n: bigint) => {
    if (n >= -0x20000000 && n < 0x20000000) {
      return Signed.encodeInt(Number(n))
    } else {
      if (n >= 0) {
        return BigIntToBytes(n, true, false)
      } else {
        return BigIntToBytes(~n, true, true)
      }
    }
  }

  static encodeInt: Encoder<number> = (n: number) => {
    if (n >= 0) {
      return Signed.encodePositiveInt(n)
    } else {
      return Signed.encodeNegativeInt(n)
    }
  }
  static encodePositiveInt: Encoder<number> = (n: number) => {
    if (n < 0) {
      throw Error(`number for uint: ${n}`)
    } else if (n < Signed.oneByteBound) {
      return new Int8Array([n + singleByte.prefix])
    } else if (n < Signed.twoByteBound) {
      return new Int8Array([(n >> 8) + twoByte.prefix, n])
    } else if (n < Signed.fourByteBound) {
      return new Int8Array([(n >> 24) + fourByte.prefix, n >> 16, n >> 8, n])
    } else {
      return new Int8Array([multiByte.prefix, n >> 24, n >> 16, n >> 8, n])
    }
  }

  static encodeNegativeInt: Encoder<number> = (n: number) => {
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
}

function isMulti(bytes: ByteArray): boolean {
  switch (bytes[bytes.pos] & maskRest) {
    case singleByte.prefix:
      return false
    case twoByte.prefix:
      return false
    case fourByte.prefix:
      return false
    default:
      return true
  }
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
