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
import React, { createContext, useContext } from 'react'

import { Account, KeyType, SignerProvider, NetworkId } from '@alephium/web3'
import { Theme, Mode, CustomTheme, ConnectorId } from '../types'
import { node } from '@alephium/web3'
import { Connectors } from '../utils/connector'

type Error = string | React.ReactNode | null

export type ConnectSettingValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  route: string
  setRoute: React.Dispatch<React.SetStateAction<string>>
  errorMessage: Error
  connectorId: ConnectorId
  setConnectorId: React.Dispatch<React.SetStateAction<ConnectorId>>
  displayAccount?: (account: Account) => string
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  mode: Mode
  setMode: React.Dispatch<React.SetStateAction<Mode>>
  customTheme: CustomTheme
  setCustomTheme: React.Dispatch<React.SetStateAction<CustomTheme>>
  csrModeOnly: boolean // whether to show the connect button only in CSR mode
}

export const ConnectSettingContext = createContext<ConnectSettingValue | null>(null)

export const useConnectSettingContext = () => {
  const context = useContext(ConnectSettingContext)
  if (!context) throw Error('ConnectSetting Hook must be inside a Provider.')
  return context
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

export type AlephiumConnectContextValue = {
  addressGroup?: number
  setAddressGroup: (addressGroup: number | undefined) => void
  keyType?: KeyType
  setKeyType: (keyType: KeyType | undefined) => void
  network: NetworkId
  setNetwork: (network: NetworkId) => void
  account?: Account
  setAccount: (account: Account | undefined) => void
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void
  signerProvider?: SignerProvider
  setSignerProvider: (signerProvider: SignerProvider | undefined) => void
  connectors: Connectors
}

export const AlephiumConnectContext = createContext<AlephiumConnectContextValue | null>(null)

// Use hooks `useWallet` and `useWalletConfig` instead
export const useAlephiumConnectContext = () => {
  const context = useContext(AlephiumConnectContext)
  if (!context) throw Error('AlephiumConnect Hook must be inside a Provider.')
  return context
}

export type AlephiumBalanceContextValue = {
  balance?: node.Balance
  updateBalance: () => void
  updateBalanceForTx: (txId: string, confirmations?: number) => void
}

export const AlephiumBalanceContext = createContext<AlephiumBalanceContextValue | null>(null)

// Use hook `useBalance` instead
export const useAlephiumBalanceContext = () => {
  const context = useContext(AlephiumBalanceContext)
  if (!context) throw Error('AlephiumBalance Hook must be inside a Provider.')
  return context
}
