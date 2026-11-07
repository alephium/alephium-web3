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

import { vi } from 'vitest'
import type { NodeProvider } from '../api'
import type { ContractEvent, ContractEvents } from '../api/api-alephium'
import * as web3 from '../global'
import { BatchedEventSubscription, EventSubscription, subscribeToEventBatches, subscribeToEvents } from './events'

const address = 'test-contract'
const events: ContractEvent[] = [0, 1, 2].map((eventIndex) => ({
  blockHash: 'block',
  txId: 'transaction',
  timestamp: 1,
  contractAddress: address,
  eventIndex,
  fields: []
}))

function deferred<T = void>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe('event subscriptions', () => {
  const getEvents = vi.fn<(address: string, params: { start: number }) => Promise<ContractEvents>>()

  beforeEach(() => {
    getEvents.mockReset()
    getEvents.mockImplementation((_address, { start }) => Promise.resolve({ events: [], nextStart: start }))
    vi.spyOn(web3, 'getCurrentNodeProvider').mockReturnValue({
      events: { getEventsContractContractaddress: getEvents }
    } as unknown as NodeProvider)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('delivers one ordered batch per page and follows the node cursor from a nonzero start', async () => {
    const messageCallback = vi.fn()
    const onEventCountChanged = vi.fn()
    const errorCallback = vi.fn()
    getEvents
      .mockResolvedValueOnce({ events: events.slice(0, 2), nextStart: 13 })
      .mockResolvedValueOnce({ events: events.slice(2), nextStart: 20 })
    const subscription = new BatchedEventSubscription(
      { pollingInterval: 100, messageCallback, errorCallback, onEventCountChanged },
      address,
      10
    )

    await subscription.polling()

    expect(messageCallback.mock.calls).toEqual([[events.slice(0, 2)], [events.slice(2)]])
    expect(getEvents.mock.calls).toEqual([
      [address, { start: 10 }],
      [address, { start: 13 }],
      [address, { start: 20 }]
    ])
    expect(onEventCountChanged.mock.calls).toEqual([[13], [20]])
    expect(subscription.currentEventCount()).toBe(20)
    expect(subscription.contractAddress).toBe(address)
    expect(errorCallback).not.toHaveBeenCalled()
  })

  it('awaits the complete batch before committing its cursor or requesting another page', async () => {
    const entered = deferred()
    const completed = deferred()
    const onEventCountChanged = vi.fn()
    const messageCallback = vi.fn(() => {
      entered.resolve()
      return completed.promise
    })
    getEvents.mockResolvedValueOnce({ events, nextStart: 4 })
    const subscription = new BatchedEventSubscription(
      { pollingInterval: 100, messageCallback, errorCallback: vi.fn(), onEventCountChanged },
      address
    )

    const polling = subscription.polling()
    await entered.promise
    expect(messageCallback).toHaveBeenCalledExactlyOnceWith(events)
    expect(subscription.currentEventCount()).toBe(0)
    expect(onEventCountChanged).not.toHaveBeenCalled()
    expect(getEvents).toHaveBeenCalledTimes(1)

    completed.resolve()
    await polling
    expect(subscription.currentEventCount()).toBe(4)
    expect(onEventCountChanged).toHaveBeenCalledExactlyOnceWith(4)
    expect(getEvents).toHaveBeenLastCalledWith(address, { start: 4 })
  })

  describe.each([
    ['individual', EventSubscription],
    ['batched', BatchedEventSubscription]
  ] as const)('%s compatibility', (_name, SubscriptionClass) => {
    function createSubscription(fromCount?: number) {
      const options = {
        pollingInterval: 100,
        messageCallback: vi.fn(),
        errorCallback: vi.fn(),
        onEventCountChanged: vi.fn()
      }
      return { options, subscription: new SubscriptionClass(options, address, fromCount) }
    }

    it('does not deliver empty pages, but commits an advanced node cursor', async () => {
      const { subscription, options } = createSubscription()
      getEvents.mockResolvedValueOnce({ events: [], nextStart: 2 })
      await subscription.polling()
      expect(options.messageCallback).not.toHaveBeenCalled()
      expect(options.onEventCountChanged).toHaveBeenCalledExactlyOnceWith(2)
      expect(subscription.currentEventCount()).toBe(2)
      expect(getEvents).toHaveBeenCalledTimes(2)
    })

    it('waits for the count callback before fetching the next page', async () => {
      const { subscription, options } = createSubscription()
      const entered = deferred()
      const completed = deferred()
      options.onEventCountChanged.mockImplementation(() => {
        entered.resolve()
        return completed.promise
      })
      getEvents.mockResolvedValueOnce({ events: [events[0]], nextStart: 2 })

      const polling = subscription.polling()
      await entered.promise
      expect(subscription.currentEventCount()).toBe(2)
      expect(getEvents).toHaveBeenCalledTimes(1)
      completed.resolve()
      await polling
      expect(getEvents).toHaveBeenLastCalledWith(address, { start: 2 })
    })

    it('reports a rejected message callback and retries from the uncommitted cursor', async () => {
      const { subscription, options } = createSubscription(5)
      const error = new Error('transaction rolled back')
      options.messageCallback.mockRejectedValueOnce(error)
      getEvents
        .mockResolvedValueOnce({ events: [events[0]], nextStart: 8 })
        .mockResolvedValueOnce({ events: [events[0]], nextStart: 8 })

      await subscription.polling()
      expect(options.errorCallback).toHaveBeenCalledExactlyOnceWith(error, subscription)
      expect(subscription.currentEventCount()).toBe(5)
      expect(options.onEventCountChanged).not.toHaveBeenCalled()

      await subscription.polling()
      expect(getEvents.mock.calls.map(([, params]) => params.start)).toEqual([5, 5, 8])
      expect(options.messageCallback).toHaveBeenCalledTimes(2)
      expect(subscription.currentEventCount()).toBe(8)
    })

    it('reports synchronous message failures without committing the cursor', async () => {
      const { subscription, options } = createSubscription()
      const error = new Error('invalid event')
      options.messageCallback.mockImplementationOnce(() => {
        throw error
      })
      getEvents.mockResolvedValueOnce({ events: [events[0]], nextStart: 1 })
      await subscription.polling()
      expect(options.errorCallback).toHaveBeenCalledExactlyOnceWith(error, subscription)
      expect(subscription.currentEventCount()).toBe(0)
      expect(options.onEventCountChanged).not.toHaveBeenCalled()
    })

    it('reports provider failures without advancing or delivering events', async () => {
      const { subscription, options } = createSubscription(5)
      const error = new Error('node unavailable')
      getEvents.mockRejectedValueOnce(error)
      await subscription.polling()
      expect(options.errorCallback).toHaveBeenCalledExactlyOnceWith(error, subscription)
      expect(subscription.currentEventCount()).toBe(5)
      expect(options.messageCallback).not.toHaveBeenCalled()
      expect(options.onEventCountChanged).not.toHaveBeenCalled()
    })

    it('ignores the existing missing-contract response', async () => {
      const { subscription, options } = createSubscription(5)
      getEvents.mockRejectedValueOnce(new Error(`Contract events of ${address} not found`))
      await subscription.polling()
      expect(options.errorCallback).not.toHaveBeenCalled()
      expect(options.messageCallback).not.toHaveBeenCalled()
      expect(options.onEventCountChanged).not.toHaveBeenCalled()
      expect(subscription.currentEventCount()).toBe(5)
    })

    it('keeps the committed cursor if the count callback fails', async () => {
      const { subscription, options } = createSubscription()
      const error = new Error('checkpoint unavailable')
      options.onEventCountChanged.mockRejectedValueOnce(error)
      getEvents.mockResolvedValueOnce({ events: [events[0]], nextStart: 2 })
      await subscription.polling()
      expect(options.errorCallback).toHaveBeenCalledExactlyOnceWith(error, subscription)
      expect(subscription.currentEventCount()).toBe(2)
      expect(getEvents).toHaveBeenCalledTimes(1)
      await subscription.polling()
      expect(getEvents).toHaveBeenLastCalledWith(address, { start: 2 })
      expect(options.messageCallback).toHaveBeenCalledTimes(1)
    })

    it('does not fetch after cancellation or deliver an in-flight response', async () => {
      const { subscription, options } = createSubscription()
      const response = deferred<ContractEvents>()
      getEvents.mockReturnValueOnce(response.promise)
      const polling = subscription.polling()
      subscription.unsubscribe()
      response.resolve({ events, nextStart: 2 })
      await polling
      await subscription.polling()
      expect(subscription.isCancelled()).toBe(true)
      expect(getEvents).toHaveBeenCalledTimes(1)
      expect(options.messageCallback).not.toHaveBeenCalled()
      expect(options.onEventCountChanged).not.toHaveBeenCalled()
      expect(subscription.currentEventCount()).toBe(0)
    })

    it('finishes the accepted page and stops pagination when its callback unsubscribes', async () => {
      const { subscription, options } = createSubscription()
      options.messageCallback.mockImplementation(() => subscription.unsubscribe())
      getEvents.mockResolvedValueOnce({ events: [events[0]], nextStart: 2 })
      await subscription.polling()
      expect(options.messageCallback).toHaveBeenCalledTimes(1)
      expect(options.onEventCountChanged).toHaveBeenCalledExactlyOnceWith(2)
      expect(subscription.currentEventCount()).toBe(2)
      expect(getEvents).toHaveBeenCalledTimes(1)
    })
  })

  it('preserves sequential individual delivery by default', async () => {
    const entered = deferred()
    const completed = deferred()
    const messageCallback = vi.fn((event: ContractEvent) => {
      if (event === events[0]) {
        entered.resolve()
        return completed.promise
      }
    })
    getEvents.mockResolvedValueOnce({ events: events.slice(0, 2), nextStart: 1 })
    const subscription = new EventSubscription(
      { pollingInterval: 100, messageCallback, errorCallback: vi.fn() },
      address
    )

    const polling = subscription.polling()
    await entered.promise
    expect(messageCallback.mock.calls).toEqual([[events[0]]])
    expect(subscription.currentEventCount()).toBe(0)
    completed.resolve()
    await polling
    expect(messageCallback.mock.calls).toEqual([[events[0]], [events[1]]])
    expect(subscription.currentEventCount()).toBe(1)
  })

  it('preserves parallel individual delivery and awaits all callbacks before advancing', async () => {
    const bothEntered = deferred()
    const firstCompleted = deferred()
    const secondCompleted = deferred()
    const messageCallback = vi.fn((event: ContractEvent) => {
      if (event === events[0]) return firstCompleted.promise
      bothEntered.resolve()
      return secondCompleted.promise
    })
    getEvents.mockResolvedValueOnce({ events: events.slice(0, 2), nextStart: 1 })
    const subscription = new EventSubscription(
      { pollingInterval: 100, messageCallback, errorCallback: vi.fn(), parallel: true },
      address
    )

    const polling = subscription.polling()
    await bothEntered.promise
    expect(messageCallback.mock.calls).toEqual([[events[0]], [events[1]]])
    secondCompleted.resolve()
    await secondCompleted.promise
    expect(subscription.currentEventCount()).toBe(0)
    expect(getEvents).toHaveBeenCalledTimes(1)
    firstCompleted.resolve()
    await polling
    expect(subscription.currentEventCount()).toBe(1)
  })

  it.each([
    ['individual', subscribeToEvents],
    ['batched', subscribeToEventBatches]
  ] as const)(
    'starts the %s helper immediately, polls on the interval, and clears its timer',
    async (_name, subscribe) => {
      vi.useFakeTimers()
      const messageCallback = vi.fn()
      getEvents.mockResolvedValueOnce({ events: [events[0]], nextStart: 5 })
      const subscription = subscribe({ pollingInterval: 100, messageCallback, errorCallback: vi.fn() }, address, 4)
      expect(getEvents).toHaveBeenCalledExactlyOnceWith(address, { start: 4 })

      await vi.advanceTimersByTimeAsync(0)
      expect(subscription.currentEventCount()).toBe(5)
      expect(messageCallback).toHaveBeenCalledTimes(1)
      expect(getEvents).toHaveBeenCalledTimes(2)
      await vi.advanceTimersByTimeAsync(99)
      expect(getEvents).toHaveBeenCalledTimes(2)
      await vi.advanceTimersByTimeAsync(1)
      expect(getEvents).toHaveBeenCalledTimes(3)

      subscription.unsubscribe()
      await vi.advanceTimersByTimeAsync(1000)
      expect(getEvents).toHaveBeenCalledTimes(3)
      expect(vi.getTimerCount()).toBe(0)
    }
  )
})
