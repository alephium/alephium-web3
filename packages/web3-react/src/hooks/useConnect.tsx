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
import { NetworkId } from '@alephium/web3'
import { useAlephiumConnectContext, useConnectSettingContext } from '../contexts/alephiumConnect'
import { useCallback, useMemo } from 'react'
import { WalletConnectProvider } from '@alephium/walletconnect-provider'
import QRCodeModal from '@walletconnect/qrcode-modal'

const WALLET_CONNECT_PROJECT_ID = '6e2562e43678dd68a9070a62b6d52207'

export interface ConnectOptions {
  addressGroup?: number
  networkId: NetworkId
}

export function useConnect(options: ConnectOptions) {
  const { addressGroup, networkId } = options
  const { connectorId, keyType } = useConnectSettingContext()
  const { signerProvider, setSignerProvider, setAccount } = useAlephiumConnectContext()

  const wcDisconnect = useCallback(async () => {
    if ((connectorId === 'walletConnect' || connectorId === 'desktopWallet') && signerProvider) {
      await (signerProvider as WalletConnectProvider).disconnect()
      setSignerProvider(undefined)
      setAccount(undefined)
    }
  }, [connectorId, signerProvider, setSignerProvider, setAccount])

  const wcConnect = useCallback(async () => {
    const wcProvider = await WalletConnectProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      networkId: networkId,
      addressGroup: addressGroup,
      onDisconnected: wcDisconnect
    })

    wcProvider.on('displayUri', (uri) => {
      QRCodeModal.open(uri, () => console.log('qr closed'))
    })

    try {
      await wcProvider.connect()

      if (wcProvider.account) {
        setAccount({ ...wcProvider.account, network: networkId })
        setSignerProvider(wcProvider as any)
      }
    } catch (e) {
      console.log('wallet connect error')
      console.error(e)
    }

    QRCodeModal.close()
  }, [networkId, addressGroup, wcDisconnect, setAccount, setSignerProvider])

  const desktopWalletConnect = useCallback(async () => {
    const wcProvider = await WalletConnectProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      networkId: networkId,
      addressGroup: addressGroup,
      onDisconnected: wcDisconnect
    })

    wcProvider.on('displayUri', (uri) => {
      window.open(`alephium://wc?uri=${uri}`)
    })

    try {
      await wcProvider.connect()

      if (wcProvider.account) {
        setAccount({ ...wcProvider.account, network: networkId })
        setSignerProvider(wcProvider as any)
      }
    } catch (e) {
      console.log('wallet connect error')
      console.error(e)
    }
  }, [networkId, addressGroup, wcDisconnect, setAccount, setSignerProvider])

  const disconnectAlephium = useCallback(() => {
    getDefaultAlephiumWallet()
      .then((alephium) => {
        if (!!alephium) {
          alephium.disconnect()
        }
      })
      .catch((error: any) => {
        console.error(error)
      })
  }, [])

  const enableOptions = useMemo(() => {
    return {
      addressGroup: addressGroup,
      networkId: networkId,
      keyType: keyType,
      onDisconnected: () => {
        setSignerProvider(undefined)
        setAccount(undefined)
      }
    }
  }, [networkId, addressGroup, keyType, setSignerProvider, setAccount])

  const connectAlephium = useCallback(async () => {
    const windowAlephium = await getDefaultAlephiumWallet()

    const enabledAccount = await windowAlephium?.enable(enableOptions).catch(() => undefined) // Need to catch the exception here

    if (windowAlephium && enabledAccount) {
      setSignerProvider(windowAlephium)
      setAccount({ ...enabledAccount, network: enableOptions.networkId })
    }

    return enabledAccount
  }, [enableOptions, setSignerProvider, setAccount])

  const autoConnectAlephium = useCallback(async () => {
    const windowAlephium = await getDefaultAlephiumWallet()

    const enabledAccount = await windowAlephium?.enableIfConnected(enableOptions).catch(() => undefined) // Need to catch the exception here

    if (windowAlephium && enabledAccount) {
      setSignerProvider(windowAlephium)
      setAccount({ ...enabledAccount, network: enableOptions.networkId })
    }
  }, [enableOptions, setSignerProvider, setAccount])

  return useMemo(
    () =>
      ({
        injected: { connect: connectAlephium, disconnect: disconnectAlephium, autoConnect: autoConnectAlephium },
        walletConnect: { connect: wcConnect, disconnect: wcDisconnect },
        desktopWallet: { connect: desktopWalletConnect, disconnect: wcDisconnect }
      }[`${connectorId}`]),
    [
      connectorId,
      connectAlephium,
      disconnectAlephium,
      autoConnectAlephium,
      wcConnect,
      desktopWalletConnect,
      wcDisconnect
    ]
  )
}
