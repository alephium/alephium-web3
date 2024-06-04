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
import { DecodedCompactInt, compactSignedIntCodec } from './compact-int-codec'
import { Codec } from './codec'
import { ArrayCodec, DecodedArray } from './array-codec'

export interface PublicKeyHash {
  publicKeyHash: Uint8Array
}

class PublicKeyHashCodec implements Codec<PublicKeyHash> {
  parser = Parser.start().buffer('publicKeyHash', { length: 32 })

  encode(input: PublicKeyHash): Uint8Array {
    return input.publicKeyHash
  }

  decode(input: Uint8Array): PublicKeyHash {
    return this.parser.parse(input)
  }
}

const publicKeyHashCodec = new PublicKeyHashCodec()
const publicKeyHashesCodec = new ArrayCodec(publicKeyHashCodec)
const multiSigParser = Parser.start()
  .nest('publicKeyHashes', { type: publicKeyHashesCodec.parser })
  .nest('m', { type: compactSignedIntCodec.parser })
export interface MultiSig {
  publicKeyHashes: DecodedArray<PublicKeyHash>
  m: DecodedCompactInt
}

export interface P2SH {
  scriptHash: Uint8Array
}

export interface P2C {
  contractId: Uint8Array
}

export interface LockupScript {
  scriptType: number
  script: PublicKeyHash | MultiSig | P2SH | P2C
}

export class LockupScriptCodec implements Codec<LockupScript> {
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

  encode(input: LockupScript): Uint8Array {
    const result: number[] = [input.scriptType]
    if (input.scriptType === 0) {
      result.push(...(input.script as PublicKeyHash).publicKeyHash)
    } else if (input.scriptType === 1) {
      result.push(...publicKeyHashesCodec.encode((input.script as MultiSig).publicKeyHashes.value))
      result.push(...compactSignedIntCodec.encode((input.script as MultiSig).m))
    } else if (input.scriptType === 2) {
      result.push(...(input.script as P2SH).scriptHash)
    } else if (input.scriptType === 3) {
      result.push(...(input.script as P2C).contractId)
    } else {
      throw new Error(`Unsupported script type: ${input.scriptType}`)
    }

    return new Uint8Array(result)
  }

  decode(input: Uint8Array): LockupScript {
    return this.parser.parse(input)
  }
}

export const lockupScriptCodec = new LockupScriptCodec()
