interface SessionEvents {
  on(event: 'session_delete', listener: () => void): unknown
  off(event: 'session_delete', listener: () => void): unknown
}

// A Vitest hook timeout does not cancel its async function. Bound the event wait ourselves so the
// caller's finally block can always close relay transports, including when a peer never acknowledges.
export const disconnectTestSession = async (
  events: SessionEvents,
  disconnect: () => Promise<void>,
  timeoutMs = 10000
) => {
  let onDeleted: () => void = () => undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const deleted = new Promise<void>((resolve) => {
    onDeleted = resolve
    events.on('session_delete', onDeleted)
  })
  try {
    await Promise.race([
      Promise.all([deleted, Promise.resolve().then(disconnect)]),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Timed out waiting for WalletConnect disconnection')), timeoutMs)
      })
    ])
  } finally {
    clearTimeout(timer)
    events.off('session_delete', onDeleted)
  }
}
