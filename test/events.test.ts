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
  Contract,
  getContractEventsCurrentCount,
  contractIdFromAddress,
  TOTAL_NUMBER_OF_GROUPS
} from '../packages/web3'
import { EventSubscribeOptions, sleep } from '../packages/web3'
import { web3 } from '../packages/web3'
import { Sub } from '../artifacts/ts/Sub'
import { Add, AddTypes, AddInstance } from '../artifacts/ts/Add'
import { AddMain, DestroyAdd } from '../artifacts/ts/scripts'
import { CreateContractEventAddresses, DestroyContractEventAddresses } from '../packages/web3'
import { ContractCreatedEvent, subscribeContractCreatedEvent } from '../packages/web3'
import { ContractDestroyedEvent, subscribeContractDestroyedEvent } from '../packages/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { getSigner } from '@alephium/web3-test'

describe('events', function () {
  let signer: PrivateKeyWallet
  let eventCount: number

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    signer = await getSigner()
  })

  beforeEach(() => {
    eventCount = 0
  })

  async function deployContract(signer: PrivateKeyWallet): Promise<AddInstance> {
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n } })
    return (await Add.deploy(signer, { initialFields: { sub: sub.contractInstance.contractId, result: 0n } }))
      .contractInstance
  }

  function createSubscribeOptions<T>(events: Array<T>): EventSubscribeOptions<T> {
    return {
      pollingInterval: 500,
      messageCallback: (event: T) => {
        events.push(event)
      },
      errorCallback: (error: any, subscription) => {
        console.log(error)
        subscription.unsubscribe()
      },
      onEventCountChanged: (count: number) => {
        eventCount = count
      }
    }
  }

  it('should subscribe contract events', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddTypes.AddEvent> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = add.subscribeAddEvent(subscribeOptions)
    for (let i = 0; i < 3; i++) {
      await AddMain.execute(signer, { initialFields: { add: add.contractId, array: [2n, 1n] } })
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
    expect(eventCount).toEqual(3)

    subscription.unsubscribe()
  }, 15000)

  it('should subscribe all events', async () => {
    const add = await deployContract(signer)
    type EventTypes = AddTypes.AddEvent | AddTypes.Add1Event | AddTypes.EmptyEvent
    const addEvents: Array<EventTypes> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = add.subscribeAllEvents(subscribeOptions)
    for (let i = 0; i < 3; i++) {
      await AddMain.execute(signer, { initialFields: { add: add.contractId, array: [2n, 1n] } })
    }
    await sleep(3000)

    const isAdd = (event: EventTypes): event is AddTypes.AddEvent => {
      return (<AddTypes.AddEvent>event).fields.x !== undefined
    }

    const isAdd1 = (event: EventTypes): event is AddTypes.Add1Event => {
      return (<AddTypes.Add1Event>event).fields.a !== undefined
    }

    const isEmpty = (event: EventTypes): event is AddTypes.EmptyEvent => {
      return Object.keys((<AddTypes.EmptyEvent>event).fields).length === 0
    }

    expect(addEvents.length).toEqual(9)
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
      } else if (isEmpty(event)) {
        expect(event.fields).toEqual({})
        expect(event.name).toEqual('Empty')
        expect(event.eventIndex).toEqual(2)
      } else {
        expect(false).toEqual(true)
      }
    })
    expect(subscription.currentEventCount()).toEqual(3)
    expect(eventCount).toEqual(3)

    subscription.unsubscribe()
  })

  it('should cancel event subscription', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddTypes.AddEvent> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = add.subscribeAddEvent(subscribeOptions)
    const scriptTx0 = await AddMain.execute(signer, { initialFields: { add: add.contractId, array: [2n, 1n] } })
    await sleep(1500)
    expect(eventCount).toEqual(1)
    subscription.unsubscribe()

    expect(addEvents.length).toEqual(1)
    expect(addEvents[0].txId).toEqual(scriptTx0.txId)
    expect(addEvents[0].fields.x).toEqual(2n)
    expect(addEvents[0].fields.y).toEqual(1n)
    expect(subscription.currentEventCount()).toEqual(addEvents.length)

    await AddMain.execute(signer, { initialFields: { add: add.contractId, array: [2n, 1n] } })
    await sleep(1500)
    expect(eventCount).toEqual(1)
    expect(addEvents.length).toEqual(1)
  })

  it('should test special contract address', () => {
    CreateContractEventAddresses.forEach((address, groupIndex) => {
      const bytes = contractIdFromAddress(address)
      expect(bytes.slice(0, 30)).toEqual(new Uint8Array(30))
      expect(bytes.slice(30, 31)).toEqual(new Uint8Array([Contract.ContractCreatedEventIndex]))
      expect(bytes[31]).toEqual(groupIndex)
    })

    DestroyContractEventAddresses.forEach((address, groupIndex) => {
      const bytes = contractIdFromAddress(address)
      expect(bytes.slice(0, 30)).toEqual(new Uint8Array(30))
      expect(bytes.slice(30, 31)).toEqual(new Uint8Array([Contract.ContractDestroyedEventIndex]))
      expect(bytes[31]).toEqual(groupIndex)
    })
  })

  it('should subscribe contract created events', async () => {
    const events: Array<ContractCreatedEvent> = []
    const subscribeOptions = createSubscribeOptions(events)
    const groups = Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys())
    const contractEvents0 = await Promise.all(
      groups.map((g) => {
        const createContractEventAddress = CreateContractEventAddresses[`${g}`]
        return getContractEventsCurrentCount(createContractEventAddress)
      })
    )
    const subscription = subscribeContractCreatedEvent(
      subscribeOptions,
      signer.group,
      contractEvents0[`${signer.group}`]
    )
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n } })
    await sleep(1500)
    subscription.unsubscribe()

    expect(events.length).toEqual(1)
    expect(events[0].eventIndex).toEqual(Contract.ContractCreatedEventIndex)
    expect(events[0].name).toEqual(Contract.ContractCreatedEvent.name)
    expect(events[0].fields.address).toEqual(sub.contractInstance.address)
    expect(events[0].fields.parentAddress).toEqual(undefined)
    expect(events[0].fields.stdInterfaceIdGuessed).toEqual(undefined)

    const contractEvents1 = await Promise.all(
      groups.map((g) => {
        const createContractEventAddress = CreateContractEventAddresses[`${g}`]
        return getContractEventsCurrentCount(createContractEventAddress)
      })
    )
    contractEvents1.forEach((count, groupIndex) => {
      if (groupIndex === signer.group) {
        expect(count).toEqual(contractEvents0[`${groupIndex}`] + 1)
      } else {
        expect(count).toEqual(contractEvents0[`${groupIndex}`])
      }
    })
  })

  it('should subscribe contract destroyed events', async () => {
    const add = await deployContract(signer)
    const events: Array<ContractDestroyedEvent> = []
    const subscribeOptions = createSubscribeOptions(events)
    const groups = Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys())
    const contractEvents0 = await Promise.all(
      groups.map((g) => {
        const destroyContractEventAddress = DestroyContractEventAddresses[`${g}`]
        return getContractEventsCurrentCount(destroyContractEventAddress)
      })
    )
    const subscription = subscribeContractDestroyedEvent(
      subscribeOptions,
      signer.group,
      contractEvents0[`${signer.group}`]
    )

    const caller = (await signer.getSelectedAccount()).address
    await DestroyAdd.execute(signer, { initialFields: { add: add.contractId, caller } })

    await sleep(1500)
    subscription.unsubscribe()

    expect(events.length).toEqual(1)
    expect(events[0].eventIndex).toEqual(Contract.ContractDestroyedEventIndex)
    expect(events[0].name).toEqual(Contract.ContractDestroyedEvent.name)
    expect(events[0].fields.address).toEqual(add.address)

    const contractEvents1 = await Promise.all(
      groups.map((g) => {
        const destroyContractEventAddress = DestroyContractEventAddresses[`${g}`]
        return getContractEventsCurrentCount(destroyContractEventAddress)
      })
    )
    contractEvents1.forEach((count, groupIndex) => {
      if (groupIndex === signer.group) {
        expect(count).toEqual(contractEvents0[`${groupIndex}`] + 1)
      } else {
        expect(count).toEqual(contractEvents0[`${groupIndex}`])
      }
    })
  })

  it('should check group index', () => {
    const events: Array<ContractCreatedEvent> = []
    const subscribeOptions = createSubscribeOptions(events)
    for (let groupIndex = 0; groupIndex < TOTAL_NUMBER_OF_GROUPS; groupIndex += 1) {
      const subscription0 = subscribeContractCreatedEvent(subscribeOptions, groupIndex)
      subscription0.unsubscribe()
      const subscription1 = subscribeContractDestroyedEvent(subscribeOptions, groupIndex)
      subscription1.unsubscribe()
    }

    expect(() => subscribeContractCreatedEvent(subscribeOptions, -1)).toThrow(
      'Invalid group index -1, expected a value within the range [0, 4)'
    )
    expect(() => subscribeContractCreatedEvent(subscribeOptions, 4)).toThrow(
      'Invalid group index 4, expected a value within the range [0, 4)'
    )
    expect(() => subscribeContractDestroyedEvent(subscribeOptions, -1)).toThrow(
      'Invalid group index -1, expected a value within the range [0, 4)'
    )
    expect(() => subscribeContractDestroyedEvent(subscribeOptions, 4)).toThrow(
      'Invalid group index 4, expected a value within the range [0, 4)'
    )
  })
})
