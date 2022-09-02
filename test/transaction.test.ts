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

import { subscribeToTxStatus } from '../src/transaction/status'
import { Project } from '../src/contract'
import { TxStatus } from '../src/api/api-alephium'
import { testNodeWallet } from '../src/test'
import { SubscribeOptions, timeout } from '../src/utils'
import { setCurrentNodeProvider } from '../src'

describe('transactions', function () {
  it('should subscribe transaction status', async () => {
    setCurrentNodeProvider('http://127.0.0.1:22973')
    await Project.build()
    const sub = Project.contract('sub/sub.ral')
    const signer = await testNodeWallet()
    const subDeployTx = await sub.transactionForDeployment(signer, {
      initialFields: { result: 0 },
      initialTokenAmounts: []
    })

    let txStatus: TxStatus | undefined = undefined
    let counter = 0
    const subscriptOptions: SubscribeOptions<TxStatus> = {
      pollingInterval: 500,
      messageCallback: (status: TxStatus): Promise<void> => {
        txStatus = status
        counter = counter + 1
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }

    const counterBeforeSubscribe = counter

    const subscription = subscribeToTxStatus(subscriptOptions, subDeployTx.txId)
    await timeout(1500)
    expect(txStatus).toMatchObject({ type: 'TxNotFound' })

    await signer.submitTransaction(subDeployTx.unsignedTx, subDeployTx.txId)
    await timeout(1500)
    expect(txStatus).toMatchObject({ type: 'Confirmed' })

    expect(counterBeforeSubscribe).toBeLessThan(counter)

    subscription.unsubscribe()

    const counterAfterUnsubscribe = counter
    await timeout(1500)
    expect(txStatus).toMatchObject({ type: 'Confirmed' })
    // There maybe a pending request when we unsubscribe
    expect([counter, counter - 1]).toContain(counterAfterUnsubscribe)
  }, 10000)
})
