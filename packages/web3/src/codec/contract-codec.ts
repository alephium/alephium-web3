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
import { i32Codec } from './compact-int-codec'
import { Method, methodCodec } from './method-codec'
import { concatBytes } from '../utils'
import { Reader } from './reader'

const i32sCodec = new ArrayCodec(i32Codec)

export interface HalfDecodedContract {
  fieldLength: number
  methodIndexes: number[]
  methods: Uint8Array
}

export interface Contract {
  fieldLength: number
  methods: Method[]
}

export class ContractCodec extends Codec<HalfDecodedContract> {
  encode(input: HalfDecodedContract): Uint8Array {
    return concatBytes([i32Codec.encode(input.fieldLength), i32sCodec.encode(input.methodIndexes), input.methods])
  }

  _decode(input: Reader): HalfDecodedContract {
    const fieldLength = i32Codec._decode(input)
    const methodIndexes = i32sCodec._decode(input)
    const methods = input.consumeAll()
    return { fieldLength, methodIndexes, methods }
  }

  decodeContract(input: Uint8Array): Contract {
    const halfDecoded = this.decode(input)
    const fieldLength = halfDecoded.fieldLength
    const methodIndexes = halfDecoded.methodIndexes
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
    const fieldLength = contract.fieldLength
    const methods = contract.methods.map((m) => methodCodec.encode(m))
    let count = 0
    const methodIndexes = Array.from(Array(methods.length).keys()).map((index) => {
      count += methods[`${index}`].length
      return count
    })
    const halfDecoded = {
      fieldLength,
      methodIndexes: methodIndexes,
      methods: concatBytes(methods)
    }
    return this.encode(halfDecoded)
  }
}

export const contractCodec = new ContractCodec()
