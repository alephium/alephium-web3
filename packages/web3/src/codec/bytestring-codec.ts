import { Parser } from 'binary-parser'
import { compactIntCodec } from './compact-int-codec'
import { Codec } from './codec'

export class ByteStringCodec implements Codec<any> {
  parser = new Parser()
    .nest("length", {
      type: compactIntCodec.parser
    })
    .buffer("value", {
      length: function(ctx) {
        return compactIntCodec.toInt(this['length']! as any as {mode: number, rest: Uint8Array})
      }
    })

  encode(input: any): Buffer {
    return Buffer.from([...compactIntCodec.encode(input.length), ...input.value])
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }
}

export const byteStringCodec = new ByteStringCodec()