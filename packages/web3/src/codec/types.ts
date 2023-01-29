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

import { Int } from './int'
import { Codec, enhanceCodec } from './codec'
import { Byte } from './byte'
import { Bytes } from './bytes'
import { Hex } from './hex'
import { U256 } from './u256'
import { toInt } from './compact'

// hex string
// TODO fix
export const Target = Hex(32)
// export const Target = Hex(4)

export const Hash: Codec<string> = Hex(32)

export const Blake3: Codec<string> = Hex(32)

export const Signature: Codec<string> = Hex(64)

export const PublicKey: Codec<string> = Hex(33)
export const PrivateKey: Codec<string> = Hex(32)

export const Hint: Codec<number> = enhanceCodec(
  Bytes(4),
  (n: number) => Int8Array.from([n >> 24, n >> 16, n >> 8, n]),
  (value: Int8Array) => toInt(value)
)

export const TimeStamp: Codec<number> = enhanceCodec(
  Bytes(8),
  (n: number) => {
    const value = BigInt(n)
    return Int8Array.from([
      Number(value >> BigInt(56)),
      Number(value >> BigInt(48)),
      Number(value >> BigInt(40)),
      Number(value >> BigInt(32)),
      Number(value >> BigInt(24)),
      Number(value >> BigInt(16)),
      Number(value >> BigInt(8)),
      Number(value)
    ])
  },
  (bytes: Int8Array) => {
    const value =
      (BigInt(bytes[0] & 0xff) << BigInt(56)) |
      (BigInt(bytes[1] & 0xff) << BigInt(48)) |
      (BigInt(bytes[2] & 0xff) << BigInt(40)) |
      (BigInt(bytes[3] & 0xff) << BigInt(32)) |
      (BigInt(bytes[4] & 0xff) << BigInt(24)) |
      (BigInt(bytes[5] & 0xff) << BigInt(16)) |
      (BigInt(bytes[6] & 0xff) << BigInt(8)) |
      BigInt(bytes[7] & 0xff)
    return Number(value)
  }
)

// export const TimeStamp = Long
export const Nonce: Codec<string> = Hex(24)
export const TokenId = Hash

export const TransactionId = Hash

export const ContractId = Hash

export const NetworkId = Byte

export const Amount = U256

export const GasBox = Int

export const GasPrice: Codec<string> = enhanceCodec(
  U256,
  (value: string) => BigInt(value),
  (value: bigint) => value.toString(16)
)
