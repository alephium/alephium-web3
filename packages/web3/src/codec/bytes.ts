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
import { toInterBytes } from './interUint8Array'

const BytesEnc =
  (nBytes: number): Encoder<Uint8Array> =>
  (bytes) =>
    bytes.length === nBytes ? bytes : bytes.slice(0, nBytes)

const BytesDec = (nBytes: number): Decoder<Uint8Array> =>
  toInterBytes((bytes) => {
    const len = nBytes !== Infinity ? nBytes : bytes.byteLength - bytes.pos
    const result = new Uint8Array(bytes.buffer, bytes.pos, len)
    bytes.pos += len
    return result
  })

export const Bytes = (nBytes: number): Codec<Uint8Array> => createCodec(BytesEnc(nBytes), BytesDec(nBytes))

Bytes.enc = BytesEnc
Bytes.dec = BytesDec
