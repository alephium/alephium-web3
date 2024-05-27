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

import * as web3 from '../global'
import { node } from '../api'
import { Subscription, SubscribeOptions } from '../utils'

export type TxStatus = node.TxStatus

export class TxStatusSubscription extends Subscription<TxStatus> {
  readonly txId: string
  readonly fromGroup?: number
  readonly toGroup?: number
  readonly confirmations: number

  constructor(
    options: SubscribeOptions<TxStatus>,
    txId: string,
    fromGroup?: number,
    toGroup?: number,
    confirmations?: number
  ) {
    super(options)
    this.txId = txId
    this.fromGroup = fromGroup
    this.toGroup = toGroup
    this.confirmations = confirmations ?? 1
  }

  override async polling(): Promise<void> {
    try {
      const txStatus = await web3.getCurrentNodeProvider().transactions.getTransactionsStatus({
        txId: this.txId,
        fromGroup: this.fromGroup,
        toGroup: this.toGroup
      })

      await this.messageCallback(txStatus)
      if (txStatus.type === 'Confirmed' && (txStatus as node.Confirmed).chainConfirmations >= this.confirmations) {
        this.unsubscribe()
      }
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }
}

export function subscribeToTxStatus(
  options: SubscribeOptions<TxStatus>,
  txId: string,
  fromGroup?: number,
  toGroup?: number,
  confirmations?: number
): TxStatusSubscription {
  const subscription = new TxStatusSubscription(options, txId, fromGroup, toGroup, confirmations)
  subscription.subscribe()
  return subscription
}
