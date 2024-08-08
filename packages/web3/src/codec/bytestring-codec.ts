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
import { concatBytes } from '../utils'
import { Reader } from './reader'
import { ArrayCodec } from './array-codec'

export type ByteString = Uint8Array

export class ByteStringCodec extends Codec<ByteString> {
  encode(input: ByteString): Uint8Array {
    return concatBytes([i32Codec.encode(input.length), input])
  }

  _decode(input: Reader): ByteString {
    const length = i32Codec._decode(input)
    return input.consumeBytes(length)
  }
}

export const byteStringCodec = new ByteStringCodec()
export const byteStringsCodec = new ArrayCodec(byteStringCodec)
