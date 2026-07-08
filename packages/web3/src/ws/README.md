# Websocket Client

This folder contains the typed websocket client used by `@alephium/web3`.
The package barrel re-exports it, so consumers can import it from the package root:

```ts
import { WebSocketClient } from '@alephium/web3'
```

## WebSocketClient

`WebSocketClient` connects to an Alephium node websocket endpoint and gives you:

- connection lifecycle events through `onConnected`, `on('disconnected')`, and `on('error')`
- a generic `onNotification` callback for every subscription notification
- typed subscription helpers for blocks, transactions, and contract events
- `subscribe(...)` and `unsubscribe(...)` if you need lower-level control

Constructor:

```ts
new WebSocketClient(url: string, options?: { apiKey?: string })
```

Use `apiKey` only when your websocket endpoint requires the `X-API-KEY` header.

### Example

```ts
import { WebSocketClient } from '@alephium/web3'

const client = new WebSocketClient('ws://127.0.0.1:21973/ws')

client.onConnected(async () => {
  console.log('connected')
  await client.subscribeToBlock()
  await client.subscribeToTx()
})

client.onBlockNotification((params) => {
  console.log('block notification')
  console.log(params.result)
})

client.onTxNotification((params) => {
  console.log('tx notification')
  console.log(params.result)
})

client.onContractEventNotification((params) => {
  console.log('contract event notification')
  console.log(params.result)
})

client.on('error', (error) => {
  console.error(error)
})
```

### Subscription helpers

- `subscribeToBlock()`
- `subscribeToTx()`
- `subscribeToContractEvents(addresses)`
- `subscribeToFilteredContractEvents(eventIndex, addresses)`
- `unsubscribe(subscriptionId)`
- `disconnect()`

Contract-event subscriptions require at least one contract address. The helper
deduplicates addresses before sending the request.

## Listener Script

`packages/web3/scripts/ws-listener.ts` is a small manual listener that prints
incoming subscription payloads as formatted JSON.

From `packages/web3/`, use one of the package scripts:

```bash
pnpm ws:listen
pnpm ws:listen:block
pnpm ws:listen:tx
pnpm ws:listen:contract
```

The listener accepts these modes:

- `all` listens to blocks, transactions, and contract events
- `block` listens only to blocks
- `tx` listens only to transactions
- `contract` listens only to contract events

The mode is passed as the first CLI argument. The package scripts above already
set it for you.

### Environment Variables

- `WS_URL`
  - websocket URL to connect to
  - default: `ws://127.0.0.1:21973/ws`
- `CONTRACT_ADDRESSES`
  - comma-separated list of contract addresses
  - required for `ws:listen:contract`
- `CONTRACT_EVENT_INDEX`
  - optional event index filter for contract-event subscriptions

Example:

```bash
WS_URL=ws://127.0.0.1:21973/ws \
CONTRACT_ADDRESSES=addr1,addr2 \
CONTRACT_EVENT_INDEX=0 \
pnpm ws:listen:contract
```

If `CONTRACT_EVENT_INDEX` is omitted, the script subscribes to all events for
the provided contract addresses.

### Behavior

- the script waits for the websocket connection before subscribing
- block and transaction notifications are printed from `params.result`
- contract mode exits early if `CONTRACT_ADDRESSES` is missing
- `SIGINT` and `SIGTERM` close the socket before exiting
