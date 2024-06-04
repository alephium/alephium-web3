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
import { Parser } from 'binary-parser'
import { ArrayCodec, DecodedArray } from './array-codec'
import { DecodedCompactInt, compactUnsignedIntCodec } from './compact-int-codec'
import { signedIntCodec } from './signed-int-codec'
import { longCodec } from './long-codec'
import { ByteString, byteStringCodec } from './bytestring-codec'
import { LockupScript, MultiSig, P2SH, lockupScriptCodec } from './lockup-script-codec'
import { FixedAssetOutput } from '../api/api-alephium'
import { blakeHash, createHint } from './hash'
import { bs58, binToHex, hexToBinUnsafe } from '../utils'
import { Codec, concatBytes } from './codec'
import { PublicKeyHash } from './lockup-script-codec'
import { Token, tokensCodec } from './token-codec'

export interface AssetOutput {
  amount: DecodedCompactInt
  lockupScript: LockupScript
  lockTime: Uint8Array
  tokens: DecodedArray<Token>
  additionalData: ByteString
}

export class AssetOutputCodec implements Codec<AssetOutput> {
  parser = Parser.start()
    .nest('amount', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('lockupScript', {
      type: lockupScriptCodec.parser
    })
    .buffer('lockTime', {
      length: 8
    })
    .nest('tokens', {
      type: tokensCodec.parser
    })
    .nest('additionalData', {
      type: byteStringCodec.parser
    })

  encode(input: AssetOutput): Uint8Array {
    const amount = compactUnsignedIntCodec.encode(input.amount)
    const lockupScript = lockupScriptCodec.encode(input.lockupScript)
    const tokens = tokensCodec.encode(input.tokens.value)
    const additionalData = byteStringCodec.encode(input.additionalData)

    return concatBytes([amount, lockupScript, input.lockTime, tokens, additionalData])
  }

  decode(input: Uint8Array): AssetOutput {
    return this.parser.parse(input)
  }

  static toFixedAssetOutputs(txIdBytes: Uint8Array, outputs: AssetOutput[]): FixedAssetOutput[] {
    return outputs.map((output, index) => AssetOutputCodec.toFixedAssetOutput(txIdBytes, output, index))
  }

  static toFixedAssetOutput(txIdBytes: Uint8Array, output: AssetOutput, index: number): FixedAssetOutput {
    const attoAlphAmount = compactUnsignedIntCodec.toU256(output.amount).toString()
    const lockTime = Number(longCodec.decode(output.lockTime))
    const tokens = output.tokens.value.map((token) => {
      return {
        id: binToHex(token.tokenId),
        amount: compactUnsignedIntCodec.toU256(token.amount).toString()
      }
    })
    const message = binToHex(output.additionalData.value)
    const scriptType = output.lockupScript.scriptType
    const key = binToHex(blakeHash(concatBytes([txIdBytes, signedIntCodec.encode(index)])))
    const outputLockupScript = output.lockupScript.script
    const address = bs58.encode(lockupScriptCodec.encode(output.lockupScript))

    let hint: number | undefined = undefined
    if (scriptType === 0) {
      // P2PKH
      hint = createHint((outputLockupScript as PublicKeyHash).publicKeyHash)
    } else if (scriptType === 1) {
      // P2MPKH
      hint = createHint((outputLockupScript as MultiSig).publicKeyHashes.value[0].publicKeyHash)
    } else if (scriptType === 2) {
      // P2SH
      hint = createHint((outputLockupScript as P2SH).scriptHash)
    } else if (scriptType === 3) {
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
    const amount: DecodedCompactInt = compactUnsignedIntCodec.fromU256(BigInt(fixedOutput.attoAlphAmount))

    const lockTime = longCodec.encode(BigInt(fixedOutput.lockTime))
    const lockupScript: LockupScript = lockupScriptCodec.decode(bs58.decode(fixedOutput.address))
    const tokensValue = fixedOutput.tokens.map((token) => {
      return {
        tokenId: hexToBinUnsafe(token.id),
        amount: compactUnsignedIntCodec.fromU256(BigInt(token.amount))
      }
    })
    const tokens: DecodedArray<Token> = {
      length: compactUnsignedIntCodec.fromU32(tokensValue.length),
      value: tokensValue
    }
    const additionalDataValue = hexToBinUnsafe(fixedOutput.message)
    const additionalData: ByteString = {
      length: compactUnsignedIntCodec.fromU32(additionalDataValue.length),
      value: additionalDataValue
    }

    return {
      amount,
      lockupScript,
      lockTime,
      tokens,
      additionalData
    }
  }
}

export const assetOutputCodec = new AssetOutputCodec()
export const assetOutputsCodec = new ArrayCodec(assetOutputCodec)
