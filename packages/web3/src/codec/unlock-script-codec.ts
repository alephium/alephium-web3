import { Parser } from "binary-parser"
import { ArrayCodec } from "./array-codec"
import { compactIntCodec } from "./compact-int-codec"
import { Codec } from './codec'
import { statefulScriptCodec } from "./script-codec"
import { byteStringCodec } from "./bytestring-codec"
import { lockupScriptCodec } from "./lockup-script-codec"

class P2PKHCodec implements Codec<any> {
    parser = Parser.start().buffer("publicKey", { length: 33 })

    encode(input: any): Buffer {
        return input.publicKey
    }

    decode(input: Buffer): any {
        return this.parser.parse(input)
    }
}
const p2pkhCodec = new P2PKHCodec()

class P2MPKHCodec implements Codec<any> {
    parser = Parser.start()
      .nest("publicKeys", {
        type: ArrayCodec.arrayParser(
                Parser.start()
                    .nest("publicKey", { type: p2pkhCodec.parser })
                    .nest("index", { type: compactIntCodec.parser })
              )
      })

    encode(input: any): Buffer {
        return Buffer.concat([
            Buffer.from(compactIntCodec.encode(input.publicKeys.length)),
            ...input.publicKeys.value.map((v) => {
                return Buffer.concat([
                    v.publicKey.publicKey,
                    Buffer.from(compactIntCodec.encode(v.index))
                ])
            })
        ])
    }

    decode(input: Buffer): any {
        return this.parser.parse(input)
    }
}
const p2mpkhCodec = new P2MPKHCodec()

class ValCodec implements Codec<any> {
    parser = Parser.start()
      .int8("type")
      .choice("val", {
        "tag": "type",
        choices: {
            0x00: new Parser().uint8("value"),    // Boolean
            0x01: compactIntCodec.parser,         // I256  - TODO: FIXME
            0x02: compactIntCodec.parser,         // U256
            0x03: byteStringCodec.parser,         // ByteVec
            0x04: lockupScriptCodec.parser,       // Address
        }
      })

    encode(input: any): Buffer {
        const valType = input.type

        if (valType === 0x00) { // Boolean
            return Buffer.from([valType, input.val])
        } else if (valType === 0x01) { // I256
            return Buffer.from([valType, ...compactIntCodec.encode(input.val)])
        } else if (valType === 0x02) { // U256
            return Buffer.from([valType, ...compactIntCodec.encode(input.val)])
        } else if (valType === 0x03) { // ByteVec
            return Buffer.from([valType, ...byteStringCodec.encode(input.val)])
        } else if (valType === 0x04) { // Address
            return Buffer.from([valType, ...lockupScriptCodec.encode(input.val)])
        } else {
            throw new Error(`ValCodec: unsupported val type: ${valType}`)
        }
    }

    decode(input: Buffer): any {
        return this.parser.parse(input)
    }
}

const valCodec = new ValCodec()

export class P2SHCodec implements Codec<any> {
    parser = Parser.start()
      .nest("script", {
        type: statefulScriptCodec.parser
      })
      .nest("params", {
        type: ArrayCodec.arrayParser(valCodec.parser)
      })

    encode(input: any): Buffer {
        return Buffer.concat([
            statefulScriptCodec.encode(input.script),
            new ArrayCodec(valCodec).encode(input.params)
        ])
    }

    decode(input: Buffer): any {
        return this.parser.parse(input)
    }
}

const p2shCodec = new P2SHCodec()

export class UnlockScriptCodec implements Codec<any> {
    parser = Parser.start()
      .uint8("scriptType")
      .choice("script", {
        tag: "scriptType",
        choices: {
          0: p2pkhCodec.parser,
          1: p2mpkhCodec.parser,
          2: p2shCodec.parser,
          3: Parser.start()   // TODO: SameAsPrevious, FIXME
        },
    })

    encode(input: any): Buffer {
      const scriptType = input.scriptType
      const inputUnLockScript = input.script
      const inputUnLockScriptType = Buffer.from([scriptType])

      if (scriptType === 0) { // P2PKH
        return Buffer.concat([inputUnLockScriptType, p2pkhCodec.encode(inputUnLockScript)])
      } else if (scriptType === 1) { // P2MPKH
        return Buffer.concat([inputUnLockScriptType, p2mpkhCodec.encode(inputUnLockScript)])
      } else if (scriptType === 2) { // P2SH
        return Buffer.concat([inputUnLockScriptType, p2shCodec.encode(input.script)])
      } else if (scriptType === 3) { // SameAsPrevious
        return inputUnLockScriptType
      } else {
        throw new Error(`TODO: encode unlock script: ${scriptType}`)
      }
    }

    decode(input: Buffer): any {
      return this.parser.parse(input)
    }
  }

export const unlockScriptCodec = new UnlockScriptCodec()