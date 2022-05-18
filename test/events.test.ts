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

import { CliqueClient } from '../src/clique'
import { subscribe, Subscription } from '../src/events'
import { Contract, Script } from '../src/contract'
import { NodeWallet, SignScriptTxParams } from '../src/signer'
import * as api from '../api/api-alephium'
import { testAddress, testWallet } from './wallet'

describe('events', function () {
  async function deployContract(client: CliqueClient, signer: NodeWallet): Promise<[string, string]> {
    const sub = await Contract.fromSource(client, 'sub.ral')
    const subDeployTx = await sub.transactionForDeployment(signer, { initialFields: [0] })
    const subContractId = subDeployTx.contractId
    const subSubmitResult = await signer.submitTransaction(subDeployTx.unsignedTx, subDeployTx.txId, testAddress)
    expect(subSubmitResult.txId).toEqual(subDeployTx.txId)

    const add = await Contract.fromSource(client, 'add.ral')
    const addDeployTx = await add.transactionForDeployment(signer, { initialFields: [subContractId, 0] })
    const addSubmitResult = await signer.submitTransaction(addDeployTx.unsignedTx, addDeployTx.txId, testAddress)
    expect(addSubmitResult.txId).toEqual(addDeployTx.txId)
    return [addDeployTx.contractAddress, addDeployTx.contractId]
  }

  async function executeScript(params: SignScriptTxParams, signer: NodeWallet, times: number) {
    for (let i = 0; i < times; i++) {
      const scriptTx = await signer.buildScriptTx(params)
      await signer.submitTransaction(scriptTx.unsignedTx, scriptTx.txId, testAddress)
    }
  }

  it('should subscribe contract events', async () => {
    const client = new CliqueClient({ baseUrl: 'http://127.0.0.1:22973' })
    await client.init(false)
    const signer = await testWallet(client)

    const [contractAddress, contractId] = await deployContract(client, signer)
    const events: Array<api.ContractEvent> = []
    const subscriptOptions = {
      client: client,
      contractAddress: contractAddress,
      pollingInterval: 500,
      eventCallback: (event: api.ContractEvent): Promise<void> => {
        events.push(event)
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription: Subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }
    const subscription = subscribe(subscriptOptions)
    const script = await Script.fromSource(client, 'main.ral')
    const scriptTxParams = await script.paramsForDeployment({
      templateVariables: { addContractId: contractId },
      signerAddress: (await signer.getAccounts())[0].address
    })
    await executeScript(scriptTxParams, signer, 3)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    expect(events.length).toEqual(3)
    events.forEach((event) => {
      expect(event.contractAddress).toEqual(contractAddress)
      expect(event.fields).toEqual([
        { type: 'U256', value: '2' },
        { type: 'U256', value: '1' }
      ])
    })
    expect(subscription.currentEventCount()).toEqual(events.length)

    subscription.unsubscribe()
  })

  it('should cancel event subscription', async () => {
    const client = new CliqueClient({ baseUrl: 'http://127.0.0.1:22973' })
    await client.init(false)
    const signer = await testWallet(client)

    const [contractAddress, contractId] = await deployContract(client, signer)
    const events: Array<api.ContractEvent> = []
    const subscriptOptions = {
      client: client,
      contractAddress: contractAddress,
      pollingInterval: 500,
      eventCallback: (event: api.ContractEvent): Promise<void> => {
        events.push(event)
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription: Subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }
    const subscription = subscribe(subscriptOptions)
    const script = await Script.fromSource(client, 'main.ral')
    const scriptTx0 = await script.transactionForDeployment(signer, {
      templateVariables: { addContractId: contractId }
    })
    await signer.submitTransaction(scriptTx0.unsignedTx, scriptTx0.txId, testAddress)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    subscription.unsubscribe()

    expect(events.length).toEqual(1)
    expect(events[0].contractAddress).toEqual(contractAddress)
    expect(events[0].fields).toEqual([
      { type: 'U256', value: '2' },
      { type: 'U256', value: '1' }
    ])
    expect(subscription.currentEventCount()).toEqual(events.length)

    const scriptTx1 = await script.transactionForDeployment(signer, {
      templateVariables: { addContractId: contractId }
    })
    await signer.submitTransaction(scriptTx1.unsignedTx, scriptTx1.txId, testAddress)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    expect(events.length).toEqual(1)
  })
})
