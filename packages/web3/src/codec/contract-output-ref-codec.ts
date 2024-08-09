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
import { byte32Codec, ObjectCodec } from './codec'
import { intAs4BytesCodec } from './int-as-4bytes-codec'

export interface ContractOutputRef {
  hint: number
  key: Uint8Array
}

export const contractOutputRefCodec = new ObjectCodec<ContractOutputRef>({
  hint: intAs4BytesCodec,
  key: byte32Codec
})
export const contractOutputRefsCodec = new ArrayCodec(contractOutputRefCodec)
