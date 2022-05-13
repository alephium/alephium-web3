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

import { signatureEncode } from '../utils'
import { encrypt, decrypt } from '../password-crypto'
import { ISigningWallet } from './ISigningWallet'

export class SigningWallet implements ISigningWallet {
  constructor(private encryptedSecretJson: string) {}

  static async FromPrivateKey(password: string, privateKey: string): Promise<ISigningWallet> {
    return new SigningWallet(encrypt(password, JSON.stringify({ privateKey })))
  }

  sign(password: string, dataToSign: string): string {
    const decryptedSecretJson = decrypt(password, this.encryptedSecretJson)
    const { privateKey } = JSON.parse(decryptedSecretJson)
    const keyPair = ec.keyFromPrivate(privateKey)
    const signature = keyPair.sign(dataToSign)

    return signatureEncode(signature)
  }
}
