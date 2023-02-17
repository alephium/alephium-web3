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

import { ec as EC } from 'elliptic'
import { binToHex, encodeSignature, hexToBinUnsafe, signatureDecode } from '..'
import { KeyType } from '../signer'
import * as secp from 'tiny-secp256k1'

const ec = new EC('secp256k1')

// hash has to be 32 bytes
export function sign(hash: string, privateKey: string, _keyType?: KeyType): string {
  const keyType = _keyType ?? 'default'

  if (keyType === 'default') {
    const key = ec.keyFromPrivate(privateKey)
    const signature = key.sign(hash)
    return encodeSignature(signature)
  } else {
    const signature = secp.signSchnorr(hexToBinUnsafe(hash), hexToBinUnsafe(privateKey))
    return binToHex(signature)
  }
}

export function verifySignature(hash: string, publicKey: string, signature: string, _keyType?: KeyType): boolean {
  const keyType = _keyType ?? 'default'

  try {
    if (keyType === 'default') {
      const key = ec.keyFromPublic(publicKey, 'hex')
      return key.verify(hash, signatureDecode(ec, signature))
    } else {
      return secp.verifySchnorr(hexToBinUnsafe(hash), hexToBinUnsafe(publicKey), hexToBinUnsafe(signature))
    }
  } catch (error) {
    return false
  }
}
