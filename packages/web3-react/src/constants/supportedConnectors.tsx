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
import { Connector } from '../types'
import Logos from './../assets/logos'

let supportedConnectors: Connector[] = []

if (typeof window != 'undefined') {
  supportedConnectors = [
    {
      id: 'injected',
      name: 'Extension Wallet',
      shortName: 'Browser',
      logos: {
        default: <Logos.AlephiumIcon />,
        mobile: (
          <div
            style={{
              padding: 5,
              background: 'var(--ck-body-background-tertiary)',
              borderRadius: '27%',
              boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div
              style={{
                transform: 'scale(0.75)',
                position: 'relative',
                width: '100%'
              }}
            >
              <Logos.AlephiumIcon />
            </div>
          </div>
        ),
        transparent: <Logos.AlephiumIcon />
      },
      scannable: false,
      extensionIsInstalled: () => {
        return Boolean(window['alephiumProviders'])
      }
    },
    {
      id: 'walletConnect',
      name: 'WalletConnect',
      shortName: 'WalletConnect',
      logos: {
        default: <Logos.WalletConnect />,
        mobile: (
          <div
            style={{
              padding: 5,
              background: 'var(--ck-body-background-secondary)',
              borderRadius: '21%',
              boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.02)'
            }}
          >
            <Logos.WalletConnect />
          </div>
        ),
        transparent: <Logos.WalletConnect background={false} />,
        connectorButton: <Logos.WalletConnect />,
        qrCode: <Logos.WalletConnect background={true} />
      },
      logoBackground: 'var(--ck-brand-walletConnect)',
      scannable: true
    }
  ]
}

export default supportedConnectors
