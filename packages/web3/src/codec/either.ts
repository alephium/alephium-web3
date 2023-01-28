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
import { byteArray } from './byteArray'
import { merge } from './merge'
import { Byte } from './byte'

type EitherPayload<L, R> = { flag: 0; value: L } | { flag: 1; value: R }

const EitherDec = <L, R>(lDecoder: Decoder<L>, rDecoder: Decoder<R>): Decoder<EitherPayload<L, R>> =>
  byteArray((bytes) => {
    const flag = Byte.dec(bytes)
    const decoder = flag === 0 ? lDecoder : rDecoder
    const value = decoder(bytes)
    return { flag, value } as EitherPayload<L, R>
  })

const EitherEnc =
  <L, R>(lEncoder: Encoder<L>, rEncoder: Encoder<R>): Encoder<EitherPayload<L, R>> =>
  ({ flag, value }) =>
    merge(Byte.enc(flag), (flag === 0 ? lEncoder : rEncoder)(value as any))

export const Either = <L, R>(lCodec: Codec<L>, rCodec: Codec<R>): Codec<EitherPayload<L, R>> =>
  createCodec(EitherEnc(lCodec[0], rCodec[0]), EitherDec(lCodec[1], rCodec[1]))

Either.dec = EitherDec
Either.enc = EitherEnc
