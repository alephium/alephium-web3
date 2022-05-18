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

import { CliqueClient } from '../clique'
import { Account, SignerWithNodeProvider } from '../signer'

export class NodeWallet extends SignerWithNodeProvider {
  public walletName: string
  public accounts: Account[] | undefined

  constructor(client: CliqueClient, walletName: string, alwaysSubmitTx = true) {
    super(client, alwaysSubmitTx)
    this.walletName = walletName
  }

  async getAccounts(): Promise<Account[]> {
    if (typeof this.accounts === 'undefined') {
      this.accounts = await this.getAllAccounts()
    }
    return this.accounts
  }

  private async getAllAccounts(): Promise<Account[]> {
    const walletAddressesResponse = await this.client.wallets.getWalletsWalletNameAddresses(this.walletName)
    const walletAddresses = convertHttpResponse(walletAddressesResponse)
    const accounts: Account[] = walletAddresses.addresses.map<Account>((acc) => ({
      publicKey: acc.publicKey,
      address: acc.address,
      group: acc.group
    }))
    return accounts
  }

  static async FromCliqueClient(client: CliqueClient, walletName: string, alwaysSubmitTx = true): Promise<NodeWallet> {
    return new NodeWallet(client, walletName, alwaysSubmitTx)
  }

  async signRaw(signerAddress: string, hexString: string): Promise<string> {
    const currentActiveAddressResponse = await this.client.wallets.getWalletsWalletNameAddresses(this.walletName)
    const { activeAddress } = convertHttpResponse(currentActiveAddressResponse)
    await this.client.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: signerAddress })
    const response = await this.client.wallets.postWalletsWalletNameSign(this.walletName, { data: hexString })
    const { signature } = convertHttpResponse(response)

    await this.client.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: activeAddress }) // set the address that's active back to previous state

    return signature
  }

  async unlock(password: string): Promise<void> {
    return convertHttpResponse(await this.client.wallets.postWalletsWalletNameUnlock(this.walletName, { password }))
  }

  async lock(): Promise<void> {
    return convertHttpResponse(await this.client.wallets.postWalletsWalletNameLock(this.walletName))
  }
}
