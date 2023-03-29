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

import { Project, Contract, getContractEventsCurrentCount } from '../packages/web3'
import { NodeWallet } from '../packages/web3-wallet'
import { SubscribeOptions, sleep } from '../packages/web3'
import { web3 } from '../packages/web3'
import { testNodeWallet } from '../packages/web3-test'
import { Sub } from '../artifacts/ts/Sub'
import { Add, AddTypes, AddInstance } from '../artifacts/ts/Add'
import { Main, DestroyAdd } from '../artifacts/ts/scripts'
import { CreateContractEventAddress, DestroyContractEventAddress } from '../packages/web3'
import { ContractCreatedEvent, subscribeContractCreatedEvent } from '../packages/web3'
import { ContractDestroyedEvent, subscribeContractDestroyedEvent } from '../packages/web3'

describe('events', function () {
  let signer: NodeWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    signer = await testNodeWallet()
    // ignore unused private function warnings
    await Project.build({ errorOnWarnings: false })
  })

  async function deployContract(signer: NodeWallet): Promise<AddInstance> {
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n } })
    return (await Add.deploy(signer, { initialFields: { sub: sub.contractId, result: 0n } })).instance
  }

  function createSubscribeOptions<T>(events: Array<T>): SubscribeOptions<T> {
    return {
      pollingInterval: 500,
      messageCallback: (event: T): Promise<void> => {
        events.push(event)
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }
  }

  it('should subscribe contract events', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddTypes.AddEvent> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = add.subscribeAddEvent(subscribeOptions)
    for (let i = 0; i < 3; i++) {
      await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    }
    await sleep(3000)

    expect(addEvents.length).toEqual(3)
    addEvents.forEach((event) => {
      expect(event.fields.x).toEqual(2n)
      expect(event.fields.y).toEqual(1n)
    })
    expect(subscription.currentEventCount()).toEqual(addEvents.length)
    const currentContractEventsCount = await add.getContractEventsCurrentCount()
    expect(currentContractEventsCount).toEqual(addEvents.length)

    subscription.unsubscribe()
  }, 15000)

  it('should subscribe all events', async () => {
    const add = await deployContract(signer)
    type EventTypes = AddTypes.AddEvent | AddTypes.Add1Event
    const addEvents: Array<EventTypes> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = add.subscribeAllEvents(subscribeOptions)
    for (let i = 0; i < 3; i++) {
      await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    }
    await sleep(3000)

    const isAdd = (event: EventTypes): event is AddTypes.AddEvent => {
      return (<AddTypes.AddEvent>event).fields.x !== undefined
    }

    const isAdd1 = (event: EventTypes): event is AddTypes.Add1Event => {
      return (<AddTypes.Add1Event>event).fields.a !== undefined
    }

    expect(addEvents.length).toEqual(6)
    addEvents.forEach((event) => {
      if (isAdd(event)) {
        expect(event.fields.x).toEqual(2n)
        expect(event.fields.y).toEqual(1n)
        expect(event.name).toEqual('Add')
        expect(event.eventIndex).toEqual(0)
      } else if (isAdd1(event)) {
        expect(event.fields.a).toEqual(2n)
        expect(event.fields.b).toEqual(1n)
        expect(event.name).toEqual('Add1')
        expect(event.eventIndex).toEqual(1)
      } else {
        expect(false).toEqual(true)
      }
    })
    expect(subscription.currentEventCount()).toEqual(3)

    subscription.unsubscribe()
  })

  it('should cancel event subscription', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddTypes.AddEvent> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = add.subscribeAddEvent(subscribeOptions)
    const scriptTx0 = await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    await sleep(1500)
    subscription.unsubscribe()

    expect(addEvents.length).toEqual(1)
    expect(addEvents[0].txId).toEqual(scriptTx0.txId)
    expect(addEvents[0].fields.x).toEqual(2n)
    expect(addEvents[0].fields.y).toEqual(1n)
    expect(subscription.currentEventCount()).toEqual(addEvents.length)

    await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    await sleep(1500)
    expect(addEvents.length).toEqual(1)
  })

  it('should test special contract address', () => {
    expect(CreateContractEventAddress).toEqual('tgx7VNFoP9DJiFMFgXXtafQZkUvyEdDHT9ryamHJYrpE')
    expect(DestroyContractEventAddress).toEqual('tgx7VNFoP9DJiFMFgXXtafQZkUvyEdDHT9ryamHJYrpD')
  })

  it('should subscribe contract created events', async () => {
    const events: Array<ContractCreatedEvent> = []
    const subscribeOptions = createSubscribeOptions(events)
    const currentEventCount = await getContractEventsCurrentCount(CreateContractEventAddress)
    const subscription = subscribeContractCreatedEvent(subscribeOptions, currentEventCount)
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n } })
    await sleep(1500)
    subscription.unsubscribe()

    expect(events.length).toEqual(1)
    expect(events[0].eventIndex).toEqual(Contract.ContractCreatedEventIndex)
    expect(events[0].name).toEqual(Contract.ContractCreatedEvent.name)
    expect(events[0].fields.address).toEqual(sub.instance.address)
    expect(events[0].fields.parentAddress).toEqual(undefined)
    expect(events[0].fields.stdId).toEqual(undefined)
  })

  it('should subscribe contract destroyed events', async () => {
    const add = await deployContract(signer)
    const events: Array<ContractDestroyedEvent> = []
    const subscribeOptions = createSubscribeOptions(events)
    const currentContractEventsCount = await getContractEventsCurrentCount(DestroyContractEventAddress)
    const subscription = subscribeContractDestroyedEvent(subscribeOptions, currentContractEventsCount)

    const caller = (await signer.getSelectedAccount()).address
    await DestroyAdd.execute(signer, { initialFields: { add: add.contractId, caller } })

    await sleep(1500)
    subscription.unsubscribe()

    expect(events.length).toEqual(1)
    expect(events[0].eventIndex).toEqual(Contract.ContractDestroyedEventIndex)
    expect(events[0].name).toEqual(Contract.ContractDestroyedEvent.name)
    expect(events[0].fields.address).toEqual(add.address)
  })
})
