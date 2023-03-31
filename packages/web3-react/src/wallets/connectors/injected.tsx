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
import { WalletProps } from './../wallet'

import { isMobile } from '../../utils'
import Logos from './../../assets/logos'

export const injected = (_walletOptions): WalletProps => {
  const isInstalled = typeof window !== 'undefined'

  const shouldUseWalletConnect = isMobile() && !isInstalled

  return {
    id: 'injected',
    name: 'Extension Wallet',
    shortName: 'browser',
    scannable: false,
    logos: { default: <Logos.AlephiumIcon /> },
    installed: Boolean(!shouldUseWalletConnect ? isInstalled : false)
  }
}
