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

import { concatBytes } from '../utils'
import djb2 from '../utils/djb2'
import { Codec } from './codec'
import { intAs4BytesCodec } from './int-as-4bytes-codec'
import { Reader } from './reader'

export class CodecWithChecksum<T> extends Codec<T> {
  constructor(private readonly codec: Codec<T>) {
    super()
  }

  encode(value: T): Uint8Array {
    const bytes = this.codec.encode(value)
    const checksum = intAs4BytesCodec.encode(djb2(bytes))
    return concatBytes([bytes, checksum])
  }

  _decode(input: Reader): T {
    const fromIndex = input.getIndex()
    const value = this.codec._decode(input)
    const toIndex = input.getIndex()
    const expected = intAs4BytesCodec._decode(input)
    const checksum = djb2(input.getFromRange(fromIndex, toIndex))
    if (checksum !== expected) {
      throw new Error(`Invalid checksum, expected ${expected}, got ${checksum}`)
    }
    return value
  }
}
