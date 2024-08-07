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
import { Either, either } from './either-codec'
import { intAs4BytesCodec } from './int-as-4bytes-codec'
import { timestampCodec } from './timestamp-codec'

describe('Encode & decode either type', function () {
  it('should encode and decode either type', function () {
    const eitherCodec = either('test', intAs4BytesCodec, timestampCodec)

    const signedInt: Either<number, bigint> = { kind: 'Left', value: 1000 }
    const encodedSignedInt = eitherCodec.encode(signedInt)
    const decodedSignedInt = eitherCodec.decode(encodedSignedInt)
    expect(signedInt).toEqual(decodedSignedInt)

    const long: Either<number, bigint> = { kind: 'Right', value: 100000000n }
    const encodedLong = eitherCodec.encode(long)
    const decodedLong = eitherCodec.decode(encodedLong)
    expect(long).toEqual(decodedLong)
  })
})
