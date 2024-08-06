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
import { compactUnsignedIntCodec, compactSignedIntCodec, DecodedCompactInt } from './compact-int-codec'
import { Codec, FixedSizeCodec, ObjectCodec } from './codec'
import { DecodedScript, scriptCodec } from './script-codec'
import { ByteString, byteStringCodec } from './bytestring-codec'
import { LockupScript, lockupScriptCodec } from './lockup-script-codec'
import { Reader } from './reader'

export type P2PKH = Uint8Array
export interface KeyWithIndex {
  publicKey: P2PKH
  index: DecodedCompactInt
}
export type P2MPKH = KeyWithIndex[]

const p2pkhCodec = new FixedSizeCodec(33)
const keyWithIndexCodec = new ObjectCodec<KeyWithIndex>({
  publicKey: p2pkhCodec,
  index: compactSignedIntCodec
})

const p2mpkhCodec: Codec<P2MPKH> = new ArrayCodec(keyWithIndexCodec)

export interface Val {
  type: number
  val: number | DecodedCompactInt | ByteString | LockupScript
}
class ValCodec extends Codec<Val> {
  encode(input: Val): Uint8Array {
    const valType = input.type

    switch (valType) {
      case 0x00: // Boolean
        return new Uint8Array([valType, input.val as number])
      case 0x01: // I256
        return new Uint8Array([valType, ...compactSignedIntCodec.encode(input.val as DecodedCompactInt)])
      case 0x02: // U256
        return new Uint8Array([valType, ...compactUnsignedIntCodec.encode(input.val as DecodedCompactInt)])
      case 0x03: // ByteVec
        return new Uint8Array([valType, ...byteStringCodec.encode(input.val as ByteString)])
      case 0x04: // Address
        return new Uint8Array([valType, ...lockupScriptCodec.encode(input.val as LockupScript)])
      default:
        throw new Error(`ValCodec: unsupported val type: ${valType}`)
    }
  }

  _decode(input: Reader): Val {
    const type = input.consumeByte()
    switch (type) {
      case 0x00: // Boolean
        return { type, val: input.consumeByte() }
      case 0x01: // I256
        return { type, val: compactSignedIntCodec._decode(input) }
      case 0x02: // U256
        return { type, val: compactUnsignedIntCodec._decode(input) }
      case 0x03: // ByteVec
        return { type, val: byteStringCodec._decode(input) }
      case 0x04: // Address
        return { type, val: lockupScriptCodec._decode(input) }
      default:
        throw new Error(`ValCodec: unsupported val type: ${type}`)
    }
  }
}

const valCodec = new ValCodec()
const valsCodec = new ArrayCodec(valCodec)

export interface P2SH {
  script: DecodedScript
  params: Val[]
}

const p2shCodec = new ObjectCodec<P2SH>({
  script: scriptCodec,
  params: valsCodec
})

export type SameAsPrevious = 'SameAsPrevious'

export interface UnlockScript {
  scriptType: number
  script: P2PKH | P2MPKH | P2SH | SameAsPrevious
}

export class UnlockScriptCodec extends Codec<UnlockScript> {
  encode(input: UnlockScript): Uint8Array {
    const scriptType = input.scriptType
    const inputUnLockScript = input.script

    switch (scriptType) {
      case 0: // P2PKH
        return new Uint8Array([scriptType, ...p2pkhCodec.encode(inputUnLockScript as P2PKH)])
      case 1: // P2MPKH
        return new Uint8Array([scriptType, ...p2mpkhCodec.encode(inputUnLockScript as P2MPKH)])
      case 2: // P2SH
        return new Uint8Array([scriptType, ...p2shCodec.encode(inputUnLockScript as P2SH)])
      case 3: // SameAsPrevious
        return new Uint8Array([scriptType])
      default:
        throw new Error(`Unsupported unlock script type: ${scriptType}`)
    }
  }

  _decode(input: Reader): UnlockScript {
    const scriptType = input.consumeByte()
    switch (scriptType) {
      case 0: // P2PKH
        return { scriptType, script: p2pkhCodec._decode(input) }
      case 1: // P2MPKH
        return { scriptType, script: p2mpkhCodec._decode(input) }
      case 2: // P2SH
        return { scriptType, script: p2shCodec._decode(input) }
      case 3: // SameAsPrevious
        return { scriptType, script: 'SameAsPrevious' }
      default:
        throw new Error(`Unsupported unlock script type: ${scriptType}`)
    }
  }
}

export const unlockScriptCodec = new UnlockScriptCodec()
