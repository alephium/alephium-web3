import EventEmitter from 'eventemitter3'
import { disconnectTestSession } from './shared/disconnectTestSession'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('waits for disconnection and its event, then removes the listener and timeout', async () => {
  const events = new EventEmitter()
  let finishDisconnect: () => void = () => undefined
  const disconnect = new Promise<void>((resolve) => {
    finishDisconnect = resolve
  })
  const finished = vi.fn()
  const pending = disconnectTestSession(events, () => disconnect).then(finished)
  events.emit('session_delete')
  await vi.advanceTimersByTimeAsync(1)
  expect(finished).not.toHaveBeenCalled()
  finishDisconnect()
  await pending
  expect(finished).toHaveBeenCalledOnce()
  expect(events.listenerCount('session_delete')).toBe(0)
  expect(vi.getTimerCount()).toBe(0)
})

it('times out a missing event so caller cleanup runs even when disconnect never resolves', async () => {
  const events = new EventEmitter()
  const closed = vi.fn()
  const pending = disconnectTestSession(events, () => new Promise(() => undefined), 100).finally(closed)
  const assertion = expect(pending).rejects.toThrow('Timed out waiting for WalletConnect disconnection')
  await vi.advanceTimersByTimeAsync(100)
  await assertion
  expect(closed).toHaveBeenCalledOnce()
  expect(events.listenerCount('session_delete')).toBe(0)
  expect(vi.getTimerCount()).toBe(0)
})

it('cleans up if disconnect fails before an acknowledgement', async () => {
  const events = new EventEmitter()
  await expect(disconnectTestSession(events, () => Promise.reject(new Error('relay offline')))).rejects.toThrow(
    'relay offline'
  )
  expect(events.listenerCount('session_delete')).toBe(0)
  expect(vi.getTimerCount()).toBe(0)
})
