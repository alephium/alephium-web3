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

import { Reader } from './reader'

describe('Reader', function () {
  it('consume one byte', () => {
    const data = new Uint8Array([0x00, 0x01, 0x02, 0x03])
    const reader = new Reader(data)
    for (let i = 0; i < data.length; i += 1) {
      expect(reader.consumeByte()).toEqual(i)
    }
    expect(() => reader.consumeByte()).toThrow()
  })

  it('consume bytes', () => {
    const data = new Uint8Array([0x00, 0x01, 0x02, 0x03])
    const reader = new Reader(data)
    expect(reader.consumeBytes(3)).toEqual(data.slice(0, 3))
    expect(reader.consumeBytes(0)).toEqual(new Uint8Array([]))
    expect(() => reader.consumeBytes(2)).toThrow()
  })

  it('consume all', () => {
    const data = new Uint8Array([0x00, 0x01, 0x02, 0x03])
    const reader = new Reader(data)
    expect(reader.consumeBytes(2)).toEqual(data.slice(0, 2))
    expect(reader.consumeAll()).toEqual(data.slice(2, data.length))
    expect(() => reader.consumeByte()).toThrow()
    expect(() => reader.consumeBytes(1)).toThrow()
    expect(reader.consumeBytes(0)).toEqual(new Uint8Array([]))
  })
})
