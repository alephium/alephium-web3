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
import { LockupScript, lockupScriptCodec, P2PK } from './lockup-script-codec'
import { byteCodec } from './codec'
import { PublicKeyLike, safePublicKeyLikeCodec } from './public-key-like-codec'

describe('LockupScript', function () {
  it('should encode & decode lockup script', function () {
    const bytes0 = new Uint8Array(randomBytes(32))
    const bytes1 = new Uint8Array(randomBytes(32))
    const bytes2 = new Uint8Array(randomBytes(32))
    const bytes3 = new Uint8Array(randomBytes(33))

    test(new Uint8Array([0x00, ...bytes0]), { kind: 'P2PKH', value: new Uint8Array(bytes0) })
    const encodedMultisig = new Uint8Array([0x01, 0x03, ...bytes0, ...bytes1, ...bytes2, 0x02])
    const p2mpkh = { publicKeyHashes: [bytes0, bytes1, bytes2], m: 2 }
    test(encodedMultisig, { kind: 'P2MPKH', value: p2mpkh })
    test(new Uint8Array([0x02, ...bytes0]), { kind: 'P2SH', value: new Uint8Array(bytes0) })
    test(new Uint8Array([0x03, ...bytes0]), { kind: 'P2C', value: new Uint8Array(bytes0) })

    const publicKeyLike: PublicKeyLike = { kind: 'SecP256K1', value: bytes3 }
    const encodedPublicKey = safePublicKeyLikeCodec.encode(publicKeyLike)
    const group = 0
    const groupByte = byteCodec.encode(group)
    const p2pk: P2PK = { publicKeyLike, group }
    test(new Uint8Array([0x04, ...encodedPublicKey, ...groupByte]), { kind: 'P2PK', value: p2pk })
  })

  function test(encoded: Uint8Array, expected: LockupScript) {
    const decoded = lockupScriptCodec.decode(encoded)
    expect(decoded).toEqual(expected)
    expect(lockupScriptCodec.encode(decoded)).toEqual(encoded)
  }
})
