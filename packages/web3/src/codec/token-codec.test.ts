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
import { ALPH_TOKEN_ID } from '../index'
import { tokenCodec } from './token-codec'
import { compactUnsignedIntCodec } from './compact-int-codec'

describe('Encode & decode tokens', function () {
  it('should encode & decode bytestring', function () {
    success({
      id: ALPH_TOKEN_ID,
      amount: 1000000000000000n
    })

    success({
      id: '7e5205529bd11e41dfb96e7de84936a1fe2bb660a401239b05e4ca835a7b5700',
      amount: 0n
    })
  })

  function success(tokenIn: { id: string; amount: bigint }) {
    const token = {
      tokenId: Buffer.from(tokenIn.id, 'hex'),
      amount: compactUnsignedIntCodec.decode(compactUnsignedIntCodec.encodeU256(tokenIn.amount))
    }
    const encoded = tokenCodec.encode(token)
    const decoded = tokenCodec.decode(encoded)
    expect(decoded).toEqual(token)
  }
})
