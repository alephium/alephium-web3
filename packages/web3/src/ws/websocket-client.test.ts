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

import { createHash } from 'crypto'
import { AddressInfo } from 'net'
import { WebSocket, WebSocketServer } from 'ws'
import { WebSocketClient } from './websocket-client'

// Mirrors WsProtocol.scala: a subscription id is a hash of what was subscribed to, so the
// same request always yields the same id, on any connection.
function subscriptionIdOf(params: [string, { addresses?: string[]; eventIndex?: number }?]): string {
  const [kind, options] = params
  const canonical =
    kind === 'contract' && options?.addresses !== undefined
      ? [...options.addresses]
          .sort()
          .map((address) => `${options.eventIndex ?? '*'}/${address}`)
          .join(',')
      : kind

  return createHash('sha256').update(canonical).digest('hex')
}

interface MockNode {
  url: string
  connectionCount: () => number
  subscribeRequestCount: () => number
  dropAllConnections: () => void
  pushBlockNotification: () => void
  close: () => Promise<void>
}

interface MockNodeOptions {
  // The node registers a subscription and starts sending before the client can have processed
  // the response. Setting this reproduces that ordering deterministically.
  notifyBeforeAcknowledging?: boolean
}

const blockNotification = (subscription: string) =>
  JSON.stringify({
    jsonrpc: '2.0',
    method: 'subscription',
    params: { type: 'Block', subscription, result: { block: { hash: 'block-hash' } } }
  })

// Stands in for the node's /ws endpoint. Subscriptions are per-connection state
// and are discarded when the socket closes, which is the behaviour under test.
async function startMockNode({ notifyBeforeAcknowledging = false }: MockNodeOptions = {}): Promise<MockNode> {
  const server = new WebSocketServer({ port: 0, path: '/ws' })
  await new Promise<void>((resolve) => server.once('listening', resolve))

  let connections = 0
  let subscribeRequests = 0
  const blockSubscriptions = new Map<WebSocket, string>()

  server.on('connection', (socket) => {
    connections += 1

    socket.on('message', (data) => {
      const request = JSON.parse(data.toString())

      if (request.method === 'subscribe') {
        subscribeRequests += 1
        const subscriptionId = subscriptionIdOf(request.params)
        if (request.params[0] === 'block') {
          blockSubscriptions.set(socket, subscriptionId)
          if (notifyBeforeAcknowledging) {
            socket.send(blockNotification(subscriptionId))
          }
        }
        socket.send(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: subscriptionId }))
      }

      if (request.method === 'unsubscribe') {
        blockSubscriptions.delete(socket)
        socket.send(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: true }))
      }
    })

    socket.on('close', () => blockSubscriptions.delete(socket))
  })

  return {
    url: `ws://127.0.0.1:${(server.address() as AddressInfo).port}/ws`,
    connectionCount: () => connections,
    subscribeRequestCount: () => subscribeRequests,
    dropAllConnections: () => server.clients.forEach((socket) => socket.terminate()),
    pushBlockNotification: () => {
      for (const [socket, subscription] of blockSubscriptions) {
        socket.send(blockNotification(subscription))
      }
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve()))
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(condition: () => boolean, description: string, timeout = 8000): Promise<void> {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (condition()) return
    await sleep(50)
  }
  throw new Error(`Timed out after ${timeout}ms waiting for: ${description}`)
}

const waitForConnection = (client: WebSocketClient) => new Promise<void>((resolve) => client.onConnected(resolve))

describe('WebSocketClient reconnection', () => {
  let node: MockNode
  let client: WebSocketClient | undefined

  beforeEach(async () => {
    node = await startMockNode()
  })

  afterEach(async () => {
    client?.disconnect()
    client = undefined
    await node.close()
  })

  it('reconnects after the connection drops unexpectedly', async () => {
    const connectedClient = new WebSocketClient(node.url)
    client = connectedClient
    await waitForConnection(connectedClient)
    await connectedClient.subscribeToBlock()

    node.dropAllConnections()
    await waitFor(() => !connectedClient.isOpen(), 'the client to notice the drop')

    await waitFor(() => connectedClient.isOpen(), 'the client to reconnect on its own')
  }, 15_000)

  it('resubscribes on reconnect, so notifications keep arriving', async () => {
    client = new WebSocketClient(node.url)
    await waitForConnection(client)
    await client.subscribeToBlock()

    let received = 0
    client.onBlockNotification(() => {
      received += 1
    })

    node.pushBlockNotification()
    await waitFor(() => received === 1, 'the first block notification')

    node.dropAllConnections()

    await waitFor(() => node.connectionCount() === 2, 'the client to open a new connection')
    await waitFor(() => node.subscribeRequestCount() === 2, 'the client to resubscribe on the new connection')

    node.pushBlockNotification()
    await waitFor(() => received === 2, 'notifications to resume after the reconnect')
  }, 15_000)

  it("emits 'reconnected' so consumers know they missed notifications and must backfill", async () => {
    client = new WebSocketClient(node.url)
    await waitForConnection(client)
    await client.subscribeToBlock()

    let reconnected = false
    client.on('reconnected', () => {
      reconnected = true
    })

    node.dropAllConnections()

    await waitFor(() => reconnected, "a 'reconnected' event")
  }, 15_000)

  it('does not reconnect after an explicit disconnect()', async () => {
    client = new WebSocketClient(node.url)
    await waitForConnection(client)
    await client.subscribeToBlock()

    client.disconnect()
    await sleep(3000)

    expect(client.isOpen()).toBe(false)
    expect(node.connectionCount()).toBe(1)
  }, 15_000)

  it('delivers notifications that arrive before the subscribe response', async () => {
    await node.close()
    node = await startMockNode({ notifyBeforeAcknowledging: true })

    client = new WebSocketClient(node.url)
    await waitForConnection(client)

    let received = 0
    client.onBlockNotification(() => {
      received += 1
    })

    await client.subscribeToBlock()

    await waitFor(() => received === 1, 'the notification sent before the subscribe response')
  }, 15_000)

  it("disconnect() still notifies the consumer's own 'disconnected' listener", async () => {
    client = new WebSocketClient(node.url)
    await waitForConnection(client)

    let notified = false
    client.on('disconnected', () => {
      notified = true
    })

    client.disconnect()

    await waitFor(() => notified, "the consumer's 'disconnected' listener to fire")
  }, 15_000)
})
