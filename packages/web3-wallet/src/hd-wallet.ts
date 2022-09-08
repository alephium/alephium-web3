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

import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

export function deriveHDWalletPrivateKey(mnemonic: string, addressIndex: number, passphrase?: string): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase)
  const masterKey = bip32.fromSeed(seed)
  const keyPair = masterKey.derivePath(getHDWalletPath(addressIndex))

  if (!keyPair.privateKey) throw new Error('Missing private key')

  return keyPair.privateKey.toString('hex')
}

export function getHDWalletPath(addressIndex: number): string {
  if (addressIndex < 0 || !Number.isInteger(addressIndex) || addressIndex.toString().includes('e')) {
    throw new Error('Invalid address index path level')
  }
  // Being explicit: we always use coinType 1234 no matter the network.
  const coinType = "1234'"

  return `m/44'/${coinType}/0'/0/${addressIndex}`
}
