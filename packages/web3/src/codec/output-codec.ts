import { Parser } from "binary-parser";
import { ArrayCodec } from "./array-codec";
import { compactIntCodec } from "./compact-int-codec";
import { intCodec } from "./int-codec";
import { longCodec } from "./long-codec";
import { byteStringCodec } from "./bytestring-codec";
import { lockupScriptCodec } from "./lockup-script-codec";
import { FixedAssetOutput } from "../api/api-alephium";
import { blakeHash, djbIntHash } from "./hash";
import { utils, binToHex } from "@alephium/web3"
import { Codec } from "./codec"

export class OutputCodec implements Codec<any> {
  parser = Parser.start()
    .nest("amount", {
      type: compactIntCodec.parser
    })
    .nest("lockupScript", {
      type: lockupScriptCodec.parser
    })
    .buffer("lockTime", {
      length: 8
    })
    .nest("tokens", {
      type: ArrayCodec.arrayParser(Parser.start())
    })
    .nest("additionalData", {
      type: byteStringCodec.parser
    })

  encode(input: any): Buffer {
    const amount = Buffer.from(compactIntCodec.encode(input.amount))
    const lockupScript = lockupScriptCodec.encode(input.lockupScript)
    const lockTime = Buffer.from(input.lockTime)
    const tokens = Buffer.from(compactIntCodec.encode(input.tokens.length))  // TODO: Support token
    const additionalData = Buffer.from(byteStringCodec.encode(input.additionalData))

    return Buffer.concat([amount, lockupScript, lockTime, tokens, additionalData])
  }

  decode(input: Buffer) {
    return this.parser.parse(input)
  }

  static convertToFixedAssetOutputs(txIdBytes: Uint8Array, outputs: any[]): FixedAssetOutput[] {
    return outputs.map((output, index) => {
      const attoAlphAmount = compactIntCodec.toInt(output.amount).toString()
      const lockTime = longCodec.decode(output.lockTime)
      const tokens = output.tokens.value.map((token) => {
          // TODO: Support token
          return undefined
      })
      const message = output.additionalData.value.toString("hex")
      const scriptType = output.lockupScript.scriptType
      const key = binToHex(blakeHash(Buffer.concat([txIdBytes, intCodec.encode(index)])))
      if (scriptType === 0) { // P2PKH
          const outputLockupScript = output.lockupScript.script
          const outputLockupScriptType = Buffer.from([output.lockupScript.scriptType])
          const address = utils.bs58.encode(Buffer.concat([outputLockupScriptType, outputLockupScript.publicKeyHash]))
          const hint = djbIntHash(outputLockupScript.publicKeyHash) | 1
          return {hint, key, attoAlphAmount, lockTime, tokens, address, message}
      } else if (scriptType === 1) { // P2MPKH
          const outputLockupScript = output.lockupScript.script
          const outputLockupScriptType = Buffer.from([output.lockupScript.scriptType])
          const address = utils.bs58.encode(Buffer.concat([
              outputLockupScriptType,
              Buffer.from(compactIntCodec.encode(outputLockupScript.publicKeyHashes.length)),
              ...outputLockupScript.publicKeyHashes.value.map((v) => v.publicKeyHash),
              Buffer.from(compactIntCodec.encode(outputLockupScript['m']))
          ]))
          const hint = djbIntHash(outputLockupScript.publicKeyHashes.value[0].publicKeyHash) | 1
          return {hint, key, attoAlphAmount, lockTime, tokens, address, message}
      } else {
          throw new Error(`TODO: decode output script type: ${scriptType}`)
      }
    })
  }

}

export const outputCodec = new OutputCodec()