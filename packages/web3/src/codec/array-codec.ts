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
import { i32Codec } from './compact-int-codec'
import { Codec } from './codec'
import { Reader } from './reader'
import { concatBytes } from '../utils'

export class ArrayCodec<T> extends Codec<T[]> {
  constructor(private childCodec: Codec<T>) {
    super()
  }

  encode(input: T[]): Uint8Array {
    const bytes: Uint8Array[] = [i32Codec.encode(input.length)]
    for (const element of input) {
      bytes.push(this.childCodec.encode(element))
    }
    return concatBytes(bytes)
  }

  _decode(input: Reader): T[] {
    const length = i32Codec._decode(input)
    const array: T[] = []
    for (let index = 0; index < length; index += 1) {
      array.push(this.childCodec._decode(input))
    }
    return array
  }
}
