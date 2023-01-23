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

interface Point {
  x: number
  y: number
}

describe('struct', function () {
  it('struct', () => {
    const pointCodec = Struct({
      x: Int,
      y: Int
    })
    const point = <Point>{
      x: 12,
      y: 12000
    }
    const encData = pointCodec.enc(point)
    expect(point.x).toEqual(pointCodec.dec(encData).x)
    expect(point.y).toEqual(pointCodec.dec(encData).y)
  })
})
