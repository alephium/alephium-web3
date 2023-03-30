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
    getDefaultAlephiumWallet()
      .then((alephium) => {
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
      })
      .then((error: any) => {
        console.error(error)
      })
  }, [])

  return { txStatus }
}
