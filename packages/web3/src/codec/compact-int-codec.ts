import { Parser } from 'binary-parser'
import { assert } from 'console'
import { binToHex } from "@alephium/web3"
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

export class CompactIntCodec implements Codec<DecodedInt>{
  parser = new Parser()
    .uint8("mode")
    .buffer("rest", {
      length: function(ctx) {
        const rawMode = this["mode"]
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

  encode(input: DecodedInt): Buffer {
    return Buffer.from([input.mode, ...input.rest])
  }

  decode(input: Buffer): DecodedInt {
    return this.parser.parse(input)
  }

  toInt(value: DecodedInt): number {
    const body = Buffer.concat([Buffer.from([value.mode]), value.rest])
    const mode = value.mode & maskRest
    if (mode === CompactInt.oneBytePrefix || mode === CompactInt.twoBytePrefix || mode === CompactInt.fourBytePrefix) {
      const isPositive = (value.mode & signFlag) == 0
      if (isPositive) {
        return this.decodePositiveInt(value.mode, body)
      } else {
        return this.decodeNegativeInt(value.mode, body)
      }
    } else {
      return parseInt(binToHex(value.rest), 16)  // Revisit, might not work for large number
    }
  }

  private decodePositiveInt(rawMode: number, body: Buffer): number {
    const mode = rawMode & maskRest
    if (mode === CompactInt.oneBytePrefix) {
      return rawMode
    } else if (mode === CompactInt.twoBytePrefix) {
      assert(body.length === 2, "Length should be 2")
      return ((body[0] & maskMode) << 8) | (body[1] & 0xff)
    } else if (mode === CompactInt.fourBytePrefix) {
      assert(body.length === 4, "Length should be 4")
      return ((body[0] & maskMode) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)
    } else {
      throw new Error(`TODO: decodePositiveInt unsupported mode: ${mode}`)
    }
  }

  private decodeNegativeInt(rawMode: number, body: Buffer) {
    const mode = rawMode & maskRest
    if (mode === CompactInt.oneByteNegPrefix) {
      return body[0] | maskModeNeg
    } else if (mode === CompactInt.twoByteNegPrefix) {
      assert(body.length === 2, "Length should be 2")
      return ((body[0] & maskModeNeg) << 8) | (body[1] & 0xff)
    } else if (mode === CompactInt.fourByteNegPrefix) {
      assert(body.length === 4, "Length should be 4")
      return ((body[0] & maskModeNeg) << 24) | ((body[1] & 0xff) << 16) | ((body[2] & 0xff) << 8) | (body[3] & 0xff)
    } else {
      throw new Error(`TODO: decodeNegativeInt unsupported mode: ${mode}`)
    }
  }
}

export const compactIntCodec = new CompactIntCodec()
