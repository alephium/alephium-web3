import { Parser } from 'binary-parser'
import { compactIntCodec, DecodedInt } from './compact-int-codec'
import { Codec } from './codec'

export class ArrayCodec implements Codec<any> {
  parser = Parser.start()

  constructor(private childCodec: Codec<any>) {
    this.parser = ArrayCodec.arrayParser(childCodec.parser)
  }

  encode(input: any): Buffer {
    let result = [...compactIntCodec.encode(input.length)]
    for (const value of input.value) {
      result.push(...Array.from(this.childCodec.encode(value)))
    }
    return Buffer.from(result)
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }

  static arrayParser(parser: Parser) {
    return new Parser()
      .nest("length", {
        type: compactIntCodec.parser
      })
      .array("value", {
        length: function(ctx) {
          return compactIntCodec.toInt(this['length']! as any as DecodedInt)
        },
        type: parser
    })
  }
}
