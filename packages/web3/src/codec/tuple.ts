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

const TupleDec = <
  A extends Array<Decoder<any>>,
  OT extends { [K in keyof A]: A[K] extends Decoder<infer D> ? D : unknown }
>(
  ...decoders: A
): Decoder<[...OT]> => toInterBytes((bytes) => decoders.map((decoder) => decoder(bytes)) as [...OT])

const TupleEnc =
  <A extends Array<Encoder<any>>, OT extends { [K in keyof A]: A[K] extends Encoder<infer D> ? D : unknown }>(
    ...encoders: A
  ): Encoder<[...OT]> =>
  (values) =>
    mergeUint8(...values.map((value, idx) => encoders[idx](value)))

export const Tuple = <
  A extends Array<Codec<any>>,
  OT extends { [K in keyof A]: A[K] extends Codec<infer D> ? D : unknown }
>(
  ...codecs: A
): Codec<[...OT]> =>
  createCodec(TupleEnc(...codecs.map(([encoder]) => encoder)), TupleDec(...codecs.map(([, decoder]) => decoder)))

Tuple.enc = TupleEnc
Tuple.dec = TupleDec
