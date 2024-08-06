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

import { i256Codec, u256Codec } from './compact-int-codec'
import { ByteString, byteStringCodec } from './bytestring-codec'
import { boolCodec, EnumCodec } from './codec'
import { LockupScript, lockupScriptCodec } from './lockup-script-codec'
import { ArrayCodec } from './array-codec'

export type Val =
  | { type: 'Bool'; value: boolean }
  | { type: 'I256'; value: bigint }
  | { type: 'U256'; value: bigint }
  | { type: 'ByteVec'; value: ByteString }
  | { type: 'Address'; value: LockupScript }

export const valCodec = new EnumCodec<Val>('val', {
  Bool: boolCodec,
  I256: i256Codec,
  U256: u256Codec,
  ByteVec: byteStringCodec,
  Address: lockupScriptCodec
})
export const valsCodec = new ArrayCodec(valCodec)
