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
import { i32Codec } from './compact-int-codec'
import { byte32Codec, EnumCodec, FixedSizeCodec, ObjectCodec } from './codec'
import { ArrayCodec } from './array-codec'
import { CodecWithChecksum } from './checksum'

export type PublicKeyHash = Uint8Array
export type P2PKH = Uint8Array
export type P2SH = Uint8Array
export type P2C = Uint8Array

export const p2cCodec = byte32Codec

export interface P2MPKH {
  publicKeyHashes: PublicKeyHash[]
  m: number
}

const p2mpkhCodec = new ObjectCodec<P2MPKH>({
  publicKeyHashes: new ArrayCodec(byte32Codec),
  m: i32Codec
})

export type SecP256K1PublicKey = Uint8Array
export type SecP256R1PublicKey = Uint8Array
export type PublicKeyType =
  | { kind: 'SecP256K1'; value: SecP256K1PublicKey }
  | { kind: 'Passkey'; value: SecP256R1PublicKey }

const publicKeyCodec = new FixedSizeCodec(33)
const publicKeyTypeCodec = new EnumCodec<PublicKeyType>('public key type', {
  SecP256K1: publicKeyCodec,
  Passkey: publicKeyCodec
})

export interface P2PK {
  type: PublicKeyType
}

const p2pkCodec = new CodecWithChecksum<P2PK>(new ObjectCodec<P2PK>({ type: publicKeyTypeCodec }))

export type LockupScript =
  | { kind: 'P2PKH'; value: P2PKH }
  | { kind: 'P2MPKH'; value: P2MPKH }
  | { kind: 'P2SH'; value: P2SH }
  | { kind: 'P2C'; value: P2C }
  | { kind: 'P2PK'; value: P2PK }

export const lockupScriptCodec = new EnumCodec<LockupScript>('lockup script', {
  P2PKH: byte32Codec,
  P2MPKH: p2mpkhCodec,
  P2SH: byte32Codec,
  P2C: byte32Codec,
  P2PK: p2pkCodec
})
