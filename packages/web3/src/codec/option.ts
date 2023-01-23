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

import { Decoder, Encoder, createCodec, Codec } from './codec'
import { byteArray } from './byteArray'
import { merge } from './merge'
import { Byte } from './byte'

const OptionDec = <T>(inner: Decoder<T>): Decoder<T | undefined | void> =>
  byteArray<T | undefined>((bytes) => {
    const val = Byte.dec(bytes)
    if (val === 0) return undefined
    return inner(bytes)
  })

const OptionEnc =
  <T>(inner: Encoder<T>): Encoder<T | undefined | void> =>
  (value) => {
    const result = new Int8Array(1)
    if (value === undefined) {
      result[0] = 0
      return result
    }
    result[0] = 1
    return merge(result, inner(value))
  }

export const Option = <T>(inner: Codec<T>): Codec<T | undefined | void> =>
  createCodec(OptionEnc(inner[0]), OptionDec(inner[1]))

Option.enc = OptionEnc
Option.dec = OptionDec
