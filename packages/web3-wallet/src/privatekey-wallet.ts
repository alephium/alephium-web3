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
import { Account, ExplorerProvider, NodeProvider, SignerProviderSimple, utils, web3 } from '@alephium/web3'
import { deriveHDWalletPrivateKey, deriveHDWalletPrivateKeyForGroup } from './hd-wallet'

const ec = new EC('secp256k1')

export class PrivateKeyWallet extends SignerProviderSimple {
  readonly privateKey: string
  readonly publicKey: string
  readonly address: string
  readonly group: number
  readonly nodeProvider: NodeProvider
  readonly explorerProvider: ExplorerProvider | undefined

  getSelectedAccount(): Promise<Account> {
    return Promise.resolve(this.account)
  }

  protected getPublicKey(address: string): Promise<string> {
    if (address !== this.address) {
      throw Error('The signer address is invalid')
    }

    return Promise.resolve(this.publicKey)
  }

  get account(): Account {
    return { address: this.address, publicKey: this.publicKey, group: this.group }
  }

  constructor(privateKey: string, nodeProvider?: NodeProvider, explorerProvider?: ExplorerProvider) {
    super()
    this.privateKey = privateKey
    this.publicKey = utils.publicKeyFromPrivateKey(privateKey)
    this.address = utils.addressFromPublicKey(this.publicKey)
    this.group = utils.groupOfAddress(this.address)
    this.nodeProvider = nodeProvider ?? web3.getCurrentNodeProvider()
    this.explorerProvider = explorerProvider ?? web3.getCurrentExplorerProvider()
  }

  static Random(targetGroup?: number, nodeProvider?: NodeProvider): PrivateKeyWallet {
    const keyPair = ec.genKeyPair()
    const wallet = new PrivateKeyWallet(keyPair.getPrivate().toString('hex'), nodeProvider)
    if (targetGroup === undefined || wallet.group === targetGroup) {
      return wallet
    } else {
      return PrivateKeyWallet.Random(targetGroup, nodeProvider)
    }
  }

  static FromMnemonic(
    mnemonic: string,
    addressIndex?: number,
    passphrase?: string,
    nodeProvider?: NodeProvider
  ): PrivateKeyWallet {
    const privateKey = deriveHDWalletPrivateKey(mnemonic, addressIndex ?? 0, passphrase)
    return new PrivateKeyWallet(privateKey, nodeProvider)
  }

  static FromMnemonicWithGroup(
    mnemonic: string,
    targetGroup: number,
    fromAddressIndex?: number,
    passphrase?: string,
    nodeProvider?: NodeProvider
  ): PrivateKeyWallet {
    const [privateKey] = deriveHDWalletPrivateKeyForGroup(mnemonic, targetGroup, fromAddressIndex, passphrase)
    return new PrivateKeyWallet(privateKey, nodeProvider)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async signRaw(signerAddress: string, hexString: string): Promise<string> {
    if (signerAddress !== this.address) {
      throw Error('Unmatched signer address')
    }

    return PrivateKeyWallet.sign(this.privateKey, hexString)
  }

  static sign(privateKey: string, hexString: string): string {
    const key = ec.keyFromPrivate(privateKey)
    const signature = key.sign(hexString)
    return utils.encodeSignature(signature)
  }
}
