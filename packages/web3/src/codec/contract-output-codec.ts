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
import { DecodedCompactInt, compactUnsignedIntCodec } from './compact-int-codec'
import { P2C } from './lockup-script-codec'
import { Codec } from './codec'
import { Token, tokensCodec } from './asset-output-codec'

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

  encode(input: ContractOutput): Buffer {
    const amount = Buffer.from(compactUnsignedIntCodec.encode(input.amount))
    const lockupScript = (input.lockupScript as P2C).contractId
    const tokens = Buffer.from(tokensCodec.encode(input.tokens.value))

    return Buffer.concat([amount, lockupScript, tokens])
  }

  decode(input: Buffer): ContractOutput {
    return this.parser.parse(input)
  }
}

export const contractOutputCodec = new ContractOutputCodec()
