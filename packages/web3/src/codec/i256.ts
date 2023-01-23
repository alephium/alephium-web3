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

import { Codec, createCodec, Decoder, Encoder } from './codec'
import { compact } from './compact'
import { byteArray } from './byteArray'

const I256Enc: Encoder<bigint> = (n) => compact.enc(n)

const I256Dec: Decoder<bigint> = byteArray((bytes) => BigInt(compact.dec(bytes)))

export const I256: Codec<bigint> = createCodec(I256Enc, I256Dec)

I256.enc = I256Enc
I256.dec = I256Dec
