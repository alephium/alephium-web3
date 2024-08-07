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
import { u256Codec } from './compact-int-codec'
import { P2C, p2cCodec } from './lockup-script-codec'
import { ObjectCodec } from './codec'
import { Token, tokensCodec } from './token-codec'
import { ContractOutput as ApiContractOutput } from '../api/api-alephium'
import { blakeHash, createHint } from './hash'
import { binToHex, bs58, concatBytes, hexToBinUnsafe } from '../utils'
import { intAs4BytesCodec } from './int-as-4bytes-codec'
import { lockupScriptCodec } from './lockup-script-codec'

export interface ContractOutput {
  amount: bigint
  lockupScript: P2C
  tokens: Token[]
}

export class ContractOutputCodec extends ObjectCodec<ContractOutput> {
  static convertToApiContractOutput(txIdBytes: Uint8Array, output: ContractOutput, index: number): ApiContractOutput {
    const hint = createHint(output.lockupScript)
    const key = binToHex(blakeHash(concatBytes([txIdBytes, intAs4BytesCodec.encode(index)])))
    const attoAlphAmount = output.amount.toString()
    const address = bs58.encode(new Uint8Array([0x03, ...output.lockupScript]))
    const tokens = output.tokens.map((token) => {
      return {
        id: binToHex(token.tokenId),
        amount: token.amount.toString()
      }
    })
    return { hint, key, attoAlphAmount, address, tokens, type: 'ContractOutput' }
  }

  static convertToOutput(apiContractOutput: ApiContractOutput): ContractOutput {
    const amount = BigInt(apiContractOutput.attoAlphAmount)
    const lockupScript: P2C = lockupScriptCodec.decode(bs58.decode(apiContractOutput.address)).value as P2C

    const tokens = apiContractOutput.tokens.map((token) => {
      return {
        tokenId: hexToBinUnsafe(token.id),
        amount: BigInt(token.amount)
      }
    })
    return { amount, lockupScript, tokens }
  }
}

export const contractOutputCodec = new ContractOutputCodec({
  amount: u256Codec,
  lockupScript: p2cCodec,
  tokens: tokensCodec
})
