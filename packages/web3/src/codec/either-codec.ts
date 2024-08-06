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

export interface Either<L, R> {
  either: number
  value: L | R
}

export class EitherCodec<L, R> extends Codec<Either<L, R>> {
  constructor(private leftCodec: Codec<L>, private rightCodec: Codec<R>) {
    super()
  }

  encode(input: Either<L, R>): Uint8Array {
    const result = [input.either]
    if (input.either === 0) {
      result.push(...this.leftCodec.encode(input.value as L))
    } else {
      result.push(...this.rightCodec.encode(input.value as R))
    }
    return new Uint8Array(result)
  }

  _decode(input: Reader): Either<L, R> {
    const type = input.consumeByte()
    const value = type === 0 ? this.leftCodec._decode(input) : this.rightCodec._decode(input)
    return { either: type, value }
  }

  fromLeft(left: L): Either<L, R> {
    return {
      either: 0,
      value: left
    }
  }

  fromRight(right: R): Either<L, R> {
    return {
      either: 1,
      value: right
    }
  }
}
