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

import { TxStatus } from '../api/api-alephium'
import { Subscription, SubscribeOptions } from '../utils'

export class TxStatusSubscription extends Subscription<TxStatus> {
  readonly txId: string
  readonly fromGroup?: number
  readonly toGroup?: number

  constructor(options: SubscribeOptions<TxStatus>, txId: string, fromGroup?: number, toGroup?: number) {
    super(options)
    this.txId = txId
    this.fromGroup = fromGroup
    this.toGroup = toGroup

    this.startPolling()
  }

  override async polling(): Promise<void> {
    try {
      const txStatus = await this.provider.transactions.getTransactionsStatus({
        txId: this.txId,
        fromGroup: this.fromGroup,
        toGroup: this.toGroup
      })

      await this.messageCallback(txStatus)
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }
}

export function subscribeToTxStatus(
  options: SubscribeOptions<TxStatus>,
  txId: string,
  fromGroup?: number,
  toGroup?: number
): TxStatusSubscription {
  return new TxStatusSubscription(options, txId, fromGroup, toGroup)
}
