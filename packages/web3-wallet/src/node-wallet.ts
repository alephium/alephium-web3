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

import { web3, Account, SignerProviderWithMultipleAccounts, NodeProvider } from '@alephium/web3'

export class NodeWallet extends SignerProviderWithMultipleAccounts {
  public walletName: string
  private accounts: Account[] | undefined
  public readonly nodeProvider: NodeProvider

  constructor(walletName: string, nodeProvider?: NodeProvider) {
    super()
    this.walletName = walletName
    this.nodeProvider = nodeProvider ?? web3.getCurrentNodeProvider()
  }

  async getAccounts(): Promise<Account[]> {
    if (typeof this.accounts === 'undefined') {
      this.accounts = await this.getAllAccounts()
    }
    return this.accounts
  }

  async setSelectedAccount(address: string): Promise<void> {
    await this.nodeProvider.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: address })
  }

  async getSelectedAccount(): Promise<Account> {
    const activeAddress = await this.nodeProvider.wallets.getWalletsWalletNameAddresses(this.walletName)
    const accounts = await this.getAccounts()
    const activeAccount = accounts.find((account) => {
      return account.address === activeAddress.activeAddress
    })
    if (activeAccount === undefined) {
      throw Error(`The active account is a new one, please re-initiate your TS node wallet.`)
    }
    return activeAccount
  }

  private async getAllAccounts(): Promise<Account[]> {
    const walletAddresses = await this.nodeProvider.wallets.getWalletsWalletNameAddresses(this.walletName)
    const accounts: Account[] = walletAddresses.addresses.map<Account>((acc) => ({
      publicKey: acc.publicKey,
      address: acc.address,
      group: acc.group
    }))
    return accounts
  }

  async signRaw(signerAddress: string, hexString: string): Promise<string> {
    const provider = this.nodeProvider
    const currentActiveAddressResponse = await provider.wallets.getWalletsWalletNameAddresses(this.walletName)
    const { activeAddress } = currentActiveAddressResponse
    await provider.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: signerAddress })
    const { signature } = await provider.wallets.postWalletsWalletNameSign(this.walletName, { data: hexString })

    await provider.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: activeAddress }) // set the address that's active back to previous state

    return signature
  }

  async unlock(password: string): Promise<void> {
    return await this.nodeProvider.wallets.postWalletsWalletNameUnlock(this.walletName, { password })
  }

  async lock(): Promise<void> {
    return await this.nodeProvider.wallets.postWalletsWalletNameLock(this.walletName)
  }
}
