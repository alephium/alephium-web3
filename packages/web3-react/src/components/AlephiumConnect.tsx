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
import React, { useCallback, useContext, useEffect, useState } from 'react'

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
import { Theme, Mode, CustomTheme } from '../types'
import { routes } from './Common/Modal'
import {
  AlephiumBalanceContext,
  AlephiumConnectContext,
  ConnectSettingContext,
  ConnectSettingValue,
  useAlephiumConnectContext
} from '../contexts/alephiumConnect'

type ConnectSettingProviderProps = {
  useTheme?: Theme
  useMode?: Mode
  useCustomTheme?: CustomTheme
  network: NetworkId
  addressGroup?: number
  keyType?: KeyType
  children?: React.ReactNode
}

export const ConnectSettingProvider: React.FC<ConnectSettingProviderProps> = ({
  useTheme = 'auto',
  useMode = 'auto',
  useCustomTheme,
  network,
  addressGroup,
  keyType,
  children
}) => {
  // Only allow for mounting ConnectSettingProvider once, so we avoid weird global
  // state collisions.
  const context = useContext(ConnectSettingContext)
  if (context) {
    throw new Error('Multiple, nested usages of ConnectSettingContext detected. Please use only one.')
  }

  const [theme, setTheme] = useState<Theme>(useTheme)
  const [mode, setMode] = useState<Mode>(useMode)
  const [customTheme, setCustomTheme] = useState<CustomTheme>(useCustomTheme ?? {})

  const [open, setOpen] = useState<boolean>(false)
  const [connectorId, setConnectorId] = useState<ConnectSettingValue['connectorId']>('injected')
  const [route, setRoute] = useState<string>(routes.CONNECTORS)
  const [errorMessage, setErrorMessage] = useState<ConnectSettingValue['errorMessage']>('')

  useEffect(() => setTheme(theme), [theme])
  // useEffect(() => setErrorMessage(null), [route, open]) TODO: handle error properly

  // Check if chain is supported, elsewise redirect to switches page
  const value = {
    open,
    setOpen,
    route,
    setRoute,
    connectorId,
    setConnectorId,
    network,
    theme,
    setTheme,
    mode,
    setMode,
    customTheme,
    setCustomTheme,
    addressGroup,
    keyType: keyType ?? 'default',
    // Other configuration
    errorMessage
  }

  return (
    <ConnectSettingContext.Provider value={value}>
      <ThemeProvider theme={defaultTheme}>
        {children}
        <AlephiumConnectModal theme={theme} mode={mode} customTheme={customTheme} />
      </ThemeProvider>
    </ConnectSettingContext.Provider>
  )
}

function tryGetNodeProvider(): NodeProvider | undefined {
  try {
    return web3.getCurrentNodeProvider()
  } catch (_) {
    return undefined
  }
}

export const AlephiumConnectProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // Only allow for mounting AlephiumConnectProvider once, so we avoid weird global
  // state collisions.
  const context = useContext(AlephiumConnectContext)
  if (context) {
    throw new Error('Multiple, nested usages of AlephiumConnectProvider detected. Please use only one.')
  }

  const [account, setAccount] = useState<Account & { network: NetworkId }>()
  const [signerProvider, setSignerProvider] = useState<SignerProvider | undefined>()

  const value = {
    account,
    setAccount,
    signerProvider,
    setSignerProvider
  }

  return <AlephiumConnectContext.Provider value={value}>{children}</AlephiumConnectContext.Provider>
}

export const AlephiumBalanceProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const context = useContext(AlephiumBalanceContext)
  if (context) {
    throw new Error('Multiple, nested usages of AlephiumBalanceProvider detected. Please use only one.')
  }

  const connectContext = useAlephiumConnectContext()
  const [balance, setBalance] = useState<node.Balance | undefined>()

  const updateBalance = useCallback(async () => {
    const nodeProvider = tryGetNodeProvider() ?? connectContext.signerProvider?.nodeProvider
    if (nodeProvider && connectContext.account) {
      const newBalance = await nodeProvider.addresses.getAddressesAddressBalance(connectContext.account.address)
      setBalance((prevBalance) => {
        if (prevBalance !== undefined && isBalanceEqual(prevBalance, newBalance)) {
          return prevBalance
        }
        return newBalance
      })
    } else if (connectContext.account === undefined) {
      setBalance(undefined)
    }
  }, [connectContext.account, connectContext.signerProvider])

  const updateBalanceForTx = useCallback(
    (txId: string, confirmations?: number) => {
      const expectedConfirmations = confirmations ?? 1
      const pollingInterval = connectContext.account?.network === 'devnet' ? 1000 : 4000
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
    [updateBalance, connectContext.account?.network]
  )

  /*
    No update by default, only when useBalance is called
  */
  // useEffect(() => {
  //   if (balance === undefined) {
  //     updateBalance()
  //   } else if (connectContext.account === undefined) {
  //     setBalance(undefined)
  //   }
  // }, [updateBalance, balance, connectContext.account])

  const value = {
    balance,
    updateBalance,
    updateBalanceForTx
  }

  return <AlephiumBalanceContext.Provider value={value}>{children}</AlephiumBalanceContext.Provider>
}

export const AlephiumWalletProvider = ({
  useTheme,
  useMode,
  useCustomTheme,
  network,
  addressGroup,
  keyType,
  children
}: ConnectSettingProviderProps) => {
  return (
    <ConnectSettingProvider
      useTheme={useTheme}
      useMode={useMode}
      useCustomTheme={useCustomTheme}
      network={network}
      addressGroup={addressGroup}
      keyType={keyType}
    >
      <AlephiumConnectProvider>
        <AlephiumBalanceProvider>
          {children}
        </AlephiumBalanceProvider>
      </AlephiumConnectProvider>
    </ConnectSettingProvider>
  )
}
