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
import { EitherCodec } from './either-codec'
import { signedIntCodec } from './signed-int-codec'
import { longCodec } from './long-codec'

describe('Encode & decode either type', function () {
  it('should encode and decode either type', function () {
    const eitherCodec = new EitherCodec(signedIntCodec, longCodec)

    const signedInt = { either: 0, value: 1000 }
    const encodedSignedInt = eitherCodec.encode(signedInt)
    const decodedSignedInt = eitherCodec.decode(encodedSignedInt)
    expect(signedInt).toEqual(decodedSignedInt)

    const long = { either: 1, value: 100000000n }
    const encodedLong = eitherCodec.encode(long)
    const decodedLong = eitherCodec.decode(encodedLong)
    expect(long).toEqual(decodedLong)
  })
})
