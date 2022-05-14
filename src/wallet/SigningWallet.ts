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

import { signatureEncode } from '../utils'
import { encrypt, decrypt } from '../password-crypto'
import { ISigningWallet } from './ISigningWallet'
import { SigningWalletStoredState } from './StoredState'

const ec = new EC('secp256k1')

export class SigningWallet implements ISigningWallet {
  constructor(public encryptedSecretJson: string, public address: string) {}

  static async FromSigningWalletStoredState(
    password: string,
    storedState: SigningWalletStoredState,
    address: string
  ): Promise<ISigningWallet> {
    return SigningWallet.FromPrivateKey(password, storedState.privateKey, address)
  }

  static async FromPrivateKey(password: string, address: string, privateKey: string): Promise<ISigningWallet> {
    return new SigningWallet(encrypt(password, JSON.stringify({ privateKey } as SigningWalletStoredState)), address)
  }

  async sign(password: string, dataToSign: string): Promise<string> {
    const decryptedSecretJson = decrypt(password, this.encryptedSecretJson)
    const { privateKey } = JSON.parse(decryptedSecretJson) as SigningWalletStoredState
    const keyPair = ec.keyFromPrivate(privateKey)
    const signature = keyPair.sign(dataToSign)

    return signatureEncode(signature)
  }
}
