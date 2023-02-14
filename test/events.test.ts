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

import { Project } from '../packages/web3'
import { NodeWallet } from '../packages/web3-wallet'
import { SubscribeOptions, timeout } from '../packages/web3'
import { web3 } from '../packages/web3'
import { testNodeWallet } from '../packages/web3-test'
import { Sub } from '../artifacts/ts/Sub'
import { Add, AddInstance } from '../artifacts/ts/Add'
import { Main } from '../artifacts/ts/scripts'

describe('events', function () {
  let signer: NodeWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    signer = await testNodeWallet()
    // ignore unused private function warnings
    await Project.build({ errorOnWarnings: false })
  })

  async function deployContract(signer: NodeWallet): Promise<AddInstance> {
    const sub = await Sub.factory.deploy(signer, { initialFields: { result: 0n } })
    return (await Add.factory.deploy(signer, { initialFields: { sub: sub.contractId, result: 0n } })).instance
  }

  it('should subscribe contract events', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<Add.AddEvent> = []
    const subscriptOptions: SubscribeOptions<Add.AddEvent> = {
      pollingInterval: 500,
      messageCallback: (event: Add.AddEvent): Promise<void> => {
        addEvents.push(event)
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }
    const subscription = add.subscribeAddEvent(subscriptOptions)
    for (let i = 0; i < 3; i++) {
      await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    }
    await timeout(3000)

    expect(addEvents.length).toEqual(3)
    addEvents.forEach((event) => {
      expect(event.fields.x).toEqual(2n)
      expect(event.fields.y).toEqual(1n)
    })
    expect(subscription.currentEventCount()).toEqual(addEvents.length)

    subscription.unsubscribe()
  }, 15000)

  it('should subscribe all events', async () => {
    const add = await deployContract(signer)
    type EventTypes = Add.AddEvent | Add.Add1Event | Add.ContractCreatedEvent | Add.ContractDestroyedEvent
    const addEvents: Array<EventTypes> = []
    const subscriptOptions: SubscribeOptions<EventTypes> = {
      pollingInterval: 500,
      messageCallback: (event: EventTypes): Promise<void> => {
        addEvents.push(event)
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }
    const subscription = add.subscribeEvents(subscriptOptions)
    for (let i = 0; i < 3; i++) {
      await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    }
    await timeout(3000)

    const isAdd = (event: EventTypes): event is Add.AddEvent => {
      return (<Add.AddEvent>event).fields.x !== undefined
    }

    const isAdd1 = (event: EventTypes): event is Add.Add1Event => {
      return (<Add.Add1Event>event).fields.a !== undefined
    }

    expect(addEvents.length).toEqual(6)
    addEvents.forEach((event) => {
      if (isAdd(event)) {
        expect(event.fields.x).toEqual(2n)
        expect(event.fields.y).toEqual(1n)
      } else if (isAdd1(event)) {
        expect(event.fields.a).toEqual(2n)
        expect(event.fields.b).toEqual(1n)
      } else {
        expect(false).toEqual(true)
      }
    })
    expect(subscription.currentEventCount()).toEqual(3)

    subscription.unsubscribe()
  })

  it('should cancel event subscription', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<Add.AddEvent> = []
    const subscriptOptions: SubscribeOptions<Add.AddEvent> = {
      pollingInterval: 500,
      messageCallback: (event: Add.AddEvent): Promise<void> => {
        addEvents.push(event)
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }
    const subscription = add.subscribeAddEvent(subscriptOptions)
    const scriptTx0 = await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    await timeout(1500)
    subscription.unsubscribe()

    expect(addEvents.length).toEqual(1)
    expect(addEvents[0].txId).toEqual(scriptTx0.txId)
    expect(addEvents[0].fields.x).toEqual(2n)
    expect(addEvents[0].fields.y).toEqual(1n)
    expect(subscription.currentEventCount()).toEqual(addEvents.length)

    await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    await timeout(1500)
    expect(addEvents.length).toEqual(1)
  })
})
