/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import React, { useContext } from 'react'
import { render, act, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AlephiumConnectContext, AlephiumConnectContextValue } from '../../contexts/alephiumConnect'
import { ConnectResult, Connectors } from '../../utils/connector'

// ---- Mocks ----

const subscribeListeners: Set<(providers: any[]) => void> = new Set()
const mockSubscribe = vi.fn((listener: (providers: any[]) => void) => {
  subscribeListeners.add(listener)
  return () => {
    subscribeListeners.delete(listener)
  }
})
const mockGetProviders = vi.fn(() => [] as any[])

vi.mock('../../utils/injectedProviders', () => ({
  injectedProviderStore: {
    subscribe: (listener: any) => mockSubscribe(listener),
    getProviders: () => mockGetProviders()
  },
  getInjectedProviderId: () => 'Alephium',
  getInjectedProvider: () => undefined
}))

const mockGetLastConnectedAccount = vi.fn()
const mockSetLastConnectedAccount = vi.fn()
const mockRemoveLastConnectedAccount = vi.fn()

vi.mock('../../utils/storage', () => ({
  getLastConnectedAccount: (...args: any[]) => mockGetLastConnectedAccount(...args),
  setLastConnectedAccount: (...args: any[]) => mockSetLastConnectedAccount(...args),
  removeLastConnectedAccount: (...args: any[]) => mockRemoveLastConnectedAccount(...args)
}))

const mockAutoConnect = vi.fn()
const mockConnect = vi.fn()
const mockDisconnect = vi.fn()

function makeConnectors(): Connectors {
  return {
    injected: {
      connect: mockConnect,
      disconnect: mockDisconnect,
      autoConnect: mockAutoConnect
    },
    walletConnect: {
      connect: mockConnect,
      disconnect: mockDisconnect
    },
    desktopWallet: {
      connect: mockConnect,
      disconnect: mockDisconnect
    }
  }
}

vi.mock('../../utils/connector', () => ({
  createDefaultConnectors: () => makeConnectors()
}))

// Mock useInjectedProviders to return an empty array
vi.mock('../../hooks/useInjectedProviders', () => ({
  useInjectedProviders: () => []
}))

// Mock isCompatibleAddressGroup to always return true
vi.mock('@alephium/walletconnect-provider', () => ({
  isCompatibleAddressGroup: () => true
}))

// ---- Import the component under test after mocks ----
// eslint-disable-next-line
import { AlephiumConnectProvider } from '../AlephiumConnect'

// ---- Test Helper ----

function TestConsumer({ onRender }: { onRender: (ctx: AlephiumConnectContextValue) => void }) {
  const ctx = useContext(AlephiumConnectContext)
  if (ctx) onRender(ctx)
  return null
}

const fakeAccount = {
  address: '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
  publicKey: 'abc123',
  keyType: 'default' as const,
  group: 0
}

const fakeSignerProvider = { nodeProvider: {} } as any

describe('AlephiumConnect auto-connect retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    subscribeListeners.clear()

    // Default: last connected account exists (so auto-connect is attempted)
    mockGetLastConnectedAccount.mockReturnValue({
      connectorId: 'injected',
      account: fakeAccount,
      network: 'mainnet'
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('connects immediately when provider is available on first attempt', async () => {
    mockAutoConnect.mockImplementation(async (opts: any) => {
      await opts.onConnected({ account: fakeAccount, signerProvider: fakeSignerProvider } as ConnectResult)
      return fakeAccount
    })

    let latestCtx: AlephiumConnectContextValue | undefined

    await act(() => {
      render(
        <AlephiumConnectProvider network="mainnet">
          <TestConsumer
            onRender={(ctx) => {
              latestCtx = ctx
            }}
          />
        </AlephiumConnectProvider>
      )
    })

    expect(latestCtx!.connectionStatus).toBe('connected')
    expect(latestCtx!.account?.address).toBe(fakeAccount.address)
    // Store subscribe should not have active listeners (no retry needed)
    expect(subscribeListeners.size).toBe(0)
  })

  it('connects when provider arrives late (within timeout)', async () => {
    let callCount = 0
    mockAutoConnect.mockImplementation(async (opts: any) => {
      callCount++
      if (callCount === 1) {
        // First attempt fails
        return undefined
      }
      // Second attempt succeeds
      await opts.onConnected({ account: fakeAccount, signerProvider: fakeSignerProvider } as ConnectResult)
      return fakeAccount
    })

    let latestCtx: AlephiumConnectContextValue | undefined

    await act(() => {
      render(
        <AlephiumConnectProvider network="mainnet">
          <TestConsumer
            onRender={(ctx) => {
              latestCtx = ctx
            }}
          />
        </AlephiumConnectProvider>
      )
    })

    // After initial failed attempt, status should still be 'connecting'
    expect(latestCtx!.connectionStatus).toBe('connecting')
    // A subscription should be active
    expect(subscribeListeners.size).toBe(1)

    // Simulate a late-arriving provider
    await act(() => {
      subscribeListeners.forEach((listener) => listener([{ id: 'alephium' }]))
    })

    expect(latestCtx!.connectionStatus).toBe('connected')
    expect(latestCtx!.account?.address).toBe(fakeAccount.address)
    // Subscription should be cleaned up after success
    expect(subscribeListeners.size).toBe(0)
  })

  it('disconnects when provider never arrives (timeout)', async () => {
    mockAutoConnect.mockResolvedValue(undefined)

    let latestCtx: AlephiumConnectContextValue | undefined

    await act(() => {
      render(
        <AlephiumConnectProvider network="mainnet">
          <TestConsumer
            onRender={(ctx) => {
              latestCtx = ctx
            }}
          />
        </AlephiumConnectProvider>
      )
    })

    expect(latestCtx!.connectionStatus).toBe('connecting')

    // Advance timers past the 3-second timeout
    await act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(latestCtx!.connectionStatus).toBe('disconnected')
    expect(mockRemoveLastConnectedAccount).toHaveBeenCalled()
    // Subscription should be cleaned up
    expect(subscribeListeners.size).toBe(0)
  })

  it('cleans up on unmount during wait', async () => {
    mockAutoConnect.mockResolvedValue(undefined)

    let latestCtx: AlephiumConnectContextValue | undefined

    let result: ReturnType<typeof render>
    await act(() => {
      result = render(
        <AlephiumConnectProvider network="mainnet">
          <TestConsumer
            onRender={(ctx) => {
              latestCtx = ctx
            }}
          />
        </AlephiumConnectProvider>
      )
    })

    expect(latestCtx!.connectionStatus).toBe('connecting')
    expect(subscribeListeners.size).toBe(1)

    // Unmount during wait
    await act(() => {
      result!.unmount()
    })

    // Subscription should be cleaned up
    expect(subscribeListeners.size).toBe(0)

    // Advancing timers should not cause errors
    await act(() => {
      vi.advanceTimersByTime(3000)
    })

    // No call to removeLastConnectedAccount since cleanup cancelled the timeout
    const callsAfterUnmount = mockRemoveLastConnectedAccount.mock.calls.length
    expect(callsAfterUnmount).toBe(0)
  })

  it('does not override explicit disconnect with retry', async () => {
    let callCount = 0
    mockAutoConnect.mockImplementation(async (opts: any) => {
      callCount++
      if (callCount === 1) {
        return undefined
      }
      await opts.onConnected({ account: fakeAccount, signerProvider: fakeSignerProvider } as ConnectResult)
      return fakeAccount
    })

    let latestCtx: AlephiumConnectContextValue | undefined

    await act(() => {
      render(
        <AlephiumConnectProvider network="mainnet">
          <TestConsumer
            onRender={(ctx) => {
              latestCtx = ctx
            }}
          />
        </AlephiumConnectProvider>
      )
    })

    expect(latestCtx!.connectionStatus).toBe('connecting')

    // Simulate a late provider arriving and succeeding
    await act(() => {
      subscribeListeners.forEach((listener) => listener([{ id: 'alephium' }]))
    })

    expect(latestCtx!.connectionStatus).toBe('connected')

    // Now explicitly disconnect
    await act(() => {
      latestCtx!.setSignerProvider(undefined)
    })

    expect(latestCtx!.connectionStatus).toBe('disconnected')

    // The retry mechanism should not override this since subscriptions are cleaned up
    expect(subscribeListeners.size).toBe(0)
  })
})
