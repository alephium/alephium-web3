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

export type Encoder<T> = (value: T) => Int8Array
export type Decoder<T> = (value: Int8Array | ArrayBuffer | string) => T

export type Codec<T> = [Encoder<T>, Decoder<T>] & {
  enc: Encoder<T>
  dec: Decoder<T>
}

export type CodecType<T extends Codec<any>> = T extends Codec<infer V> ? V : unknown

export type StringRecord<T> = {
  [Sym: symbol]: never
  [Num: number]: never
  [Str: string]: T
}

export const createCodec = <T>(encoder: Encoder<T>, decoder: Decoder<T>): Codec<T> => {
  const result = [encoder, decoder] as any
  result.enc = encoder
  result.dec = decoder
  return result
}

export const enhanceEncoder =
  <I, O>(encoder: Encoder<I>, mapper: (value: O) => I): Encoder<O> =>
  (value) =>
    encoder(mapper(value))

export const enhanceDecoder =
  <I, O>(decoder: Decoder<I>, mapper: (value: I) => O): Decoder<O> =>
  (value) =>
    mapper(decoder(value))

export const enhanceCodec = <I, O>(
  [encoder, decoder]: Codec<I>,
  toFrom: (value: O) => I,
  fromTo: (value: I) => O
): Codec<O> => createCodec(enhanceEncoder(encoder, toFrom), enhanceDecoder(decoder, fromTo))
