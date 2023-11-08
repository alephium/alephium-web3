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
import { assert } from 'console'
import { longCodec } from './long-codec'

describe('Encode & decode signed long', function () {
  it('should encode & decode int', function () {
    const min = -(2n ** 63n)
    const max = 2n ** 63n - 1n

    success(0n)
    success(1003191134n)
    success(-1003191134n)
    success(8378798798791134n)
    success(-8378798798791134n)
    success(max)
    success(min)
    success(-1n)

    fail(max + 1n)
    fail(min - 1n)
    fail(2n ** 100n)
  })

  function success(value: bigint) {
    const encoded = longCodec.encode(value)
    const decoded = longCodec.decode(encoded)
    expect(decoded).toEqual(value)
  }

  function fail(value: bigint) {
    const encoded = longCodec.encode(value)
    const decoded = longCodec.decode(encoded)
    expect(decoded).not.toEqual(value)
  }
})
