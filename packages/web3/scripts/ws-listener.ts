import { WebSocketClient } from '../src/ws'

type ListenMode = 'all' | 'block' | 'tx' | 'contract'

const wsUrl = process.env.WS_URL ?? 'ws://127.0.0.1:21973/ws'
const mode = parseMode(process.argv[2])
const contractAddresses = parseAddresses(process.env.CONTRACT_ADDRESSES)
const contractEventIndex = parseEventIndex(process.env.CONTRACT_EVENT_INDEX)

function waitForConnection(client: WebSocketClient): Promise<void> {
  return new Promise((resolve) => {
    client.onConnected(resolve)
  })
}

async function main(): Promise<void> {
  console.log(`Connecting to ${wsUrl}`)
  console.log(`Listening mode: ${mode}`)

  const client = new WebSocketClient(wsUrl)

  if (mode === 'all' || mode === 'block') {
    client.onBlockNotification((params) => {
      console.log(JSON.stringify(params.result, null, 2))
    })
  }

  if (mode === 'all' || mode === 'tx') {
    client.onTxNotification((params) => {
      console.log(JSON.stringify(params.result, null, 2))
    })
  }

  if (mode === 'all' || mode === 'contract') {
    client.onContractEventNotification((params) => {
      console.log(JSON.stringify(params.result, null, 2))
    })
  }

  client.on('error', (error) => {
    console.error('websocket error:', error)
  })

  client.on('disconnected', () => {
    console.log('disconnected')
  })

  await waitForConnection(client)
  console.log('connected')

  if (mode === 'all' || mode === 'block') {
    const blockSubscriptionId = await client.subscribeToBlock()
    console.log(`subscribed to blocks: ${blockSubscriptionId}`)
  }

  if (mode === 'all' || mode === 'tx') {
    const txSubscriptionId = await client.subscribeToTx()
    console.log(`subscribed to txs: ${txSubscriptionId}`)
  }

  if (mode === 'all' || mode === 'contract') {
    if (contractAddresses.length === 0) {
      throw new Error(
        'Set CONTRACT_ADDRESSES to a comma-separated list of contract addresses before using ws:listen:contract'
      )
    }

    const contractSubscriptionId =
      contractEventIndex === undefined
        ? await client.subscribeToContractEvents(contractAddresses)
        : await client.subscribeToFilteredContractEvents(contractEventIndex, contractAddresses)

    console.log(`subscribed to contract events: ${contractSubscriptionId}`)
    console.log(`contract addresses: ${contractAddresses.join(', ')}`)
    if (contractEventIndex !== undefined) {
      console.log(`contract event index: ${contractEventIndex}`)
    }
  }

  const shutdown = () => {
    client.disconnect()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

function parseMode(value: string | undefined): ListenMode {
  switch (value) {
    case undefined:
    case 'all':
    case 'block':
    case 'tx':
    case 'contract':
      return value ?? 'all'
    default:
      throw new Error(`Invalid listen mode: ${value}`)
  }
}

function parseAddresses(value: string | undefined): string[] {
  return value === undefined
    ? []
    : value
        .split(',')
        .map((address) => address.trim())
        .filter((address) => address.length > 0)
}

function parseEventIndex(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') {
    return undefined
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    throw new Error(`Invalid CONTRACT_EVENT_INDEX: ${value}`)
  }

  return parsed
}
