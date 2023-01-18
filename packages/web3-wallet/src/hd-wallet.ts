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

import { publicKeyFromPrivateKey } from '@alephium/web3'
import { Account, ExplorerProvider, NodeProvider } from '@alephium/web3'
import { addressFromPublicKey } from '@alephium/web3'
import { Address } from '@alephium/web3'
import { groupOfAddress } from '@alephium/web3'
import { groupOfPrivateKey, SignerProviderWithCachedAccounts, TOTAL_NUMBER_OF_GROUPS, web3 } from '@alephium/web3'
import { BIP32Factory } from 'bip32'
import * as bip39 from 'bip39'
import * as ecc from 'tiny-secp256k1'
import { PrivateKeyWallet } from './privatekey-wallet'

export function deriveHDWalletPrivateKey(mnemonic: string, _fromAddressIndex?: number, passphrase?: string): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase)
  const bip32 = BIP32Factory(ecc)
  const masterKey = bip32.fromSeed(seed)
  const fromAddressIndex = _fromAddressIndex ?? 0
  const keyPair = masterKey.derivePath(getHDWalletPath(fromAddressIndex))

  if (!keyPair.privateKey) throw new Error('Missing private key')

  return keyPair.privateKey.toString('hex')
}

export function deriveHDWalletPrivateKeyForGroup(
  mnemonic: string,
  targetGroup: number,
  _fromAddressIndex?: number,
  passphrase?: string
): [string, number] {
  if (targetGroup < 0 || targetGroup > TOTAL_NUMBER_OF_GROUPS) {
    throw Error(`Invalid target group for HD wallet derivation: ${targetGroup}`)
  }

  const fromAddressIndex = _fromAddressIndex ?? 0
  const privateKey = deriveHDWalletPrivateKey(mnemonic, fromAddressIndex, passphrase)
  if (groupOfPrivateKey(privateKey) === targetGroup) {
    return [privateKey, fromAddressIndex]
  } else {
    return deriveHDWalletPrivateKeyForGroup(mnemonic, targetGroup, fromAddressIndex + 1, passphrase)
  }
}

export function getHDWalletPath(addressIndex: number): string {
  if (addressIndex < 0 || !Number.isInteger(addressIndex) || addressIndex.toString().includes('e')) {
    throw new Error('Invalid address index path level')
  }
  // Being explicit: we always use coinType 1234 no matter the network.
  const coinType = "1234'"

  return `m/44'/${coinType}/0'/0/${addressIndex}`
}

export type HDWalletAccount = Account & { addressIndex: number }

// In-memory HDWallet for simple use cases. Advanced wallet better used the derivation functions above.
export class HDWallet extends SignerProviderWithCachedAccounts<HDWalletAccount> {
  private readonly mnemonic: string
  private readonly passphrase?: string
  readonly nodeProvider: NodeProvider
  readonly explorerProvider: ExplorerProvider | undefined

  constructor(mnemonic: string, nodeProvider?: NodeProvider, explorerProvider?: ExplorerProvider, passphrase?: string) {
    super()
    this.mnemonic = mnemonic
    this.passphrase = passphrase
    this.nodeProvider = nodeProvider ?? web3.getCurrentNodeProvider()
    this.explorerProvider = explorerProvider ?? web3.getCurrentExplorerProvider()
  }

  private getNextFromAddressIndex(targetGroup?: number): number {
    let usedAddressIndex = -1
    for (const account of this._accounts.values()) {
      if ((targetGroup === undefined || account.group == targetGroup) && account.addressIndex > usedAddressIndex) {
        usedAddressIndex = account.addressIndex
      }
    }
    return usedAddressIndex + 1
  }

  deriveAndAddNewAccount(targetGroup?: number): HDWalletAccount {
    const fromAddressIndex = this.getNextFromAddressIndex(targetGroup)

    let priKey: string
    let addressIndex: number = fromAddressIndex
    if (targetGroup !== undefined) {
      const [_priKey, _addressIndex] = deriveHDWalletPrivateKeyForGroup(
        this.mnemonic,
        targetGroup,
        fromAddressIndex,
        this.passphrase
      )
      priKey = _priKey
      addressIndex = _addressIndex
    } else {
      priKey = deriveHDWalletPrivateKey(this.mnemonic, fromAddressIndex, this.passphrase)
    }

    const publicKey = publicKeyFromPrivateKey(priKey)
    const address = addressFromPublicKey(publicKey)
    const group = groupOfAddress(address)
    const account = { address, group, publicKey, addressIndex }

    this._accounts.set(account.address, account)
    return account
  }

  async signRaw(signerAddress: Address, hexString: string): Promise<string> {
    const account = await this.getAccount(signerAddress)
    const privateKey = deriveHDWalletPrivateKey(this.mnemonic, account.addressIndex, this.passphrase)

    return PrivateKeyWallet.sign(privateKey, hexString)
  }
}
