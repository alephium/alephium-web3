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

import { web3, Account, SignerWithNodeProvider } from '@alephium/web3'

export class NodeWallet extends SignerWithNodeProvider {
  public walletName: string
  private accounts: Account[] | undefined

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

  async setActiveAccount(addressIndex: number): Promise<void>
  async setActiveAccount(address: string): Promise<void>
  async setActiveAccount(input: string | number): Promise<void> {
    let address: string
    if (typeof input === 'string') {
      address = input
    } else {
      const accounts = await this.getAccounts()
      address = accounts[`${input}`].address
    }
    await web3
      .getCurrentNodeProvider()
      .wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: address })
  }

  async getActiveAccount(): Promise<Account> {
    const activeAddress = await web3.getCurrentNodeProvider().wallets.getWalletsWalletNameAddresses(this.walletName)
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
    const walletAddresses = await web3.getCurrentNodeProvider().wallets.getWalletsWalletNameAddresses(this.walletName)
    const accounts: Account[] = walletAddresses.addresses.map<Account>((acc) => ({
      publicKey: acc.publicKey,
      address: acc.address,
      group: acc.group
    }))
    return accounts
  }

  async signRaw(signerAddress: string, hexString: string): Promise<string> {
    const provider = web3.getCurrentNodeProvider()
    const currentActiveAddressResponse = await provider.wallets.getWalletsWalletNameAddresses(this.walletName)
    const { activeAddress } = currentActiveAddressResponse
    await provider.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: signerAddress })
    const { signature } = await provider.wallets.postWalletsWalletNameSign(this.walletName, { data: hexString })

    await provider.wallets.postWalletsWalletNameChangeActiveAddress(this.walletName, { address: activeAddress }) // set the address that's active back to previous state

    return signature
  }

  async unlock(password: string): Promise<void> {
    return await web3.getCurrentNodeProvider().wallets.postWalletsWalletNameUnlock(this.walletName, { password })
  }

  async lock(): Promise<void> {
    return await web3.getCurrentNodeProvider().wallets.postWalletsWalletNameLock(this.walletName)
  }
}
