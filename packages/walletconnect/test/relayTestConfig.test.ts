import { createRelayTestConfig, OFFICIAL_RELAY_URL } from './shared/relayTestConfig'

it('uses the official relay and leaves live tests disabled without a project ID', () => {
  const config = createRelayTestConfig({})
  expect(config.projectId).toBeUndefined()
  expect(config.clientOptions('single', 'provider').relayUrl).toBe(OFFICIAL_RELAY_URL)
})

it('treats blank project IDs and relay overrides as absent', () => {
  const config = createRelayTestConfig({ TEST_PROJECT_ID: '  ', TEST_RELAY_URL: ' ' })
  expect(config.projectId).toBeUndefined()
  expect(config.clientOptions('single', 'provider').relayUrl).toBe('wss://relay.walletconnect.com')
})

it('passes the project ID and in-memory storage to both peers', () => {
  const config = createRelayTestConfig({ TEST_PROJECT_ID: ' test-project ' }, 'run-1')
  for (const peer of ['provider', 'wallet']) {
    expect(config.clientOptions('single', peer)).toMatchObject({
      projectId: 'test-project',
      relayUrl: OFFICIAL_RELAY_URL,
      storageOptions: { database: ':memory:' }
    })
  }
})

it('isolates each run, suite and peer with different storage prefixes', () => {
  const first = createRelayTestConfig({})
  const second = createRelayTestConfig({})
  const prefixes = [
    first.clientOptions('single', 'provider'),
    first.clientOptions('single', 'wallet'),
    first.clientOptions('arbitrary', 'provider'),
    first.clientOptions('arbitrary', 'wallet'),
    second.clientOptions('single', 'provider')
  ].map(({ customStoragePrefix }) => customStoragePrefix)
  expect(new Set(prefixes).size).toBe(prefixes.length)
})

it('allows an explicitly configured compatible relay', () => {
  const config = createRelayTestConfig({
    TEST_PROJECT_ID: 'test-project',
    TEST_RELAY_URL: ' wss://relay.example.test '
  })
  expect(config.clientOptions('single', 'wallet').relayUrl).toBe('wss://relay.example.test')
})
