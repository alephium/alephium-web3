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
import { randomBytes } from 'crypto'
import { Val, valCodec } from './val'
import { hexToBinUnsafe } from '../utils'

describe('Val', function () {
  it('should encode & decode val', function () {
    test(new Uint8Array([0x00, 0x00]), { type: 'Bool', value: false })
    test(new Uint8Array([0x00, 0x01]), { type: 'Bool', value: true })
    test(
      new Uint8Array([0x01, ...hexToBinUnsafe('dc7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd')]),
      { type: 'I256', value: 57896044618658097711785492504343953926634992332820282019728792003956564819965n }
    )
    test(
      new Uint8Array([0x01, ...hexToBinUnsafe('dc8000000000000000000000000000000000000000000000000000000000000000')]),
      { type: 'I256', value: -57896044618658097711785492504343953926634992332820282019728792003956564819968n }
    )
    test(new Uint8Array([0x02, ...hexToBinUnsafe('bfffffff')]), { type: 'U256', value: 1073741823n })
    test(
      new Uint8Array([0x02, ...hexToBinUnsafe('dcfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe')]),
      { type: 'U256', value: 115792089237316195423570985008687907853269984665640564039457584007913129639934n }
    )
    test(new Uint8Array([0x03, 0x04, 0x00, 0x01, 0x02, 0x03]), {
      type: 'ByteVec',
      value: new Uint8Array([0x00, 0x01, 0x02, 0x03])
    })
    test(new Uint8Array([0x03, 0x00]), { type: 'ByteVec', value: new Uint8Array([]) })
    const bytes = new Uint8Array(randomBytes(32))
    const encodedLockupScript = new Uint8Array([0x04, 0x00, ...bytes])
    test(encodedLockupScript, { type: 'Address', value: { type: 'P2PKH', value: bytes } })
  })

  function test(encoded: Uint8Array, expected: Val) {
    const decoded = valCodec.decode(encoded)
    expect(decoded).toEqual(expected)
    expect(valCodec.encode(decoded)).toEqual(encoded)
  }
})
