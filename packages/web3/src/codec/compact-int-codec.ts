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
import { BigIntCodec } from './bigint-codec'
import { Reader } from './reader'

const maskRest = 0xc0
const maskMode = 0x3f
const maskModeNeg = 0xffffffc0

type FixedWidthMode = {
  type: 'SingleByte' | 'TwoByte' | 'FourByte'
  prefix: number
  negPrefix: number
}
type MultiByteMode = { type: 'MultiByte'; prefix: number }
type Mode = FixedWidthMode | MultiByteMode

const SingleByteMode: FixedWidthMode = { type: 'SingleByte', prefix: 0x00, negPrefix: 0xc0 }
const TwoByteMode: FixedWidthMode = { type: 'TwoByte', prefix: 0x40, negPrefix: 0x80 }
const FourByteMode: FixedWidthMode = { type: 'FourByte', prefix: 0x80, negPrefix: 0x40 }
const MultiByte: MultiByteMode = { type: 'MultiByte', prefix: 0xc0 }

function decodeMode(input: Reader): { mode: Mode; body: Uint8Array } {
  const byte = input.consumeByte()
  switch (byte & maskRest) {
    case SingleByteMode.prefix:
      return { mode: SingleByteMode, body: new Uint8Array([byte]) }
    case TwoByteMode.prefix:
      return { mode: TwoByteMode, body: new Uint8Array([byte, ...input.consumeBytes(1)]) }
    case FourByteMode.prefix:
      return { mode: FourByteMode, body: new Uint8Array([byte, ...input.consumeBytes(3)]) }
    default: {
      const length = (byte & maskMode) + 4
      return { mode: MultiByte, body: new Uint8Array([byte, ...input.consumeBytes(length)]) }
    }
  }
}

export class UnSigned {
  static readonly oneByteBound = BigInt(0x40)
  static readonly twoByteBound = UnSigned.oneByteBound << BigInt(8)
  static readonly fourByteBound = UnSigned.oneByteBound << BigInt(8 * 3)
  static readonly u256UpperBound = BigInt(1) << BigInt(256)
  static readonly u32UpperBound = 2 ** 32

  static encodeU32(value: number): Uint8Array {
    assert(value >= 0 && value < UnSigned.u32UpperBound, `Invalid u32 value: ${value}`)

    if (value < UnSigned.oneByteBound) {
      return new Uint8Array([(SingleByteMode.prefix + value) & 0xff])
    } else if (value < UnSigned.twoByteBound) {
      return new Uint8Array([(TwoByteMode.prefix + (value >> 8)) & 0xff, value & 0xff])
    } else if (value < UnSigned.fourByteBound) {
      return new Uint8Array([
        (FourByteMode.prefix + (value >> 24)) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    } else {
      return new Uint8Array([
        MultiByte.prefix,
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    }
  }

  static encodeU256(value: bigint): Uint8Array {
    assert(value >= 0n && value < UnSigned.u256UpperBound, `Invalid u256 value: ${value}`)

    if (value < UnSigned.fourByteBound) {
      return UnSigned.encodeU32(Number(value))
    } else {
      let bytes = BigIntCodec.encode(value)
      if (bytes[0] === 0) {
        bytes = bytes.slice(1)
      }

      const header = (bytes.length - 4 + MultiByte.prefix) & 0xff
      return new Uint8Array([header, ...bytes])
    }
  }

  static decodeInt(mode: FixedWidthMode, body: Uint8Array): number {
    switch (mode.type) {
      case 'SingleByte':
        assert(body.length === 1, 'Length should be 2')
        return body[0]
      case 'TwoByte':
        assert(body.length === 2, 'Length should be 2')
        return ((body[0] & maskMode) << 8) | (body[1] & 0xff)
      case 'FourByte':
        assert(body.length === 4, 'Length should be 4')
        return (
          (((body[0] & maskMode) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)) >>> 0
        )
    }
  }

  static decodeU32(mode: Mode, body: Uint8Array): number {
    switch (mode.type) {
      case 'SingleByte':
      case 'TwoByte':
      case 'FourByte':
        return UnSigned.decodeInt(mode, body)
      case 'MultiByte':
        assert(body.length >= 5, 'Length should be greater than 5')
        if (body.length === 5) {
          return ((body[1] << 24) | ((body[2] & 0xff) << 16) | ((body[3] & 0xff) << 8) | (body[4] & 0xff)) >>> 0
        } else {
          throw new Error(`Expect 4 bytes int, but get ${body.length - 1} bytes int`)
        }
    }
  }

  static decodeU256(mode: Mode, body: Uint8Array): bigint {
    switch (mode.type) {
      case 'SingleByte':
      case 'TwoByte':
      case 'FourByte':
        return BigInt(UnSigned.decodeInt(mode, body))
      case 'MultiByte':
        return BigIntCodec.decodeUnsigned(body.slice(1, body.length))
    }
  }
}

export const u256Codec = new (class extends Codec<bigint> {
  encode(input: bigint): Uint8Array {
    return UnSigned.encodeU256(input)
  }
  _decode(input: Reader): bigint {
    const { mode, body } = decodeMode(input)
    return UnSigned.decodeU256(mode, body)
  }
})()

export const u32Codec = new (class extends Codec<number> {
  encode(input: number): Uint8Array {
    return UnSigned.encodeU32(input)
  }
  _decode(input: Reader): number {
    const { mode, body } = decodeMode(input)
    return UnSigned.decodeU32(mode, body)
  }
})()

export class Signed {
  static readonly signFlag = 0x20 // 0b00100000
  static readonly oneByteBound = BigInt(0x20)
  static readonly twoByteBound = Signed.oneByteBound << BigInt(8)
  static readonly fourByteBound = Signed.oneByteBound << BigInt(8 * 3)
  static readonly i256UpperBound = BigInt(1) << BigInt(255)
  static readonly i256LowerBound = -Signed.i256UpperBound
  static readonly i32UpperBound = 2 ** 31
  static readonly i32LowerBound = -Signed.i32UpperBound

  static encodeI32(value: number): Uint8Array {
    assert(value >= Signed.i32LowerBound && value < Signed.i32UpperBound, `Invalid i32 value: ${value}`)
    if (value >= 0) {
      return Signed.encodePositiveI32(value)
    } else {
      return Signed.encodeNegativeI32(value)
    }
  }

  static encodePositiveI32(value: number): Uint8Array {
    if (value < this.oneByteBound) {
      return new Uint8Array([(SingleByteMode.prefix + value) & 0xff])
    } else if (value < this.twoByteBound) {
      return new Uint8Array([(TwoByteMode.prefix + (value >> 8)) & 0xff, value & 0xff])
    } else if (value < this.fourByteBound) {
      return new Uint8Array([
        (FourByteMode.prefix + (value >> 24)) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    } else {
      return new Uint8Array([
        MultiByte.prefix,
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    }
  }

  static encodeNegativeI32(value: number): Uint8Array {
    if (value >= -this.oneByteBound) {
      return new Uint8Array([(value ^ SingleByteMode.negPrefix) & 0xff])
    } else if (value >= -this.twoByteBound) {
      return new Uint8Array([((value >> 8) ^ TwoByteMode.negPrefix) & 0xff, value & 0xff])
    } else if (value >= -this.fourByteBound) {
      return new Uint8Array([
        ((value >> 24) ^ FourByteMode.negPrefix) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    } else {
      return new Uint8Array([
        MultiByte.prefix,
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    }
  }

  static encodeI256(value: bigint): Uint8Array {
    assert(value >= Signed.i256LowerBound && value < Signed.i256UpperBound, `Invalid i256 value: ${value}`)

    if (value >= -0x20000000 && value < 0x20000000) {
      return this.encodeI32(Number(value))
    } else {
      const bytes = BigIntCodec.encode(value)
      const header = (bytes.length - 4 + MultiByte.prefix) & 0xff
      return new Uint8Array([header, ...bytes])
    }
  }

  static decodeInt(mode: FixedWidthMode, body: Uint8Array): number {
    const isPositive = (body[0] & Signed.signFlag) === 0
    if (isPositive) {
      return Signed.decodePositiveInt(mode, body)
    } else {
      return Signed.decodeNegativeInt(mode, body)
    }
  }

  static decodePositiveInt(mode: FixedWidthMode, body: Uint8Array): number {
    switch (mode.type) {
      case 'SingleByte':
        return body[0]
      case 'TwoByte':
        assert(body.length === 2, 'Length should be 2')
        return ((body[0] & maskMode) << 8) | (body[1] & 0xff)
      case 'FourByte':
        assert(body.length === 4, 'Length should be 4')
        return ((body[0] & maskMode) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)
    }
  }

  static decodeNegativeInt(mode: FixedWidthMode, body: Uint8Array) {
    switch (mode.type) {
      case 'SingleByte':
        return body[0] | maskModeNeg
      case 'TwoByte':
        assert(body.length === 2, 'Length should be 2')
        return ((body[0] | maskModeNeg) << 8) | (body[1] & 0xff)
      case 'FourByte':
        assert(body.length === 4, 'Length should be 4')
        return ((body[0] | maskModeNeg) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)
    }
  }

  static decodeI32(mode: Mode, body: Uint8Array): number {
    switch (mode.type) {
      case 'SingleByte':
      case 'TwoByte':
      case 'FourByte':
        return Signed.decodeInt(mode, body)
      case 'MultiByte':
        if (body.length === 5) {
          return (body[1] << 24) | ((body[2] & 0xff) << 16) | ((body[3] & 0xff) << 8) | (body[4] & 0xff)
        } else {
          throw new Error(`Expect 4 bytes int, but get ${body.length - 1} bytes int`)
        }
    }
  }

  static decodeI256(mode: Mode, body: Uint8Array): bigint {
    switch (mode.type) {
      case 'SingleByte':
      case 'TwoByte':
      case 'FourByte':
        return BigInt(Signed.decodeInt(mode, body))
      case 'MultiByte':
        const bytes = body.slice(1, body.length)
        assert(bytes.length <= 32, 'Expect <= 32 bytes for I256')
        return BigIntCodec.decodeSigned(bytes)
    }
  }
}

export const i256Codec = new (class extends Codec<bigint> {
  encode(input: bigint): Uint8Array {
    return Signed.encodeI256(input)
  }
  _decode(input: Reader): bigint {
    const { mode, body } = decodeMode(input)
    return Signed.decodeI256(mode, body)
  }
})()
export const i32Codec = new (class extends Codec<number> {
  encode(input: number): Uint8Array {
    return Signed.encodeI32(input)
  }
  _decode(input: Reader): number {
    const { mode, body } = decodeMode(input)
    return Signed.decodeI32(mode, body)
  }
})()
