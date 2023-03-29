import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { node, SubscribeOptions, subscribeToTxStatus, TxStatusSubscription, web3 } from '@alephium/web3'
import { useEffect, useState } from 'react'

export function useTxStatus(
  txId: string,
  txStatusCallback: (status: node.TxStatus) => Promise<any> = (_) => Promise.resolve()
) {
  const [txStatus, setTxStatus] = useState<node.TxStatus | undefined>(undefined)

  const subscriptionOptions: SubscribeOptions<node.TxStatus> = {
    pollingInterval: 3000,
    messageCallback: async (status: node.TxStatus): Promise<void> => {
      setTxStatus(status)
      if (status.type === 'Confirmed' || status.type === 'TxNotFound') {
        await new Promise((r) => setTimeout(r, 5000))
      }
      txStatusCallback(status)
    },
    errorCallback: (error: any, subscription): Promise<void> => {
      console.error(error)
      subscription.unsubscribe()
      return Promise.resolve()
    }
  }

  useEffect(() => {
    getDefaultAlephiumWallet().then(alephium => {
      if (!alephium?.nodeProvider) {
        throw Error('Alephium object is not initialized')
      }
      web3.setCurrentNodeProvider(alephium.nodeProvider)

      var subscription: TxStatusSubscription | undefined = undefined
      if (subscriptionOptions) {
        subscription = subscribeToTxStatus(subscriptionOptions, txId)
      }

      return () => {
        if (subscription) {
          subscription.unsubscribe()
        }
      }
    }).then((error: any) => {
      console.error(error)
    })
  }, [])

  return { txStatus }
}
