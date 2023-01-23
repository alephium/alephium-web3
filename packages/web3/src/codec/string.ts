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

import { compact } from './compact'
import { byteArray } from './byteArray'
import { merge } from './merge'
import { Decoder, Encoder, createCodec } from './codec'

const StringEnc: Encoder<string> = (str) => {
  const textEncoder = new TextEncoder()
  const val = textEncoder.encode(str)
  return merge(compact.enc(val.length), Int8Array.from(val))
}

const StringDec: Decoder<string> = byteArray((bytes) => {
  const textDecoder = new TextDecoder()
  const nElements = compact.dec(bytes) as number
  const result = textDecoder.decode(bytes.slice(bytes.pos, bytes.pos + nElements))
  bytes.pos += nElements
  return result
})

export const String = createCodec(StringEnc, StringDec)
