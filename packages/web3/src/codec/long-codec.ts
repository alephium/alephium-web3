import { Parser } from 'binary-parser'
import { Codec } from './codec'
import { assert } from 'console'

export class LongCodec implements Codec<number> {
    parser = Parser.start()
      .buffer("value", {
        length: 8
      })
  
    encode(value: number): Buffer {
      return Buffer.from([
        (value >> 56) & 0xff,
        (value >> 48) & 0xff,
        (value >> 40) & 0xff,
        (value >> 32) & 0xff,
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    }
  
    decode(bytes: Buffer): number {
      assert(bytes.length === 8, "Length should be 8")
      return (bytes[0] & 0xff) << 56 |
        (bytes[1] & 0xff) << 48 |
        (bytes[2] & 0xff) << 40 |
        (bytes[3] & 0xff) << 32 |
        (bytes[4] & 0xff) << 24 |
        (bytes[5] & 0xff) << 16 |
        (bytes[6] & 0xff) << 8 |
        (bytes[7] & 0xff)
    }
  }

export const longCodec = new LongCodec()