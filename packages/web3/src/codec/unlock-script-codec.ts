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
import { Codec, EnumCodec, FixedSizeCodec, ObjectCodec } from './codec'
import { DecodedScript, scriptCodec } from './script-codec'
import { ByteString, byteStringCodec } from './bytestring-codec'
import { LockupScript, lockupScriptCodec } from './lockup-script-codec'
import { Reader } from './reader'

export type Val =
  | { type: 'Bool'; value: boolean }
  | { type: 'I256'; value: DecodedCompactInt }
  | { type: 'U256'; value: DecodedCompactInt }
  | { type: 'ByteVec'; value: ByteString }
  | { type: 'Address'; value: LockupScript }

const boolCodec = new (class extends Codec<boolean> {
  encode(input: boolean): Uint8Array {
    return new Uint8Array([input ? 1 : 0])
  }
  _decode(input: Reader): boolean {
    const byte = input.consumeByte()
    if (byte === 1) {
      return true
    } else if (byte === 0) {
      return false
    } else {
      throw new Error(`Invalid encoded bool value ${byte}, expected 0 or 1`)
    }
  }
})()

const valCodec = new EnumCodec<Val>('val', {
  Bool: boolCodec,
  I256: compactSignedIntCodec,
  U256: compactUnsignedIntCodec,
  ByteVec: byteStringCodec,
  Address: lockupScriptCodec
})
const valsCodec = new ArrayCodec(valCodec)

export type P2PKH = Uint8Array
export interface KeyWithIndex {
  publicKey: P2PKH
  index: DecodedCompactInt
}
export type P2MPKH = KeyWithIndex[]
export interface P2SH {
  script: DecodedScript
  params: Val[]
}
export type SameAsPrevious = 'SameAsPrevious'

export type UnlockScript =
  | { type: 'P2PKH'; value: P2PKH }
  | { type: 'P2MPKH'; value: P2MPKH }
  | { type: 'P2SH'; value: P2SH }
  | { type: 'SameAsPrevious'; value: SameAsPrevious }

const p2pkhCodec = new FixedSizeCodec(33)
const keyWithIndexCodec = new ObjectCodec<KeyWithIndex>({
  publicKey: p2pkhCodec,
  index: compactSignedIntCodec
})
const p2mpkhCodec: Codec<P2MPKH> = new ArrayCodec(keyWithIndexCodec)
const p2shCodec = new ObjectCodec<P2SH>({
  script: scriptCodec,
  params: valsCodec
})
const sameAsPreviousCodec = new (class extends Codec<SameAsPrevious> {
  encode(): Uint8Array {
    return new Uint8Array([])
  }
  _decode(): SameAsPrevious {
    return 'SameAsPrevious'
  }
})()

export const unlockScriptCodec = new EnumCodec<UnlockScript>('unlock script', {
  P2PKH: p2pkhCodec,
  P2MPKH: p2mpkhCodec,
  P2SH: p2shCodec,
  SameAsPrevious: sameAsPreviousCodec
})
