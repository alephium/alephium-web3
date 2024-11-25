/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-nocheck - Disable TypeScript checking for this file
// eslint-disable-next-line header/header
// @ts-nocheck - Disable TypeScript checking for this file
// eslint-disable-next-line header/header
const { EventSubscription, subscribeToEvents } = require('./events')
const { node } = require('../api')
const web3 = require('../global')

describe('EventSubscription', () => {
  let subscription
  const contractAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'

  const mockEvent = {
    blockHash: 'block-hash',
    txId: 'tx-id',
    eventIndex: 0,
    fields: []
  }

  // Mock the getCurrentNodeProvider
  const mockGetEventsContract = jest.fn()
  const mockNodeProvider = {
    events: {
      getEventsContractContractaddress: mockGetEventsContract
    }
  }
  let mockProviderSpy

  beforeEach(() => {
    jest.clearAllMocks()
    mockProviderSpy = jest.spyOn(web3, 'getCurrentNodeProvider').mockReturnValue(mockNodeProvider)
  })

  afterEach(async () => {
    if (subscription) {
      await subscription.unsubscribe()
    }
    mockProviderSpy.mockRestore()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should create subscription with default fromCount', () => {
    subscription = new EventSubscription(
      {
        messageCallback: jest.fn(),
        errorCallback: jest.fn(),
        pollingInterval: 1000
      },
      contractAddress
    )
    expect(subscription.currentEventCount()).toBe(0)
    expect(subscription.contractAddress).toBe(contractAddress)
  })

  it('should create subscription with custom fromCount', () => {
    const fromCount = 5
    subscription = new EventSubscription(
      {
        messageCallback: jest.fn(),
        errorCallback: jest.fn(),
        pollingInterval: 1000
      },
      contractAddress,
      fromCount
    )
    expect(subscription.currentEventCount()).toBe(fromCount)
  })

  it('should handle event polling with new events', async () => {
    const messageCallback = jest.fn()
    const onEventCountChanged = jest.fn()

    subscription = new EventSubscription(
      {
        messageCallback,
        errorCallback: jest.fn(),
        onEventCountChanged,
        pollingInterval: 1000
      },
      contractAddress
    )

    // Mock the response with data property to match HTTP response structure
    mockGetEventsContract.mockResolvedValueOnce({
      data: {
        events: [mockEvent],
        nextStart: 1
      }
    })

    await subscription.polling()

    // Add small delay to ensure async operations complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(messageCallback).toHaveBeenCalledWith(mockEvent)
    expect(onEventCountChanged).toHaveBeenCalledWith(1)
  })

  it('should handle polling with no new events', async () => {
    const messageCallback = jest.fn()
    const onEventCountChanged = jest.fn()

    subscription = new EventSubscription(
      {
        messageCallback,
        errorCallback: jest.fn(),
        onEventCountChanged,
        pollingInterval: 1000
      },
      contractAddress
    )

    mockGetEventsContract.mockResolvedValueOnce({
      data: {
        events: [],
        nextStart: 0
      }
    })

    await subscription.polling()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(messageCallback).not.toHaveBeenCalled()
    expect(onEventCountChanged).not.toHaveBeenCalled()
  })

  it('should handle polling errors', async () => {
    const error = new Error('Network error')
    const errorCallback = jest.fn()

    subscription = new EventSubscription(
      {
        messageCallback: jest.fn(),
        errorCallback,
        pollingInterval: 1000
      },
      contractAddress
    )

    mockGetEventsContract.mockRejectedValueOnce(error)

    await subscription.polling()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(errorCallback).toHaveBeenCalledWith(error, subscription)
  })

  describe('subscribeToEvents', () => {
    it('should create and subscribe to events', async () => {
      const options = {
        messageCallback: jest.fn(),
        errorCallback: jest.fn(),
        pollingInterval: 1000
      }

      const subscribeSpy = jest.spyOn(EventSubscription.prototype, 'subscribe')
      const sub = subscribeToEvents(options, contractAddress)

      expect(sub).toBeInstanceOf(EventSubscription)
      expect(subscribeSpy).toHaveBeenCalled()
      expect(sub.contractAddress).toBe(contractAddress)

      await sub.unsubscribe()
      subscribeSpy.mockRestore()
    })

    it('should create subscription with custom fromCount', async () => {
      const options = {
        messageCallback: jest.fn(),
        errorCallback: jest.fn(),
        pollingInterval: 1000
      }
      const fromCount = 5

      const sub = subscribeToEvents(options, contractAddress, fromCount)

      expect(sub.currentEventCount()).toBe(fromCount)

      await sub.unsubscribe()
    })
  })
})
