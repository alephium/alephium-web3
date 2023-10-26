import { Parser } from "binary-parser"
import { AssetInput } from "../api/api-alephium"
import { binToHex } from "@alephium/web3"
import { unlockScriptCodec } from "./unlock-script-codec"
import { Codec } from "./codec"
import { intCodec } from "./int-codec"

export class InputCodec implements Codec<any> {
  parser = Parser.start()
    .nest("outputRef", {
      type: Parser.start().int32("hint").buffer("key", { length: 32 })
    })
    .nest("unlockScript", {
      type: unlockScriptCodec.parser
    })

  encode(input: any): Buffer {
    return Buffer.concat([
      Buffer.from([...intCodec.encode(input.outputRef.hint), ...input.outputRef.key]),
      unlockScriptCodec.encode(input.unlockScript)
    ])
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }

  static convertToAssetInputs(inputs: any[]): AssetInput[] {
    return inputs.map((input) => {
      const hint = input.outputRef.hint
      const key = binToHex(input.outputRef.key)
      const unlockScript = unlockScriptCodec.encode(input.unlockScript)
      return {
         outputRef: { hint, key },
         unlockScript: unlockScript.toString("hex")
      }
    })
  }
}

export const inputCodec = new InputCodec()