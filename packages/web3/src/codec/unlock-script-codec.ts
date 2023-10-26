import { Parser } from "binary-parser"
import { ArrayCodec } from "./array-codec"
import { compactIntCodec } from "./compact-int-codec"
import { Codec } from './codec'

const publicKeyParser = Parser.start().buffer("publicKey", { length: 33 })
const publicKeysParser = Parser.start()
  .nest("publicKeys", {
    type: ArrayCodec.arrayParser(
            Parser.start()
                .nest("publicKey", { type: publicKeyParser })
                .nest("index", { type: compactIntCodec.parser })
          )
  })

export class UnlockScriptCodec implements Codec<any> {
    parser = Parser.start()
      .uint8("scriptType")
      .choice("script", {
        tag: "scriptType",
        choices: {
          0: publicKeyParser,
          1: publicKeysParser,
          2: Parser.start(),  // TODO: P2SH, generalize the array type first
          3: Parser.start()   // TODO: Same as previous, need to be fixed
        },
    })

    encode(input: any): Buffer {
      const scriptType = input.scriptType
      const inputUnLockScript = input.script
      const inputUnLockScriptType = Buffer.from([scriptType])

      if (scriptType === 0) { // P2PKH
        return Buffer.concat([inputUnLockScriptType, inputUnLockScript.publicKey])
      } else if (scriptType === 1) { // P2MPKH
        return Buffer.concat([
            inputUnLockScriptType,
            Buffer.from(compactIntCodec.encode(inputUnLockScript.publicKeys.length)),
            ...inputUnLockScript.publicKeys.value.map((v) => {
              return Buffer.concat([
                v.publicKey.publicKey,
                Buffer.from(compactIntCodec.encode(v.index))
              ])
            })
          ])
      } else {
        throw new Error(`TODO: encode unlock script: ${scriptType}`)
      }
    }

    decode(input: Buffer): any {
      return this.parser.parse(input)
    }
  }

export const unlockScriptCodec = new UnlockScriptCodec()