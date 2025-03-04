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
import { ReactNode } from 'react'

export type ProviderTheme =
  | 'simple-light'
  | 'simple-dark'
  | 'web95'
  | 'retro'
  | 'soft'
  | 'midnight'
  | 'minimal'
  | 'rounded'
  | 'nouns'

export type Theme = Exclude<ProviderTheme, 'simple-light' | 'simple-dark'> | 'auto'
export type Mode = 'light' | 'dark' | 'auto'
export type CustomTheme = any // TODO: define type
export const connectorIds = ['injected', 'walletConnect', 'desktopWallet'] as const
export type ConnectorId = (typeof connectorIds)[number]
export type InjectedProviderId = string

export type CustomStyle = {
  theme?: Theme
  mode?: Mode
  customTheme?: CustomTheme
}

export type Connector = {
  id: ConnectorId
  name?: string
  shortName?: string
  logos: {
    default: ReactNode
    transparent?: ReactNode
    connectorButton?: ReactNode
    qrCode?: ReactNode
    appIcon?: ReactNode
    mobile?: ReactNode
  }
  logoBackground?: string
  scannable?: boolean
  extensions?: { [key: string]: string }
  appUrls?: { [key: string]: string }
  extensionIsInstalled?: () => boolean
  defaultConnect?: () => void
}
