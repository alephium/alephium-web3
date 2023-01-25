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

import { Encoder, Decoder, Codec, createCodec } from './codec'
import { byteArray } from './byteArray'
import { merge } from './merge'
import { Int } from './int'

const ByteStringEnc: Encoder<Int8Array> = (bytes: Int8Array) => merge(Int.enc(bytes.byteLength), bytes)

const ByteStringDec: Decoder<Int8Array> = byteArray((bytes) => {
  const len = Int.dec(bytes)
  const result = new Int8Array(bytes.buffer, bytes.pos, len)
  bytes.pos += len
  return result
})

export const ByteString: Codec<Int8Array> = createCodec(ByteStringEnc, ByteStringDec)
