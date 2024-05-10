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
import { signedIntCodec } from './signed-int-codec'

describe('Encode & decode signed int', function () {
  it('should encode & decode int', function () {
    const min = -(2 ** 31)
    const max = 2 ** 31 - 1

    for (let i = 0; i < 10; i++) {
      success(getRandomInt32())
    }
    success(0)
    success(max)
    success(min)

    fail(max + 1)
    fail(min - 1)
    fail(2 ** 50)
  })

  function success(value: number) {
    const encoded = signedIntCodec.encode(value)
    const decoded = signedIntCodec.decode(encoded)
    expect(decoded).toEqual(value)
  }

  function fail(value: number) {
    const encoded = signedIntCodec.encode(value)
    const decoded = signedIntCodec.decode(encoded)
    expect(decoded).not.toEqual(value)
  }

  function getRandomInt32(): number {
    return (Math.random() * 0xffffffff) | 0
  }
})
