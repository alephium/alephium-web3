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
import { UnlockScript, unlockScriptCodec } from './unlock-script-codec'
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
  })

  function test(encoded: Uint8Array, expected: UnlockScript) {
    const decoded = unlockScriptCodec.decode(encoded)
    expect(decoded).toEqual(expected)
    expect(unlockScriptCodec.encode(decoded)).toEqual(encoded)
  }
})
