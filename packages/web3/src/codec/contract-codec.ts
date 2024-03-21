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
import { ArrayCodec, DecodedArray } from './array-codec'
import { Codec } from './codec'
import { compactSignedIntCodec, compactUnsignedIntCodec, DecodedCompactInt } from './compact-int-codec'
import { Method, MethodCodec, methodCodec } from './method-codec'

const compactSignedIntsCodec = new ArrayCodec(compactSignedIntCodec)

export interface HalfDecodedContract {
  fieldLength: DecodedCompactInt
  methodIndexes: DecodedArray<DecodedCompactInt>
  methods: Buffer
}

export interface Contract {
  fieldLength: number
  methods: Method[]
}

export class ContractCodec implements Codec<HalfDecodedContract> {
  parser = Parser.start()
    .nest('fieldLength', {
      type: compactSignedIntCodec.parser
    })
    .nest('methodIndexes', {
      type: compactSignedIntsCodec.parser
    })
    .buffer('methods', { readUntil: 'eof' })

  encode(input: HalfDecodedContract): Buffer {
    return Buffer.from([
      ...compactSignedIntCodec.encode(input.fieldLength),
      ...compactSignedIntsCodec.encode(input.methodIndexes.value),
      ...input.methods
    ])
  }

  decode(input: Buffer): HalfDecodedContract {
    return this.parser.parse(input)
  }

  decodeContract(input: Buffer): Contract {
    const halfDecoded = this.decode(input)
    const fieldLength = compactUnsignedIntCodec.toU32(halfDecoded.fieldLength)
    const methodIndexes = halfDecoded.methodIndexes.value.map((v) => compactUnsignedIntCodec.toU32(v))
    const methods: Method[] = []
    for (let i = 0, start = 0; i < methodIndexes.length; i++) {
      const end = methodIndexes[i]
      const method = MethodCodec.toMethod(methodCodec.decode(halfDecoded.methods.slice(start, end)))
      methods.push(method)
      start = end
    }

    return { fieldLength, methods }
  }
}

export const contractCodec = new ContractCodec()
