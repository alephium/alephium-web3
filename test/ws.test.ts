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
  subscribeContractCreatedEventWS,
  subscribeContractDestroyedEventWS,
  TOTAL_NUMBER_OF_GROUPS
} from '../packages/web3'
import { WsSubscribeOptions, sleep } from '../packages/web3'
import { web3 } from '../packages/web3'
import { Sub } from '../artifacts/ts/Sub'
import { Add, AddTypes, AddInstance } from '../artifacts/ts/Add'
import { AddMain, DestroyAdd } from '../artifacts/ts/scripts'
import { CreateContractEventAddresses, DestroyContractEventAddresses } from '../packages/web3'
import { ContractCreatedEvent } from '../packages/web3'
import { ContractDestroyedEvent } from '../packages/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { getSigner } from '@alephium/web3-test'

describe('events', function () {
  const nodeUrl = 'http://127.0.0.1:22973'
  let signer: PrivateKeyWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider(nodeUrl, undefined, fetch)
    signer = await getSigner()
  })

  async function deployContract(signer: PrivateKeyWallet): Promise<AddInstance> {
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n } })
    return (await Add.deploy(signer, { initialFields: { sub: sub.contractInstance.contractId, result: 0n } }))
      .contractInstance
  }

  function createSubscribeOptions<T>(events: Array<T>): WsSubscribeOptions<T> {
    return {
      nodeUrl,
      messageCallback: (event: T) => {
        events.push(event)
      },
      errorCallback: (error: any) => {
        console.log(error)
      }
    }
  }

  it('should subscribe contract events', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddTypes.AddEvent> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = await add.subscribeAddEventWS(subscribeOptions)
    for (let i = 0; i < 3; i++) {
      await AddMain.execute({ signer, initialFields: { add: add.contractId, array: [2n, 1n] } })
    }
    await sleep(3000)

    expect(addEvents.length).toEqual(3)
    addEvents.forEach((event) => {
      expect(event.fields.x).toEqual(2n)
      expect(event.fields.y).toEqual(1n)
    })
    const currentContractEventsCount = await add.getContractEventsCurrentCount()
    expect(currentContractEventsCount).toEqual(addEvents.length)
    await subscription.unsubscribe()
  }, 15000)

  it('should subscribe all events', async () => {
    const add = await deployContract(signer)
    type EventTypes = AddTypes.AddEvent | AddTypes.Add1Event | AddTypes.EmptyEvent
    const addEvents: Array<EventTypes> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = await add.subscribeAllEventsWS(subscribeOptions)
    for (let i = 0; i < 3; i++) {
      await AddMain.execute({ signer, initialFields: { add: add.contractId, array: [2n, 1n] } })
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
    await subscription.unsubscribe()
  })

  it('should cancel event subscription', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddTypes.AddEvent> = []
    const subscribeOptions = createSubscribeOptions(addEvents)
    const subscription = await add.subscribeAddEventWS(subscribeOptions)
    const scriptTx0 = await AddMain.execute({ signer, initialFields: { add: add.contractId, array: [2n, 1n] } })
    await sleep(1500)
    await subscription.unsubscribe()

    expect(addEvents.length).toEqual(1)
    expect(addEvents[0].txId).toEqual(scriptTx0.txId)
    expect(addEvents[0].fields.x).toEqual(2n)
    expect(addEvents[0].fields.y).toEqual(1n)

    await AddMain.execute({ signer, initialFields: { add: add.contractId, array: [2n, 1n] } })
    await sleep(1500)
    expect(addEvents.length).toEqual(1)
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
    const subscription = await subscribeContractCreatedEventWS(subscribeOptions, signer.group)
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n } })
    await sleep(1500)
    await subscription.unsubscribe()

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
    const subscription = await subscribeContractDestroyedEventWS(subscribeOptions, signer.group)

    const caller = (await signer.getSelectedAccount()).address
    await DestroyAdd.execute({ signer, initialFields: { add: add.contractId, caller } })

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
})
