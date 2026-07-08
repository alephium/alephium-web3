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

import {
  ONE_ALPH,
  SignTransferTxResult,
  waitForTxConfirmation,
  web3,
  WebSocketClient
} from '../packages/web3'
import {  PrivateKeyWallet } from '@alephium/web3-wallet'
import { getSigner, randomContractAddress } from '@alephium/web3-test'

const NODE_PROVIDER = 'http://127.0.0.1:22973'
const WS_ENDPOINT = 'ws://127.0.0.1:22973/ws'

describe('WebSocketClient', () => {
  let client: WebSocketClient
  let signer: PrivateKeyWallet

  async function signAndSubmitTx(): Promise<SignTransferTxResult> {
    const address = (await signer.getSelectedAccount()).address

    return signer.signAndSubmitTransferTx({
      signerAddress: address,
      destinations: [{ address, attoAlphAmount: ONE_ALPH }]
    })
  }

  beforeAll(async () => {
    web3.setCurrentNodeProvider(NODE_PROVIDER, undefined, fetch)
    signer = await getSigner()
    client = new WebSocketClient(WS_ENDPOINT)
  })

  afterAll(() => {
    client.disconnect()
  })

  test('should subscribe, receive block and tx notifications, then unsubscribe', async () => {
    await waitForConnection(client)

    const blockSubscriptionId = await client.subscribeToBlock()
    const txSubscriptionId = await client.subscribeToTx()
    const contractEventsSubscriptionId = await client.subscribeToContractEvents([
      randomContractAddress()
    ])

    const notificationsPromise = waitForNotifications(client, {
      block: true,
      tx: true
    })

    const ret  = await signAndSubmitTx()

    await waitForTxConfirmation(ret.txId, 1, 1000)

    const result = await notificationsPromise

    expect(result.block).toBe(true)
    expect(result.tx).toBe(true)

    await expect(client.unsubscribe(blockSubscriptionId)).resolves.toBe(true)
    await expect(client.unsubscribe(txSubscriptionId)).resolves.toBe(true)
    await expect(client.unsubscribe(contractEventsSubscriptionId)).resolves.toBe(true)
  }, 20_000)
})

function waitForConnection(client: WebSocketClient): Promise<void> {
  return new Promise((resolve) => {
    client.onConnected(resolve)
  })
}

function waitForNotifications(
  client: WebSocketClient,
  expected: { block?: boolean; tx?: boolean }
): Promise<{ block: boolean; tx: boolean }> {
  return new Promise((resolve, reject) => {
    let block = false
    let tx = false

    const timeout = setTimeout(() => {
      reject(
        new Error(
          `Timeout waiting for notifications. Received: block=${block}, tx=${tx}`
        )
      )
    }, 20_000)

    client.onNotification((params) => {

      if (params.result?.block !== undefined) {
        block = true
      }

      if (params.result?.unsigned !== undefined) {
        tx = true
      }

      const hasExpectedBlock = expected.block ? block : true
      const hasExpectedTx = expected.tx ? tx : true

      if (hasExpectedBlock && hasExpectedTx) {
        clearTimeout(timeout)
        resolve({ block, tx })
      }
    })
  })
}
