/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/
import { ArrayCodec } from './array-codec'
import { u256Codec } from './compact-int-codec'
import { intAs4BytesCodec } from './int-as-4bytes-codec'
import { timestampCodec } from './timestamp-codec'
import { ByteString, byteStringCodec } from './bytestring-codec'
import { LockupScript, P2MPKH, P2PKH, P2SH, lockupScriptCodec } from './lockup-script-codec'
import { FixedAssetOutput } from '../api/api-alephium'
import { blakeHash, createHint } from './hash'
import { bs58, binToHex, hexToBinUnsafe, concatBytes } from '../utils'
import { ObjectCodec } from './codec'
import { Token, tokensCodec } from './token-codec'

export interface AssetOutput {
  amount: bigint
  lockupScript: LockupScript
  lockTime: bigint
  tokens: Token[]
  additionalData: ByteString
}

export class AssetOutputCodec extends ObjectCodec<AssetOutput> {
  static toFixedAssetOutputs(txIdBytes: Uint8Array, outputs: AssetOutput[]): FixedAssetOutput[] {
    return outputs.map((output, index) => AssetOutputCodec.toFixedAssetOutput(txIdBytes, output, index))
  }

  static toFixedAssetOutput(txIdBytes: Uint8Array, output: AssetOutput, index: number): FixedAssetOutput {
    const attoAlphAmount = output.amount.toString()
    const lockTime = Number(output.lockTime)
    const tokens = output.tokens.map((token) => {
      return {
        id: binToHex(token.tokenId),
        amount: token.amount.toString()
      }
    })
    const message = binToHex(output.additionalData)
    const scriptType = output.lockupScript.kind
    const key = binToHex(blakeHash(concatBytes([txIdBytes, intAs4BytesCodec.encode(index)])))
    const outputLockupScript = output.lockupScript.value
    const address = bs58.encode(lockupScriptCodec.encode(output.lockupScript))

    let hint: number | undefined = undefined
    if (scriptType === 'P2PKH') {
      hint = createHint(outputLockupScript as P2PKH)
    } else if (scriptType === 'P2MPKH') {
      hint = createHint((outputLockupScript as P2MPKH).publicKeyHashes[0])
    } else if (scriptType === 'P2SH') {
      hint = createHint(outputLockupScript as P2SH)
    } else if (scriptType === 'P2C') {
      throw new Error(`P2C script type not allowed for asset output`)
    } else {
      throw new Error(`Unexpected output script type: ${scriptType}`)
    }

    return { hint, key, attoAlphAmount, lockTime, tokens, address, message }
  }

  static fromFixedAssetOutputs(fixedOutputs: FixedAssetOutput[]): AssetOutput[] {
    return fixedOutputs.map((output) => {
      return AssetOutputCodec.fromFixedAssetOutput(output)
    })
  }

  static fromFixedAssetOutput(fixedOutput: FixedAssetOutput): AssetOutput {
    const amount = BigInt(fixedOutput.attoAlphAmount)
    const lockTime = BigInt(fixedOutput.lockTime)
    const lockupScript: LockupScript = lockupScriptCodec.decode(bs58.decode(fixedOutput.address))
    const tokens = fixedOutput.tokens.map((token) => {
      return {
        tokenId: hexToBinUnsafe(token.id),
        amount: BigInt(token.amount)
      }
    })
    const additionalData = hexToBinUnsafe(fixedOutput.message)
    return { amount, lockupScript, lockTime, tokens, additionalData }
  }
}

export const assetOutputCodec = new AssetOutputCodec({
  amount: u256Codec,
  lockupScript: lockupScriptCodec,
  lockTime: timestampCodec,
  tokens: tokensCodec,
  additionalData: byteStringCodec
})
export const assetOutputsCodec = new ArrayCodec(assetOutputCodec)
