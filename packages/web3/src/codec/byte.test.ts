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

import { Byte } from './byte'

describe('byte', function () {
  it('byte', () => {
    expect(Byte.enc(0).toString()).toEqual('0')
    expect(Byte.enc(1).toString()).toEqual('1')
    expect(Byte.enc(-1).toString()).toEqual('-1')

    expect(Byte.dec('00')).toEqual(0)
    expect(Byte.dec('01')).toEqual(1)

    expect(Byte.enc(127).toString()).toEqual(Int8Array.of(127).toString())
    expect(Byte.enc(-128).toString()).toEqual(Int8Array.of(-128).toString())
  })
})
