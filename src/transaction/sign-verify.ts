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

import * as utils from '../utils'

const ec = new EC('secp256k1')

export function transactionSign(txHash: string, privateKey: string): string {
  const keyPair = ec.keyFromPrivate(privateKey)
  const signature = keyPair.sign(txHash)

  return utils.signatureEncode(signature)
}

export function transactionVerifySignature(txHash: string, publicKey: string, signature: string): boolean {
  try {
    const key = ec.keyFromPublic(publicKey, 'hex')
    return key.verify(txHash, utils.signatureDecode(ec, signature))
  } catch (error) {
    return false
  }
}
