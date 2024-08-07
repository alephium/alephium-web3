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
import { byteCodec } from './codec'

describe('codec', function () {
  it('should encode & decode byte', function () {
    for (let i = 0; i < 256; i += 1) {
      expect(byteCodec.encode(i)).toEqual(new Uint8Array([i]))
      expect(byteCodec.decode(new Uint8Array([i]))).toEqual(i)
    }

    expect(() => byteCodec.encode(-1)).toThrow()
    expect(() => byteCodec.encode(256)).toThrow()
  })
})
