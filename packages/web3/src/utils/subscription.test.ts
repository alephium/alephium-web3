import EventEmitter from 'eventemitter3'
import { Subscription, SubscribeOptions } from './subscription'

// Mock implementation of the abstract class for testing
class TestSubscription<Message> extends Subscription<Message> {
  public pollingCallCount = 0

  constructor(options: SubscribeOptions<Message>) {
    super(options)
  }

  protected async polling(): Promise<void> {
    this.pollingCallCount++
  }
}

describe('Subscription', () => {
  let subscription: TestSubscription<string>
  let messageCallback: jest.Mock
  let errorCallback: jest.Mock

  beforeEach(() => {
    jest.useFakeTimers()
    messageCallback = jest.fn()
    errorCallback = jest.fn()
    subscription = new TestSubscription({
      pollingInterval: 1000,
      messageCallback,
      errorCallback,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with correct properties', () => {
    expect(subscription.pollingInterval).toBe(1000)
    expect(subscription['messageCallback']).toBe(messageCallback)
    expect(subscription['errorCallback']).toBe(errorCallback)
    expect(subscription['cancelled']).toBe(false)
    expect(subscription['eventEmitter']).toBeInstanceOf(EventEmitter)
  })

  it('should start polling when subscribed', () => {
    subscription.subscribe()
    expect(subscription.pollingCallCount).toBe(1)
    
    jest.advanceTimersByTime(1000)
    expect(subscription.pollingCallCount).toBe(2)

    jest.advanceTimersByTime(2000)
    expect(subscription.pollingCallCount).toBe(4)
  })

  it('should stop polling when unsubscribed', () => {
    subscription.subscribe()
    jest.advanceTimersByTime(2000)
    expect(subscription.pollingCallCount).toBe(3)

    subscription.unsubscribe()
    jest.advanceTimersByTime(2000)
    // Should not increase
    expect(subscription.pollingCallCount).toBe(3) 
  })

  it('should report correct cancellation status', () => {
    expect(subscription.isCancelled()).toBe(false)
    subscription.unsubscribe()
    expect(subscription.isCancelled()).toBe(true)
  })

  it('should handle multiple subscriptions and unsubscriptions', () => {
    subscription.subscribe()
    jest.advanceTimersByTime(500)
    subscription.unsubscribe()
    jest.advanceTimersByTime(1000)
    subscription.subscribe()
    jest.advanceTimersByTime(1500)
    expect(subscription.pollingCallCount).toBe(3)
  })

  it('should not start a new polling cycle if cancelled during polling', async () => {
    const slowPollingSubscription = new class extends TestSubscription<string> {
      protected async polling(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500))
        super.polling()
      }
    }({
      pollingInterval: 1000,
      messageCallback,
      errorCallback,
    })

    slowPollingSubscription.subscribe()
    // Start the first polling cycle
    jest.advanceTimersByTime(100) 
    slowPollingSubscription.unsubscribe()
    jest.advanceTimersByTime(2000)
    expect(slowPollingSubscription.pollingCallCount).toBe(1)
  })

  it('should remove all event listeners when unsubscribed', () => {
    const removeAllListenersSpy = jest.spyOn(subscription['eventEmitter'], 'removeAllListeners')
    subscription.subscribe()
    subscription.unsubscribe()
    expect(removeAllListenersSpy).toHaveBeenCalled()
  })
})

