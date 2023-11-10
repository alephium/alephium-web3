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
import { Codec } from './codec'
import { instrCodec, Instr } from './instr-codec'

const instrsCodec = new ArrayCodec<Instr>(instrCodec)

export interface Method {
  isPublic: number
  assetModifier: number
  argsLength: DecodedCompactInt
  localsLength: DecodedCompactInt
  returnLength: DecodedCompactInt
  instrs: DecodedArray<Instr>
}

export class MethodCodec implements Codec<Method> {
  parser = Parser.start()
    .uint8('isPublic')
    .uint8('assetModifier')
    .nest('argsLength', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('localsLength', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('returnLength', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('instrs', {
      type: instrsCodec.parser
    })

  encode(input: Method): Buffer {
    const result = [input.isPublic, input.assetModifier]
    result.push(...compactUnsignedIntCodec.encode(input.argsLength))
    result.push(...compactUnsignedIntCodec.encode(input.localsLength))
    result.push(...compactUnsignedIntCodec.encode(input.returnLength))
    result.push(...instrsCodec.encode(input.instrs.value))
    return Buffer.from(result)
  }

  decode(input: Buffer): Method {
    return this.parser.parse(input)
  }
}

export const methodCodec = new MethodCodec()
