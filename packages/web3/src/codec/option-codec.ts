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
import { Codec, EnumCodec } from './codec'

export type Option<T> = { kind: 'None'; value: undefined } | { kind: 'Some'; value: T }

const undefinedCodec = new (class extends Codec<undefined> {
  encode(): Uint8Array {
    return new Uint8Array([])
  }
  _decode(): undefined {
    return undefined
  }
})()

export function option<T>(codec: Codec<T>): Codec<Option<T>> {
  return new EnumCodec<Option<T>>('option', {
    None: undefinedCodec,
    Some: codec
  })
}
