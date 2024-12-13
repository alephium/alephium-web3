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
import { ContractEvents } from '../api/api-alephium'

export interface EventSubscribeOptions<Message> extends SubscribeOptions<Message> {
  onEventCountChanged?: (eventCount: number) => Promise<void> | void
}

export class EventSubscription extends Subscription<node.ContractEvent> {
  readonly contractAddress: string
  private fromCount: number
  private onEventCountChanged?: (eventCount: number) => Promise<void> | void

  constructor(options: EventSubscribeOptions<node.ContractEvent>, contractAddress: string, fromCount?: number) {
    super(options)
    this.contractAddress = contractAddress
    this.fromCount = typeof fromCount === 'undefined' ? 0 : fromCount
    this.onEventCountChanged = options.onEventCountChanged
  }

  currentEventCount(): number {
    return this.fromCount
  }

  private async getEvents(start: number): Promise<ContractEvents> {
    try {
      return await web3
        .getCurrentNodeProvider()
        .events.getEventsContractContractaddress(this.contractAddress, { start })
    } catch (error) {
      if (error instanceof Error && error.message.includes(`Contract events of ${this.contractAddress} not found`)) {
        return { events: [], nextStart: start }
      }
      throw error
    }
  }

  override async polling(): Promise<void> {
    try {
      const events = await this.getEvents(this.fromCount)
      if (this.fromCount === events.nextStart) {
        return
      }

      const promises = events.events.map((event) => this.messageCallback(event))
      await Promise.all(promises)
      this.fromCount = events.nextStart

      if (this.onEventCountChanged !== undefined) {
        await this.onEventCountChanged(this.fromCount)
      }

      await this.polling()
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }
}

export function subscribeToEvents(
  options: EventSubscribeOptions<node.ContractEvent>,
  contractAddress: string,
  fromCount?: number
): EventSubscription {
  const subscription = new EventSubscription(options, contractAddress, fromCount)
  subscription.subscribe()
  return subscription
}
