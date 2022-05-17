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
import { convertHttpResponse } from '../utils'
import { ReadOnlyWallet } from './ReadOnlyWallet'

import { IAccount } from './IAccount'
import { IRecoverableWallet } from './IRecoverableWallet'
import { CliqueClient } from '../clique'

export class NodeWallet extends ReadOnlyWallet implements IRecoverableWallet {
  encryptedSecretJson: string
  private client: CliqueClient
  private walletName: string

  constructor(client: CliqueClient, accounts: IAccount[], walletName: string) {
    const readOnlyAccounts = accounts.map(({ publicKey, p2pkhAddress, group }) => ({
      publicKey,
      p2pkhAddress,
      group
    }))
    super(readOnlyAccounts)
    this.encryptedSecretJson = ''
    this.client = client
    this.walletName = walletName
  }

  async getMnemonic(password: string): Promise<string> {
    const revealMnemonicResponse = await this.client.wallets.postWalletsWalletNameRevealMnemonic(this.walletName, {
      password
    })
    return convertHttpResponse(revealMnemonicResponse).mnemonic
  }

  static async FromCliqueClient(client: CliqueClient, walletName: string): Promise<IRecoverableWallet> {
    const walletAddressesResponse = await client.wallets.getWalletsWalletNameAddresses(walletName)
    const walletAddresses = convertHttpResponse(walletAddressesResponse)
    const accounts: IAccount[] = walletAddresses.addresses.map<IAccount>((acc) => ({
      publicKey: acc.publicKey,
      p2pkhAddress: acc.address,
      group: acc.group
    }))

    return new NodeWallet(client, accounts, walletName)
  }

  async sign(password: string, dataToSign: string, signerAddress: string): Promise<string> {
    await this.client.wallets.postWalletsWalletNameUnlock(this.walletName, { password })
    const currentActiveAddressResponse = await this.client.wallets.getWalletsWalletNameAddresses(this.walletName)
    const { activeAddress } = convertHttpResponse(currentActiveAddressResponse)
    await this.client.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: signerAddress })
    const response = await this.client.wallets.postWalletsWalletNameSign(this.walletName, { data: dataToSign })
    const { signature } = convertHttpResponse(response)

    await this.client.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: activeAddress }) // set the address that's active back to previous state

    return signature
  }
}
