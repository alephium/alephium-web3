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

import { concatBytes } from '../utils'
import { Reader } from './reader'

export abstract class Codec<T> {
  abstract encode(input: T): Uint8Array
  decode(input: Uint8Array): T {
    const reader = new Reader(input)
    return this._decode(reader)
  }

  abstract _decode(input: Reader): T
}

export function assert(value: boolean, message: string) {
  if (!value) {
    throw new Error(message)
  }
}

export class FixedSizeCodec extends Codec<Uint8Array> {
  constructor(private readonly size: number) {
    super()
  }

  encode(input: Uint8Array): Uint8Array {
    assert(input.length === this.size, `Invalid length, expected ${this.size}, got ${input.length}`)
    return input
  }

  _decode(input: Reader): Uint8Array {
    return input.consumeBytes(this.size)
  }
}

export class ObjectCodec<T> extends Codec<T> {
  private keys: (keyof T)[]

  constructor(private codecs: { [K in keyof T]: Codec<T[K]> }) {
    super()
    this.keys = Object.keys(codecs) as (keyof T)[]
  }

  encode(value: T): Uint8Array {
    const bytes: Uint8Array[] = []
    for (const key of this.keys) {
      bytes.push(this.codecs[key].encode(value[key]))
    }
    return concatBytes(bytes)
  }

  _decode(input: Reader): T {
    const result: T = {} as T
    for (const key of this.keys) {
      result[key] = this.codecs[key]._decode(input)
    }
    return result as T
  }
}

export class ByteCodec extends Codec<number> {
  encode(input: number): Uint8Array {
    return new Uint8Array([input])
  }
  _decode(input: Reader): number {
    return input.consumeByte()
  }
}

export const byte32Codec = new FixedSizeCodec(32)
export const byteCodec = new ByteCodec()
