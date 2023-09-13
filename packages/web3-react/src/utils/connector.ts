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

import { Account, NetworkId, SignerProvider, KeyType } from '@alephium/web3'
import { WalletConnectProvider } from '@alephium/walletconnect-provider'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { AlephiumWindowObject, getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { getLastConnectedAccount, setLastConnectedAccount } from './storage'
import { ConnectorId } from '../types'

const WALLET_CONNECT_PROJECT_ID = '6e2562e43678dd68a9070a62b6d52207'

export type ConnectResult = {
  account: Account
  signerProvider: SignerProvider
}

export type ConnectOptions = {
  network: NetworkId
  addressGroup?: number
  keyType?: KeyType
  onDisconnected: () => Promise<void> | void
  onConnected: (result: ConnectResult) => Promise<void> | void
}

export type ConnectFunc = (options: ConnectOptions) => Promise<Account | undefined>

export type Connector = {
  connect: ConnectFunc
  disconnect: (signerProvider: SignerProvider) => Promise<void>
  autoConnect?: ConnectFunc
}

// TODO: handle error properly
async function _wcConnect(onDisplayUri: (uri: string) => void, options: ConnectOptions, connectorId: ConnectorId) {
  const wcProvider = await WalletConnectProvider.init({
    projectId: WALLET_CONNECT_PROJECT_ID,
    networkId: options.network,
    addressGroup: options.addressGroup,
    onDisconnected: options.onDisconnected
  })

  wcProvider.on('displayUri', onDisplayUri)
  wcProvider.on('session_delete', options.onDisconnected)

  try {
    await wcProvider.connect()

    if (wcProvider.account) {
      await options.onConnected({ account: wcProvider.account, signerProvider: wcProvider })
      setLastConnectedAccount(connectorId, wcProvider.account, options.network)
      return wcProvider.account
    }
  } catch (e) {
    console.error(`Wallet connect error:`, e)
    options.onDisconnected()
  }
  return undefined
}

const wcAutoConnect = async (options: ConnectOptions, connectorId: ConnectorId): Promise<Account | undefined> => {
  try {
    const wcProvider = await WalletConnectProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      networkId: options.network,
      addressGroup: options.addressGroup,
      onDisconnected: options.onDisconnected
    })
    wcProvider.on('session_delete', options.onDisconnected)

    const isPreauthorized = wcProvider.isPreauthorized()
    if (!isPreauthorized) {
      return undefined
    }
    await wcProvider.connect()
    if (wcProvider.account) {
      await options.onConnected({ account: wcProvider.account, signerProvider: wcProvider })
      setLastConnectedAccount(connectorId, wcProvider.account, options.network)
      return wcProvider.account
    }
  } catch (e) {
    console.error(`Wallet connect auto-connect error: ${e}`)
    options.onDisconnected()
  }
  return undefined
}

const wcConnect = async (options: ConnectOptions): Promise<Account | undefined> => {
  const result = await _wcConnect(
    (uri) => QRCodeModal.open(uri, () => console.log('qr closed')),
    options,
    'walletConnect'
  )
  QRCodeModal.close()
  return result
}

const desktopWalletConnect = async (options: ConnectOptions): Promise<Account | undefined> => {
  return await _wcConnect((uri) => window.open(`alephium://wc?uri=${uri}`), options, 'desktopWallet')
}

const wcDisconnect = async (signerProvider: SignerProvider): Promise<void> => {
  await (signerProvider as WalletConnectProvider).disconnect()
}

const injectedConnect = async (options: ConnectOptions): Promise<Account | undefined> => {
  try {
    const windowAlephium = await getDefaultAlephiumWallet()
    const enabledAccount = await windowAlephium?.enable({ ...options, networkId: options.network })

    if (windowAlephium && enabledAccount) {
      await options.onConnected({ account: enabledAccount, signerProvider: windowAlephium })
      setLastConnectedAccount('injected', enabledAccount, options.network)
      return enabledAccount
    }
  } catch (error) {
    console.error(`Wallet connect error:`, error)
    options.onDisconnected()
  }
  return undefined
}

const injectedDisconnect = async (signerProvider: SignerProvider): Promise<void> => {
  return await (signerProvider as AlephiumWindowObject).disconnect()
}

const injectedAutoConnect = async (options: ConnectOptions): Promise<Account | undefined> => {
  try {
    const windowAlephium = await getDefaultAlephiumWallet()
    const enabledAccount = await windowAlephium?.enableIfConnected({ ...options, networkId: options.network })

    if (windowAlephium && enabledAccount) {
      await options.onConnected({ account: enabledAccount, signerProvider: windowAlephium })
      setLastConnectedAccount('injected', enabledAccount, options.network)
    }

    return enabledAccount
  } catch (error) {
    console.error(`Wallet auto-connect error:`, error)
    options.onDisconnected()
  }
  return undefined
}

const connectors: Record<ConnectorId, Connector> = {
  injected: {
    connect: injectedConnect,
    disconnect: injectedDisconnect,
    autoConnect: injectedAutoConnect
  },
  walletConnect: {
    connect: wcConnect,
    disconnect: wcDisconnect,
    autoConnect: (options) => wcAutoConnect(options, 'walletConnect')
  },
  desktopWallet: {
    connect: desktopWalletConnect,
    disconnect: wcDisconnect,
    autoConnect: (options) => wcAutoConnect(options, 'desktopWallet')
  }
}

export function getConnectorById(connectorId: ConnectorId) {
  return connectors[`${connectorId}`]
}
