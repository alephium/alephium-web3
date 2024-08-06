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
import { DecodedCompactInt, compactSignedIntCodec } from './compact-int-codec'
import { byte32Codec, Codec, ObjectCodec } from './codec'
import { ArrayCodec } from './array-codec'
import { Reader } from './reader'

export type PublicKeyHash = Uint8Array
export type P2PKH = Uint8Array
export type P2SH = Uint8Array
export type P2C = Uint8Array

export const p2cCodec = byte32Codec

export interface P2MPKH {
  publicKeyHashes: PublicKeyHash[]
  m: DecodedCompactInt
}

const p2mpkhCodec = new ObjectCodec<P2MPKH>({
  publicKeyHashes: new ArrayCodec(byte32Codec),
  m: compactSignedIntCodec
})

export interface LockupScript {
  scriptType: number
  script: P2PKH | P2MPKH | P2SH | P2C
}

export class LockupScriptCodec extends Codec<LockupScript> {
  private checkType(type: number) {
    if (type === 0 || type === 1 || type === 2 || type === 3) {
      return
    }
    throw Error(`Unsupported script type: ${type}`)
  }

  encode(input: LockupScript): Uint8Array {
    this.checkType(input.scriptType)
    const result: number[] = [input.scriptType]
    if (input.scriptType === 1) {
      result.push(...p2mpkhCodec.encode(input.script as P2MPKH))
    } else {
      result.push(...byte32Codec.encode(input.script as Uint8Array))
    }
    return new Uint8Array(result)
  }

  _decode(input: Reader): LockupScript {
    const scriptType = input.consumeByte()
    this.checkType(scriptType)
    const script = scriptType === 1 ? p2mpkhCodec._decode(input) : byte32Codec._decode(input)
    return { scriptType, script }
  }
}

export const lockupScriptCodec = new LockupScriptCodec()
