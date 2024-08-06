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
import { Codec } from './codec'
import { compactSignedIntCodec, DecodedCompactInt } from './compact-int-codec'
import { Method, methodCodec } from './method-codec'
import { concatBytes } from '../utils'
import { Reader } from './reader'

const compactSignedIntsCodec = new ArrayCodec(compactSignedIntCodec)

export interface HalfDecodedContract {
  fieldLength: DecodedCompactInt
  methodIndexes: DecodedCompactInt[]
  methods: Uint8Array
}

export interface Contract {
  fieldLength: number
  methods: Method[]
}

export class ContractCodec extends Codec<HalfDecodedContract> {
  encode(input: HalfDecodedContract): Uint8Array {
    return concatBytes([
      compactSignedIntCodec.encode(input.fieldLength),
      compactSignedIntsCodec.encode(input.methodIndexes),
      input.methods
    ])
  }

  _decode(input: Reader): HalfDecodedContract {
    const fieldLength = compactSignedIntCodec._decode(input)
    const methodIndexes = compactSignedIntsCodec._decode(input)
    const methods = input.consumeAll()
    return { fieldLength, methodIndexes, methods }
  }

  decodeContract(input: Uint8Array): Contract {
    const halfDecoded = this.decode(input)
    const fieldLength = compactSignedIntCodec.toI32(halfDecoded.fieldLength)
    const methodIndexes = halfDecoded.methodIndexes.map((v) => compactSignedIntCodec.toI32(v))
    const methods: Method[] = []
    for (let i = 0, start = 0; i < methodIndexes.length; i++) {
      const end = methodIndexes[i]
      const method = methodCodec.decode(halfDecoded.methods.slice(start, end))
      methods.push(method)
      start = end
    }

    return { fieldLength, methods }
  }

  encodeContract(contract: Contract): Uint8Array {
    const fieldLength = compactSignedIntCodec.fromI32(contract.fieldLength)
    const methods = contract.methods.map((m) => methodCodec.encode(m))
    let count = 0
    const methodIndexes = Array.from(Array(methods.length).keys()).map((index) => {
      count += methods[`${index}`].length
      return count
    })
    const halfDecoded = {
      fieldLength,
      methodIndexes: methodIndexes.map((value) => compactSignedIntCodec.fromI32(value)),
      methods: concatBytes(methods)
    }
    return this.encode(halfDecoded)
  }
}

export const contractCodec = new ContractCodec()
