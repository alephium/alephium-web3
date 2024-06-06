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
import { DecodedArray } from './array-codec'
import { DecodedCompactInt, compactSignedIntCodec, compactUnsignedIntCodec } from './compact-int-codec'
import { P2C } from './lockup-script-codec'
import { Codec } from './codec'
import { Token, tokensCodec } from './token-codec'
import { ContractOutput as ApiContractOutput } from '../api/api-alephium'
import { blakeHash, createHint } from './hash'
import { binToHex, bs58, concatBytes, hexToBinUnsafe } from '../utils'
import { signedIntCodec } from './signed-int-codec'
import { lockupScriptCodec } from './lockup-script-codec'

export interface ContractOutput {
  amount: DecodedCompactInt
  lockupScript: P2C
  tokens: DecodedArray<Token>
}

export class ContractOutputCodec implements Codec<ContractOutput> {
  parser = Parser.start()
    .nest('amount', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('lockupScript', {
      type: Parser.start().buffer('contractId', { length: 32 })
    })
    .nest('tokens', {
      type: tokensCodec.parser
    })

  encode(input: ContractOutput): Uint8Array {
    const amount = compactUnsignedIntCodec.encode(input.amount)
    const lockupScript = input.lockupScript.contractId
    const tokens = tokensCodec.encode(input.tokens.value)

    return concatBytes([amount, lockupScript, tokens])
  }

  decode(input: Uint8Array): ContractOutput {
    return this.parser.parse(input)
  }

  static convertToApiContractOutput(txIdBytes: Uint8Array, output: ContractOutput, index: number): ApiContractOutput {
    const hint = createHint(output.lockupScript.contractId)
    const key = binToHex(blakeHash(concatBytes([txIdBytes, signedIntCodec.encode(index)])))
    const attoAlphAmount = compactUnsignedIntCodec.toU256(output.amount).toString()
    const address = bs58.encode(new Uint8Array([0x03, ...output.lockupScript.contractId]))
    const tokens = output.tokens.value.map((token) => {
      return {
        id: binToHex(token.tokenId),
        amount: compactUnsignedIntCodec.toU256(token.amount).toString()
      }
    })
    return { hint, key, attoAlphAmount, address, tokens, type: 'ContractOutput' }
  }

  static convertToOutput(apiContractOutput: ApiContractOutput): ContractOutput {
    const amount: DecodedCompactInt = compactUnsignedIntCodec.fromU256(BigInt(apiContractOutput.attoAlphAmount))
    const lockupScript: P2C = lockupScriptCodec.decode(bs58.decode(apiContractOutput.address)).script as P2C

    const tokensValue = apiContractOutput.tokens.map((token) => {
      return {
        tokenId: hexToBinUnsafe(token.id),
        amount: compactUnsignedIntCodec.fromU256(BigInt(token.amount))
      }
    })
    const tokens: DecodedArray<Token> = {
      length: compactSignedIntCodec.fromI32(tokensValue.length),
      value: tokensValue
    }

    return { amount, lockupScript, tokens }
  }
}

export const contractOutputCodec = new ContractOutputCodec()
