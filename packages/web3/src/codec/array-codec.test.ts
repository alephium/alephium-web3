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
import { ArrayCodec } from './array-codec'
import { compactUnsignedIntCodec } from './compact-int-codec'
import { signedIntCodec } from './signed-int-codec'

describe('Encode & decode arrays', function () {
  it('should encode and decode arrays', function () {
    const arraySignedIntCodec = new ArrayCodec(signedIntCodec)

    const arrayOfSignedInts = [1, 2, 3, 4, 5]
    const encoded = arraySignedIntCodec.encode(arrayOfSignedInts)
    const decoded = arraySignedIntCodec.decode(encoded)
    expect(arrayOfSignedInts).toEqual(decoded)

    const empty = []
    const encodedEmpty = arraySignedIntCodec.encode(empty)
    const decodedEmpty = arraySignedIntCodec.decode(encodedEmpty)
    expect(empty).toEqual(decodedEmpty)
  })
})
