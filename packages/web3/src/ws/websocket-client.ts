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
import WebSocket from 'ws'
import { EventEmitter } from 'eventemitter3'

import type {
  BlockAndEvents,
  ContractEventByBlockHash,
  TransactionTemplate
} from '../api/api-alephium'

export type WsSubscriptionKind = 'block' | 'tx' | 'contract'

export type WsSubscriptionParams =
  | [kind: 'block']
  | [kind: 'tx']
  | [kind: 'contract', options: { addresses: string[]; eventIndex?: number }]

export interface WsSubscriptionRequest {
  jsonrpc: '2.0'
  id: number
  method: 'subscribe' | 'unsubscribe'
  params: string[] | WsSubscriptionParams
}

export interface WsResponseSuccess<T = unknown> {
  jsonrpc: '2.0'
  id: number
  result: T
}

export interface WsResponseError {
  jsonrpc: '2.0'
  id?: number
  error: {
    code: number
    message: string
  }
}

export interface WsSubscriptionNotification<T = unknown> {
  jsonrpc: '2.0'
  method: 'subscription'
  params: {
    subscription: string
    result: T
  }
}

export type WsResponse<T = unknown> = WsResponseSuccess<T> | WsResponseError
export type WsIncomingMessage =
  | WsSubscriptionNotification<BlockAndEvents | TransactionTemplate | ContractEventByBlockHash>
  | WsResponse

export interface WebSocketClientOptions {
  apiKey?: string
}

type NotificationPayload = BlockAndEvents | TransactionTemplate | ContractEventByBlockHash
type NotificationListener = (params: WsSubscriptionNotification<NotificationPayload>['params']) => void
type SubscriptionListener<T> = (params: WsSubscriptionNotification<T>['params']) => void

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isWsResponseError(message: unknown): message is WsResponseError {
  return (
    isObject(message) &&
    message.jsonrpc === '2.0' &&
    isObject(message.error) &&
    typeof message.error.code === 'number' &&
    typeof message.error.message === 'string'
  )
}

function isWsResponseSuccess(message: unknown): message is WsResponseSuccess {
  return isObject(message) && message.jsonrpc === '2.0' && typeof message.id === 'number' && 'result' in message
}

function isWsSubscriptionMessage(message: unknown): message is WsSubscriptionNotification<NotificationPayload> {
  return (
    isObject(message) &&
    message.jsonrpc === '2.0' &&
    message.method === 'subscription' &&
    isObject(message.params) &&
    typeof message.params.subscription === 'string' &&
    'result' in message.params
  )
}

function normalizeContractAddresses(addresses: string[]): string[] {
  return [...new Set(addresses)]
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket
  private requestId: number
  private isConnected: boolean
  private notifications: WsSubscriptionNotification<NotificationPayload>[]
  private subscriptionKinds: Map<string, WsSubscriptionKind>

  constructor(url: string, options: WebSocketClientOptions = {}) {
    super()
    this.requestId = 0
    this.isConnected = false
    this.notifications = []
    this.subscriptionKinds = new Map()

    const headers = options.apiKey ? { 'X-API-KEY': options.apiKey } : undefined
    this.ws =
      headers === undefined ? new WebSocket(url) : new WebSocket(url, undefined, { headers })

    this.ws.on('open', () => {
      this.isConnected = true
      this.emit('connected')
    })

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message: unknown = JSON.parse(data.toString())
        if (isWsSubscriptionMessage(message)) {
          this.notifications.push(message)
          const kind = this.subscriptionKinds.get(message.params.subscription)
          this.emit('notification', message.params)
          this.emit(`notification_${message.params.subscription}`, message.params)
          if (kind !== undefined) {
            this.emit(`notification:${kind}`, message.params)
          }
          return
        }

        if (isWsResponseError(message) || isWsResponseSuccess(message)) {
          this.emit(`response_${message.id}`, message)
          return
        }

        this.emit('error', new Error('Unsupported websocket message'))
      } catch (error) {
        this.emit('error', error)
      }
    })

    this.ws.on('close', () => {
      this.isConnected = false
      this.emit('disconnected')
    })

    this.ws.on('error', (error) => {
      this.emit('error', error)
    })
  }

  public isOpen(): boolean {
    return this.isConnected
  }

  public subscribe(method: 'subscribe', params: WsSubscriptionParams): Promise<string>
  public subscribe(method: 'unsubscribe', params: [string]): Promise<boolean>
  public subscribe(method: 'subscribe' | 'unsubscribe', params: WsSubscriptionParams | [string]): Promise<string | boolean> {
    const id = this.getRequestId()
    const request: WsSubscriptionRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    }

    return new Promise((resolve, reject) => {
      this.once(`response_${id}`, (response: WsResponse) => {
        if ('result' in response) {
          resolve(response.result as string | boolean)
          return
        }

        reject(response.error)
      })

      this.ws.send(JSON.stringify(request))
    })
  }

  public subscribeToBlock(): Promise<string> {
    return this.subscribeAndRegisterKind('block', ['block'])
  }

  public subscribeToTx(): Promise<string> {
    return this.subscribeAndRegisterKind('tx', ['tx'])
  }

  public subscribeToContractEvents(addresses: string[]): Promise<string> {
    return this.subscribeAndRegisterKind('contract', [
      'contract',
      { addresses: normalizeContractAddresses(addresses) }
    ])
  }

  public subscribeToFilteredContractEvents(eventIndex: number, addresses: string[]): Promise<string> {
    return this.subscribeAndRegisterKind('contract', [
      'contract',
      { eventIndex, addresses: normalizeContractAddresses(addresses) }
    ])
  }

  public unsubscribe(subscriptionId: string): Promise<boolean> {
    return this.subscribe('unsubscribe', [subscriptionId]) as Promise<boolean>
  }

  public onConnected(callback: () => void): void {
    if (this.isConnected) {
      callback()
      return
    }

    this.on('connected', callback)
  }

  public onNotification(callback: NotificationListener): void {
    for (const notification of this.notifications) {
      callback(notification.params)
    }

    this.on('notification', callback)
  }

  public onBlockNotification(callback: SubscriptionListener<BlockAndEvents>): void {
    this.onTypedNotification('block', callback)
  }

  public onTxNotification(callback: SubscriptionListener<TransactionTemplate>): void {
    this.onTypedNotification('tx', callback)
  }

  public onContractEventNotification(callback: SubscriptionListener<ContractEventByBlockHash>): void {
    this.onTypedNotification('contract', callback)
  }

  public disconnect(): void {
    this.removeAllListeners()
    this.ws.removeAllListeners()
    this.subscriptionKinds.clear()
    this.ws.close()
  }

  private async subscribeAndRegisterKind(
    kind: WsSubscriptionKind,
    params: WsSubscriptionParams
  ): Promise<string> {
    const subscriptionId = (await this.subscribe('subscribe', params)) as string
    this.subscriptionKinds.set(subscriptionId, kind)
    return subscriptionId
  }

  private onTypedNotification<T extends NotificationPayload>(
    kind: WsSubscriptionKind,
    callback: SubscriptionListener<T>
  ): void {
    const eventName = `notification:${kind}`
    for (const notification of this.notifications) {
      if (this.subscriptionKinds.get(notification.params.subscription) === kind) {
        callback(notification.params as unknown as WsSubscriptionNotification<T>['params'])
      }
    }
    this.on(eventName, callback as (...args: any[]) => void)
  }

  private getRequestId(): number {
    return ++this.requestId
  }
}
