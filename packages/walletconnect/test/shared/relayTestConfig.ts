import { randomUUID } from 'crypto'

export const OFFICIAL_RELAY_URL = 'wss://relay.walletconnect.com'

// A separate prefix for each run, suite and peer prevents Core/storage reuse across live tests.
// Creating configuration is pure with respect to the network: callers decide whether to run live tests.
export const createRelayTestConfig = (
  env: Partial<Pick<NodeJS.ProcessEnv, 'TEST_PROJECT_ID' | 'TEST_RELAY_URL'>>,
  runId: string = randomUUID()
) => {
  const projectId = env.TEST_PROJECT_ID?.trim() || undefined
  const relayUrl = env.TEST_RELAY_URL?.trim() || OFFICIAL_RELAY_URL

  return {
    projectId,
    clientOptions: (suite: string, peer: string) => ({
      projectId,
      relayUrl,
      customStoragePrefix: `alephium-tests-${runId}-${suite}-${peer}`,
      storageOptions: { database: ':memory:' }
    })
  }
}
