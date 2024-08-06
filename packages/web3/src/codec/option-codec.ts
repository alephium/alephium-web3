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
import { Codec } from './codec'
import { Reader } from './reader'

export interface Option<T> {
  option: number
  value?: T
}

export class OptionCodec<T> extends Codec<Option<T>> {
  constructor(private childCodec: Codec<T>) {
    super()
  }

  encode(input: Option<T>): Uint8Array {
    const result = [input.option]
    if (input.option === 1) {
      result.push(...this.childCodec.encode(input.value!))
    }
    return new Uint8Array(result)
  }

  _decode(input: Reader): Option<T> {
    const option = input.consumeByte()
    return { option, value: option === 1 ? this.childCodec._decode(input) : undefined }
  }

  fromBytes(input?: Uint8Array): Option<T> {
    return {
      option: input ? 1 : 0,
      value: input ? this.childCodec.decode(input) : undefined
    }
  }
}
