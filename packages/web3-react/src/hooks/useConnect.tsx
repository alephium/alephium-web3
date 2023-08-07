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
import type { EnableOptionsBase } from '@alephium/web3'
import { useAlephiumConnectContext } from '../contexts/alephiumConnect'
import { useCallback, useMemo } from 'react'
import { WalletConnectProvider } from '@alephium/walletconnect-provider'
import QRCodeModal from '@walletconnect/qrcode-modal'

const WALLET_CONNECT_PROJECT_ID = '6e2562e43678dd68a9070a62b6d52207'

export type ConnectOptions = Omit<EnableOptionsBase, 'onDisconnected'>

export function useConnect(options: ConnectOptions) {
  const context = useAlephiumConnectContext()

  const wcDisconnect = useCallback(async () => {
    if (
      (context.connectorId === 'walletConnect' || context.connectorId === 'desktopWallet') &&
      context.signerProvider
    ) {
      await (context.signerProvider as WalletConnectProvider).disconnect()
      context.setSignerProvider(undefined)
      context.setAccount(undefined)
    }
  }, [context])

  const wcConnect = useCallback(async () => {
    if (context.network === undefined) {
      throw new Error('No network id specified')
    }
    const wcProvider = await WalletConnectProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      networkId: context.network,
      addressGroup: options.addressGroup,
      onDisconnected: wcDisconnect
    })

    wcProvider.on('displayUri', (uri) => {
      context.setOpen(false)
      QRCodeModal.open(uri, () => console.log('qr closed'))
    })

    try {
      await wcProvider.connect()

      context.setAccount(wcProvider.account)
      context.setSignerProvider(wcProvider as any)
    } catch (e) {
      console.log('wallet connect error')
      console.error(e)
    }

    QRCodeModal.close()
  }, [context, wcDisconnect])

  const desktopWalletConnect = useCallback(async () => {
    if (context.network === undefined) {
      throw new Error('No network id specified')
    }

    const wcProvider = await WalletConnectProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      networkId: context.network,
      addressGroup: options.addressGroup,
      onDisconnected: wcDisconnect
    })

    wcProvider.on('displayUri', (uri) => {
      window.open(`alephium://wc?uri=${uri}`)
    })

    try {
      await wcProvider.connect()

      context.setAccount(wcProvider.account)
      context.setSignerProvider(wcProvider as any)
    } catch (e) {
      console.log('wallet connect error')
      console.error(e)
    }
  }, [context, wcDisconnect])

  const disconnectAlephium = () => {
    getDefaultAlephiumWallet()
      .then((alephium) => {
        if (!!alephium) {
          alephium.disconnect()
          context.setSignerProvider(undefined)
          context.setAccount(undefined)
        }
      })
      .catch((error: any) => {
        console.error(error)
      })
  }

  const connectAlephium = useCallback(async () => {
    const windowAlephium = await getDefaultAlephiumWallet()

    const enabledAccount = await windowAlephium
      ?.enable({
        ...options,
        onDisconnected: () => {
          return Promise.resolve()
        }
      })
      .catch(() => undefined) // Need to catch the exception here

    if (windowAlephium && enabledAccount) {
      context.setSignerProvider(windowAlephium)
      context.setAccount(enabledAccount)
    }

    return enabledAccount
  }, [context])

  return useMemo(
    () =>
      ({
        injected: { connect: connectAlephium, disconnect: disconnectAlephium },
        walletConnect: { connect: wcConnect, disconnect: wcDisconnect },
        desktopWallet: { connect: desktopWalletConnect, disconnect: wcDisconnect }
      }[context.connectorId]),
    [context]
  )
}
