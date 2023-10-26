import { Parser } from 'binary-parser'
import { ArrayCodec } from './array-codec'
import { compactIntCodec } from './compact-int-codec'
import { Codec } from './codec'
import { instrCodec } from './instr-codec'

export class MethodCodec implements Codec<any> {
    parser = Parser.start()
      .uint8("isPublic")
      .uint8("assetModifier")
      .nest("argsLength", {
        type: compactIntCodec.parser
      })
      .nest("localsLength", {
        type: compactIntCodec.parser
      })
      .nest("returnLength", {
        type: compactIntCodec.parser
      })
      .nest("instrs", {
        type: new ArrayCodec(instrCodec).parser
      })
  
    encode(input: any): Buffer {
      let result = [input.isPublic, input.assetModifier]
      result.push(...compactIntCodec.encode(input.argsLength))
      result.push(...compactIntCodec.encode(input.localsLength))
      result.push(...compactIntCodec.encode(input.returnLength))
      result.push(...compactIntCodec.encode(input.instrs.length))
      for (const instr of input.instrs.value) {
        result.push(...Array.from(instrCodec.encode(instr)))
      }
  
      return Buffer.from(result)
    }
  
    decode(input: Buffer): any {
      return this.parser.parse(input)
    }
  }

  export const methodCodec = new MethodCodec()