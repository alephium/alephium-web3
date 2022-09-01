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

import { Account, SignerWithNodeProvider } from '../signer'

export class NodeWallet extends SignerWithNodeProvider {
  public walletName: string
  public accounts: Account[] | undefined

  constructor(walletName: string, alwaysSubmitTx = true) {
    super(alwaysSubmitTx)
    this.walletName = walletName
  }

  async getAccounts(): Promise<Account[]> {
    if (typeof this.accounts === 'undefined') {
      this.accounts = await this.getAllAccounts()
    }
    return this.accounts
  }

  private async getAllAccounts(): Promise<Account[]> {
    const walletAddresses = await this.provider.wallets.getWalletsWalletNameAddresses(this.walletName)
    const accounts: Account[] = walletAddresses.addresses.map<Account>((acc) => ({
      publicKey: acc.publicKey,
      address: acc.address,
      group: acc.group
    }))
    return accounts
  }

  async signRaw(signerAddress: string, hexString: string): Promise<string> {
    const currentActiveAddressResponse = await this.provider.wallets.getWalletsWalletNameAddresses(this.walletName)
    const { activeAddress } = currentActiveAddressResponse
    await this.provider.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: signerAddress })
    const { signature } = await this.provider.wallets.postWalletsWalletNameSign(this.walletName, { data: hexString })

    await this.provider.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: activeAddress }) // set the address that's active back to previous state

    return signature
  }

  async unlock(password: string): Promise<void> {
    return await this.provider.wallets.postWalletsWalletNameUnlock(this.walletName, { password })
  }

  async lock(): Promise<void> {
    return await this.provider.wallets.postWalletsWalletNameLock(this.walletName)
  }
}
