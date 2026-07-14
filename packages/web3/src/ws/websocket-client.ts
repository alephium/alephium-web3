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

import type { BlockAndEvents, ContractEventByBlockHash, TransactionTemplate } from '../api/api-alephium'

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

export type WsNotificationType = 'Block' | 'Tx' | 'ContractEvent'

export interface WsSubscriptionNotification<T = unknown> {
  jsonrpc: '2.0'
  method: 'subscription'
  params: {
    type: WsNotificationType
    subscription: string
    result: T
  }
}

const SUBSCRIPTION_KIND_BY_NOTIFICATION_TYPE: Record<WsNotificationType, WsSubscriptionKind> = {
  Block: 'block',
  Tx: 'tx',
  ContractEvent: 'contract'
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

// The node forgets a subscription when its connection closes, and hands out a new id on
// resubscribe. The request params are therefore what we keep, not the id we got back.
interface PendingRequest {
  resolve: (result: string | boolean) => void
  reject: (reason: unknown) => void
  timer: ReturnType<typeof setTimeout>
}

const REQUEST_TIMEOUT_MS = 10_000
const INITIAL_RECONNECT_DELAY_MS = 500
const MAX_RECONNECT_DELAY_MS = 30_000

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
    typeof message.params.type === 'string' &&
    message.params.type in SUBSCRIPTION_KIND_BY_NOTIFICATION_TYPE &&
    'result' in message.params
  )
}

function normalizeContractAddresses(addresses: string[]): string[] {
  return [...new Set(addresses)]
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket
  private readonly url: string
  private readonly headers?: Record<string, string>
  private requestId: number
  private isConnected: boolean
  private isClosing: boolean
  private reconnectAttempts: number
  private reconnectTimer?: ReturnType<typeof setTimeout>
  private notifications: WsSubscriptionNotification<NotificationPayload>[]
  private subscriptions: Map<string, WsSubscriptionParams>
  private pendingRequests: Map<number, PendingRequest>

  constructor(url: string, options: WebSocketClientOptions = {}) {
    super()
    this.url = url
    this.headers = options.apiKey ? { 'X-API-KEY': options.apiKey } : undefined
    this.requestId = 0
    this.isConnected = false
    this.isClosing = false
    this.reconnectAttempts = 0
    this.notifications = []
    this.subscriptions = new Map()
    this.pendingRequests = new Map()

    this.ws = this.connect()
  }

  public isOpen(): boolean {
    return this.isConnected
  }

  public subscribe(method: 'subscribe', params: WsSubscriptionParams): Promise<string>
  public subscribe(method: 'unsubscribe', params: [string]): Promise<boolean>
  public async subscribe(
    method: 'subscribe' | 'unsubscribe',
    params: WsSubscriptionParams | [string]
  ): Promise<string | boolean> {
    await this.waitUntilOpen()

    const id = this.getRequestId()
    const request: WsSubscriptionRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`Websocket ${method} request timed out after ${REQUEST_TIMEOUT_MS}ms`))
      }, REQUEST_TIMEOUT_MS)

      this.pendingRequests.set(id, { resolve, reject, timer })
      this.ws.send(JSON.stringify(request))
    })
  }

  public subscribeToBlock(): Promise<string> {
    return this.subscribeAndRegister(['block'])
  }

  public subscribeToTx(): Promise<string> {
    return this.subscribeAndRegister(['tx'])
  }

  public subscribeToContractEvents(addresses: string[]): Promise<string> {
    return this.subscribeAndRegister(['contract', { addresses: normalizeContractAddresses(addresses) }])
  }

  public subscribeToFilteredContractEvents(eventIndex: number, addresses: string[]): Promise<string> {
    return this.subscribeAndRegister(['contract', { eventIndex, addresses: normalizeContractAddresses(addresses) }])
  }

  public async unsubscribe(subscriptionId: string): Promise<boolean> {
    const result = await this.subscribe('unsubscribe', [subscriptionId])
    this.subscriptions.delete(subscriptionId)
    return result
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
    this.isClosing = true

    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }

    this.rejectPendingRequests(new Error('Websocket client disconnected'))
    this.subscriptions.clear()
    this.ws.close()
  }

  private connect(): WebSocket {
    const ws =
      this.headers === undefined
        ? new WebSocket(this.url)
        : new WebSocket(this.url, undefined, { headers: this.headers })

    ws.on('open', () => {
      const isReconnect = this.reconnectAttempts > 0
      this.isConnected = true
      this.reconnectAttempts = 0
      this.emit('connected')

      if (isReconnect) {
        this.resubscribeAll().catch((error) => this.emit('error', error))
      }
    })

    ws.on('message', (data: WebSocket.Data) => this.handleMessage(data))

    ws.on('close', () => {
      this.isConnected = false
      this.rejectPendingRequests(new Error('Websocket connection closed'))
      this.emit('disconnected')

      if (this.isClosing) {
        return
      }

      this.scheduleReconnect()
    })

    ws.on('error', (error) => this.emit('error', error))

    return ws
  }

  private scheduleReconnect(): void {
    const delay = Math.min(INITIAL_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempts, MAX_RECONNECT_DELAY_MS)
    // Jitter, so that every client of a restarted node does not stampede it in lockstep.
    const jitteredDelay = delay * (0.5 + Math.random() / 2)
    this.reconnectAttempts += 1

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined
      this.ws = this.connect()
    }, jitteredDelay)
  }

  private async resubscribeAll(): Promise<void> {
    const previousSubscriptions = [...this.subscriptions.values()]
    this.subscriptions.clear()

    for (const params of previousSubscriptions) {
      const subscriptionId = await this.subscribe('subscribe', params)
      this.subscriptions.set(subscriptionId, params)
    }

    // Notifications produced while we were disconnected are gone for good. Consumers that
    // need completeness must reconcile over the REST API from their last known state.
    this.emit('reconnected')
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const message: unknown = JSON.parse(data.toString())
      if (isWsSubscriptionMessage(message)) {
        this.notifications.push(message)
        // Routed by what the notification says it is, not by what we recorded when the
        // subscription was acknowledged: the node starts sending as soon as it registers the
        // subscription, which can be before we have processed its response.
        const kind = SUBSCRIPTION_KIND_BY_NOTIFICATION_TYPE[message.params.type]
        this.emit('notification', message.params)
        this.emit(`notification_${message.params.subscription}`, message.params)
        this.emit(`notification:${kind}`, message.params)
        return
      }

      if (isWsResponseError(message) || isWsResponseSuccess(message)) {
        this.settleRequest(message)
        return
      }

      this.emit('error', new Error('Unsupported websocket message'))
    } catch (error) {
      this.emit('error', error)
    }
  }

  private settleRequest(response: WsResponse): void {
    if (response.id === undefined) {
      return
    }

    const pendingRequest = this.pendingRequests.get(response.id)
    if (pendingRequest === undefined) {
      return
    }

    clearTimeout(pendingRequest.timer)
    this.pendingRequests.delete(response.id)

    if ('result' in response) {
      pendingRequest.resolve(response.result as string | boolean)
      return
    }

    pendingRequest.reject(response.error)
  }

  private rejectPendingRequests(error: Error): void {
    for (const [id, pendingRequest] of this.pendingRequests) {
      clearTimeout(pendingRequest.timer)
      this.pendingRequests.delete(id)
      pendingRequest.reject(error)
    }
  }

  private waitUntilOpen(): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const onConnected = () => {
        clearTimeout(timer)
        resolve()
      }

      const timer = setTimeout(() => {
        this.off('connected', onConnected)
        reject(new Error(`Timed out after ${REQUEST_TIMEOUT_MS}ms waiting for the websocket to open`))
      }, REQUEST_TIMEOUT_MS)

      this.once('connected', onConnected)
    })
  }

  private async subscribeAndRegister(params: WsSubscriptionParams): Promise<string> {
    const subscriptionId = await this.subscribe('subscribe', params)
    this.subscriptions.set(subscriptionId, params)
    return subscriptionId
  }

  private onTypedNotification<T extends NotificationPayload>(
    kind: WsSubscriptionKind,
    callback: SubscriptionListener<T>
  ): void {
    const eventName = `notification:${kind}`
    for (const notification of this.notifications) {
      if (SUBSCRIPTION_KIND_BY_NOTIFICATION_TYPE[notification.params.type] === kind) {
        callback(notification.params as unknown as WsSubscriptionNotification<T>['params'])
      }
    }
    this.on(eventName, callback as (...args: any[]) => void)
  }

  private getRequestId(): number {
    return ++this.requestId
  }
}
