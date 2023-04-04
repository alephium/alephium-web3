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
import React from 'react'
import { useAlephiumConnectContext } from '../../../contexts/alephiumConnect'
import supportedConnectors from '../../../constants/supportedConnectors'

import { PageContent } from '../../Common/Modal/styles'

import {
  ConnectorsContainer,
  ConnectorButton,
  ConnectorLabel,
  ConnectorIcon,
  MobileConnectorsContainer,
  MobileConnectorButton,
  MobileConnectorLabel,
  MobileConnectorIcon
} from './styles'

import { isMobile } from '../../../utils'
import useDefaultWallets from '../../../wallets/useDefaultWallets'
import { WalletProps } from '../../../wallets/wallet'
import { routes } from '../../Common/Modal'

const Connectors: React.FC = () => {
  const context = useAlephiumConnectContext()
  const mobile = isMobile()
  const wallets = useDefaultWallets()

  return (
    <PageContent style={{ width: 312 }}>
      {mobile ? (
        <>
          <MobileConnectorsContainer>
            {supportedConnectors.map((connector) => {
              const info = supportedConnectors.filter((c) => c.id === connector.id)[0]
              if (!info) return null

              let logos = info.logos
              let name = info.shortName ?? info.name ?? connector.name

              if (info.id === 'injected' && connector.name) {
                const foundInjector = findInjectedConnectorInfo(connector.name, wallets)
                if (foundInjector) {
                  logos = foundInjector.logos
                  name = foundInjector.name.replace(' Wallet', '')
                }
              }

              if (info.id === 'walletConnect') {
                name = 'Wallet Connect'
              }

              return (
                <MobileConnectorButton
                  key={`m-${connector.id}`}
                  //disabled={!connector.ready}
                  onClick={() => {
                    context.setRoute(routes.CONNECT)
                    context.setConnectorId(connector.id)
                  }}
                >
                  <MobileConnectorIcon>
                    {logos.mobile ?? logos.appIcon ?? logos.connectorButton ?? logos.default}
                  </MobileConnectorIcon>
                  <MobileConnectorLabel>{name}</MobileConnectorLabel>
                </MobileConnectorButton>
              )
            })}
          </MobileConnectorsContainer>
        </>
      ) : (
        <>
          <ConnectorsContainer>
            {supportedConnectors.map((connector) => {
              const info = supportedConnectors.filter((c) => c.id === connector.id)[0]
              if (!info) return null

              let logos = info.logos
              let name = info.name ?? connector.name
              if (info.id === 'walletConnect') {
                name = 'WalletConnect'
              }

              if (info.id === 'injected' && connector.name) {
                const foundInjector = findInjectedConnectorInfo(connector.name, wallets)
                if (foundInjector) {
                  logos = foundInjector.logos
                  name = foundInjector.name
                }
              }

              let logo = logos.connectorButton ?? logos.default
              if (info.extensionIsInstalled && logos.appIcon) {
                if (info.extensionIsInstalled()) {
                  logo = logos.appIcon
                }
              }

              return (
                <ConnectorButton
                  key={connector.id}
                  disabled={context.route !== routes.CONNECTORS}
                  onClick={() => {
                    //connect()
                    context.setRoute(routes.CONNECT)
                    context.setConnectorId(connector.id)
                  }}
                >
                  <ConnectorIcon>{logo}</ConnectorIcon>
                  <ConnectorLabel>{name}</ConnectorLabel>
                </ConnectorButton>
              )
            })}
          </ConnectorsContainer>
        </>
      )}
    </PageContent>
  )
}

export default Connectors

const findInjectedConnectorInfo = (name: string, wallets: WalletProps[]) => {
  let walletList = name.split(/[(),]+/)
  walletList.shift() // remove "Injected" from array
  walletList = walletList.map((x) => x.trim())

  const hasWalletLogo = walletList.filter((x) => {
    const a = wallets.map((wallet) => wallet.name).includes(x)
    if (a) return x
    return null
  })
  if (hasWalletLogo.length === 0) return null

  const foundInjector = wallets.filter((wallet) => wallet.installed && wallet.name === hasWalletLogo[0])[0]

  return foundInjector
}
