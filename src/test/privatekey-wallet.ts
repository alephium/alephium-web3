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
import { Account, SignerWithNodeProvider } from '../signer'
import * as utils from '../utils'

const ec = new EC('secp256k1')

export class PrivateKeyWallet extends SignerWithNodeProvider {
  readonly privateKey: string
  readonly publicKey: string
  readonly address: string
  readonly group: number

  constructor(privateKey: string, alwaysSubmitTx = true) {
    super(alwaysSubmitTx)
    this.privateKey = privateKey
    this.publicKey = utils.publicKeyFromPrivateKey(privateKey)
    this.address = utils.addressFromPublicKey(this.publicKey)
    this.group = utils.groupOfAddress(this.address)
  }

  static Random(alwaysSubmitTx = true): PrivateKeyWallet {
    const keyPair = ec.genKeyPair()
    return new PrivateKeyWallet(keyPair.getPrivate().toString('hex'), alwaysSubmitTx)
  }

  async getAccounts(): Promise<Account[]> {
    return [{ address: this.address, publicKey: this.publicKey, group: this.group }]
  }

  async signRaw(signerAddress: string, hexString: string): Promise<string> {
    if (signerAddress !== this.address) {
      throw Error('Unmatched signer address')
    }

    const key = ec.keyFromPrivate(this.privateKey)
    const signature = key.sign(hexString)
    return utils.signatureEncode(signature)
  }
}
