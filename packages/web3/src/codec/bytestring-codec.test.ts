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
import { byteStringCodec } from './bytestring-codec'
import { compactUnsignedIntCodec } from './compact-int-codec'

describe('Encode & decode bytestring', function () {
  it('should encode & decode bytestring', function () {
    success(Buffer.from(''))
    success(Buffer.from('Alephium is great!'))
  })

  function success(value: Buffer) {
    const encodedOne = byteStringCodec.encodeBuffer(value)
    const decodedOne = byteStringCodec.decode(encodedOne)
    const encodedTwo = byteStringCodec.encode(decodedOne)
    const decodedTwo = byteStringCodec.decodeBuffer(encodedTwo)
    expect(compactUnsignedIntCodec.toU32(decodedOne.length)).toEqual(decodedOne.value.length)
    expect(decodedOne.value).toEqual(value)
    expect(decodedTwo).toEqual(value)
  }
})
