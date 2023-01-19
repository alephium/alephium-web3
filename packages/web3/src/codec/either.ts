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

import { Codec, createCodec, Decoder, Encoder } from './codec'
import { toInterBytes } from './interUint8Array'
import { Byte } from './byte'
import { merge as mergeUint8 } from './merge'

const EitherDec = <T>(inner: Decoder<T>): Decoder<T | undefined | void> =>
  toInterBytes<T | undefined>((bytes) => {
    const val = Byte.dec(bytes)
    if (val === 0) return undefined
    return inner(bytes)
  })

const EitherEnc =
  <T>(inner: Encoder<T>): Encoder<T | undefined | void> =>
  (value) => {
    const result = new Uint8Array(1)
    if (value === undefined) {
      result[0] = 0
      return result
    }
    result[0] = 1
    return mergeUint8(result, inner(value))
  }

export const Either = <T>(inner: Codec<T>): Codec<T | undefined | void> =>
  createCodec(EitherEnc(inner[0]), EitherDec(inner[1]))

Either.enc = EitherEnc
Either.dec = EitherDec
