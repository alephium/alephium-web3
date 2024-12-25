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
import { WalletConnectProvider, SignClientOptions } from '@alephium/walletconnect-provider'
import QRCodeModal from '@alephium/walletconnect-qrcode-modal'
import { AlephiumWindowObject, getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { setLastConnectedAccount } from './storage'
import { ConnectorId, InjectedProviderId } from '../types'
import { getInjectedProvider } from './injectedProviders'

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

export type InjectedConnectOptions = ConnectOptions & {
  injectedProviderId?: InjectedProviderId
}

export type Connector = {
  connect: (opts: InjectedConnectOptions | ConnectOptions) => Promise<Account | undefined>
  disconnect: (signerProvider: SignerProvider) => Promise<void>
  autoConnect?: (opts: ConnectOptions) => Promise<Account | undefined>
}

export type Connectors = {
  injected: Connector
  walletConnect: Connector
  desktopWallet: Connector
}

export function createWalletConnectConnector(signClientOptions?: SignClientOptions): Connector {
  const connectorId: ConnectorId = 'walletConnect'
  return {
    connect: async (options: ConnectOptions): Promise<Account | undefined> => {
      const result = await _wcConnect(
        (uri) => QRCodeModal.open(uri, () => console.log('qr closed')),
        { ...options, signClientOptions },
        connectorId
      )
      QRCodeModal.close()
      return result
    },
    disconnect: wcDisconnect,
    autoConnect: async (options: ConnectOptions): Promise<Account | undefined> => {
      return await wcAutoConnect({ ...options, signClientOptions }, connectorId)
    }
  }
}

export function createDesktopWalletConnector(signClientOptions?: SignClientOptions): Connector {
  const connectorId: ConnectorId = 'desktopWallet'
  return {
    connect: async (options: ConnectOptions): Promise<Account | undefined> => {
      return await _wcConnect(
        (uri) => window.open(`alephium://wc?uri=${uri}`),
        { ...options, signClientOptions },
        connectorId
      )
    },
    disconnect: wcDisconnect,
    autoConnect: async (options: ConnectOptions): Promise<Account | undefined> => {
      return await wcAutoConnect({ ...options, signClientOptions }, connectorId)
    }
  }
}

export function createInjectedConnector(providers: AlephiumWindowObject[]): Connector {
  return {
    connect: async (options: InjectedConnectOptions): Promise<Account | undefined> => {
      try {
        const windowAlephium = await getInjectedProvider(providers, options.injectedProviderId)
        const enableOptions = {
          addressGroup: options.addressGroup,
          keyType: options.keyType,
          networkId: options.network,
          onDisconnected: options.onDisconnected
        }
        const enabledAccount = await windowAlephium?.enable(enableOptions)

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
    },
    disconnect: async (signerProvider: SignerProvider): Promise<void> => {
      return await (signerProvider as AlephiumWindowObject).disconnect()
    },
    autoConnect: async (options: ConnectOptions): Promise<Account | undefined> => {
      try {
        const allProviders = [...providers]
        if (allProviders.length === 0) {
          const windowAlephium = await getDefaultAlephiumWallet()
          if (windowAlephium !== undefined) {
            allProviders.push(windowAlephium)
          }
        }
        const enableOptions = {
          addressGroup: options.addressGroup,
          keyType: options.keyType,
          networkId: options.network,
          onDisconnected: undefined as any
        }
        for (const provider of allProviders) {
          const enabledAccount = await provider.enableIfConnected(enableOptions as any)
          if (enabledAccount) {
            await options.onConnected({ account: enabledAccount, signerProvider: provider })
            setLastConnectedAccount('injected', enabledAccount, options.network)
            // eslint-disable-next-line
            ;(provider as any)['onDisconnected'] = options.onDisconnected
            return enabledAccount
          }
        }
        return undefined
      } catch (error) {
        console.error(`Wallet auto-connect error:`, error)
        options.onDisconnected()
      }
      return undefined
    }
  }
}

export function createDefaultConnectors(injectedProviders: AlephiumWindowObject[]): Connectors {
  return {
    injected: createInjectedConnector(injectedProviders),
    walletConnect: createWalletConnectConnector(undefined),
    desktopWallet: createDesktopWalletConnector(undefined)
  }
}

// TODO: handle error properly
async function _wcConnect(
  onDisplayUri: (uri: string) => void,
  options: ConnectOptions & { signClientOptions?: SignClientOptions },
  connectorId: 'walletConnect' | 'desktopWallet'
) {
  const wcProvider = await WalletConnectProvider.init({
    projectId: WALLET_CONNECT_PROJECT_ID,
    networkId: options.network,
    addressGroup: options.addressGroup,
    onDisconnected: options.onDisconnected,
    ...options.signClientOptions
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

const wcAutoConnect = async (
  options: ConnectOptions & { signClientOptions?: SignClientOptions },
  connectorId: 'walletConnect' | 'desktopWallet'
): Promise<Account | undefined> => {
  try {
    const wcProvider = await WalletConnectProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      networkId: options.network,
      addressGroup: options.addressGroup,
      onDisconnected: options.onDisconnected,
      ...options.signClientOptions
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

const wcDisconnect = async (signerProvider: SignerProvider): Promise<void> => {
  await (signerProvider as WalletConnectProvider).disconnect()
}
