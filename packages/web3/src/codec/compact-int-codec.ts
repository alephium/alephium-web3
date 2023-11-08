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
import { Parser } from 'binary-parser'
import { Codec, assert } from './codec'

export class CompactInt {
  static readonly oneBytePrefix = 0x00
  static readonly oneByteNegPrefix = 0xc0
  static readonly twoBytePrefix = 0x40
  static readonly twoByteNegPrefix = 0x80
  static readonly fourBytePrefix = 0x80
  static readonly fourByteNegPrefix = 0x40
  static readonly multiBytePrefix = 0xc0
}

const maskRest = 0xc0
const maskMode = 0x3f
const maskModeNeg = 0xffffffc0
const signFlag = 0x20 // 0b00100000

export interface DecodedCompactInt {
  mode: number
  rest: Uint8Array
}

const compactIntParser = new Parser().uint8('mode').buffer('rest', {
  length: function (ctx) {
    const rawMode = this['mode']
    const mode = rawMode & maskRest

    switch (mode) {
      case CompactInt.oneBytePrefix:
        return 0
      case CompactInt.twoBytePrefix:
        return 1
      case CompactInt.fourBytePrefix:
        return 3
      default:
        return (rawMode & maskMode) + 4
    }
  }
})

export class CompactUnsignedIntCodec implements Codec<DecodedCompactInt> {
  private oneByteBound = 0x40
  private twoByteBound = this.oneByteBound << 8
  private fourByteBound = this.oneByteBound << (8 * 3)

  parser = compactIntParser

  encode(input: DecodedCompactInt): Buffer {
    return Buffer.from([input.mode, ...input.rest])
  }

  encodeU32(value: number): Buffer {
    if (value < this.oneByteBound) {
      return Buffer.from([(CompactInt.oneBytePrefix + value) & 0xff])
    } else if (value < this.twoByteBound) {
      return Buffer.from([(CompactInt.twoBytePrefix + (value >> 8)) & 0xff, value & 0xff])
    } else if (value < this.fourByteBound) {
      return Buffer.from([
        (CompactInt.fourBytePrefix + (value >> 24)) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    } else {
      return Buffer.from([
        CompactInt.multiBytePrefix,
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    }
  }

  decodeU32(input: Buffer): number {
    const decoded = this.decode(input)
    return this.toU32(decoded)
  }

  decode(input: Buffer): DecodedCompactInt {
    return this.parser.parse(input)
  }

  toU32(value: DecodedCompactInt): number {
    const body = Buffer.from([value.mode, ...value.rest])
    return decodePositiveInt(value.mode, body)
  }

  toU256(value: DecodedCompactInt): bigint {
    const mode = value.mode & maskRest
    if (fixedSize(mode)) {
      return BigInt(this.toU32(value))
    } else {
      return BigInt('0x' + Buffer.from(value.rest).toString('hex'))
    }
  }
}

export const compactUnsignedIntCodec = new CompactUnsignedIntCodec()

export class CompactSignedIntCodec implements Codec<DecodedCompactInt> {
  private signFlag = 0x20 // 0b00100000
  private oneByteBound = 0x20 // 0b00100000
  private twoByteBound = this.oneByteBound << 8
  private fourByteBound = this.oneByteBound << (8 * 3)

  parser = compactIntParser

  encode(input: DecodedCompactInt): Buffer {
    return Buffer.from([input.mode, ...input.rest])
  }

  decode(input: Buffer): DecodedCompactInt {
    return this.parser.parse(input)
  }

  decodeI32(input: Buffer): number {
    const decoded = this.decode(input)
    return this.toI32(decoded)
  }

  encodeI32(value: number): Buffer {
    if (value >= 0) {
      if (value < this.oneByteBound) {
        return Buffer.from([(CompactInt.oneBytePrefix + value) & 0xff])
      } else if (value < this.twoByteBound) {
        return Buffer.from([(CompactInt.twoBytePrefix + (value >> 8)) & 0xff, value & 0xff])
      } else if (value < this.fourByteBound) {
        return Buffer.from([
          (CompactInt.fourBytePrefix + (value >> 24)) & 0xff,
          (value >> 16) & 0xff,
          (value >> 8) & 0xff,
          value & 0xff
        ])
      } else {
        return Buffer.from([
          CompactInt.multiBytePrefix,
          (value >> 24) & 0xff,
          (value >> 16) & 0xff,
          (value >> 8) & 0xff,
          value & 0xff
        ])
      }
    } else {
      if (value >= -this.oneByteBound) {
        return Buffer.from([(value ^ CompactInt.oneByteNegPrefix) & 0xff])
      } else if (value >= -this.twoByteBound) {
        return Buffer.from([((value >> 8) ^ CompactInt.twoByteNegPrefix) & 0xff, value & 0xff])
      } else if (value >= -this.fourByteBound) {
        return Buffer.from([
          ((value >> 24) ^ CompactInt.fourByteNegPrefix) & 0xff,
          (value >> 16) & 0xff,
          (value >> 8) & 0xff,
          value & 0xff
        ])
      } else {
        return Buffer.from([
          CompactInt.multiBytePrefix,
          (value >> 24) & 0xff,
          (value >> 16) & 0xff,
          (value >> 8) & 0xff,
          value & 0xff
        ])
      }
    }
  }

  toI32(value: DecodedCompactInt): number {
    const body = Buffer.from([value.mode, ...value.rest])
    const mode = value.mode & maskRest
    if (fixedSize(mode)) {
      const isPositive = (value.mode & signFlag) == 0
      if (isPositive) {
        return decodePositiveInt(value.mode, body)
      } else {
        return decodeNegativeInt(value.mode, body)
      }
    } else {
      if (body.length === 5) {
        return ((body[1] & 0xff) << 24) | ((body[2] & 0xff) << 16) | ((body[3] & 0xff) << 8) | (body[4] & 0xff)
      } else {
        throw new Error(`Expect 4 bytes int, but get ${body.length - 1} bytes int`)
      }
    }
  }

  toI256(value: DecodedCompactInt): bigint {
    const mode = value.mode & maskRest

    if (fixedSize(mode)) {
      return BigInt(this.toI32(value))
    } else {
      if (value.rest.length <= 32) {
        return BigInt('0x' + Buffer.from(value.rest).toString('hex'))
      } else {
        throw new Error(`Expect <= 32 bytes for I256, but get ${value.rest.length} bytes instead`)
      }
    }
  }
}

export const compactSignedIntCodec = new CompactSignedIntCodec()

function decodePositiveInt(rawMode: number, body: Buffer): number {
  const mode = rawMode & maskRest

  switch (mode) {
    case CompactInt.oneBytePrefix:
      return rawMode
    case CompactInt.twoBytePrefix:
      assert(body.length === 2, 'Length should be 2')
      return ((body[0] & maskMode) << 8) | (body[1] & 0xff)
    case CompactInt.fourBytePrefix:
      assert(body.length === 4, 'Length should be 4')
      return ((body[0] & maskMode) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)
    default:
      if (body.length === 5) {
        return Number(BigInt('0x' + body.slice(1).toString('hex')))
      } else {
        throw new Error(`decodePositiveInt: Expect 4 bytes int, but get ${body.length - 1} bytes int`)
      }
  }
}

function decodeNegativeInt(rawMode: number, body: Buffer) {
  const mode = rawMode & maskRest
  switch (mode) {
    case CompactInt.oneBytePrefix:
      return rawMode | maskModeNeg
    case CompactInt.twoBytePrefix:
      assert(body.length === 2, 'Length should be 2')
      return ((body[0] & maskModeNeg) << 8) | (body[1] & 0xff)
    case CompactInt.fourBytePrefix:
      assert(body.length === 4, 'Length should be 4')
      return ((body[0] | maskModeNeg) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)
    default:
      throw new Error(`decodeNegativeInt: Expect 4 bytes int, but get ${body.length - 1} bytes int`)
  }
}

function fixedSize(mode: number): boolean {
  return mode === CompactInt.oneBytePrefix || mode === CompactInt.twoBytePrefix || mode === CompactInt.fourBytePrefix
}
