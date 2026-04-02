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

import { binToHex, encodeSignature, hexToBinUnsafe, signatureDecode } from '../utils'
import { KeyType } from '../signer'
import * as secp from '@noble/secp256k1'
import { sha256 } from '@noble/hashes/sha256'
import { hmac } from '@noble/hashes/hmac'

secp.utils.sha256Sync = (...messages: Uint8Array[]): Uint8Array => {
  const h = sha256.create()
  for (const message of messages) h.update(message)
  return h.digest()
}

secp.utils.hmacSha256Sync = (key: Uint8Array, ...messages: Uint8Array[]): Uint8Array => {
  const h = hmac.create(sha256, key)
  for (const message of messages) h.update(message)
  return h.digest()
}

function checkKeyType(keyType: KeyType) {
  if (keyType !== 'default' && keyType !== 'bip340-schnorr' && keyType !== 'gl-secp256k1') {
    throw new Error(`Invalid key type ${keyType}, only supports secp256k1 and schnorr for now`)
  }
}

// hash has to be 32 bytes
export function sign(hash: string, privateKey: string, _keyType?: KeyType): string {
  const keyType = _keyType ?? 'default'
  checkKeyType(keyType)

  if (keyType === 'default' || keyType === 'gl-secp256k1') {
    const sig = secp.signSync(hexToBinUnsafe(hash), hexToBinUnsafe(privateKey), { der: false })
    const signature = secp.Signature.fromCompact(sig)
    return encodeSignature({ r: signature.r, s: signature.s })
  } else {
    const signature = secp.schnorr.signSync(hexToBinUnsafe(hash), hexToBinUnsafe(privateKey))
    return binToHex(signature)
  }
}

export function verifySignature(hash: string, publicKey: string, signature: string, _keyType?: KeyType): boolean {
  const keyType = _keyType ?? 'default'
  checkKeyType(keyType)

  try {
    if (keyType === 'default' || keyType === 'gl-secp256k1') {
      const decoded = signatureDecode(signature)
      const sig = secp.Signature.fromCompact(decoded.r + decoded.s)
      return secp.verify(sig, hexToBinUnsafe(hash), hexToBinUnsafe(publicKey))
    } else {
      return secp.schnorr.verifySync(hexToBinUnsafe(signature), hexToBinUnsafe(hash), hexToBinUnsafe(publicKey))
    }
  } catch (error) {
    return false
  }
}
