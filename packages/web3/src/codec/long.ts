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

import { Bytes } from './bytes'
import { Codec, enhanceCodec } from './codec'
import { multiByte } from './compact'

export const Long: Codec<bigint> = enhanceCodec(
  Bytes(9),
  (value: bigint) =>
    Int8Array.from([
      4 | multiByte.prefix,
      Number(value >> BigInt(56)),
      Number(value >> BigInt(48)),
      Number(value >> BigInt(40)),
      Number(value >> BigInt(32)),
      Number(value >> BigInt(24)),
      Number(value >> BigInt(16)),
      Number(value >> BigInt(8)),
      Number(value)
    ]),
  (bytes: Int8Array) =>
    (BigInt(bytes[1] & 0xff) << BigInt(56)) |
    (BigInt(bytes[2] & 0xff) << BigInt(48)) |
    (BigInt(bytes[3] & 0xff) << BigInt(40)) |
    (BigInt(bytes[4] & 0xff) << BigInt(32)) |
    (BigInt(bytes[5] & 0xff) << BigInt(24)) |
    (BigInt(bytes[6] & 0xff) << BigInt(16)) |
    (BigInt(bytes[7] & 0xff) << BigInt(8)) |
    BigInt(bytes[8] & 0xff)
)
