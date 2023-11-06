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
import { ArrayCodec } from './array-codec'
import { compactUnsignedIntCodec } from './compact-int-codec'
import { signedIntCodec } from './signed-int-codec'
import { longCodec } from './long-codec'
import { byteStringCodec } from './bytestring-codec'
import { lockupScriptCodec } from './lockup-script-codec'
import { FixedAssetOutput } from '../api/api-alephium'
import { blakeHash, djbIntHash } from './hash'
import { utils, binToHex } from '@alephium/web3'
import { Codec } from './codec'

export class TokenCodec implements Codec<any> {
  parser = Parser.start()
    .buffer('tokenId', {
      length: 32
    })
    .nest('amount', {
      type: compactUnsignedIntCodec.parser
    })

  encode(input: any): Buffer {
    const tokenId = input.tokenId
    const amount = Buffer.from(compactUnsignedIntCodec.encode(input.amount))
    return Buffer.concat([tokenId, amount])
  }

  decode(input: Buffer) {
    return this.parser.parse(input)
  }
}

const tokenCodec = new TokenCodec()

export class OutputCodec implements Codec<any> {
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
      type: ArrayCodec.arrayParser(tokenCodec.parser)
    })
    .nest('additionalData', {
      type: byteStringCodec.parser
    })

  encode(input: any): Buffer {
    const amount = Buffer.from(compactUnsignedIntCodec.encode(input.amount))
    const lockupScript = lockupScriptCodec.encode(input.lockupScript)
    const lockTime = Buffer.from(input.lockTime)
    const tokens = Buffer.from(new ArrayCodec(tokenCodec).encode(input.tokens))
    const additionalData = Buffer.from(byteStringCodec.encode(input.additionalData))

    return Buffer.concat([amount, lockupScript, lockTime, tokens, additionalData])
  }

  decode(input: Buffer) {
    return this.parser.parse(input)
  }

  static convertToFixedAssetOutputs(txIdBytes: Uint8Array, outputs: any[]): FixedAssetOutput[] {
    return outputs.map((output, index) => {
      const attoAlphAmount = compactUnsignedIntCodec.toU256(output.amount).toString()
      const lockTime = longCodec.decode(output.lockTime)
      const tokens = output.tokens.value.map((token) => {
        return {
          id: token.tokenId.toString('hex'),
          amount: compactUnsignedIntCodec.toInt(token.amount).toString()
        }
      })
      const message = output.additionalData.value.toString('hex')
      const scriptType = output.lockupScript.scriptType
      const key = binToHex(blakeHash(Buffer.concat([txIdBytes, signedIntCodec.encode(index)])))
      const outputLockupScript = output.lockupScript.script
      const address = utils.bs58.encode(lockupScriptCodec.encode(output.lockupScript))

      let hint: number | undefined = undefined
      if (scriptType === 0) {
        // P2PKH
        hint = createHint(outputLockupScript.publicKeyHash)
      } else if (scriptType === 1) {
        // P2MPKH
        hint = createHint(outputLockupScript.publicKeyHashes.value[0].publicKeyHash)
      } else if (scriptType === 2) {
        // P2SH
        hint = createHint(outputLockupScript.scriptHash)
      } else if (scriptType === 3) {
        // P2C
        hint = createHint(outputLockupScript.contractId)
      } else {
        throw new Error(`TODO: decode output script type: ${scriptType}`)
      }

      return { hint, key, attoAlphAmount, lockTime, tokens, address, message }
    })
  }
}

function createHint(input: Buffer): number {
  return djbIntHash(input) | 1
}

export const outputCodec = new OutputCodec()
