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

import { NodeProvider } from '../src/api'
import { subscribeToTxStatus } from '../src/transaction/status'
import { Contract } from '../src/contract'
import { TxStatus } from '../src/api/api-alephium'
import { testWallet } from '../src/test'
import { SubscribeOptions } from '../src/utils'

describe('transactions', function() {
  it('should subscribe transaction status', async () => {
    const provider = new NodeProvider('http://127.0.0.1:22973')
    const sub = await Contract.fromSource(provider, 'sub.ral')
    const signer = await testWallet(provider)
    const subDeployTx = await sub.transactionForDeployment(signer, {
      initialFields: { result: 0 },
      initialTokenAmounts: []
    })

    var txStatus: TxStatus | undefined = undefined
    var counter = 0
    const subscriptOptions: SubscribeOptions<TxStatus> = {
      provider: provider,
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
    await new Promise((resolve) => setTimeout(resolve, 1500))
    expect(txStatus).toMatchObject({ type: 'TxNotFound' })

    const subSubmitResult = await signer.submitTransaction(subDeployTx.unsignedTx, subDeployTx.txId)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    expect(txStatus).toMatchObject({ type: 'Confirmed' })

    expect(counterBeforeSubscribe).toBeLessThan(counter)

    subscription.unsubscribe()

    const counterAfterUnsubscribe = counter
    await new Promise((resolve) => setTimeout(resolve, 1500))
    expect(txStatus).toMatchObject({ type: 'Confirmed' })
    expect(counterAfterUnsubscribe).toEqual(counter)
  })
})
