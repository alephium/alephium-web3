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
import { assert } from 'console'
import { binToHex } from '@alephium/web3'
import { Codec } from './codec'

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

export interface DecodedInt {
  mode: number
  rest: Uint8Array
}

const compactIntParser = new Parser().uint8('mode').buffer('rest', {
  length: function (ctx) {
    const rawMode = this['mode']
    const mode = rawMode & maskRest
    if (mode === CompactInt.oneBytePrefix) {
      return 0
    } else if (mode === CompactInt.twoBytePrefix) {
      return 1
    } else if (mode === CompactInt.fourBytePrefix) {
      return 3
    } else {
      return (rawMode & maskMode) + 4
    }
  }
})

export class CompactUnsignedIntCodec implements Codec<DecodedInt> {
  parser = compactIntParser

  encode(input: DecodedInt): Buffer {
    return Buffer.from([input.mode, ...input.rest])
  }

  decode(input: Buffer): DecodedInt {
    return this.parser.parse(input)
  }

  toInt(value: DecodedInt): number {
    const body = Buffer.from([value.mode, ...value.rest])
    return decodePositiveInt(value.mode, body)
  }

  toU256(value: DecodedInt): bigint {
    const mode = value.mode & maskRest
    if (mode === CompactInt.oneBytePrefix || mode === CompactInt.twoBytePrefix || mode === CompactInt.fourBytePrefix) {
      return BigInt(this.toInt(value))
    } else {
      return BigInt('0x' + Buffer.from(value.rest).toString('hex'))
    }
  }
}

export const compactUnsignedIntCodec = new CompactUnsignedIntCodec()

export class CompactSignedIntCodec implements Codec<DecodedInt> {
  parser = compactIntParser

  encode(input: DecodedInt): Buffer {
    return Buffer.from([input.mode, ...input.rest])
  }

  decode(input: Buffer): DecodedInt {
    return this.parser.parse(input)
  }

  toInt(value: DecodedInt): number {
    const body = Buffer.from([value.mode, ...value.rest])
    const mode = value.mode & maskRest
    if (mode === CompactInt.oneBytePrefix || mode === CompactInt.twoBytePrefix || mode === CompactInt.fourBytePrefix) {
      const isPositive = (value.mode & signFlag) == 0
      if (isPositive) {
        return decodePositiveInt(value.mode, body)
      } else {
        return decodeNegativeInt(value.mode, body)
      }
    } else {
      if (body.length === 5) {
        return ((body[1] & maskMode) << 24) | ((body[2] & 0xff) << 16) | ((body[3] & 0xff) << 8) | (body[4] & 0xff)
      } else {
        throw new Error(`Expect 4 bytes int, but get ${body.length - 1} bytes int`)
      }
    }
  }

  toLong(value: DecodedInt): number {
    const body = Buffer.from([value.mode, ...value.rest])
    const mode = value.mode & maskRest

    if (mode === CompactInt.oneBytePrefix || mode === CompactInt.twoBytePrefix || mode === CompactInt.fourBytePrefix) {
      return this.toInt(value)
    } else {
      if (body.length === 9) {
        return (
          ((body[1] & maskMode) << 56) |
          ((body[2] & 0xff) << 48) |
          ((body[3] & 0xff) << 40) |
          ((body[4] & 0xff) << 32) |
          ((body[5] & 0xff) << 24) |
          ((body[6] & 0xff) << 16) |
          ((body[7] & 0xff) << 8) |
          (body[8] & 0xff)
        )
      } else {
        throw new Error(`Expect 8 bytes int, but get ${body.length - 1} bytes int`)
      }
    }
  }
}

export const compactSignedIntCodec = new CompactSignedIntCodec()

function decodePositiveInt(rawMode: number, body: Buffer): number {
  const mode = rawMode & maskRest
  if (mode === CompactInt.oneBytePrefix) {
    return rawMode
  } else if (mode === CompactInt.twoBytePrefix) {
    assert(body.length === 2, 'Length should be 2')
    return ((body[0] & maskMode) << 8) | (body[1] & 0xff)
  } else if (mode === CompactInt.fourBytePrefix) {
    assert(body.length === 4, 'Length should be 4')
    return ((body[0] & maskMode) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)
  } else {
    throw new Error(`decodePositiveInt: Expect 4 bytes int, but get ${body.length - 1} bytes int`)
  }
}

function decodeNegativeInt(rawMode: number, body: Buffer) {
  const mode = rawMode & maskRest
  if (mode === CompactInt.oneByteNegPrefix) {
    return body[0] | maskModeNeg
  } else if (mode === CompactInt.twoByteNegPrefix) {
    assert(body.length === 2, 'Length should be 2')
    return ((body[0] & maskModeNeg) << 8) | (body[1] & 0xff)
  } else if (mode === CompactInt.fourByteNegPrefix) {
    assert(body.length === 4, 'Length should be 4')
    return ((body[0] & maskModeNeg) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)
  } else {
    throw new Error(`decodeNegativeInt: Expect 4 bytes int, but get ${body.length - 1} bytes int`)
  }
}