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
import { Account, KeyType, ExplorerProvider, NodeProvider, SignerProviderSimple, utils, web3 } from '@alephium/web3'
import { publicKeyFromPrivateKey, addressFromPublicKey, groupOfAddress } from '@alephium/web3'
import { deriveHDWalletPrivateKey, deriveHDWalletPrivateKeyForGroup } from './hd-wallet'

const ec = new EC('secp256k1')

// In-memory HDWallet for simple use cases.
export class PrivateKeyWallet extends SignerProviderSimple {
  readonly keyType: KeyType
  readonly privateKey: string
  readonly publicKey: string
  readonly address: string
  readonly group: number
  readonly _nodeProvider: NodeProvider | undefined
  readonly _explorerProvider: ExplorerProvider | undefined

  public get nodeProvider(): NodeProvider {
    return this._nodeProvider ?? web3.getCurrentNodeProvider()
  }

  public get explorerProvider(): ExplorerProvider | undefined {
    return this._explorerProvider ?? web3.getCurrentExplorerProvider()
  }

  protected unsafeGetSelectedAccount(): Promise<Account> {
    return Promise.resolve(this.account)
  }

  protected getPublicKey(address: string): Promise<string> {
    if (address !== this.address) {
      throw Error('The signer address is invalid')
    }

    return Promise.resolve(this.publicKey)
  }

  get account(): Account {
    return { keyType: this.keyType, address: this.address, publicKey: this.publicKey, group: this.group }
  }

  constructor({
    privateKey,
    keyType,
    nodeProvider,
    explorerProvider
  }: {
    privateKey: string
    keyType?: KeyType
    nodeProvider?: NodeProvider
    explorerProvider?: ExplorerProvider
  }) {
    super()
    this.keyType = keyType ?? 'default'
    this.privateKey = privateKey
    this.publicKey = publicKeyFromPrivateKey(privateKey, this.keyType)
    this.address = addressFromPublicKey(this.publicKey, this.keyType)
    this.group = groupOfAddress(this.address)
    this._nodeProvider = nodeProvider
    this._explorerProvider = explorerProvider
  }

  static Random(targetGroup?: number, nodeProvider?: NodeProvider, keyType?: KeyType): PrivateKeyWallet {
    const keyPair = ec.genKeyPair()
    const wallet = new PrivateKeyWallet({
      privateKey: keyPair.getPrivate().toString('hex', 64),
      keyType,
      nodeProvider
    })
    if (targetGroup === undefined || wallet.group === targetGroup) {
      return wallet
    } else {
      return PrivateKeyWallet.Random(targetGroup, nodeProvider, keyType)
    }
  }

  static FromMnemonic({
    mnemonic,
    keyType,
    addressIndex,
    passphrase,
    nodeProvider
  }: {
    mnemonic: string
    keyType?: KeyType
    addressIndex?: number
    passphrase?: string
    nodeProvider?: NodeProvider
  }): PrivateKeyWallet {
    const privateKey = deriveHDWalletPrivateKey(mnemonic, keyType ?? 'default', addressIndex ?? 0, passphrase)
    return new PrivateKeyWallet({ privateKey, keyType, nodeProvider })
  }

  static FromMnemonicWithGroup(
    mnemonic: string,
    targetGroup: number,
    keyType?: KeyType,
    fromAddressIndex?: number,
    passphrase?: string,
    nodeProvider?: NodeProvider
  ): PrivateKeyWallet {
    const [privateKey] = deriveHDWalletPrivateKeyForGroup(
      mnemonic,
      targetGroup,
      keyType ?? 'default',
      fromAddressIndex,
      passphrase
    )
    return new PrivateKeyWallet({ privateKey, keyType, nodeProvider })
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async signRaw(signerAddress: string, hexString: string): Promise<string> {
    if (signerAddress !== this.address) {
      throw Error('Unmatched signer address')
    }

    return PrivateKeyWallet.sign(this.privateKey, hexString, this.keyType)
  }

  static sign(privateKey: string, hexString: string, _keyType?: KeyType): string {
    return utils.sign(hexString, privateKey, _keyType)
  }
}
