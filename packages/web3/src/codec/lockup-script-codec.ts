import { Parser } from "binary-parser"
import { compactIntCodec } from "./compact-int-codec"
import { Codec } from './codec'
import { ArrayCodec } from "./array-codec"

class PublicKeyHashCodec implements Codec<any> {
  parser = Parser.start().buffer("publicKeyHash", { length: 32 })

  static new(): PublicKeyHashCodec {
    return new PublicKeyHashCodec()
  }

  encode(input: any): Buffer {
    return input.publicKeyHash
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }
}

const publicKeyHashCodec = PublicKeyHashCodec.new()
const multiSigParser = Parser.start()
  .nest("publicKeyHashes", { type: new ArrayCodec(publicKeyHashCodec).parser })
  .nest("m", { type: compactIntCodec.parser })

export class LockupScriptCodec implements Codec<any> {
  parser = Parser.start()
    .uint8("scriptType")
    .choice("script", {
      tag: "scriptType",
      choices: {
        0: publicKeyHashCodec.parser,
        1: multiSigParser,
        2: Parser.start().buffer("scriptHash", { length: 32 }),
        3: Parser.start().buffer("contractId", { length: 32 })
      }
  })

  encode(input: any): Buffer {
    let result: number[] = [input.scriptType]
    if (input.scriptType === 0) {
      result.push(...input.script.publicKeyHash)
    } else if (input.scriptType === 1) {
      result.push(...compactIntCodec.encode(input.script.publicKeyHashes.length))
      for (const publicKeyHash of input.script.publicKeyHashes.value) {
        result.push(...publicKeyHash.publicKeyHash)
      }
      result.push(...compactIntCodec.encode(input.script.m))
    } else if (input.scriptType === 2) {
      result.push(...input.script.scriptHash)
    } else if (input.scriptType === 3) {
      result.push(...input.script.contractId)
    } else {
      throw new Error(`Unsupported script type: ${input.scriptType}`)
    }

    return Buffer.from(result)
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }
}

export const lockupScriptCodec = new LockupScriptCodec()