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
import { i32Codec } from './compact-int-codec'
import { Codec, EnumCodec, FixedSizeCodec, ObjectCodec } from './codec'
import { Script, scriptCodec } from './script-codec'
import { Val, valsCodec } from './val'
import { PublicKeyLike, publicKeyLikeCodec } from './public-key-like-codec'

export type PublicKey = Uint8Array
export interface KeyWithIndex {
  publicKey: PublicKey
  index: number
}
export type P2MPKH = KeyWithIndex[]
export interface P2SH {
  script: Script
  params: Val[]
}
export type SameAsPrevious = 'SameAsPrevious'
export type P2PK = 'P2PK'

export interface P2HMPK {
  publicKeys: PublicKeyLike[]
  publicKeyIndexes: number[]
}

export type UnlockScript =
  | { kind: 'P2PKH'; value: PublicKey }
  | { kind: 'P2MPKH'; value: P2MPKH }
  | { kind: 'P2SH'; value: P2SH }
  | { kind: 'SameAsPrevious'; value: SameAsPrevious }
  | { kind: 'PoLW'; value: PublicKey }
  | { kind: 'P2PK'; value: P2PK }
  | { kind: 'P2HMPK'; value: P2HMPK }

const publicKeyCodec = new FixedSizeCodec(33)
const keyWithIndexCodec = new ObjectCodec<KeyWithIndex>({
  publicKey: publicKeyCodec,
  index: i32Codec
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
const p2pkCodec = new (class extends Codec<P2PK> {
  encode(): Uint8Array {
    return new Uint8Array([])
  }
  _decode(): P2PK {
    return 'P2PK'
  }
})()

const publicKeyLikesCodec = new ArrayCodec(publicKeyLikeCodec)
const publicKeyIndexesCodec = new ArrayCodec(i32Codec)
const p2hmpkCodec = new ObjectCodec<P2HMPK>({
  publicKeys: publicKeyLikesCodec,
  publicKeyIndexes: publicKeyIndexesCodec
})

export const unlockScriptCodec = new EnumCodec<UnlockScript>('unlock script', {
  P2PKH: publicKeyCodec,
  P2MPKH: p2mpkhCodec,
  P2SH: p2shCodec,
  SameAsPrevious: sameAsPreviousCodec,
  PoLW: publicKeyCodec,
  P2PK: p2pkCodec,
  P2HMPK: p2hmpkCodec
})

export const encodedSameAsPrevious = unlockScriptCodec.encode({ kind: 'SameAsPrevious', value: 'SameAsPrevious' })
