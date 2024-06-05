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

import { binToHex, concatBytes, hexToBinUnsafe } from '@alephium/web3'
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  CipherKey,
  BinaryLike,
  DecipherGCM,
  CipherGCM
} from 'crypto'

const saltByteLength = 64
const ivByteLength = 64
const authTagLength = 16

export const encrypt = (password: string, dataRaw: string): string => {
  const data = new TextEncoder().encode(dataRaw)

  const salt = randomBytes(saltByteLength)
  const derivedKey = keyFromPassword(password, salt)
  const iv = randomBytes(ivByteLength)
  const cipher = createCipher(derivedKey, iv)
  const encrypted = concatBytes([cipher.update(data), cipher.final()])
  const authTag = cipher.getAuthTag()
  const payload = {
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    encrypted: binToHex(concatBytes([encrypted, authTag])),
    version: 1
  }

  return JSON.stringify(payload)
}

export const decrypt = (password: string, payloadRaw: string): string => {
  const payload = JSON.parse(payloadRaw)

  const version = payload.version
  if (version !== 1) {
    throw new Error(`Invalid version: got ${version}, expected: 1`)
  }

  const salt = hexToBinUnsafe(payload.salt)
  const iv = hexToBinUnsafe(payload.iv)
  const encrypted = hexToBinUnsafe(payload.encrypted)

  const derivedKey = keyFromPassword(password, salt)
  const decipher = createDecipher(derivedKey, iv)
  const data = encrypted.slice(0, encrypted.length - authTagLength)
  const authTag = encrypted.slice(encrypted.length - authTagLength, encrypted.length)
  decipher.setAuthTag(authTag)
  const decrypted = concatBytes([decipher.update(data), decipher.final()])

  return new TextDecoder().decode(decrypted)
}

const createCipher = (key: CipherKey, iv: BinaryLike): CipherGCM => {
  return createCipheriv('aes-256-gcm', key, iv)
}

const createDecipher = (key: CipherKey, iv: BinaryLike): DecipherGCM => {
  return createDecipheriv('aes-256-gcm', key, iv)
}

const keyFromPassword = (password: BinaryLike, salt: BinaryLike) => {
  return pbkdf2Sync(password, salt, 10000, 32, 'sha256')
}
