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
import { compactUnsignedIntCodec } from './compact-int-codec'
import { Codec } from './codec'
import { ArrayCodec } from './array-codec'

class PublicKeyHashCodec implements Codec<any> {
  parser = Parser.start().buffer('publicKeyHash', { length: 32 })

  static new(): PublicKeyHashCodec {
    return new PublicKeyHashCodec()
  }

  encode(input: any): Buffer {
    return input.publicKeyHash
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }
}

const publicKeyHashCodec = PublicKeyHashCodec.new()
const publicKeyHashesCodec = new ArrayCodec(publicKeyHashCodec)
const multiSigParser = Parser.start()
  .nest('publicKeyHashes', { type: publicKeyHashesCodec.parser })
  .nest('m', { type: compactUnsignedIntCodec.parser })

export class LockupScriptCodec implements Codec<any> {
  parser = Parser.start()
    .uint8('scriptType')
    .choice('script', {
      tag: 'scriptType',
      choices: {
        0: publicKeyHashCodec.parser,
        1: multiSigParser,
        2: Parser.start().buffer('scriptHash', { length: 32 }),
        3: Parser.start().buffer('contractId', { length: 32 })
      }
    })

  encode(input: any): Buffer {
    const result: number[] = [input.scriptType]
    if (input.scriptType === 0) {
      result.push(...input.script.publicKeyHash)
    } else if (input.scriptType === 1) {
      result.push(...publicKeyHashesCodec.encode(input.script.publicKeyHashes.value))
      result.push(...compactUnsignedIntCodec.encode(input.script.m))
    } else if (input.scriptType === 2) {
      result.push(...input.script.scriptHash)
    } else if (input.scriptType === 3) {
      result.push(...input.script.contractId)
    } else {
      throw new Error(`Unsupported script type: ${input.scriptType}`)
    }

    return Buffer.from(result)
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }
}

export const lockupScriptCodec = new LockupScriptCodec()
