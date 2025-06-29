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
import EventEmitter from 'eventemitter3'
import { SessionTypes } from '@walletconnect/types'
import SignClient from '@walletconnect/sign-client'
import { SESSION_CONTEXT, SIGN_CLIENT_STORAGE_PREFIX } from '@walletconnect/sign-client'
import { isBrowser } from '@walletconnect/utils'
import {
  getChainsFromNamespaces,
  getAccountsFromNamespaces,
  getSdkError,
  mapToObj,
  objToMap
} from '@walletconnect/utils'
import {
  SignerProvider,
  Account,
  SignTransferTxParams,
  SignTransferTxResult,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
  SignMessageParams,
  SignMessageResult,
  groupOfAddress,
  addressFromPublicKey,
  NodeProvider,
  ExplorerProvider,
  ApiRequestArguments,
  NetworkId,
  networkIds,
  EnableOptionsBase,
  SignChainedTxParams,
  SignChainedTxResult,
  TraceableError,
  isGroupedAccount,
  isGrouplessAccount
} from '@alephium/web3'

import {
  ALEPHIUM_DEEP_LINK,
  LOGGER,
  PROVIDER_NAMESPACE,
  RELAY_METHODS,
  RELAY_URL,
  VALID_ADDRESS_GROUPS
} from './constants'
import {
  AddressGroup,
  RelayMethodParams,
  RelayMethodResult,
  ProviderEvent,
  ProviderEventArgument,
  RelayMethod,
  SignClientOptions,
  ChainInfo
} from './types'
import { isMobile } from './utils'
import {
  CORE_STORAGE_PREFIX,
  CORE_STORAGE_OPTIONS,
  HISTORY_STORAGE_VERSION,
  HISTORY_CONTEXT,
  STORE_STORAGE_VERSION,
  MESSAGES_STORAGE_VERSION,
  MESSAGES_CONTEXT
} from '@walletconnect/core'
import { KeyValueStorage } from '@walletconnect/keyvaluestorage'
import { JsonRpcRecord, MessageRecord } from '@walletconnect/types'
import { Sema } from 'async-sema'

const REQUESTS_PER_SECOND_LIMIT = 5

export interface ProviderOptions extends EnableOptionsBase, SignClientOptions {
  // Alephium options
  networkId: NetworkId // the id of the network, e.g. mainnet, testnet or devnet.
  addressGroup?: number // either a specific group or undefined to support all groups
  methods?: RelayMethod[] // all of the methods to be used in relay; no need to configure in most cases

  // WalletConnect options
  client?: SignClient // existing sign client; no need to configure in most cases
}

export class WalletConnectProvider extends SignerProvider {
  private providerOpts: ProviderOptions

  public events: EventEmitter = new EventEmitter()
  public nodeProvider: NodeProvider | undefined
  public explorerProvider: ExplorerProvider | undefined

  public networkId: NetworkId
  public addressGroup: AddressGroup
  public permittedChain: string
  public methods: RelayMethod[]

  public account: Account | undefined = undefined

  public client!: SignClient
  public session: SessionTypes.Struct | undefined
  private rateLimit = RateLimit(REQUESTS_PER_SECOND_LIMIT)

  static async init(opts: ProviderOptions): Promise<WalletConnectProvider> {
    const provider = new WalletConnectProvider(opts)
    await provider.initialize()
    return provider
  }

  private constructor(opts: ProviderOptions) {
    super()

    this.providerOpts = opts
    this.networkId = opts.networkId
    this.addressGroup = opts.addressGroup
    this.permittedChain = formatChain(this.networkId, this.addressGroup)

    this.methods = opts.methods ?? [...RELAY_METHODS]
    if (this.methods.includes('alph_requestNodeApi')) {
      this.nodeProvider = NodeProvider.Remote(this.requestNodeAPI)
    } else {
      this.nodeProvider = undefined
    }
    if (this.methods.includes('alph_requestExplorerApi')) {
      this.explorerProvider = ExplorerProvider.Remote(this.requestExplorerAPI)
    } else {
      this.explorerProvider = undefined
    }
  }

  public async connect(): Promise<void> {
    if (!this.session) {
      const { uri, approval } = await this.client.connect({
        requiredNamespaces: {
          alephium: {
            chains: [this.permittedChain],
            methods: this.methods,
            events: ['accountChanged']
          }
        }
      })

      if (uri) {
        this.emitEvents('displayUri', uri)
      }

      this.session = await approval()
      this.updateNamespace(this.session.namespaces)
    } else {
      this.updateNamespace(this.session.namespaces)
    }
    await this.cleanMessages()
  }

  public async disconnect(): Promise<void> {
    if (!this.client || !this.session) {
      throw new Error('Sign Client not initialized')
    }

    await this.providerOpts.onDisconnected()

    const reason = getSdkError('USER_DISCONNECTED')
    try {
      await this.client.disconnect({ topic: this.session.topic, reason })
    } catch (error) {
      await this.client.session.delete(this.session.topic, reason)
      await this.client.core.crypto.deleteSymKey(this.session.topic)
    }
    this.session = undefined
    this.account = undefined
  }

  public on<E extends ProviderEvent>(event: E, listener: (args: ProviderEventArgument<E>) => any): void {
    this.events.on(event, listener)
  }

  public once<E extends ProviderEvent>(event: ProviderEvent, listener: (args: ProviderEventArgument<E>) => any): void {
    this.events.once(event, listener)
  }

  public removeListener<E extends ProviderEvent>(
    event: ProviderEvent,
    listener: (args: ProviderEventArgument<E>) => any
  ): void {
    this.events.removeListener(event, listener)
  }

  public off<E extends ProviderEvent>(event: ProviderEvent, listener: (args: ProviderEventArgument<E>) => any): void {
    this.events.off(event, listener)
  }

  // ---------- Signer Methods ----------------------------------------------- //

  protected unsafeGetSelectedAccount(): Promise<Account> {
    if (this.account === undefined) {
      throw Error('Account is not available')
    }
    return Promise.resolve(this.account)
  }

  public async signAndSubmitTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
    return this.typedRequest('alph_signAndSubmitTransferTx', params)
  }

  public async signAndSubmitDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> {
    return this.typedRequest('alph_signAndSubmitDeployContractTx', params)
  }

  public async signAndSubmitExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> {
    return this.typedRequest('alph_signAndSubmitExecuteScriptTx', params)
  }

  public async signAndSubmitUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    return this.typedRequest('alph_signAndSubmitUnsignedTx', params)
  }

  public async signAndSubmitChainedTx(params: SignChainedTxParams[]): Promise<SignChainedTxResult[]> {
    return this.typedRequest('alph_signAndSubmitChainedTx', params)
  }

  public async signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    return this.typedRequest('alph_signUnsignedTx', params)
  }

  public async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    return this.typedRequest('alph_signMessage', params)
  }

  // ---------- Private ----------------------------------------------- //

  private getCustomStoragePrefix(): string {
    return this.providerOpts.customStoragePrefix ?? 'alephium'
  }

  private getWCStorageKey(prefix: string, version: string, name: string): string {
    const customStoragePrefix = `:${this.getCustomStoragePrefix()}`
    return prefix + version + customStoragePrefix + '//' + name
  }

  private async getSessionTopics(storage: KeyValueStorage): Promise<string[]> {
    const sessionKey = this.getWCStorageKey(SIGN_CLIENT_STORAGE_PREFIX, STORE_STORAGE_VERSION, SESSION_CONTEXT)
    const sessions = await storage.getItem<SessionTypes.Struct[]>(sessionKey)
    if (sessions === undefined) {
      return []
    }
    return sessions
      .filter((session) => {
        const chains = getChainsFromNamespaces(session.namespaces, [PROVIDER_NAMESPACE])
        return chains.length > 0 && chains.every((c) => c.startsWith(PROVIDER_NAMESPACE))
      })
      .map((session) => session.topic)
  }

  // clean the `history` and `messages` storage before `SignClient` init
  private async cleanBeforeInit() {
    console.log('Clean storage before SignClient init')
    const storage = new KeyValueStorage({ ...CORE_STORAGE_OPTIONS })
    const historyStorageKey = this.getWCStorageKey(CORE_STORAGE_PREFIX, HISTORY_STORAGE_VERSION, HISTORY_CONTEXT)
    const historyRecords = await storage.getItem<JsonRpcRecord[]>(historyStorageKey)
    if (historyRecords !== undefined) {
      const remainRecords = historyRecords.filter((record) => !this.needToDeleteHistory(record))
      await storage.setItem<JsonRpcRecord[]>(historyStorageKey, remainRecords)
    }

    const topics = await this.getSessionTopics(storage)
    if (topics.length > 0) {
      const messageStorageKey = this.getWCStorageKey(CORE_STORAGE_PREFIX, MESSAGES_STORAGE_VERSION, MESSAGES_CONTEXT)
      const messages = await storage.getItem<Record<string, MessageRecord>>(messageStorageKey)
      if (messages === undefined) {
        return
      }

      const messagesMap = objToMap(messages)
      topics.forEach((topic) => messagesMap.delete(topic))
      await storage.setItem<Record<string, MessageRecord>>(messageStorageKey, mapToObj(messagesMap))
      console.log(`Clean topics from messages storage: ${topics.join(',')}`)
    }
  }

  private needToDeleteHistory(record: JsonRpcRecord): boolean {
    const request = record.request
    if (request.method !== 'wc_sessionRequest') {
      return false
    }
    const alphRequestMethod = request.params?.request?.method
    return alphRequestMethod === 'alph_requestNodeApi' || alphRequestMethod === 'alph_requestExplorerApi'
  }

  private cleanHistory(checkResponse: boolean) {
    try {
      const records = this.client.core.history.records
      for (const [id, record] of records) {
        if (checkResponse && record.response === undefined) {
          continue
        }
        if (this.needToDeleteHistory(record)) {
          this.client.core.history.delete(record.topic, id)
        }
      }
    } catch (error) {
      console.error(`Failed to clean history, error: ${error}`)
    }
  }

  private async cleanMessages() {
    if (this.session !== undefined) {
      try {
        await this.client.core.relayer.messages.del(this.session.topic)
      } catch (error) {
        console.error(`Failed to clean messages, error: ${error}, topic: ${this.session.topic}`)
      }
    }
  }

  private async initialize() {
    try {
      await this.cleanBeforeInit()
    } catch (error) {
      console.error(`Failed to clean storage, error: ${error}`)
    }
    await this.createClient()
    this.cleanHistory(false)
    this.checkStorage()
    this.registerEventListeners()
  }

  private async createClient() {
    this.client =
      this.providerOpts.client ||
      (await SignClient.init({
        ...this.providerOpts,
        logger: this.providerOpts.logger || LOGGER,
        relayUrl: this.providerOpts.relayUrl || RELAY_URL,
        customStoragePrefix: this.getCustomStoragePrefix()
      }))
  }

  private checkStorage() {
    const sessionKeys = this.client.session.keys
    for (let i = sessionKeys.length - 1; i >= 0; i--) {
      const session = this.client.session.get(sessionKeys[`${i}`])
      const hasKeyChain = this.client.core.crypto.keychain.has(session.topic)
      const chains = getChainsFromNamespaces(session.namespaces, [PROVIDER_NAMESPACE])
      if (this.sameChains(chains, [this.permittedChain]) && hasKeyChain) {
        this.session = session
        return
      }
    }
  }

  private registerEventListeners() {
    if (typeof this.client === 'undefined') {
      throw new Error('Sign Client is not initialized')
    }

    this.client.on('session_ping', (args) => {
      if (args.topic === this.session?.topic) {
        this.emitEvents('session_ping', args)
      }
    })

    this.client.on('session_event', (args) => {
      if (args.topic === this.session?.topic) {
        this.emitEvents('session_event', args)
      }
    })

    this.client.on('session_update', ({ topic, params }) => {
      if (topic === this.session?.topic) {
        const { namespaces } = params
        const _session = this.client?.session.get(topic)
        this.session = { ..._session, namespaces } as SessionTypes.Struct
        this.updateNamespace(this.session.namespaces)
        this.emitEvents('session_update', { topic, params })
      }
    })

    this.client.on('session_delete', (args) => {
      if (args.topic === this.session?.topic) {
        this.emitEvents('session_delete')
      }
    })
  }

  private emitEvents(event: ProviderEvent, data?: any): void {
    this.events.emit(event, data)
  }

  private typedRequest<T extends RelayMethod>(method: T, params: RelayMethodParams<T>): Promise<RelayMethodResult<T>> {
    return this.request({ method, params })
  }

  // The provider only supports signer methods. The other requests should use Alephium Rest API.
  private async request<T = unknown>(args: { method: string; params: any }): Promise<T> {
    await this.rateLimit()
    if (!this.session) {
      throw new Error('Sign Client not initialized')
    }

    if (!(this.methods as string[]).includes(args.method)) {
      return Promise.reject(new Error(`Invalid method was passed: ${args.method}`))
    }

    if (!args.method.startsWith('alph_request')) {
      const signerAddress = args.params?.signerAddress
      if (typeof signerAddress === 'undefined') {
        throw new Error('Cannot request without signerAddress')
      }
      const selectedAddress = (await this.getSelectedAccount()).address
      if (signerAddress !== selectedAddress) {
        throw new Error(`Invalid signer address: ${args.params.signerAddress}`)
      }
    }

    try {
      const isSignRequest = args.method.startsWith('alph_sign')
      if (isSignRequest) {
        redirectToDeepLink()
      }
      const response = await this.client.request<T>({
        request: {
          method: args.method,
          params: args.params
        },
        chainId: this.permittedChain,
        topic: this.session?.topic
      })
      if (!isSignRequest) {
        this.cleanHistory(true)
      }
      await this.cleanMessages()
      return response
    } catch (error: any) {
      throw new TraceableError(`Failed to request ${args.method}`, error)
    }
  }

  private requestNodeAPI = (args: ApiRequestArguments): Promise<any> => {
    return this.typedRequest('alph_requestNodeApi', args)
  }

  private requestExplorerAPI = (args: ApiRequestArguments): Promise<any> => {
    return this.typedRequest('alph_requestExplorerApi', args)
  }

  private updateNamespace(namespaces: SessionTypes.Namespaces) {
    const chains = getChainsFromNamespaces(namespaces, [PROVIDER_NAMESPACE])
    this.setChain(chains)
    const accounts = getAccountsFromNamespaces(namespaces, [PROVIDER_NAMESPACE])
    this.setAccounts(accounts)
  }

  private sameChains(chains0: string[], chains1?: string[]): boolean {
    if (typeof chains1 === 'undefined') {
      return false
    } else {
      return chains0.join() === chains1.join()
    }
  }

  private setChain(chains: string[]) {
    if (!this.sameChains(chains, [this.permittedChain])) {
      throw Error('Network or address group has changed')
    }
  }

  private sameAccounts(account0: Account[], account1?: Account[]): boolean {
    if (typeof account1 === 'undefined') {
      return false
    } else {
      return account0.map((a) => a.address).join() === account1.map((a) => a.address).join()
    }
  }

  isPreauthorized(): boolean {
    if (!this.session) return false
    const accounts = getAccountsFromNamespaces(this.session.namespaces, [PROVIDER_NAMESPACE])
    const parsedAccounts = accounts.map(parseAccount)
    const { networkId, addressGroup, keyType } = this.providerOpts
    return !!parsedAccounts.find(
      (account) =>
        networkId === account.networkId &&
        isCompatibleAddressGroup(account, addressGroup) &&
        (keyType === undefined || account.keyType === keyType)
    )
  }

  private lastSetAccounts?: Account[]
  private setAccounts(accounts: string[]) {
    const parsedAccounts = accounts.map(parseAccount)
    if (this.sameAccounts(parsedAccounts, this.lastSetAccounts)) {
      return
    } else {
      this.lastSetAccounts = parsedAccounts
    }

    if (parsedAccounts.length !== 1) {
      throw Error('The WC provider does not supports multiple accounts')
    }

    const newAccount = parsedAccounts[0]
    if (!isCompatibleAddressGroup(newAccount, this.addressGroup)) {
      throw Error('The new account belongs to an unexpected address group')
    }

    this.account = newAccount
    this.emitEvents('accountChanged', newAccount)
  }
}

export function isCompatibleChain(chain: string): boolean {
  return chain.startsWith(`${PROVIDER_NAMESPACE}:`)
}

export function isCompatibleAddressGroup(account: Account, expectedAddressGroup: AddressGroup): boolean {
  return (
    expectedAddressGroup === undefined ||
    isGrouplessAccount(account) ||
    (isGroupedAccount(account) && expectedAddressGroup === account.group)
  )
}

export function parseChain(chainString: string): ChainInfo {
  try {
    const [namespace, _addressGroup, networkId] = chainString.replace(/_/g, ':').split(':')
    if (namespace !== PROVIDER_NAMESPACE) {
      throw Error(`Invalid namespace: expected ${PROVIDER_NAMESPACE}, but got ${namespace}`)
    }
    const addressGroup = parseInt(_addressGroup, 10)
    validateAddressGroup(addressGroup)

    const networkIdList = networkIds as ReadonlyArray<string>
    if (!networkIdList.includes(networkId)) {
      throw Error(`Invalid network id, expect one of ${networkIdList}`)
    }
    return {
      networkId: networkId as NetworkId,
      addressGroup: addressGroup === -1 ? undefined : addressGroup
    }
  } catch (error) {
    console.debug('Failed to parse chain, falling back to legacy parsing', chainString)
    return parseChainLegacy(chainString)
  }
}

export function parseChainLegacy(chainString: string): ChainInfo {
  const [_namespace, networkId, _addressGroup] = chainString.replace(/\//g, ':').split(':')
  const addressGroup = parseInt(_addressGroup, 10)
  validateAddressGroup(addressGroup)

  const networkIdList = networkIds as ReadonlyArray<string>
  if (!networkIdList.includes(networkId)) {
    throw Error(`Invalid network id, expect one of ${networkIdList}`)
  }
  return {
    networkId: networkId as NetworkId,
    addressGroup: addressGroup === -1 ? undefined : addressGroup
  }
}

export function formatChain(networkId: NetworkId, addressGroup: AddressGroup): string {
  const addressGroupNumber = toAddressGroupNumber(addressGroup)
  return `${PROVIDER_NAMESPACE}:${addressGroupNumber}_${networkId}`
}

export function formatChainLegacy(networkId: NetworkId, addressGroup: AddressGroup): string {
  if (addressGroup !== undefined && addressGroup < 0) {
    throw Error('Address group in provider needs to be either undefined or non-negative')
  }
  const addressGroupNumber = toAddressGroupNumber(addressGroup)
  return `${PROVIDER_NAMESPACE}:${networkId}/${addressGroupNumber}`
}

export function formatAccount(permittedChain: string, account: Account): string {
  return `${permittedChain}:${account.publicKey}_${account.keyType}`
}

export function formatAccountLegacy(permittedChain: string, account: Account): string {
  return `${permittedChain}:${account.publicKey}/${account.keyType}`
}

export function parseAccount(accountString: string): Account & { networkId: NetworkId } {
  try {
    const [_namespace, _group, networkId, publicKey, keyType] = accountString.replace(/_/g, ':').split(':')
    const address = addressFromPublicKey(publicKey)
    const group = groupOfAddress(address)
    if (keyType !== 'default' && keyType !== 'bip340-schnorr') {
      throw Error(`Invalid key type: ${keyType}`)
    }
    return { address, group, publicKey, keyType, networkId: networkId as NetworkId }
  } catch (error) {
    console.debug(`Failed to parse account ${accountString}, falling back to legacy parsing`)
    return parseAccountLegacy(accountString)
  }
}

export function parseAccountLegacy(account: string): Account & { networkId: NetworkId } {
  const [_namespace, networkId, _group, publicKey, keyType] = account.replace(/\//g, ':').split(':')
  const address = addressFromPublicKey(publicKey)
  const group = groupOfAddress(address)
  if (keyType !== 'default' && keyType !== 'bip340-schnorr') {
    throw Error(`Invalid key type: ${keyType}`)
  }
  return { address, group, publicKey, keyType, networkId: networkId as NetworkId }
}

function redirectToDeepLink() {
  if (isMobile() && isBrowser()) {
    window.open(ALEPHIUM_DEEP_LINK, '_self', 'noreferrer noopener')
  }
}

function RateLimit(rps: number) {
  const sema = new Sema(rps)
  const delay = 1000 // 1 second

  return async () => {
    const waitingLength = sema.nrWaiting()
    if (waitingLength > 0) {
      console.warn(
        `There are currently ${waitingLength} requests in the waiting queue. Please reduce the number of WalletConnect requests.`
      )
    }
    await sema.acquire()
    setTimeout(() => sema.release(), delay)
  }
}

function toAddressGroupNumber(addressGroup: AddressGroup): number {
  const groupNumber = addressGroup !== undefined ? addressGroup : -1
  validateAddressGroup(groupNumber)
  return groupNumber
}

function validateAddressGroup(addressGroup: number) {
  if (!VALID_ADDRESS_GROUPS.includes(addressGroup)) {
    throw Error('Address group must be -1 (for any groups) or between 0 and 3 (inclusive)')
  }
}
