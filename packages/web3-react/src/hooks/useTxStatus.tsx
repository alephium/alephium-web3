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
import { node, SubscribeOptions, subscribeToTxStatus } from '@alephium/web3'
import { useEffect, useMemo, useState } from 'react'

export function useTxStatus(txId: string, txStatusCallback?: (status: node.TxStatus) => Promise<any>) {
  const [txStatus, setTxStatus] = useState<node.TxStatus | undefined>(undefined)

  const subscriptionOptions: SubscribeOptions<node.TxStatus> = useMemo(
    () => ({
      pollingInterval: 3000,
      messageCallback: async (status: node.TxStatus): Promise<void> => {
        setTxStatus(status)
        if (txStatusCallback !== undefined) {
          await txStatusCallback(status)
        }
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.error(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }),
    [txStatusCallback]
  )

  useEffect(() => {
    const subscription = subscribeToTxStatus(subscriptionOptions, txId)
    return () => subscription.unsubscribe()
  }, [subscriptionOptions, txId])

  return { txStatus }
}
