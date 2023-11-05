import { Parser } from 'binary-parser'
import { ArrayCodec } from './array-codec'
import { compactIntCodec } from './compact-int-codec'
import { Codec } from './codec'
import { methodCodec } from './method-codec'

export class StatefulScriptCodec implements Codec<any> {
  parser = Parser.start().nest("methods", {
    type: new ArrayCodec(methodCodec).parser
  })

  static new(): StatefulScriptCodec {
    return new StatefulScriptCodec()
  }

  encode(input: any): Buffer {
    let script = [...compactIntCodec.encode(input.methods.length)]
    for (const method of input.methods.value) {
      script.push(...methodCodec.encode(method))
    }

    return Buffer.from(script)
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }
}

export const statefulScriptCodec = StatefulScriptCodec.new()