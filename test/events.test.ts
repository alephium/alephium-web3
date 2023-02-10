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
import { Sub } from '../.generated/Sub'
import { Add, AddAdd, AddAdd1 } from '../.generated/Add'
import { Main } from '../.generated/scripts'

describe('events', function () {
  let signer: NodeWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    signer = await testNodeWallet()
    // ignore unused private function warnings
    await Project.build({ errorOnWarnings: false })
  })

  async function deployContract(signer: NodeWallet): Promise<Add> {
    const sub = await Sub.deploy(signer, 0n)
    return await Add.deploy(signer, sub.contractId, 0n)
  }

  it('should subscribe contract events', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddAdd> = []
    const subscriptOptions: SubscribeOptions<AddAdd> = {
      pollingInterval: 500,
      messageCallback: (event: AddAdd): Promise<void> => {
        addEvents.push(event)
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }
    const subscription = add.subscribeAdd(subscriptOptions)
    for (let i = 0; i < 3; i++) {
      await Main.execute(signer, add.contractId)
    }
    await timeout(3000)

    expect(addEvents.length).toEqual(3)
    addEvents.forEach((event) => {
      expect(event.x).toEqual(2n)
      expect(event.y).toEqual(1n)
    })
    expect(subscription.currentEventCount()).toEqual(addEvents.length)

    subscription.unsubscribe()
  }, 15000)

  it('should subscribe all events', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddAdd | AddAdd1> = []
    const subscriptOptions: SubscribeOptions<AddAdd | AddAdd1> = {
      pollingInterval: 500,
      messageCallback: (event: AddAdd | AddAdd1): Promise<void> => {
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
      await Main.execute(signer, add.contractId)
    }
    await timeout(3000)

    const isAdd = (event: AddAdd | AddAdd1): event is AddAdd => {
      return (<AddAdd>event).x !== undefined
    }

    expect(addEvents.length).toEqual(6)
    addEvents.forEach((event) => {
      if (isAdd(event)) {
        expect(event.x).toEqual(2n)
        expect(event.y).toEqual(1n)
      } else {
        expect(event.a).toEqual(2n)
        expect(event.b).toEqual(1n)
      }
    })
    expect(subscription.currentEventCount()).toEqual(3)

    subscription.unsubscribe()
  })

  it('should cancel event subscription', async () => {
    const add = await deployContract(signer)
    const addEvents: Array<AddAdd> = []
    const subscriptOptions: SubscribeOptions<AddAdd> = {
      pollingInterval: 500,
      messageCallback: (event: AddAdd): Promise<void> => {
        addEvents.push(event)
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }
    const subscription = add.subscribeAdd(subscriptOptions)
    const scriptTx0 = await Main.execute(signer, add.contractId)
    await timeout(1500)
    subscription.unsubscribe()

    expect(addEvents.length).toEqual(1)
    expect(addEvents[0].txId).toEqual(scriptTx0.txId)
    expect(addEvents[0].x).toEqual(2n)
    expect(addEvents[0].y).toEqual(1n)
    expect(subscription.currentEventCount()).toEqual(addEvents.length)

    await Main.execute(signer, add.contractId)
    await timeout(1500)
    expect(addEvents.length).toEqual(1)
  })
})
