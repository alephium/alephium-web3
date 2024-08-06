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
import { byte32Codec, ObjectCodec } from './codec'
import { ArrayCodec } from './array-codec'

export interface Token {
  tokenId: Uint8Array
  amount: bigint
}

export const tokenCodec = new ObjectCodec<Token>({
  tokenId: byte32Codec,
  amount: u256Codec
})
export const tokensCodec = new ArrayCodec(tokenCodec)
