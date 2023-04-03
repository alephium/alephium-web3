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
import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { useEffect } from 'react'
import { useAlephiumConnectContext } from '../contexts/alephiumConnect'
import { KeyType } from '@alephium/web3'

export function useAccount(onDisconnected?: () => Promise<void>) {
  const context = useAlephiumConnectContext()

  useEffect(() => {
    const handler = async () => {
      if (context.connectorId === 'walletConnect') {
        return
      }

      const windowAlephium = await getDefaultAlephiumWallet()
      const keyType: KeyType = context.keyType ?? 'default'
      const connectedAccount = windowAlephium?.connectedAccount
      if (
        onDisconnected === undefined &&
        connectedAccount !== undefined &&
        connectedAccount.group === context.addressGroup &&
        connectedAccount.keyType === keyType &&
        windowAlephium?.connectedNetworkId === context.network
      ) {
        return
      }

      const enabledAccount = await windowAlephium?.enableIfConnected({
        onDisconnected: onDisconnected ?? (() => Promise.resolve()),
        networkId: context.network,
        chainGroup: context.addressGroup,
        keyType: context.keyType
      })

      windowAlephium && context.setSignerProvider(windowAlephium)
      enabledAccount && context.setAccount(enabledAccount)
    }

    handler()
  }, [onDisconnected])

  return { account: context.account, isConnected: !!context.account }
}
