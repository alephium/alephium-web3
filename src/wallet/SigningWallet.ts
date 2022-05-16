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
import { ReadOnlyWallet } from './ReadOnlyWallet'
import { SigningWalletStoredState } from './StoredState'
import * as utils from '../utils'
import { ISigningAccount } from './ISigningAccount'
import { RecoverableWallet } from './RecoverableWallet'
import { StoredState } from './walletUtils'

const ec = new EC('secp256k1')

export class SigningWallet extends ReadOnlyWallet implements ISigningWallet {
  public encryptedSecretJson: string
  constructor(encryptedSecretJson: string, password: string) {
    const storedState = JSON.parse(decrypt(password, encryptedSecretJson))
    let recoveredState: SigningWalletStoredState
    switch (storedState.version) {
      case 2: {
        recoveredState = storedState as SigningWalletStoredState
        break
      }
      default: {
        if (storedState.mnemonic) {
          const upgradedWallet = RecoverableWallet.FromMnemonicSync(password, (storedState as StoredState).mnemonic)
          recoveredState = JSON.parse(decrypt(password, upgradedWallet.encryptedSecretJson)) as SigningWalletStoredState
          break
        }
        throw new Error(
          'No versions beyond 1 and 2 defined. Though implementations for the stored state version upgrade should probably live in the stored state classes'
        )
      }
    }

    const readOnlyAccounts = recoveredState.accounts.map(({ publicKey, p2pkhAddress }) => ({ publicKey, p2pkhAddress }))
    super(readOnlyAccounts)
    this.encryptedSecretJson = encrypt(password, JSON.stringify(recoveredState))
  }

  static async FromSigningWalletStoredState(
    password: string,
    storedState: SigningWalletStoredState
  ): Promise<ISigningWallet> {
    return new SigningWallet(encrypt(password, JSON.stringify(storedState)), password)
  }

  static async FromPrivateKeys(password: string, privateKeys: string[]): Promise<ISigningWallet> {
    const signingAccounts: ISigningAccount[] = privateKeys.map((privateKey) => {
      const publicKey = utils.publicKeyFromPrivateKey(privateKey)
      return {
        privateKey,
        publicKey,
        p2pkhAddress: utils.addressFromPublicKey(publicKey)
      }
    })

    return new SigningWallet(
      encrypt(password, JSON.stringify(new SigningWalletStoredState({ accounts: signingAccounts }))),
      password
    )
  }

  async sign(password: string, dataToSign: string): Promise<string> {
    const decryptedSecretJson = decrypt(password, this.encryptedSecretJson)
    const {
      accounts: [{ privateKey }]
    } = JSON.parse(decryptedSecretJson) as SigningWalletStoredState
    const keyPair = ec.keyFromPrivate(privateKey)
    const signature = keyPair.sign(dataToSign)

    return signatureEncode(signature)
  }
}
