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

import EventEmitter from 'eventemitter3'
import * as api from './api/api-alephium'
import { CliqueClient } from './clique'
import { convertHttpResponse } from './utils'

type EventCallback = (event: api.ContractEvent) => Promise<void>
type ErrorCallback = (error: any, subscription: Subscription) => Promise<void>

export interface SubscribeOptions {
  client: CliqueClient
  contractAddress: string
  fromCount?: number
  pollingInterval: number
  eventCallback: EventCallback
  errorCallback: ErrorCallback
}

export class Subscription {
  client: CliqueClient
  readonly contractAddress: string
  pollingInterval: number

  private fromCount: number
  private eventCallback: EventCallback
  private errorCallback: ErrorCallback
  private task: ReturnType<typeof setTimeout> | undefined
  private cancelled: boolean
  private eventEmitter: EventEmitter

  constructor(options: SubscribeOptions) {
    this.client = options.client
    this.contractAddress = options.contractAddress
    this.fromCount = typeof options.fromCount === 'undefined' ? 0 : options.fromCount
    this.pollingInterval = options.pollingInterval
    this.eventCallback = options.eventCallback
    this.errorCallback = options.errorCallback
    this.task = undefined
    this.cancelled = false

    this.eventEmitter = new EventEmitter()
    this.eventEmitter.on('tick', async () => {
      await this.fetchEvents()
    })
    this.eventEmitter.emit('tick')
  }

  unsubscribe(): void {
    this.eventEmitter.removeAllListeners()
    this.cancelled = true
    if (typeof this.task !== 'undefined') {
      clearTimeout(this.task)
    }
  }

  currentEventCount(): number {
    return this.fromCount
  }

  private async fetchEvents() {
    try {
      const response = await this.client.events.getEventsContractContractaddress(this.contractAddress, {
        start: this.fromCount
      })
      if (this.cancelled) {
        return
      }

      const events = convertHttpResponse(response)
      if (this.fromCount === events.nextStart) {
        this.task = setTimeout(() => this.eventEmitter.emit('tick'), this.pollingInterval)
        return
      }

      const promises = events.events.map((event) => this.eventCallback(event))
      await Promise.all(promises)
      this.fromCount = events.nextStart
      await this.fetchEvents()
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }
}

export function subscribe(options: SubscribeOptions): Subscription {
  return new Subscription(options)
}
