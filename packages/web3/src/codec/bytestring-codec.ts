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
import { Parser } from 'binary-parser'
import { DecodedCompactInt, compactUnsignedIntCodec } from './compact-int-codec'
import { Codec } from './codec'

export interface ByteString {
  length: DecodedCompactInt
  value: Buffer
}

export class ByteStringCodec implements Codec<ByteString> {
  parser = new Parser()
    .nest('length', {
      type: compactUnsignedIntCodec.parser
    })
    .buffer('value', {
      length: function (ctx) {
        return compactUnsignedIntCodec.toU32(this['length']! as any as DecodedCompactInt)
      }
    })

  encode(input: ByteString): Buffer {
    return Buffer.from([...compactUnsignedIntCodec.encode(input.length), ...input.value])
  }

  decode(input: Buffer): ByteString {
    return this.parser.parse(input)
  }

  encodeBuffer(input: Buffer): Buffer {
    return Buffer.from([...compactUnsignedIntCodec.encodeU32(input.length), ...input])
  }

  decodeBuffer(input: Buffer): Buffer {
    return this.decode(input).value
  }
}

export const byteStringCodec = new ByteStringCodec()
