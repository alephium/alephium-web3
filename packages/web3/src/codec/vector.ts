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

import { Codec, Decoder, Encoder, createCodec } from './codec'
import { toInterBytes } from './interUint8Array'
import { merge as mergeUint8 } from './merge'
import { compact } from './compact'

const VectorEnc = <T>(inner: Encoder<T>, size?: number): Encoder<Array<T>> =>
  size! >= 0
    ? (value) => mergeUint8(...value.map(inner))
    : (value) => mergeUint8(compact.enc(value.length), ...value.map(inner))

const VectorDec = <T>(getter: Decoder<T>, size?: number): Decoder<Array<T>> =>
  toInterBytes((bytes) => {
    const nElements = size! >= 0 ? size! : compact.dec(bytes)
    const result = new Array(nElements as number)

    for (let i = 0; i < nElements; i++) {
      result[i] = getter(bytes)
    }

    return result
  })

export const Vector = <T>(inner: Codec<T>, size?: number): Codec<Array<T>> =>
  createCodec(VectorEnc(inner[0], size), VectorDec(inner[1], size))

Vector.enc = VectorEnc
Vector.dec = VectorDec
