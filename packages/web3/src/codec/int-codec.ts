
import { Parser } from 'binary-parser'
import { Codec } from './codec'
import { assert } from 'console'

export class IntCodec implements Codec<number> {
    parser = Parser.start()
      .buffer("value", {
        length: 4
      })
  
    encode(value: number): Buffer {
      return Buffer.from([
        (value >> 24) & 0xff,
        (value >> 16) & 0xff,
        (value >> 8) & 0xff,
        value & 0xff
      ])
    }
  
    decode(bytes: Buffer): number {
      assert(bytes.length === 4, "Length should be 4")
      return (bytes[0] & 0xff) << 24 |
        (bytes[1] & 0xff) << 16 |
        (bytes[2] & 0xff) << 8  |
        (bytes[3] & 0xff)
    }
  }

export const intCodec = new IntCodec()