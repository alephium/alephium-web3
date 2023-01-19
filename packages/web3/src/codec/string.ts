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
import { toInterBytes } from './interUint8Array'
import { merge as mergeUint8 } from './merge'
import { Decoder, Encoder, createCodec } from './codec'

const textEncoder = new TextEncoder()
const strEnc: Encoder<string> = (str) => {
  const val = textEncoder.encode(str)
  return mergeUint8(compact.enc(val.length), val)
}

const textDecoder = new TextDecoder()
const strDec: Decoder<string> = toInterBytes((bytes) => {
  const nElements = compact.dec(bytes) as number
  const result = textDecoder.decode(bytes.slice(bytes.pos, bytes.pos + nElements))
  bytes.pos += nElements
  return result
})

export const str = createCodec(strEnc, strDec)
