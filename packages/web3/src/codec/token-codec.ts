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

import { Buffer } from 'buffer/'
import { Parser } from 'binary-parser'
import { DecodedCompactInt, compactUnsignedIntCodec } from './compact-int-codec'
import { Codec } from './codec'
import { ArrayCodec } from './array-codec'

export interface Token {
  tokenId: Buffer
  amount: DecodedCompactInt
}

export class TokenCodec implements Codec<Token> {
  parser = Parser.start()
    .buffer('tokenId', {
      length: 32
    })
    .nest('amount', {
      type: compactUnsignedIntCodec.parser
    })

  encode(input: Token): Buffer {
    const tokenId = input.tokenId
    const amount = Buffer.from(compactUnsignedIntCodec.encode(input.amount))
    return Buffer.concat([tokenId, amount])
  }

  decode(input: Buffer): Token {
    return this.parser.parse(input)
  }
}

export const tokenCodec = new TokenCodec()
export const tokensCodec = new ArrayCodec(tokenCodec)
