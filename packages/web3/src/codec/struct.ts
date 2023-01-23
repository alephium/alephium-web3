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

import { Codec, Decoder, Encoder, createCodec, enhanceEncoder, enhanceDecoder, StringRecord } from './codec'
import { map } from './map'
import { Tuple } from './tuple'

const StructEnc = <
  A extends StringRecord<Encoder<any>>,
  OT extends { [K in keyof A]: A[K] extends Encoder<infer D> ? D : unknown }
>(
  encoders: A
): Encoder<OT> => {
  const keys = Object.keys(encoders)
  return enhanceEncoder(Tuple.enc(...Object.values(encoders)), (input: OT) => keys.map((k) => input[k]))
}

const StructDec = <
  A extends StringRecord<Decoder<any>>,
  OT extends { [K in keyof A]: A[K] extends Decoder<infer D> ? D : unknown }
>(
  decoders: A
): Decoder<OT> => {
  const keys = Object.keys(decoders)
  return enhanceDecoder(
    Tuple.dec(...Object.values(decoders)),
    (tuple: Array<any>) => Object.fromEntries(tuple.map((value, idx) => [keys[idx], value])) as OT
  )
}

export const Struct = <
  A extends StringRecord<Codec<any>>,
  OT extends { [K in keyof A]: A[K] extends Codec<infer D> ? D : unknown }
>(
  codecs: A
): Codec<OT> => createCodec(StructEnc(map(codecs, (x) => x[0]) as any), StructDec(map(codecs, (x) => x[1]) as any))

Struct.enc = StructEnc
Struct.dec = StructDec
