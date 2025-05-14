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

import { node } from '../api'
import { WebSocket } from 'isows'

let _ws: WS | undefined = undefined

export async function getWS(nodeUrl: string): Promise<WS> {
  if (_ws !== undefined) return _ws
  const url = nodeUrl.endsWith('/ws') ? nodeUrl : `${nodeUrl}/ws`
  _ws = await WS.from(url)
  return _ws
}

export interface WsSubscribeOptions<T> {
  nodeUrl: string
  messageCallback: (message: T) => Promise<void> | void
  errorCallback: (error: any) => void
}

export interface WsSubscription {
  id: string
  unsubscribe: () => Promise<void>
}

export async function wsSubscribeEvent(
  options: WsSubscribeOptions<node.ContractEvent>,
  contractAddress: string,
  eventIndex?: number
) {
  const ws = await getWS(options.nodeUrl)
  return ws.subscribeEvent(options, contractAddress, eventIndex)
}

export class WS {
  private subscriptions: Map<string, WsSubscribeOptions<any>>
  private requests: Map<number, (msg: any) => void>
  private currentId: number

  private nextId(): number {
    this.currentId += 1
    return this.currentId
  }

  private constructor(private readonly socket: WebSocket) {
    this.subscriptions = new Map()
    this.requests = new Map()
    this.currentId = 0
  }

  static async from(nodeUrl: string): Promise<WS> {
    const socket = new WebSocket(nodeUrl)
    const ws = new WS(socket)

    const onError = (error: any) => {
      ws.subscriptions.forEach((options) => options.errorCallback(error))
      ws.subscriptions.clear()
      ws.requests.clear()
      socket.close()
    }

    const onMessage = ({ data }: MessageEvent) => {
      try {
        const response = JSON.parse(data)
        if (response?.method === 'subscription') {
          const options = ws.subscriptions.get(response?.params?.subscription)
          if (options !== undefined && response?.params?.result) {
            options.messageCallback(response.params.result)
          }
          return
        }

        const request = ws.requests.get(response?.id)
        if (request !== undefined) {
          ws.requests.delete(response?.id)
          request(response?.result)
        }
        return
      } catch (error) {
        onError(error)
      }
    }

    socket.addEventListener('message', onMessage)
    socket.addEventListener('error', onError)

    if (socket.readyState === WebSocket.CONNECTING) {
      await new Promise((resolve, reject) => {
        if (!socket) return
        socket.onopen = resolve
        socket.onerror = reject
      })
    }
    return ws
  }

  async subscribeEvent(
    options: WsSubscribeOptions<node.ContractEvent>,
    contractAddress: string,
    eventIndex?: number
  ): Promise<WsSubscription> {
    const request = buildSubscribeRequest(contractAddress, eventIndex, this.nextId())
    const { promise, resolve, reject } = createDeferred<WsSubscription>()
    this.requests.set(request.id, (subscriptionId) => {
      this.subscriptions.set(subscriptionId, options)
      const subscription: WsSubscription = {
        id: subscriptionId,
        unsubscribe: () => this.unsubscribe(subscriptionId)
      }
      resolve(subscription)
    })
    try {
      this.socket.send(JSON.stringify(request))
    } catch (error) {
      reject(error)
    }
    return await promise
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const request = buildUnsubscribeRequest(subscriptionId, this.nextId())
    const { promise, resolve, reject } = createDeferred<void>()
    this.requests.set(request.id, () => {
      this.subscriptions.delete(subscriptionId)
      resolve()
    })
    try {
      this.socket.send(JSON.stringify(request))
    } catch (error) {
      reject(error)
    }
    return await promise
  }
}

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: any) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function buildSubscribeRequest(contractAddress: string, eventIndex: number | undefined, id: number) {
  const args =
    eventIndex === undefined ? { addresses: [contractAddress] } : { addresses: [contractAddress], eventIndex }
  return { jsonrpc: '2.0', method: 'subscribe', params: ['contract', args], id }
}

function buildUnsubscribeRequest(subscriptionId: string, id: number) {
  return { jsonrpc: '2.0', method: 'unsubscribe', params: [subscriptionId], id }
}
