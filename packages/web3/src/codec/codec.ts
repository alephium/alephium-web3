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

  bimap<R>(from: (v: T) => R, to: (v: R) => T): Codec<R> {
    return new (class extends Codec<R> {
      constructor(private readonly codecT: Codec<T>) {
        super()
      }

      encode(input: R): Uint8Array {
        return this.codecT.encode(to(input))
      }
      _decode(input: Reader): R {
        return from(this.codecT._decode(input))
      }
    })(this)
  }
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

type ExtractKind<T> = T extends { kind: infer U extends string } ? U : never
type ExtractValue<T, K> = T extends { kind: K; value: infer V } ? V : never

export class EnumCodec<T extends { kind: ExtractKind<T>; value: ExtractValue<T, ExtractKind<T>> }> extends Codec<T> {
  private kinds: ExtractKind<T>[]

  constructor(private name: string, private codecs: { [K in ExtractKind<T>]: Codec<ExtractValue<T, K>> }) {
    super()
    this.kinds = Object.keys(codecs) as ExtractKind<T>[]
  }

  encode(value: T): Uint8Array {
    const index = this.kinds.findIndex((t) => t === value.kind)
    if (index === -1) {
      throw new Error(`Invalid ${this.name} kind ${value.kind}, expected one of ${this.kinds}`)
    }
    const codec = this.codecs[value.kind]
    return new Uint8Array([index, ...codec.encode(value.value)])
  }

  _decode(input: Reader): T {
    const index = input.consumeByte()
    if (index >= 0 && index < this.kinds.length) {
      const kind = this.kinds[`${index}`]
      const codec = this.codecs[kind as ExtractKind<T>]
      return { kind, value: codec._decode(input) } as T
    }
    throw new Error(`Invalid encoded ${this.name} kind: ${index}`)
  }
}

export const byte32Codec = new FixedSizeCodec(32)
export const byteCodec = new (class extends Codec<number> {
  encode(input: number): Uint8Array {
    assert(input >= 0 && input < 256, `Invalid byte: ${input}`)
    return new Uint8Array([input])
  }
  _decode(input: Reader): number {
    return input.consumeByte()
  }
})()

export const boolCodec = new (class extends Codec<boolean> {
  encode(input: boolean): Uint8Array {
    return new Uint8Array([input ? 1 : 0])
  }
  _decode(input: Reader): boolean {
    const byte = input.consumeByte()
    if (byte === 1) {
      return true
    } else if (byte === 0) {
      return false
    } else {
      throw new Error(`Invalid encoded bool value ${byte}, expected 0 or 1`)
    }
  }
})()
