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

import { Struct } from './struct'
import { Int } from './int'
import { Vector } from './vector'
import { Bool } from './bool'

interface Point {
  x: number
  y: number
  z: boolean
}

const pointsCodec = Vector<Point>(
  Struct({
    x: Int,
    y: Int,
    z: Bool
  })
)

describe('Vector', function () {
  it('Vector', () => {
    expect(
      pointsCodec.enc([
        { x: 1, y: 3, z: true },
        { x: 12, y: 15, z: false }
      ])
    ).toEqual(Int8Array.from([2, 1, 3, 1, 12, 15, 0]))
  })
})
