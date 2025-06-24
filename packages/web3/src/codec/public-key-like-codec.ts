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

import { Checksum } from './checksum-codec'
import { byte32Codec, EnumCodec, FixedSizeCodec } from './codec'

export type PublicKeyLike =
  | { kind: 'SecP256K1'; value: Uint8Array }
  | { kind: 'SecP256R1'; value: Uint8Array }
  | { kind: 'ED25519'; value: Uint8Array }
  | { kind: 'WebAuthn'; value: Uint8Array }

const byte33Codec = new FixedSizeCodec(33)

export const publicKeyLikeCodec = new EnumCodec<PublicKeyLike>('public key like', {
  SecP256K1: byte33Codec,
  SecP256R1: byte33Codec,
  ED25519: byte32Codec, // the length of ed25519 public key is 32
  WebAuthn: byte33Codec
})

export const safePublicKeyLikeCodec = new Checksum<PublicKeyLike>(publicKeyLikeCodec)
