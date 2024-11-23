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
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import defaultTheme from '../styles/defaultTheme'

import AlephiumConnectModal from '../components/ConnectModal'
import { ThemeProvider } from 'styled-components'
import {
  Account,
  KeyType,
  NetworkId,
  NodeProvider,
  SignerProvider,
  SubscribeOptions,
  Subscription,
  isBalanceEqual,
  node,
  subscribeToTxStatus,
  web3
} from '@alephium/web3'
import { Theme, Mode, CustomTheme, ProviderTheme } from '../types'
import { routes } from './Common/Modal'
import {
  AlephiumBalanceContext,
  AlephiumConnectContext,
  ConnectSettingContext,
  ConnectSettingValue,
  ConnectionStatus,
  useAlephiumConnectContext,
  useConnectSettingContext
} from '../contexts/alephiumConnect'
import { getLastConnectedAccount, removeLastConnectedAccount } from '../utils/storage'
import { ConnectResult, getConnectorById } from '../utils/connector'
import { useInjectedProviders } from '../hooks/useInjectedProviders'
import { injectedProviderStore } from '../utils/providers'
import { AlephiumWindowObject } from '@alephium/get-extension-wallet'

export const ConnectSettingProvider: React.FC<{
  theme?: Theme
  mode?: Mode
  customTheme?: CustomTheme
  csrModeOnly?: boolean // whether to show the connect button only in CSR mode
  children?: React.ReactNode
}> = ({ theme = 'auto', mode = 'auto', customTheme, csrModeOnly, children }) => {
  // Only allow for mounting ConnectSettingProvider once, so we avoid weird global
  // state collisions.
  const context = useContext(ConnectSettingContext)
  if (context) {
    throw new Error('Multiple, nested usages of ConnectSettingContext detected. Please use only one.')
  }

  const [_theme, setTheme] = useState<Theme>(theme)
  const [_mode, setMode] = useState<Mode>(mode)
  const [_customTheme, setCustomTheme] = useState<CustomTheme>(customTheme ?? {})

  const [open, setOpen] = useState<boolean>(false)
  const [connectorId, setConnectorId] = useState<ConnectSettingValue['connectorId']>('injected')
  const [route, setRoute] = useState<string>(routes.CONNECTORS)
  const [errorMessage, setErrorMessage] = useState<ConnectSettingValue['errorMessage']>('')

  useEffect(() => setTheme(theme), [theme])
  useEffect(() => setMode(mode), [mode])
  useEffect(() => setCustomTheme(customTheme ?? {}), [customTheme])
  // useEffect(() => setErrorMessage(null), [route, open]) TODO: handle error properly

  // Check if chain is supported, elsewise redirect to switches page
  const value = {
    open,
    setOpen,
    route,
    setRoute,
    connectorId,
    setConnectorId,
    theme: _theme,
    setTheme,
    mode: _mode,
    setMode,
    customTheme: _customTheme,
    setCustomTheme,
    csrModeOnly: csrModeOnly ?? false,
    // Other configuration
    errorMessage
  }

  return <ConnectSettingContext.Provider value={value}>{children}</ConnectSettingContext.Provider>
}

const DefaultThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const context = useConnectSettingContext()
  return (
    <ThemeProvider theme={defaultTheme}>
      {children}
      <AlephiumConnectModal theme={context.theme} mode={context.mode} customTheme={context.customTheme} />
    </ThemeProvider>
  )
}

function tryGetNodeProvider(): NodeProvider | undefined {
  try {
    return web3.getCurrentNodeProvider()
  } catch (_) {
    return undefined
  }
}

export const AlephiumConnectProvider: React.FC<{
  network: NetworkId
  addressGroup?: number
  keyType?: KeyType
  children?: React.ReactNode
}> = ({ network, addressGroup, keyType, children }) => {
  // Only allow for mounting AlephiumConnectProvider once, so we avoid weird global
  // state collisions.
  const context = useContext(AlephiumConnectContext)
  if (context) {
    throw new Error('Multiple, nested usages of AlephiumConnectProvider detected. Please use only one.')
  }

  const [_network, setNetwork] = useState<NetworkId>(network)
  const [_addressGroup, setAddressGroup] = useState<number | undefined>(addressGroup)
  const [_keyType, setKeyType] = useState<KeyType>(keyType ?? 'default')
  const allInjectedProviders = useInjectedProviders()

  useEffect(() => setNetwork(network), [network])
  useEffect(() => setAddressGroup(addressGroup), [addressGroup])
  useEffect(() => setKeyType(keyType ?? 'default'), [keyType])

  const lastConnectedAccount = useMemo(() => {
    const result = getLastConnectedAccount()
    if (result === undefined) {
      return undefined
    }
    if (
      result.network === _network &&
      (_addressGroup === undefined || result.account.group === _addressGroup) &&
      (_keyType === undefined || result.account.keyType === _keyType)
    ) {
      return result
    }
    return undefined
  }, [_network, _addressGroup, _keyType])

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    lastConnectedAccount !== undefined ? 'connecting' : 'disconnected'
  )
  const [account, setAccount] = useState<Account | undefined>(lastConnectedAccount?.account)
  const [signerProvider, setSignerProvider] = useState<SignerProvider | undefined>()

  const updateSignerProvider = useCallback(
    (newSignerProvider: SignerProvider | undefined) => {
      setSignerProvider(newSignerProvider)
      setConnectionStatus(newSignerProvider === undefined ? 'disconnected' : 'connected')
    },
    [setSignerProvider, setConnectionStatus]
  )

  const updateAccount = useCallback(
    (newAccount: Account | undefined) => {
      setAccount((prev) => (prev?.address === newAccount?.address ? prev : newAccount))
    },
    [setAccount]
  )

  useEffect(() => {
    const onDisconnected = () => {
      removeLastConnectedAccount()
      updateAccount(undefined)
      updateSignerProvider(undefined)
    }
    const onConnected = (result: ConnectResult) => {
      updateAccount(result.account)
      updateSignerProvider(result.signerProvider)
    }

    const reconnectByInjected = async (providers: AlephiumWindowObject[], times = 0) => {
      if (times >= 20) {
        onDisconnected()
        return
      }
      const result = await getConnectorById('injected').autoConnect?.({
        network,
        addressGroup,
        keyType,
        onDisconnected,
        onConnected,
        allInjectedProviders: providers
      })
      if (result !== undefined) return
      setTimeout(() => reconnectByInjected(injectedProviderStore.getProviders(), times + 1), 100)
    }

    const func = async () => {
      try {
        const lastConnectorId = lastConnectedAccount?.connectorId
        if (lastConnectorId === undefined) {
          onDisconnected()
          return
        }

        if (lastConnectorId === 'injected') {
          reconnectByInjected(allInjectedProviders)
          return
        }

        const connector = getConnectorById(lastConnectorId)
        if (connector.autoConnect !== undefined) {
          const result = await connector.autoConnect({
            network,
            addressGroup,
            keyType,
            onDisconnected,
            onConnected
          })
          if (result !== undefined) {
            return
          }
        }
      } catch (error) {
        console.error(error)
      }

      onDisconnected()
    }

    func()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    network: _network,
    setNetwork,
    addressGroup: _addressGroup,
    setAddressGroup,
    keyType: _keyType ?? 'default',
    setKeyType,
    account,
    connectionStatus,
    setConnectionStatus,
    setAccount: updateAccount,
    signerProvider,
    setSignerProvider: updateSignerProvider
  }

  return <AlephiumConnectContext.Provider value={value}>{children}</AlephiumConnectContext.Provider>
}

export const AlephiumBalanceProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const context = useContext(AlephiumBalanceContext)
  if (context) {
    throw new Error('Multiple, nested usages of AlephiumBalanceProvider detected. Please use only one.')
  }

  const { account, signerProvider, network } = useAlephiumConnectContext()
  const [balance, setBalance] = useState<node.Balance | undefined>()

  const updateBalance = useCallback(async () => {
    const nodeProvider = tryGetNodeProvider() ?? signerProvider?.nodeProvider
    if (nodeProvider && account) {
      const newBalance = await nodeProvider.addresses.getAddressesAddressBalance(account.address)
      setBalance((prevBalance) => {
        if (prevBalance !== undefined && isBalanceEqual(prevBalance, newBalance)) {
          return prevBalance
        }
        return newBalance
      })
    } else if (account === undefined) {
      setBalance(undefined)
    }
  }, [account, signerProvider])

  const updateBalanceForTx = useCallback(
    (txId: string, confirmations?: number) => {
      if (account === undefined) {
        throw new Error('Wallet is not connected')
      }

      const expectedConfirmations = confirmations ?? 1
      const pollingInterval = network === 'devnet' ? 1000 : 4000
      const messageCallback = async (txStatus: node.TxStatus): Promise<void> => {
        if (txStatus.type === 'Confirmed' && (txStatus as node.Confirmed).chainConfirmations >= expectedConfirmations) {
          await updateBalance()
        }
      }
      const errorCallback = (err: any, subscription: Subscription<node.TxStatus>): Promise<void> => {
        subscription.unsubscribe()
        console.error(`tx status subscription error: ${err}`)
        return Promise.resolve()
      }
      const options: SubscribeOptions<node.TxStatus> = {
        pollingInterval,
        messageCallback,
        errorCallback
      }
      subscribeToTxStatus(options, txId, undefined, undefined, expectedConfirmations)
    },
    [updateBalance, account, network]
  )

  useEffect(() => {
    if (account === undefined) {
      setBalance(undefined)
    }
  }, [account])

  const value = {
    balance,
    updateBalance,
    updateBalanceForTx
  }

  return <AlephiumBalanceContext.Provider value={value}>{children}</AlephiumBalanceContext.Provider>
}

type AlephiumWalletProviderProps = {
  theme?: ProviderTheme
  customTheme?: CustomTheme
  network: NetworkId
  addressGroup?: number
  keyType?: KeyType
  csrModeOnly?: boolean // whether to show the connect button only in CSR mode
  children?: React.ReactNode
}

export const AlephiumWalletProvider = ({
  theme,
  customTheme,
  network,
  addressGroup,
  keyType,
  csrModeOnly,
  children
}: AlephiumWalletProviderProps) => {
  return (
    <AlephiumConnectProvider network={network} addressGroup={addressGroup} keyType={keyType}>
      <ConnectSettingProvider
        theme={theme === 'simple-light' || theme === 'simple-dark' ? 'auto' : theme}
        mode={theme === 'simple-light' ? 'light' : theme === 'simple-dark' ? 'dark' : 'auto'}
        customTheme={customTheme}
        csrModeOnly={csrModeOnly}
      >
        <DefaultThemeProvider>
          <AlephiumBalanceProvider>{children}</AlephiumBalanceProvider>
        </DefaultThemeProvider>
      </ConnectSettingProvider>
    </AlephiumConnectProvider>
  )
}
