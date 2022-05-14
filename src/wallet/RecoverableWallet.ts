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
import * as bip39 from 'bip39'

import { Buffer } from 'buffer/'
import { IRecoverableWallet } from './IRecoverableWallet'
import { SigningWallet } from './SigningWallet'
import { encrypt, decrypt } from '../password-crypto'
import { RecoverableWalletStoredState } from './StoredState'
import { deriveAddressAndKeys } from './walletUtils'

export class RecoverableWallet extends SigningWallet implements IRecoverableWallet {
  constructor(encryptedSecretJson: string, address: string) {
    super(encryptedSecretJson, address)
  }

  static async FromMnemonic(password: string, mnemonic: string): Promise<IRecoverableWallet> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid seed phrase')
    }
    const seed = Buffer.from(bip39.mnemonicToSeedSync(mnemonic))
    const { address, privateKey } = deriveAddressAndKeys(seed)
    const storedState = new RecoverableWalletStoredState({ seed, privateKey, mnemonic })

    return new RecoverableWallet(encrypt(password, JSON.stringify(storedState)), address)
  }

  async getMnemonic(password: string): Promise<string> {
    const storedState: RecoverableWalletStoredState = JSON.parse(
      decrypt(password, this.encryptedSecretJson)
    ) as RecoverableWalletStoredState

    return storedState.mnemonic
  }
}

// export const getWalletFromMnemonic = (mnemonic: string): Wallet => {
//   const seed = Buffer.from(bip39.mnemonicToSeedSync(mnemonic))
//   const { address, publicKey, privateKey } = deriveAddressAndKeys(seed)

//   return new Wallet({ seed, address, publicKey, privateKey, mnemonic })
// }
