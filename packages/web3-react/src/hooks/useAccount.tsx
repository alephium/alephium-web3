import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { useEffect } from 'react'
import { useContext } from '../components/AlephiumConnect';
import { KeyType } from '@alephium/web3'

export function useAccount(onDisconnected?: () => Promise<void>) {
  const context = useContext()

  useEffect(() => {
    const handler = async () => {
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
