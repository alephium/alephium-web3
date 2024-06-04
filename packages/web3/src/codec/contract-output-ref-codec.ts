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
import { Codec } from './codec'
import { signedIntCodec } from './signed-int-codec'
import { concatBytes } from '../utils'

export interface ContractOutputRef {
  hint: number
  key: Uint8Array
}

export class ContractOutputRefCodec implements Codec<ContractOutputRef> {
  parser = Parser.start().int32('hint').buffer('key', { length: 32 })

  encode(input: ContractOutputRef): Uint8Array {
    return concatBytes([signedIntCodec.encode(input.hint), input.key])
  }

  decode(input: Uint8Array): ContractOutputRef {
    return this.parser.parse(input)
  }
}

export const contractOutputRefCodec = new ContractOutputRefCodec()
export const contractOutputRefsCodec = new ArrayCodec(contractOutputRefCodec)
