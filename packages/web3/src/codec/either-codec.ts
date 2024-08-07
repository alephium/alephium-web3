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

export type Either<L, R> = { kind: 'Left'; value: L } | { kind: 'Right'; value: R }

export function either<L, R>(name: string, l: Codec<L>, r: Codec<R>): Codec<Either<L, R>> {
  return new EnumCodec(name, { Left: l, Right: r })
}
