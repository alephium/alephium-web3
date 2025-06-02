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
import { P2HMPK, UnlockScript, unlockScriptCodec } from './unlock-script-codec'
import { hexToBinUnsafe } from '../utils'
import { Return } from './instr-codec'

describe('UnlockScript', function () {
  it('should encode & decode unlock script', function () {
    const key0 = new Uint8Array(randomBytes(33))
    const key2 = new Uint8Array(randomBytes(33))

    test(new Uint8Array([0x00, ...key0]), { kind: 'P2PKH', value: key0 })
    const encodedP2mpkh = new Uint8Array([0x01, 0x02, ...key0, 0x00, ...key2, 0x02])
    const p2mpkh: UnlockScript = {
      kind: 'P2MPKH',
      value: [
        { publicKey: key0, index: 0 },
        { publicKey: key2, index: 2 }
      ]
    }
    test(encodedP2mpkh, p2mpkh)
    const encodedP2sh = hexToBinUnsafe('0201010002000001020200010306000102030405')
    test(encodedP2sh, {
      kind: 'P2SH',
      value: {
        script: {
          methods: [
            {
              isPublic: true,
              usePreapprovedAssets: false,
              useContractAssets: false,
              usePayToContractOnly: false,
              argsLength: 2,
              localsLength: 0,
              returnLength: 0,
              instrs: [Return]
            }
          ]
        },
        params: [
          { kind: 'Bool', value: true },
          { kind: 'ByteVec', value: new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]) }
        ]
      }
    })
    test(new Uint8Array([0x03]), { kind: 'SameAsPrevious', value: 'SameAsPrevious' })

    const p2hmpk: P2HMPK = {
      publicKeys: [
        {
          kind: 'SecP256K1',
          value: hexToBinUnsafe('bd4633e9b44c83d2d0af346ea0176bbeec2bd9518d760686265ec1c16c33750496')
        },
        {
          kind: 'SecP256R1',
          value: hexToBinUnsafe('17079c94788a2f67022c6019db74b4d591980db6d07889ce7c442883781f12ced7')
        },
        { kind: 'ED25519', value: hexToBinUnsafe('68991de3bd36b8ba38de5457bfaeefc63b16ad6c6d735e3cab326259c407c75a') },
        {
          kind: 'WebAuthn',
          value: hexToBinUnsafe('d8257deb42de07ff159cbe3be953510c7837aa6b818ab322a973e369d7b1cf8c53')
        }
      ],
      publicKeyIndexes: [0, 1, 2, 3]
    }
    const p2hmpkEncoded = hexToBinUnsafe(
      '060400bd4633e9b44c83d2d0af346ea0176bbeec2bd9518d760686265ec1c16c337504960117079c94788a2f67022c6019db74b4d591980db6d07889ce7c442883781f12ced70268991de3bd36b8ba38de5457bfaeefc63b16ad6c6d735e3cab326259c407c75a03d8257deb42de07ff159cbe3be953510c7837aa6b818ab322a973e369d7b1cf8c530400010203'
    )
    test(p2hmpkEncoded, { kind: 'P2HMPK', value: p2hmpk })
  })

  function test(encoded: Uint8Array, expected: UnlockScript) {
    const decoded = unlockScriptCodec.decode(encoded)
    expect(decoded).toEqual(expected)
    expect(unlockScriptCodec.encode(decoded)).toEqual(encoded)
  }
})
