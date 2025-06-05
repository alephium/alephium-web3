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
import { binToHex, encodeSignature, hexToBinUnsafe, signatureDecode } from '../utils'
import { KeyType } from '../signer'
import * as necc from '@noble/secp256k1'
import { createHash, createHmac } from 'crypto'

const ec = new EC('secp256k1')

necc.utils.sha256Sync = (...messages: Uint8Array[]): Uint8Array => {
  const sha256 = createHash('sha256')
  for (const message of messages) sha256.update(message)
  return sha256.digest()
}

necc.utils.hmacSha256Sync = (key: Uint8Array, ...messages: Uint8Array[]): Uint8Array => {
  const hash = createHmac('sha256', key)
  messages.forEach((m) => hash.update(m))
  return Uint8Array.from(hash.digest())
}

function checkKeyType(keyType: KeyType) {
  if (keyType !== 'default' && keyType !== 'bip340-schnorr' && keyType !== 'gl-secp256k1') {
    throw new Error(`Invalid key type ${keyType}`)
  }
}

// hash has to be 32 bytes
export function sign(hash: string, privateKey: string, _keyType?: KeyType): string {
  const keyType = _keyType ?? 'default'
  checkKeyType(keyType)

  if (keyType === 'default' || keyType === 'gl-secp256k1') {
    const key = ec.keyFromPrivate(privateKey)
    const signature = key.sign(hash)
    return encodeSignature(signature)
  } else {
    const signature = necc.schnorr.signSync(hexToBinUnsafe(hash), hexToBinUnsafe(privateKey))
    return binToHex(signature)
  }
}

export function verifySignature(hash: string, publicKey: string, signature: string, _keyType?: KeyType): boolean {
  const keyType = _keyType ?? 'default'
  checkKeyType(keyType)

  try {
    if (keyType === 'default' || keyType === 'gl-secp256k1') {
      const key = ec.keyFromPublic(publicKey, 'hex')
      return key.verify(hash, signatureDecode(ec, signature))
    } else {
      return necc.schnorr.verifySync(hexToBinUnsafe(signature), hexToBinUnsafe(hash), hexToBinUnsafe(publicKey))
    }
  } catch (error) {
    return false
  }
}
