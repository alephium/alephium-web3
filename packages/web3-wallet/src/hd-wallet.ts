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

import { isGroupedAccount, publicKeyFromPrivateKey } from '@alephium/web3'
import { Account, KeyType, ExplorerProvider, NodeProvider } from '@alephium/web3'
import { addressFromPublicKey } from '@alephium/web3'
import { Address } from '@alephium/web3'
import { groupOfAddress } from '@alephium/web3'
import { groupOfPrivateKey, SignerProviderWithCachedAccounts, TOTAL_NUMBER_OF_GROUPS, web3 } from '@alephium/web3'
import * as bip39 from 'bip39'
import { bip32 } from './noble-wrapper'
import { PrivateKeyWallet } from './privatekey-wallet'

export function generateMnemonic(wordLength?: 12 | 24): string {
  return bip39.generateMnemonic(wordLength === 12 ? 128 : 256)
}

export function deriveHDWalletPrivateKey(
  mnemonic: string,
  keyType: KeyType,
  _fromAddressIndex?: number,
  passphrase?: string
): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase)
  const masterKey = bip32.fromSeed(seed)
  const fromAddressIndex = _fromAddressIndex ?? 0
  const keyPair = masterKey.derivePath(getHDWalletPath(keyType, fromAddressIndex))

  if (!keyPair.privateKey) throw new Error('Missing private key')

  return keyPair.privateKey.toString('hex')
}

export function deriveSecp256K1PrivateKey(mnemonic: string, fromAddressIndex?: number, passphrase?: string): string {
  return deriveHDWalletPrivateKey(mnemonic, 'default', fromAddressIndex, passphrase)
}

export function deriveSchnorrPrivateKey(mnemonic: string, fromAddressIndex?: number, passphrase?: string): string {
  return deriveHDWalletPrivateKey(mnemonic, 'bip340-schnorr', fromAddressIndex, passphrase)
}

export function deriveHDWalletPrivateKeyForGroup(
  mnemonic: string,
  targetGroup: number,
  keyType: KeyType,
  _fromAddressIndex?: number,
  passphrase?: string
): [string, number] {
  if (targetGroup < 0 || targetGroup > TOTAL_NUMBER_OF_GROUPS) {
    throw Error(`Invalid target group for HD wallet derivation: ${targetGroup}`)
  }

  const fromAddressIndex = _fromAddressIndex ?? 0
  const privateKey = deriveHDWalletPrivateKey(mnemonic, keyType, fromAddressIndex, passphrase)
  if (groupOfPrivateKey(privateKey, keyType) === targetGroup) {
    return [privateKey, fromAddressIndex]
  } else {
    return deriveHDWalletPrivateKeyForGroup(mnemonic, targetGroup, keyType, fromAddressIndex + 1, passphrase)
  }
}

export function deriveSecp256K1PrivateKeyForGroup(
  mnemonic: string,
  targetGroup: number,
  _fromAddressIndex?: number,
  passphrase?: string
): [string, number] {
  return deriveHDWalletPrivateKeyForGroup(mnemonic, targetGroup, 'default', _fromAddressIndex, passphrase)
}

export function deriveSchnorrPrivateKeyForGroup(
  mnemonic: string,
  targetGroup: number,
  _fromAddressIndex?: number,
  passphrase?: string
): [string, number] {
  return deriveHDWalletPrivateKeyForGroup(mnemonic, targetGroup, 'bip340-schnorr', _fromAddressIndex, passphrase)
}

export function getHDWalletPath(keyType: KeyType, addressIndex: number): string {
  if (addressIndex < 0 || !Number.isInteger(addressIndex) || addressIndex.toString().includes('e')) {
    throw new Error('Invalid address index path level')
  }
  // Being explicit: we always use coinType 1234 no matter the network.
  const coinType = "1234'"
  // eslint-disable-next-line
  const keyTypeNum = (() => {
    switch (keyType) {
      case 'default':
        return 0
      case 'bip340-schnorr':
        return 1
      case 'gl-secp256k1':
        return 2
      case 'gl-secp256r1':
        return 3
      case 'gl-ed25519':
        return 4
      case 'gl-webauthn':
        return 5
      default:
        throw new Error(`Unsupported key type: ${keyType}`)
    }
  })()

  return `m/44'/${coinType}/${keyTypeNum}'/0/${addressIndex}`
}

export function getSecp259K1Path(addressIndex: number): string {
  return getHDWalletPath('default', addressIndex)
}

export function getSchnorrPath(addressIndex: number): string {
  return getHDWalletPath('bip340-schnorr', addressIndex)
}

export function getGlSecp256K1Path(addressIndex: number): string {
  return getHDWalletPath('gl-secp256k1', addressIndex)
}

export function getGlSecp256R1Path(addressIndex: number): string {
  return getHDWalletPath('gl-secp256r1', addressIndex)
}

export function getGlEd25519Path(addressIndex: number): string {
  return getHDWalletPath('gl-ed25519', addressIndex)
}

export function getGlWebauthnPath(addressIndex: number): string {
  return getHDWalletPath('gl-webauthn', addressIndex)
}

export type HDWalletAccount = Account & { addressIndex: number }

// In-memory HDWallet for simple use cases. Advanced wallet better used the derivation functions above.
export class HDWallet extends SignerProviderWithCachedAccounts<HDWalletAccount> {
  private readonly mnemonic: string
  readonly keyType: KeyType
  private readonly passphrase?: string
  readonly nodeProvider: NodeProvider
  readonly explorerProvider: ExplorerProvider | undefined

  constructor({
    mnemonic,
    keyType,
    nodeProvider,
    explorerProvider,
    passphrase
  }: {
    mnemonic: string
    keyType?: KeyType
    nodeProvider?: NodeProvider
    explorerProvider?: ExplorerProvider
    passphrase?: string
  }) {
    super()
    this.mnemonic = mnemonic
    this.keyType = keyType ?? 'default'
    if (this.keyType !== 'default' && this.keyType !== 'bip340-schnorr' && this.keyType !== 'gl-secp256k1') {
      throw new Error(`Invalid key type ${keyType}`)
    }
    this.passphrase = passphrase
    this.nodeProvider = nodeProvider ?? web3.getCurrentNodeProvider()
    this.explorerProvider = explorerProvider ?? web3.getCurrentExplorerProvider()
  }

  private getNextFromAddressIndex(targetGroup?: number): number {
    let usedAddressIndex = -1
    for (const account of this._accounts.values()) {
      const accountGroup = isGroupedAccount(account) ? account.group : groupOfAddress(account.address)
      if ((targetGroup === undefined || accountGroup == targetGroup) && account.addressIndex > usedAddressIndex) {
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
        this.keyType,
        fromAddressIndex,
        this.passphrase
      )
      priKey = _priKey
      addressIndex = _addressIndex
    } else {
      priKey = deriveHDWalletPrivateKey(this.mnemonic, this.keyType, fromAddressIndex, this.passphrase)
    }

    const publicKey = publicKeyFromPrivateKey(priKey, this.keyType)
    const address = addressFromPublicKey(publicKey, this.keyType)
    const group = groupOfAddress(address)
    const account = { keyType: this.keyType, address, group, publicKey, addressIndex }

    this._accounts.set(account.address, account)
    return account
  }

  async signRaw(signerAddress: Address, hexString: string): Promise<string> {
    const account = await this.getAccount(signerAddress)
    const privateKey = deriveHDWalletPrivateKey(this.mnemonic, account.keyType, account.addressIndex, this.passphrase)

    return PrivateKeyWallet.sign(privateKey, hexString, this.keyType)
  }
}
