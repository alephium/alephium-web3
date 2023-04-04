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

type Error = string | React.ReactNode | null

export type AlephiumConnectContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  route: string
  setRoute: React.Dispatch<React.SetStateAction<string>>
  errorMessage: Error
  connectorId: ConnectorId
  setConnectorId: React.Dispatch<React.SetStateAction<ConnectorId>>
  account?: Account
  setAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
  displayAccount?: (account: Account) => string
  signerProvider?: SignerProvider
  setSignerProvider: React.Dispatch<React.SetStateAction<SignerProvider | undefined>>
  addressGroup?: number
  keyType?: KeyType
  network?: NetworkId
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  mode: Mode
  setMode: React.Dispatch<React.SetStateAction<Mode>>
  customTheme: CustomTheme
  setCustomTheme: React.Dispatch<React.SetStateAction<CustomTheme>>
}

export const AlephiumConnectContext = createContext<AlephiumConnectContextValue | null>(null)

export const useAlephiumConnectContext = () => {
  const context = useContext(AlephiumConnectContext)
  if (!context) throw Error('AlephiumConnect Hook must be inside a Provider.')
  return context
}
