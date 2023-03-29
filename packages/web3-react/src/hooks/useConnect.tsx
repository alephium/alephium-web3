import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import type { EnableOptionsBase } from '@alephium/web3';
import { useContext } from '../components/AlephiumConnect';
import { useCallback } from 'react';

export type ConnectOptions = Omit<EnableOptionsBase, 'onDisconnected'>

export function useConnect(
  options: ConnectOptions
) {
  const context = useContext()

  const disconnectAlephium = useCallback(() => {
    getDefaultAlephiumWallet().then(alephium => {
      if (!!alephium) {
        alephium.disconnect()
        context.setAccount(undefined)
        context.setSignerProvider(undefined)
      }
    }).catch((error: any) => {
      console.error(error)
    })
  }, [context])

  const connectAlephium = useCallback(async () => {
    const windowAlephium = await getDefaultAlephiumWallet()

    const enabledAccount = await windowAlephium?.enable({
      ...options, onDisconnected: disconnectAlephium
    }).catch(() => undefined) // Need to catch the exception here

    if (windowAlephium && enabledAccount) {
      context.setSignerProvider(windowAlephium)
      context.setAccount(enabledAccount)
    }

    return enabledAccount
  }, [context])

  return { connect: connectAlephium, disconnect: disconnectAlephium }
}
