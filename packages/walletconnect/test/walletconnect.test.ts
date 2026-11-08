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
import {
  formatAccount,
  formatChain,
  parseAccount,
  parseChain,
  ProviderOptions,
  WalletConnectProvider
} from '../src/index'
import { WalletClient } from './shared'
import { disconnectTestSession } from './shared/disconnectTestSession'
import { createRelayTestConfig } from './shared/relayTestConfig'
import {
  web3,
  node,
  NodeProvider,
  verifySignedMessage,
  groupOfAddress,
  NetworkId,
  binToHex,
  Account,
  groupedKeyTypes,
  grouplessKeyTypes,
  addressFromPublicKey
} from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { Greeter, Main } from '../artifacts/ts'
import { sleep } from '@alephium/web3'
import { randomBytes, randomInt } from 'crypto'
import type SignClient from '@walletconnect/sign-client'

const NETWORK_ID = 'devnet'
const ADDRESS_GROUP = 0
const RPC_URL = 'http://127.0.0.1:22973'

const nodeProvider = new NodeProvider(RPC_URL)
web3.setCurrentNodeProvider(RPC_URL)
const signerA = new PrivateKeyWallet({ privateKey: 'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5' })
const signerB = PrivateKeyWallet.Random(1)
const signerC = PrivateKeyWallet.Random(2)
const signerD = PrivateKeyWallet.Random(3)
const ACCOUNTS = {
  a: {
    address: signerA.address,
    privateKey: signerA.privateKey,
    group: signerA.group
  },
  b: {
    address: signerB.address,
    privateKey: signerB.privateKey,
    group: signerB.group
  },
  c: {
    address: signerC.address,
    privateKey: signerC.privateKey,
    group: signerC.group
  },
  d: {
    address: signerD.address,
    privateKey: signerD.privateKey,
    group: signerD.group
  }
}

const ONE_ALPH = 10n ** 18n

const relayTestConfig = createRelayTestConfig(process.env)
const hasProjectId = relayTestConfig.projectId !== undefined
if (!hasProjectId) {
  console.warn(
    'Skipping WalletConnect relay integration tests: set TEST_PROJECT_ID to a Reown project ID to enable them.'
  )
}

const TEST_APP_METADATA = {
  name: 'Test App',
  description: 'Test App for WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const TEST_WALLET_METADATA = {
  name: 'Test Wallet',
  description: 'Test Wallet for WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const TEST_PROVIDER_OPTS: ProviderOptions = {
  networkId: NETWORK_ID,
  addressGroup: ADDRESS_GROUP,
  onDisconnected: () => {
    return
  },

  metadata: TEST_APP_METADATA,
  logger: 'error'
}

const TEST_WALLET_CLIENT_OPTS = {
  networkId: NETWORK_ID as NetworkId,
  rpcUrl: RPC_URL,
  activePrivateKey: ACCOUNTS.a.privateKey,
  metadata: TEST_WALLET_METADATA
}

vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 })

describe('Unit tests', function () {
  const expectedAddressGroup0 = 2
  const expectedAddressGroup1 = 1

  it('test formatChain & parseChain', () => {
    expect(formatChain('devnet', expectedAddressGroup0)).toEqual('alephium:devnet/2')
    expect(formatChain('devnet', expectedAddressGroup1)).toEqual('alephium:devnet/1')
    expect(formatChain('devnet', undefined)).toEqual('alephium:devnet/-1')
    expect(() => formatChain('devnet', -1)).toThrow()
    expect(parseChain('alephium:devnet/2')).toEqual({ networkId: 'devnet', addressGroup: 2 })
    expect(parseChain('alephium:devnet/1')).toEqual({ networkId: 'devnet', addressGroup: 1 })
    expect(parseChain('alephium:devnet/-1')).toEqual({ networkId: 'devnet', addressGroup: undefined })
    expect(() => parseChain('alephium:devnet/-2')).toThrow()
  })

  it('test formatAccount & parseAccount', () => {
    const publicKey0 = binToHex(randomBytes(33))
    const keyType0 = groupedKeyTypes[randomInt(0, groupedKeyTypes.length)]
    const address0 = addressFromPublicKey(publicKey0, keyType0)
    const groupIndex = groupOfAddress(address0)
    const account0: Account = {
      keyType: keyType0,
      group: groupIndex,
      address: address0,
      publicKey: publicKey0
    }
    const permittedChain = formatChain('devnet', groupIndex)
    expect(formatAccount(permittedChain, account0)).toEqual(`alephium:devnet/${groupIndex}:${publicKey0}/${keyType0}`)
    expect(parseAccount(`alephium:devnet/${groupIndex}:${publicKey0}/${keyType0}`)).toEqual({
      ...account0,
      networkId: 'devnet'
    })

    const keyType1 = grouplessKeyTypes[randomInt(0, grouplessKeyTypes.length)]
    const publicKey1 = keyType1 === 'gl-ed25519' ? binToHex(randomBytes(32)) : publicKey0
    const address1 = addressFromPublicKey(publicKey1, keyType1)
    const account1: Account = {
      keyType: keyType1,
      address: address1,
      publicKey: publicKey1
    }
    expect(formatAccount(permittedChain, account1)).toEqual(`alephium:devnet/${groupIndex}:${publicKey1}/${keyType1}`)
    expect(parseAccount(`alephium:devnet/${groupIndex}:${publicKey1}/${keyType1}`)).toEqual({
      ...account1,
      networkId: 'devnet'
    })
    expect(() => parseAccount(`alephium:devnet/${groupIndex}:${publicKey1}/invalid-key`)).toThrow('Invalid key type')
  })

  it.skipIf(!hasProjectId)('should initialize providers', async () => {
    const providers: WalletConnectProvider[] = []
    try {
      const provider0 = await WalletConnectProvider.init({
        ...TEST_PROVIDER_OPTS,
        ...relayTestConfig.clientOptions('init', 'provider0')
      })
      providers.push(provider0)
      expect(provider0.nodeProvider !== undefined).toEqual(true)
      expect(provider0.explorerProvider !== undefined).toEqual(true)
      const provider1 = await WalletConnectProvider.init({
        ...TEST_PROVIDER_OPTS,
        ...relayTestConfig.clientOptions('init', 'provider1'),
        methods: []
      })
      providers.push(provider1)
      expect(provider1.nodeProvider === undefined).toEqual(true)
      expect(provider1.explorerProvider === undefined).toEqual(true)
    } finally {
      await closeTestClients(...providers.map(({ client }) => client))
    }
  })
})

async function closeTestClients(...clients: (SignClient | undefined)[]) {
  await Promise.all(
    clients.map(async (client) => {
      if (!client) return
      client.core.heartbeat.stop()
      await client.core.relayer.transportClose()
    })
  )
}

async function waitWalletConnected(client: WalletClient) {
  const deadline = Date.now() + 30_000
  while (client.topic === undefined) {
    if (Date.now() >= deadline) throw new Error('Timed out waiting for WalletConnect session acknowledgement')
    await sleep(100)
  }
}

describe.skipIf(!hasProjectId)('WalletConnectProvider with single addressGroup', function () {
  let provider: WalletConnectProvider
  let walletClient: WalletClient
  let walletAddress: string

  beforeAll(async () => {
    provider = await WalletConnectProvider.init({
      ...TEST_PROVIDER_OPTS,
      ...relayTestConfig.clientOptions('single', 'provider')
    })
    walletClient = await WalletClient.init(provider, {
      ...TEST_WALLET_CLIENT_OPTS,
      ...relayTestConfig.clientOptions('single', 'wallet')
    })
    walletAddress = walletClient.signer.address
    expect(walletAddress).toEqual(ACCOUNTS.a.address)
    await provider.connect()
    expect(provider.permittedChain).toEqual('alephium:devnet/0')
    const selectetAddress = (await provider.getSelectedAccount()).address
    expect(selectetAddress).toEqual(signerA.address)
    await waitWalletConnected(walletClient)
  })

  afterAll(async () => {
    try {
      if (walletClient && !walletClient.disconnected && walletClient.topic) {
        await disconnectTestSession(provider, () => walletClient.disconnect())
      }
      if (walletClient) expect(walletClient.client?.session.values.length).toEqual(0)
    } finally {
      await closeTestClients(provider?.client, walletClient?.client)
    }
  })

  it('should forward requests', async () => {
    if (!provider.nodeProvider) throw new Error('Node API forwarding was not initialized')
    await provider.nodeProvider.infos.getInfosVersion()
  })

  it('should sign', async () => {
    await verifySign(provider)
  })

  it('accountChanged', async () => {
    // change to account within the same group
    const currentAddress = (await provider.getSelectedAccount()).address
    expect(currentAddress).toEqual(ACCOUNTS.a.address)
    const newAccount = PrivateKeyWallet.Random(groupOfAddress(currentAddress))
    await verifyAccountsChange(newAccount.privateKey, newAccount.address, provider, walletClient)

    // change back to account a
    await verifyAccountsChange(ACCOUNTS.a.privateKey, ACCOUNTS.a.address, provider, walletClient)

    // change to account b, which is not supported
    await expectThrowsAsync(
      async () => await walletClient.changeAccount(ACCOUNTS.b.privateKey),
      'Error changing account, chain alephium:devnet/1 not permitted'
    )
  })

  it('networkChanged', async () => {
    // change to testnet
    await verifyNetworkChange('testnet', 'https://testnet-wallet.alephium.org', provider, walletClient)
  })
})

describe.skipIf(!hasProjectId)('WalletConnectProvider with arbitrary addressGroup', function () {
  let provider: WalletConnectProvider
  let walletClient: WalletClient
  let walletAddress: string

  beforeAll(async () => {
    provider = await WalletConnectProvider.init({
      ...TEST_PROVIDER_OPTS,
      networkId: NETWORK_ID,
      addressGroup: undefined,
      ...relayTestConfig.clientOptions('arbitrary', 'provider')
    })
    walletClient = await WalletClient.init(provider, {
      ...TEST_WALLET_CLIENT_OPTS,
      ...relayTestConfig.clientOptions('arbitrary', 'wallet')
    })
    walletAddress = walletClient.signer.address
    expect(walletAddress).toEqual(ACCOUNTS.a.address)
    await provider.connect()
    expect(provider.permittedChain).toEqual('alephium:devnet/-1')
    const selectedAddress = (await provider.getSelectedAccount()).address
    expect(selectedAddress).toEqual(signerA.address)
    await waitWalletConnected(walletClient)
  })

  afterAll(async () => {
    try {
      if (walletClient && !walletClient.disconnected && walletClient.topic) {
        await disconnectTestSession(provider, () => walletClient.disconnect())
      }
      if (walletClient) expect(walletClient.client?.session.values.length).toEqual(0)
    } finally {
      await closeTestClients(provider?.client, walletClient?.client)
    }
  })

  it('should sign', async () => {
    await verifySign(provider)
  })

  it('accountChanged', async () => {
    // change to account c
    await verifyAccountsChange(ACCOUNTS.c.privateKey, ACCOUNTS.c.address, provider, walletClient)

    // change to account b
    await verifyAccountsChange(ACCOUNTS.b.privateKey, ACCOUNTS.b.address, provider, walletClient)

    // change back to account a
    await verifyAccountsChange(ACCOUNTS.a.privateKey, ACCOUNTS.a.address, provider, walletClient)
  })
})

async function verifyNetworkChange(
  networkId: NetworkId,
  rpcUrl: string,
  provider: WalletConnectProvider,
  walletClient: WalletClient
) {
  await Promise.all([
    new Promise<void>((resolve) => {
      provider.on('session_delete', () => {
        resolve()
      })
    }),
    await walletClient.changeChain(networkId, rpcUrl)
  ])
}

async function verifyAccountsChange(
  privateKey: string,
  address: string,
  provider: WalletConnectProvider,
  walletClient: WalletClient
) {
  await Promise.all([
    new Promise<void>((resolve, reject) => {
      provider.on('accountChanged', (account) => {
        try {
          expect(account.address).toEqual(address)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }),
    walletClient.changeAccount(privateKey)
  ])
}

async function verifySign(provider: WalletConnectProvider) {
  let balance: node.Balance
  async function checkBalanceDecreasing() {
    const deadline = Date.now() + 10_000
    while (Date.now() < deadline) {
      await delay(500)
      const nextBalance = await nodeProvider.addresses.getAddressesAddressBalance(ACCOUNTS.a.address)
      if (BigInt(nextBalance.balance) < BigInt(balance.balance)) {
        balance = nextBalance
        return
      }
    }
    throw new Error('Devnet balance did not decrease after the signed transaction')
  }

  const selectedAddress = (await provider.getSelectedAccount()).address

  expect(selectedAddress).toEqual(ACCOUNTS.a.address)

  balance = await nodeProvider.addresses.getAddressesAddressBalance(ACCOUNTS.a.address)

  await provider.signAndSubmitTransferTx({
    signerAddress: signerA.address,
    destinations: [{ address: ACCOUNTS.b.address, attoAlphAmount: ONE_ALPH }]
  })

  await checkBalanceDecreasing()

  const greeterResult = await Greeter.deploy(provider, {
    initialFields: { btcPrice: 1n }
  })
  await checkBalanceDecreasing()

  await Main.execute({
    signer: provider,
    initialFields: { greeterContractId: greeterResult.contractInstance.contractId }
  })
  await checkBalanceDecreasing()

  const message = 'Hello Alephium!'
  const signedMessage = await provider.signMessage({
    message,
    messageHasher: 'alephium',
    signerAddress: signerA.address
  })
  expect(verifySignedMessage(message, 'alephium', signerA.publicKey, signedMessage.signature)).toEqual(true)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function expectThrowsAsync(method: () => Promise<unknown>, errorMessage: string) {
  await expect(method()).rejects.toThrow(errorMessage)
}
