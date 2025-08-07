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

import { concatBytes, hexToBinUnsafe } from '../utils'
import { PublicKeyLike, publicKeyLikeCodec, safePublicKeyLikeCodec } from './public-key-like-codec'

describe('PublicKeyLike', () => {
  it('should test publicKeyLikeCodec', () => {
    function test(encoded: Uint8Array, value: PublicKeyLike) {
      const decoded = publicKeyLikeCodec.decode(encoded)
      expect(decoded).toEqual(value)
      expect(publicKeyLikeCodec.encode(decoded)).toEqual(encoded)
    }

    const secp256k1 = hexToBinUnsafe('002dea4b238c81819e7557bb7c8a0b695a103eeee52b13f25e7c37900febe5dad5a2')
    test(secp256k1, { kind: 'SecP256K1', value: secp256k1.slice(1) })

    const secp256r1 = hexToBinUnsafe('01742dc81abaf853c7a28c4d224523cb3ce353f451f978a0911b43c3f28a90bd626d')
    test(secp256r1, { kind: 'SecP256R1', value: secp256r1.slice(1) })

    const ed25519 = hexToBinUnsafe('02b783b305958d584f08fa7152c0f50879193272c10244d9446fa146abcf300c76')
    test(ed25519, { kind: 'ED25519', value: ed25519.slice(1) })

    const webauthn = hexToBinUnsafe('0320d62dc1316fd91adcaa6d7c8dba52ab1ae5efdf2e549ce36eceb856f8e01b525a')
    test(webauthn, { kind: 'WebAuthn', value: webauthn.slice(1) })
  })

  it('should test safePublicKeyLikeCodec', () => {
    function test(encoded: Uint8Array, value: PublicKeyLike) {
      const decoded = safePublicKeyLikeCodec.decode(encoded)
      expect(decoded).toEqual(value)
      expect(safePublicKeyLikeCodec.encode(decoded)).toEqual(encoded)

      const invalidEncoded = concatBytes([encoded.slice(0, encoded.length - 2), new Uint8Array([0, 0])])
      expect(() => safePublicKeyLikeCodec.decode(invalidEncoded)).toThrow('Invalid checksum')
    }

    const secp256k1 = hexToBinUnsafe('0042e073520a5276e97bc2a287741b7d05ef4f598d2526e2c522ef3aaaee65970b4c217591ea')
    test(secp256k1, { kind: 'SecP256K1', value: secp256k1.slice(1, secp256k1.length - 4) })

    const secp256r1 = hexToBinUnsafe('01506eafc2cfce5ba942bb8070ac2cd5041538326b0e38cfdee48b3f2a1d067c4836fe416ca6')
    test(secp256r1, { kind: 'SecP256R1', value: secp256r1.slice(1, secp256r1.length - 4) })

    const ed25519 = hexToBinUnsafe('02bb93526fb1fab78adc930143176dff2193ac212bea36b5450bdb9ed15db0321a1fd1bc2c')
    test(ed25519, { kind: 'ED25519', value: ed25519.slice(1, ed25519.length - 4) })

    const webauthn = hexToBinUnsafe('030764a67380f29fa4a1454f1fd162bc7a5360ae5091782f9ba1d021c88a0f5b37cf0b0995f6')
    test(webauthn, { kind: 'WebAuthn', value: webauthn.slice(1, webauthn.length - 4) })
  })
})
