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
import React, { createContext, createElement, useEffect, useState } from 'react'

import defaultTheme from '../styles/defaultTheme'

import AlephiumConnectModal from '../components/ConnectModal'
import { ThemeProvider } from 'styled-components'
import { Account, KeyType, SignerProvider } from '@alephium/web3'
import { Theme, Mode, CustomTheme } from '../types'

export const routes = {
  CONNECTORS: 'connectors',
  PROFILE: 'profile',
  CONNECT: 'connect'
}

type Connector = any
type Error = string | React.ReactNode | null

type ContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  route: string
  setRoute: React.Dispatch<React.SetStateAction<string>>
  errorMessage: Error
  connector: Connector
  setConnector: React.Dispatch<React.SetStateAction<Connector>>
  account?: Account
  setAccount: React.Dispatch<React.SetStateAction<Account | undefined>>
  displayAccount?: (account: Account) => string
  signerProvider?: SignerProvider
  setSignerProvider: React.Dispatch<React.SetStateAction<SignerProvider | undefined>>
  addressGroup?: number
  keyType?: KeyType
  network?: string
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  mode: Mode
  setMode: React.Dispatch<React.SetStateAction<Mode>>
  customTheme: CustomTheme
  setCustomTheme: React.Dispatch<React.SetStateAction<CustomTheme>>
}

const Context = createContext<ContextValue | null>(null)

export const useContext = () => {
  const context = React.useContext(Context)
  if (!context) throw Error('AlephiumConnect Hook must be inside a Provider.')
  return context
}

type AlephiumConnectProviderProps = {
  useTheme?: Theme
  useMode?: Mode
  useCustomTheme?: CustomTheme
  network?: string
  addressGroup?: number
  keyType?: KeyType
  children?: React.ReactNode
}

export const AlephiumConnectProvider: React.FC<AlephiumConnectProviderProps> = ({
  useTheme = 'auto',
  useMode = 'auto',
  useCustomTheme,
  network,
  addressGroup,
  keyType,
  children
}) => {
  // Only allow for mounting AlephiumConnectProvider once, so we avoid weird global
  // state collisions.
  if (React.useContext(Context)) {
    throw new Error('Multiple, nested usages of AlephiumConnectProvider detected. Please use only one.')
  }

  const [theme, setTheme] = useState<Theme>(useTheme)
  const [mode, setMode] = useState<Mode>(useMode)
  const [customTheme, setCustomTheme] = useState<CustomTheme>(useCustomTheme ?? {})

  const [open, setOpen] = useState<boolean>(false)
  const [connector, setConnector] = useState<string>('')
  const [route, setRoute] = useState<string>(routes.CONNECTORS)
  const [account, setAccount] = useState<Account>()
  const [errorMessage, setErrorMessage] = useState<Error>('')
  const [signerProvider, setSignerProvider] = useState<SignerProvider | undefined>()

  useEffect(() => setTheme(theme), [theme])
  useEffect(() => setErrorMessage(null), [route, open])

  // Check if chain is supported, elsewise redirect to switches page
  const value = {
    open,
    setOpen,
    route,
    setRoute,
    connector,
    setConnector,
    account,
    setAccount,
    signerProvider,
    setSignerProvider,
    network,
    theme,
    setTheme,
    mode,
    setMode,
    customTheme,
    setCustomTheme,
    addressGroup,
    keyType,
    // Other configuration
    errorMessage
  }

  return createElement(
    Context.Provider,
    { value },
    <>
      <ThemeProvider theme={defaultTheme}>
        {children}
        <AlephiumConnectModal theme={theme} mode={mode} customTheme={customTheme} />
      </ThemeProvider>
    </>
  )
}
