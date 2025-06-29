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
  parseChain,
  formatChain,
  formatChainLegacy,
  parseChainLegacy,
  ProviderOptions,
  WalletConnectProvider
} from '../src/index'
import { WalletClient } from './shared'
import { web3, node, NodeProvider, verifySignedMessage, groupOfAddress, NetworkId } from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { SignClientTypes } from '@walletconnect/types'
import { Greeter, Main } from '../artifacts/ts'
import { sleep } from '@alephium/web3'

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

const TEST_RELAY_URL = process.env.TEST_RELAY_URL ? process.env.TEST_RELAY_URL : 'ws://localhost:5555'

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
  logger: 'error',
  relayUrl: TEST_RELAY_URL
}

const TEST_WALLET_CLIENT_OPTS = {
  networkId: NETWORK_ID as NetworkId,
  rpcUrl: RPC_URL,
  activePrivateKey: ACCOUNTS.a.privateKey,
  relayUrl: TEST_RELAY_URL,
  metadata: TEST_WALLET_METADATA
}

export const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID ? process.env.TEST_PROJECT_ID : undefined

export const TEST_SIGN_CLIENT_OPTIONS: SignClientTypes.Options = {
  logger: 'error',
  relayUrl: TEST_RELAY_URL,
  projectId: TEST_PROJECT_ID,
  storageOptions: {
    database: ':memory:'
  },
  metadata: TEST_APP_METADATA
}

jest.setTimeout(30_000)

describe('Unit tests', function () {
  const expectedAddressGroup0 = 2
  const expectedAddressGroup1 = 1

  it('test formatChainLegacy & parseChainLegacy', () => {
    expect(formatChainLegacy('devnet', expectedAddressGroup0)).toEqual('alephium:devnet/2')
    expect(formatChainLegacy('devnet', expectedAddressGroup1)).toEqual('alephium:devnet/1')
    expect(formatChainLegacy('devnet', undefined)).toEqual('alephium:devnet/-1')
    expect(() => formatChainLegacy('devnet', -1)).toThrow()
    expect(parseChainLegacy('alephium:devnet/2')).toEqual({ networkId: 'devnet', addressGroup: 2 })
    expect(parseChainLegacy('alephium:devnet/1')).toEqual({ networkId: 'devnet', addressGroup: 1 })
    expect(parseChainLegacy('alephium:devnet/-1')).toEqual({ networkId: 'devnet', addressGroup: undefined })
    expect(() => parseChainLegacy('alephium:devnet/-2')).toThrow()
  })

  it('test formatChain & parseChain', () => {
    expect(formatChain('devnet', expectedAddressGroup0)).toEqual('alephium:2_devnet')
    expect(formatChain('devnet', expectedAddressGroup1)).toEqual('alephium:1_devnet')
    expect(formatChain('devnet', undefined)).toEqual('alephium:-1_devnet')
    expect(() => formatChain('devnet', -2)).toThrow()
    expect(parseChain('alephium:devnet/2')).toEqual({ networkId: 'devnet', addressGroup: 2 })
    expect(parseChain('alephium:devnet/1')).toEqual({ networkId: 'devnet', addressGroup: 1 })
    expect(parseChain('alephium:devnet/-1')).toEqual({ networkId: 'devnet', addressGroup: undefined })
    expect(parseChain('alephium:2_devnet')).toEqual({ networkId: 'devnet', addressGroup: 2 })
    expect(parseChain('alephium:1_devnet')).toEqual({ networkId: 'devnet', addressGroup: 1 })
    expect(parseChain('alephium:-1_devnet')).toEqual({ networkId: 'devnet', addressGroup: undefined })
    expect(() => parseChain('alephium:devnet/-2')).toThrow()
    expect(() => parseChain('alephium:-2_devnet')).toThrow()
  })

  it('should initialize providers', async () => {
    const provider0 = await WalletConnectProvider.init(TEST_PROVIDER_OPTS)
    expect(provider0.nodeProvider !== undefined).toEqual(true)
    expect(provider0.explorerProvider !== undefined).toEqual(true)
    const provider1 = await WalletConnectProvider.init({ ...TEST_PROVIDER_OPTS, methods: [] })
    expect(provider1.nodeProvider === undefined).toEqual(true)
    expect(provider1.explorerProvider === undefined).toEqual(true)
  })
})

async function waitWalletConnected(client: WalletClient) {
  if (client.topic === undefined) {
    await sleep(500)
    await waitWalletConnected(client)
  }
}

describe('WalletConnectProvider with single addressGroup', function () {
  let provider: WalletConnectProvider
  let walletClient: WalletClient
  let walletAddress: string

  beforeAll(async () => {
    provider = await WalletConnectProvider.init({
      ...TEST_PROVIDER_OPTS
    })
    walletClient = await WalletClient.init(provider, TEST_WALLET_CLIENT_OPTS)
    walletAddress = walletClient.signer.address
    expect(walletAddress).toEqual(ACCOUNTS.a.address)
    await provider.connect()
    expect(provider.permittedChain).toEqual('alephium:0_devnet')
    const selectetAddress = (await provider.getSelectedAccount()).address
    expect(selectetAddress).toEqual(signerA.address)
    await waitWalletConnected(walletClient)
  })

  afterAll(async () => {
    if (!walletClient.disconnected) {
      // disconnect provider
      await Promise.all([
        new Promise<void>((resolve) => {
          provider.on('session_delete', () => {
            resolve()
          })
        }),
        walletClient.disconnect()
      ])
    }
    // expect provider to be disconnected
    expect(walletClient.client?.session.values.length).toEqual(0)
  })

  it('should forward requests', async () => {
    await provider.nodeProvider!.infos.getInfosVersion()
  })

  it('should sign', async () => {
    await verifySign(provider, walletClient)
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
    expectThrowsAsync(
      async () => await walletClient.changeAccount(ACCOUNTS.b.privateKey),
      'Error changing account, chain alephium:1_devnet not permitted'
    )
  })

  it('networkChanged', async () => {
    // change to testnet
    await verifyNetworkChange('testnet', 'https://testnet-wallet.alephium.org', provider, walletClient)
  })
})

describe('WalletConnectProvider with arbitrary addressGroup', function () {
  let provider: WalletConnectProvider
  let walletClient: WalletClient
  let walletAddress: string

  beforeAll(async () => {
    provider = await WalletConnectProvider.init({
      ...TEST_PROVIDER_OPTS,
      networkId: NETWORK_ID,
      addressGroup: undefined
    })
    walletClient = await WalletClient.init(provider, TEST_WALLET_CLIENT_OPTS)
    walletAddress = walletClient.signer.address
    expect(walletAddress).toEqual(ACCOUNTS.a.address)
    await provider.connect()
    expect(provider.permittedChain).toEqual('alephium:-1_devnet')
    const selectedAddress = (await provider.getSelectedAccount()).address
    expect(selectedAddress).toEqual(signerA.address)
    await waitWalletConnected(walletClient)
  })

  afterAll(async () => {
    if (!walletClient.disconnected) {
      // disconnect provider
      await Promise.all([
        new Promise<void>((resolve) => {
          provider.on('session_delete', () => {
            resolve()
          })
        }),
        walletClient.disconnect()
      ])
    }
    // expect provider to be disconnected
    expect(walletClient.client?.session.values.length).toEqual(0)
  })

  it('should sign', async () => {
    await verifySign(provider, walletClient)
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
    new Promise<void>((resolve, _reject) => {
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

async function verifySign(provider: WalletConnectProvider, walletClient: WalletClient) {
  let balance: node.Balance
  async function checkBalanceDecreasing() {
    delay(500)
    const balance1 = await nodeProvider.addresses.getAddressesAddressBalance(ACCOUNTS.a.address)
    if (balance1.balance >= balance.balance || balance1.balance === '0') {
      checkBalanceDecreasing()
    }
    balance = balance1
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

  await Main.execute(provider, {
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

function expectThrowsAsync(method: () => Promise<any>, errorMessage: string) {
  expect(method()).rejects.toThrow(errorMessage)
}
