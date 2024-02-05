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
import { LockupScript, MultiSig, P2C, P2SH, lockupScriptCodec } from './lockup-script-codec'
import { FixedAssetOutput } from '../api/api-alephium'
import { blakeHash, createHint } from './hash'
import { bs58, binToHex } from '../utils'
import { Codec } from './codec'
import { PublicKeyHash } from './lockup-script-codec'
import { Token, tokensCodec } from './token-codec'

export interface AssetOutput {
  amount: DecodedCompactInt
  lockupScript: LockupScript
  lockTime: Buffer
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

  encode(input: AssetOutput): Buffer {
    const amount = Buffer.from(compactUnsignedIntCodec.encode(input.amount))
    const lockupScript = lockupScriptCodec.encode(input.lockupScript)
    const lockTime = Buffer.from(input.lockTime)
    const tokens = Buffer.from(tokensCodec.encode(input.tokens.value))
    const additionalData = Buffer.from(byteStringCodec.encode(input.additionalData))

    return Buffer.concat([amount, lockupScript, lockTime, tokens, additionalData])
  }

  decode(input: Buffer): AssetOutput {
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
        id: token.tokenId.toString('hex'),
        amount: compactUnsignedIntCodec.toU256(token.amount).toString()
      }
    })
    const message = output.additionalData.value.toString('hex')
    const scriptType = output.lockupScript.scriptType
    const key = binToHex(blakeHash(Buffer.concat([txIdBytes, signedIntCodec.encode(index)])))
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
      // P2C
      hint = createHint((outputLockupScript as P2C).contractId)
    } else {
      throw new Error(`TODO: decode output script type: ${scriptType}`)
    }

    return { hint, key, attoAlphAmount, lockTime, tokens, address, message }
  }

  static fromFixedAssetOutputs(fixedOutputs: FixedAssetOutput[]): AssetOutput[] {
    return fixedOutputs.map((output) => {
      return AssetOutputCodec.fromFixedAssetOutput(output)
    })
  }

  static fromFixedAssetOutput(fixedOutput: FixedAssetOutput): AssetOutput {
    const amount: DecodedCompactInt = compactUnsignedIntCodec.decode(
      compactUnsignedIntCodec.encodeU256(BigInt(fixedOutput.attoAlphAmount))
    )
    const lockTime: Buffer = longCodec.encode(BigInt(fixedOutput.lockTime))
    const lockupScript: LockupScript = lockupScriptCodec.decode(Buffer.from(bs58.decode(fixedOutput.address)))
    const tokensValue = fixedOutput.tokens.map((token) => {
      return {
        tokenId: Buffer.from(token.id, 'hex'),
        amount: compactUnsignedIntCodec.decode(compactUnsignedIntCodec.encodeU256(BigInt(token.amount)))
      }
    })
    const tokens: DecodedArray<Token> = {
      length: compactUnsignedIntCodec.decode(compactUnsignedIntCodec.encodeU32(tokensValue.length)),
      value: tokensValue
    }
    const additionalDataValue = Buffer.from(fixedOutput.message, 'hex')
    const additionalData: ByteString = {
      length: compactUnsignedIntCodec.decode(compactUnsignedIntCodec.encodeU32(additionalDataValue.length)),
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
