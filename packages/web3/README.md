# `@alephium/web3`

The core package for building decentralized applications on Alephium.

## Subscribe to event batches

Use `subscribeToEventBatches` to process the raw contract events returned by each
node request in a single callback. For example, an indexer can persist a whole
batch in one database transaction:

```typescript
import { node, subscribeToEventBatches, web3 } from '@alephium/web3'

export function indexContractEvents(
  nodeUrl: string,
  contractAddress: string,
  persistBatch: (events: node.ContractEvent[]) => Promise<void>,
  saveCursor: (count: number) => Promise<void>,
  fromCount = 0
) {
  web3.setCurrentNodeProvider(nodeUrl)

  return subscribeToEventBatches(
    {
      pollingInterval: 1000,
      messageCallback: async (events) => {
        // Commit your database transaction before resolving this promise.
        await persistBatch(events)
      },
      onEventCountChanged: saveCursor,
      errorCallback: (error, subscription) => {
        console.error('Event indexing failed:', error)
        subscription.unsubscribe()
      }
    },
    contractAddress,
    fromCount
  )
}

// Keep the returned subscription and call subscription.unsubscribe() on shutdown.
```

Each batch preserves the order supplied by the node. Batch size follows the
node's response pages; it is not a fixed size or all events received during a
polling interval. Empty responses do not invoke `messageCallback`. The next page
is fetched only after the callback and `onEventCountChanged` finish.

`currentEventCount()` returns the node's `nextStart` cursor, which is not
necessarily the number of individual events. The cursor advances after the batch
callback succeeds. If that callback fails, the cursor stays unchanged and the
batch can be retried on the next poll unless the error callback unsubscribes.
`onEventCountChanged` runs after the in-memory cursor advances; if saving that
cursor fails, it is not rolled back. Make persistence idempotent so replaying a
batch after a failure or restart does not duplicate data.

Unsubscribing prevents subsequent pages and scheduled polls. A batch callback
already running is allowed to finish. `EventSubscription`, `subscribeToEvents`,
and the generated contract subscription methods continue to deliver individual
events, including the existing `parallel` option. Batch subscriptions always
await one batch at a time and have no `parallel` option.

## Migrating from v2

See [MIGRATION.md](MIGRATION.md) for a complete guide to upgrading from v2 to v3, including breaking changes, removed dependencies, and React Native setup.

## Build

This package uses a tsc dual-build to produce dual CJS/ESM output with proper type declarations. See the [monorepo README](../../README.md#build-system) for details on the build system, flags, and exports configuration.

```
pnpm build    # Build CJS + ESM + types
pnpm check    # Run publint + attw packaging checks
pnpm test     # Run unit tests
```
