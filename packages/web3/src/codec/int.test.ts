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

import { compact } from './compact'
import { Int } from './int'

describe('Int', function () {
  it('Int', () => {
    // 0x7fffffff
    expect(Int.enc(0x7fffffff)).toEqual(Int8Array.from([0xc0, 127, -1, -1, -1]))
    expect(Int.enc(-2147483648)).toEqual(Int8Array.from([0xc0, -128, 0, 0, 0]))
  })
})
