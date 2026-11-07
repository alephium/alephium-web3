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
  parallel?: boolean
}

export interface BatchedEventSubscribeOptions<Message> extends SubscribeOptions<Message[]> {
  onEventCountChanged?: (eventCount: number) => Promise<void> | void
}

abstract class EventSubscriptionBase<Message> extends Subscription<Message> {
  readonly contractAddress: string
  private fromCount: number
  private onEventCountChanged?: (eventCount: number) => Promise<void> | void

  constructor(options: EventSubscribeOptions<Message>, contractAddress: string, fromCount?: number) {
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
    if (this.cancelled) {
      return
    }
    try {
      const events = await this.getEvents(this.fromCount)
      if (this.cancelled || this.fromCount === events.nextStart) {
        return
      }

      await this.handleEvents(events.events)

      this.fromCount = events.nextStart

      if (this.onEventCountChanged !== undefined) {
        await this.onEventCountChanged(this.fromCount)
      }

      await this.polling()
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }

  protected abstract handleEvents(events: node.ContractEvent[]): Promise<void>
}

export class EventSubscription extends EventSubscriptionBase<node.ContractEvent> {
  private parallel: boolean

  constructor(options: EventSubscribeOptions<node.ContractEvent>, contractAddress: string, fromCount?: number) {
    super(options, contractAddress, fromCount)
    this.parallel = options.parallel ?? false
  }

  protected override async handleEvents(events: node.ContractEvent[]): Promise<void> {
    if (this.parallel) {
      await Promise.all(events.map((event) => this.messageCallback(event)))
    } else {
      for (const event of events) {
        await this.messageCallback(event)
      }
    }
  }
}

/** Delivers each non-empty node response as one batch, preserving the node's event order. */
export class BatchedEventSubscription extends EventSubscriptionBase<node.ContractEvent[]> {
  constructor(options: BatchedEventSubscribeOptions<node.ContractEvent>, contractAddress: string, fromCount?: number) {
    super(options, contractAddress, fromCount)
  }

  protected override async handleEvents(events: node.ContractEvent[]): Promise<void> {
    if (events.length > 0) {
      await this.messageCallback(events)
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

/** Starts polling immediately; the cursor advances only after the batch callback succeeds. */
export function subscribeToEventBatches(
  options: BatchedEventSubscribeOptions<node.ContractEvent>,
  contractAddress: string,
  fromCount?: number
): BatchedEventSubscription {
  const subscription = new BatchedEventSubscription(options, contractAddress, fromCount)
  subscription.subscribe()
  return subscription
}
