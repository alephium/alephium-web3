import EventEmitter from 'eventemitter3'
import { Subscription, SubscribeOptions } from './subscription'

class TestSubscription<Message> extends Subscription<Message> {
  public pollingCallCount = 0
  private pollingPromise: Promise<void> | null = null

  constructor(options: SubscribeOptions<Message>) {
    super(options)
  }

  protected override async polling(): Promise<void> {
    this.pollingCallCount++
    if (this.pollingPromise) {
      await this.pollingPromise
    }
  }

  public setPollingDelay(delay: number): void {
    this.pollingPromise = new Promise(resolve => setTimeout(resolve, delay))
  }
}

describe('Subscription', () => {
  let subscription: TestSubscription<string>
  let messageCallback: jest.Mock
  let errorCallback: jest.Mock

  beforeAll(() => {
    Object.defineProperty(global, 'performance', {
      writable: true,
    })
    
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()

    messageCallback = jest.fn()
    errorCallback = jest.fn()
    subscription = new TestSubscription({
      pollingInterval: 1000,
      messageCallback,
      errorCallback,
    })
  })

  it('should initialize with correct properties', () => {
    expect(subscription.pollingInterval).toBe(1000)
    expect(subscription['messageCallback']).toBe(messageCallback)
    expect(subscription['errorCallback']).toBe(errorCallback)
    expect(subscription['cancelled']).toBe(false)
    expect(subscription['eventEmitter']).toBeInstanceOf(EventEmitter)
  })

  it('should report correct cancellation status', () => {
    expect(subscription.isCancelled()).toBe(false)
    subscription.unsubscribe()
    expect(subscription.isCancelled()).toBe(true)
  })

  it('should not start a new polling cycle if cancelled during polling', async () => {
    const slowPollingSubscription = new TestSubscription<string>({
      pollingInterval: 1000,
      messageCallback,
      errorCallback,
    })
    slowPollingSubscription.setPollingDelay(500)

    slowPollingSubscription.subscribe()
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

