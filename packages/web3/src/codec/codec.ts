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
import { Parser } from 'binary-parser'

export interface Codec<T> {
  parser: Parser
  encode(input: T): Uint8Array
  decode(input: Uint8Array): T
}

export function assert(value: boolean, message: string) {
  if (!value) {
    throw new Error(message)
  }
}

export function fixedSizeBytes(name: string, length: number): Parser {
  return Parser.start().wrapped({
    length,
    type: Parser.start().buffer(name, { length }),
    wrapper: function (result) {
      if (result.length === length) {
        return result
      }
      throw new Error(`Too few bytes when parsing ${name}, expected ${length}, got ${result.length}`)
    }
  })
}
