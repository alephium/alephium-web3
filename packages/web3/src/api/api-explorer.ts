/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** AcceptedTransaction */
export interface AcceptedTransaction {
  /** @format 32-byte-hash */
  hash: string
  /** @format block-hash */
  blockHash: string
  /** @format int64 */
  timestamp: number
  inputs?: Input[]
  outputs?: Output[]
  version: number
  networkId: number
  scriptOpt?: string
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  scriptExecutionOk: boolean
  inputSignatures?: string[]
  scriptSignatures?: string[]
  coinbase: boolean
  type: string
}

/** AddressBalance */
export interface AddressBalance {
  /** @format uint256 */
  balance: string
  /** @format uint256 */
  lockedBalance: string
}

/** AddressInfo */
export interface AddressInfo {
  /** @format uint256 */
  balance: string
  /** @format uint256 */
  lockedBalance: string
  /** @format int32 */
  txNumber: number
}

/** AddressTokenBalance */
export interface AddressTokenBalance {
  /** @format 32-byte-hash */
  tokenId: string
  /** @format uint256 */
  balance: string
  /** @format uint256 */
  lockedBalance: string
}

/** AmountHistory */
export interface AmountHistory {
  amountHistory?: string[][]
}

/** AssetOutput */
export interface AssetOutput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens?: Token[]
  /** @format int64 */
  lockTime?: number
  /** @format hex-string */
  message?: string
  /** @format 32-byte-hash */
  spent?: string
  fixedOutput: boolean
  type: string
}

/** BadRequest */
export interface BadRequest {
  detail: string
}

/** BlockEntry */
export interface BlockEntry {
  /** @format block-hash */
  hash: string
  /** @format int64 */
  timestamp: number
  /** @format group-index */
  chainFrom: number
  /** @format group-index */
  chainTo: number
  /** @format int32 */
  height: number
  deps?: string[]
  /** @format hex-string */
  nonce: string
  version: number
  /** @format 32-byte-hash */
  depStateHash: string
  /** @format 32-byte-hash */
  txsHash: string
  /** @format int32 */
  txNumber: number
  /** @format hex-string */
  target: string
  /** @format bigint */
  hashRate: string
  /** @format block-hash */
  parent?: string
  mainChain: boolean
  ghostUncles?: GhostUncle[]
}

/** BlockEntryLite */
export interface BlockEntryLite {
  /** @format block-hash */
  hash: string
  /** @format int64 */
  timestamp: number
  /** @format group-index */
  chainFrom: number
  /** @format group-index */
  chainTo: number
  /** @format int32 */
  height: number
  /** @format int32 */
  txNumber: number
  mainChain: boolean
  /** @format bigint */
  hashRate: string
}

/** ContractLiveness */
export interface ContractLiveness {
  /** @format address */
  parent?: string
  creation: ContractLivenessLocation
  destruction?: ContractLivenessLocation
  interfaceId?: StdInterfaceId
}

/** ContractLivenessLocation */
export interface ContractLivenessLocation {
  /** @format block-hash */
  blockHash: string
  /** @format 32-byte-hash */
  txHash: string
  /** @format int64 */
  timestamp: number
}

/** ContractOutput */
export interface ContractOutput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens?: Token[]
  /** @format 32-byte-hash */
  spent?: string
  fixedOutput: boolean
  type: string
}

/** ContractParent */
export interface ContractParent {
  /** @format address */
  parent?: string
}

/** Event */
export interface Event {
  /** @format block-hash */
  blockHash: string
  /** @format 32-byte-hash */
  txHash: string
  /** @format address */
  contractAddress: string
  /** @format address */
  inputAddress?: string
  /** @format int32 */
  eventIndex: number
  fields?: Val[]
}

/** ExplorerInfo */
export interface ExplorerInfo {
  releaseVersion: string
  commit: string
  /** @format int32 */
  migrationsVersion: number
  /** @format int64 */
  lastFinalizedInputTime: number
  /** @format int64 */
  lastHoldersUpdate: number
}

/** FungibleToken */
export interface FungibleToken {
  id: string
  type: string
}

/** FungibleTokenMetadata */
export interface FungibleTokenMetadata {
  /** @format 32-byte-hash */
  id: string
  symbol: string
  name: string
  /** @format uint256 */
  decimals: string
}

/** GhostUncle */
export interface GhostUncle {
  /** @format block-hash */
  blockHash: string
  /** @format address */
  miner: string
}

/** Hashrate */
export interface Hashrate {
  /** @format int64 */
  timestamp: number
  hashrate: number
  value: number
}

/** HolderInfo */
export interface HolderInfo {
  /** @format address */
  address: string
  /** @format uint256 */
  balance: string
}

/** Input */
export interface Input {
  outputRef: OutputRef
  /** @format hex-string */
  unlockScript?: string
  /** @format 32-byte-hash */
  txHashRef?: string
  /** @format address */
  address?: string
  /** @format uint256 */
  attoAlphAmount?: string
  tokens?: Token[]
  contractInput: boolean
}

/** InternalServerError */
export interface InternalServerError {
  detail: string
}

/** IntervalType */
export enum IntervalType {
  Daily = 'daily',
  Hourly = 'hourly',
  Weekly = 'weekly'
}

/** ListBlocks */
export interface ListBlocks {
  /** @format int32 */
  total: number
  blocks?: BlockEntryLite[]
}

/** LogbackValue */
export interface LogbackValue {
  name: string
  level: string
}

/** MempoolTransaction */
export interface MempoolTransaction {
  /** @format 32-byte-hash */
  hash: string
  /** @format group-index */
  chainFrom: number
  /** @format group-index */
  chainTo: number
  inputs?: Input[]
  outputs?: Output[]
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  /** @format int64 */
  lastSeen: number
}

/** NFT */
export interface NFT {
  id: string
  type: string
}

/** NFTCollection */
export interface NFTCollection {
  type: string
}

/** NFTCollectionMetadata */
export interface NFTCollectionMetadata {
  /** @format address */
  address: string
  collectionUri: string
}

/** NFTCollectionWithRoyalty */
export interface NFTCollectionWithRoyalty {
  type: string
}

/** NFTMetadata */
export interface NFTMetadata {
  /** @format 32-byte-hash */
  id: string
  tokenUri: string
  /** @format 32-byte-hash */
  collectionId: string
  /** @format uint256 */
  nftIndex: string
}

/** NonStandard */
export interface NonStandard {
  type: string
}

/** NotFound */
export interface NotFound {
  detail: string
  resource: string
}

/** Output */
export type Output = AssetOutput | ContractOutput

/** OutputRef */
export interface OutputRef {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
}

/** PendingTransaction */
export interface PendingTransaction {
  /** @format 32-byte-hash */
  hash: string
  /** @format group-index */
  chainFrom: number
  /** @format group-index */
  chainTo: number
  inputs?: Input[]
  outputs?: Output[]
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  /** @format int64 */
  lastSeen: number
  type: string
}

/** PerChainCount */
export interface PerChainCount {
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int64 */
  count: number
}

/** PerChainDuration */
export interface PerChainDuration {
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int64 */
  duration: number
  /** @format int64 */
  value: number
}

/** PerChainHeight */
export interface PerChainHeight {
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int64 */
  height: number
  /** @format int64 */
  value: number
}

/** PerChainTimedCount */
export interface PerChainTimedCount {
  /** @format int64 */
  timestamp: number
  totalCountPerChain?: PerChainCount[]
}

/** ServiceUnavailable */
export interface ServiceUnavailable {
  detail: string
}

/** StdInterfaceId */
export type StdInterfaceId = FungibleToken | NFT | NFTCollection | NFTCollectionWithRoyalty | NonStandard | Unknown

/** SubContracts */
export interface SubContracts {
  subContracts?: string[]
}

/** TimedCount */
export interface TimedCount {
  /** @format int64 */
  timestamp: number
  /** @format int64 */
  totalCountAllChains: number
}

/** TimedPrices */
export interface TimedPrices {
  timestamps?: number[]
  prices?: number[]
}

/** Token */
export interface Token {
  /** @format 32-byte-hash */
  id: string
  /** @format uint256 */
  amount: string
}

/** TokenInfo */
export interface TokenInfo {
  /** @format 32-byte-hash */
  token: string
  /** Raw interface id, e.g. 0001 */
  stdInterfaceId?: TokenStdInterfaceId | string
}

/** TokenStdInterfaceId */
export enum TokenStdInterfaceId {
  Fungible = 'fungible',
  NonFungible = 'non-fungible',
  NonStandard = 'non-standard'
}

/** TokenSupply */
export interface TokenSupply {
  /** @format int64 */
  timestamp: number
  /** @format uint256 */
  total: string
  /** @format uint256 */
  circulating: string
  /** @format uint256 */
  reserved: string
  /** @format uint256 */
  locked: string
  /** @format uint256 */
  maximum: string
}

/** Transaction */
export interface Transaction {
  /** @format 32-byte-hash */
  hash: string
  /** @format block-hash */
  blockHash: string
  /** @format int64 */
  timestamp: number
  inputs?: Input[]
  outputs?: Output[]
  version: number
  networkId: number
  scriptOpt?: string
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  scriptExecutionOk: boolean
  inputSignatures?: string[]
  scriptSignatures?: string[]
  coinbase: boolean
}

/** TransactionInfo */
export interface TransactionInfo {
  /** @format 32-byte-hash */
  hash: string
  /** @format block-hash */
  blockHash: string
  /** @format int64 */
  timestamp: number
  coinbase: boolean
}

/** TransactionLike */
export type TransactionLike = AcceptedTransaction | PendingTransaction

/** Unauthorized */
export interface Unauthorized {
  detail: string
}

/** Unknown */
export interface Unknown {
  id: string
  type: string
}

/** Val */
export type Val = ValAddress | ValArray | ValBool | ValByteVec | ValI256 | ValU256

/** ValAddress */
export interface ValAddress {
  /** @format address */
  value: string
  type: string
}

/** ValArray */
export interface ValArray {
  value: Val[]
  type: string
}

/** ValBool */
export interface ValBool {
  value: boolean
  type: string
}

/** ValByteVec */
export interface ValByteVec {
  /** @format hex-string */
  value: string
  type: string
}

/** ValI256 */
export interface ValI256 {
  /** @format bigint */
  value: string
  type: string
}

/** ValU256 */
export interface ValU256 {
  /** @format uint256 */
  value: string
  type: string
}

export enum PaginationLimitDefault {
  Value20 = 20,
  Value10 = 10
}

export enum PaginationLimitMax {
  Value100 = 100,
  Value20 = 20
}

export enum PaginationPageDefault {
  Value1 = 1
}

export enum MaxSizeTokens {
  Value80 = 80
}

export enum MaxSizeAddressesForTokens {
  Value80 = 80
}

export enum MaxSizeAddresses {
  Value80 = 80
}

export enum TokensWithPrice {
  WETH = 'WETH',
  ALPH = 'ALPH',
  USDT = 'USDT',
  AYIN = 'AYIN',
  DAI = 'DAI',
  USDC = 'USDC',
  WBTC = 'WBTC'
}

export enum Currencies {
  Btc = 'btc',
  Eth = 'eth',
  Usd = 'usd',
  Eur = 'eur',
  Chf = 'chf',
  Gbp = 'gbp',
  Idr = 'idr',
  Vnd = 'vnd',
  Rub = 'rub',
  Try = 'try',
  Cad = 'cad',
  Aud = 'aud'
}

import 'cross-fetch/polyfill'
import { convertHttpResponse } from './utils'

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain'
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = ''
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input)
  }

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {})
      }
    }
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {})
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body)
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      return data
    })
  }
}

/**
 * @title Alephium Explorer API
 * @version 1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  blocks = {
    /**
     * @description List latest blocks
     *
     * @tags Blocks
     * @name GetBlocks
     * @request GET:/blocks
     */
    getBlocks: (
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
        /** Reverse pagination */
        reverse?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<ListBlocks, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blocks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get a block with hash
     *
     * @tags Blocks
     * @name GetBlocksBlockHash
     * @request GET:/blocks/{block_hash}
     */
    getBlocksBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<BlockEntry, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blocks/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get block's transactions
     *
     * @tags Blocks
     * @name GetBlocksBlockHashTransactions
     * @request GET:/blocks/{block_hash}/transactions
     */
    getBlocksBlockHashTransactions: (
      blockHash: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blocks/${blockHash}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  transactions = {
    /**
     * @description Get a transaction with hash
     *
     * @tags Transactions
     * @name GetTransactionsTransactionHash
     * @request GET:/transactions/{transaction_hash}
     */
    getTransactionsTransactionHash: (transactionHash: string, params: RequestParams = {}) =>
      this.request<TransactionLike, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/${transactionHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  addresses = {
    /**
     * @description Get address information
     *
     * @tags Addresses
     * @name GetAddressesAddress
     * @request GET:/addresses/{address}
     */
    getAddressesAddress: (address: string, params: RequestParams = {}) =>
      this.request<AddressInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List transactions of a given address
     *
     * @tags Addresses
     * @name GetAddressesAddressTransactions
     * @request GET:/addresses/{address}/transactions
     */
    getAddressesAddressTransactions: (
      address: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List transactions for given addresses
     *
     * @tags Addresses
     * @name PostAddressesTransactions
     * @request POST:/addresses/transactions
     */
    postAddressesTransactions: (
      query?: {
        /**
         * inclusive
         * @format int64
         * @min 0
         */
        fromTs?: number
        /**
         * exclusive
         * @format int64
         * @min 0
         */
        toTs?: number
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      data?: string[],
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/transactions`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List transactions of a given address within a time-range
     *
     * @tags Addresses
     * @name GetAddressesAddressTimerangedTransactions
     * @request GET:/addresses/{address}/timeranged-transactions
     */
    getAddressesAddressTimerangedTransactions: (
      address: string,
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/timeranged-transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get total transactions of a given address
     *
     * @tags Addresses
     * @name GetAddressesAddressTotalTransactions
     * @request GET:/addresses/{address}/total-transactions
     */
    getAddressesAddressTotalTransactions: (address: string, params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/total-transactions`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get latest transaction information of a given address
     *
     * @tags Addresses
     * @name GetAddressesAddressLatestTransaction
     * @request GET:/addresses/{address}/latest-transaction
     */
    getAddressesAddressLatestTransaction: (address: string, params: RequestParams = {}) =>
      this.request<TransactionInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/latest-transaction`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List mempool transactions of a given address
     *
     * @tags Addresses
     * @name GetAddressesAddressMempoolTransactions
     * @request GET:/addresses/{address}/mempool/transactions
     */
    getAddressesAddressMempoolTransactions: (address: string, params: RequestParams = {}) =>
      this.request<
        MempoolTransaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/addresses/${address}/mempool/transactions`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get address balance
     *
     * @tags Addresses
     * @name GetAddressesAddressBalance
     * @request GET:/addresses/{address}/balance
     */
    getAddressesAddressBalance: (address: string, params: RequestParams = {}) =>
      this.request<AddressBalance, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/balance`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List address tokens
     *
     * @tags Addresses
     * @name GetAddressesAddressTokens
     * @request GET:/addresses/{address}/tokens
     * @deprecated
     */
    getAddressesAddressTokens: (
      address: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<string[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/tokens`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List address tokens
     *
     * @tags Addresses
     * @name GetAddressesAddressTokensTokenIdTransactions
     * @request GET:/addresses/{address}/tokens/{token_id}/transactions
     */
    getAddressesAddressTokensTokenIdTransactions: (
      address: string,
      tokenId: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/tokens/${tokenId}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get address balance of given token
     *
     * @tags Addresses
     * @name GetAddressesAddressTokensTokenIdBalance
     * @request GET:/addresses/{address}/tokens/{token_id}/balance
     */
    getAddressesAddressTokensTokenIdBalance: (address: string, tokenId: string, params: RequestParams = {}) =>
      this.request<
        AddressTokenBalance,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/addresses/${address}/tokens/${tokenId}/balance`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get public key of p2pkh addresses, the address needs to have at least one input.
     *
     * @tags Addresses
     * @name GetAddressesAddressPublicKey
     * @request GET:/addresses/{address}/public-key
     */
    getAddressesAddressPublicKey: (address: string, params: RequestParams = {}) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/public-key`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get address tokens with balance
     *
     * @tags Addresses
     * @name GetAddressesAddressTokensBalance
     * @request GET:/addresses/{address}/tokens-balance
     */
    getAddressesAddressTokensBalance: (
      address: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<
        AddressTokenBalance[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/addresses/${address}/tokens-balance`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Are the addresses used (at least 1 transaction)
     *
     * @tags Addresses, Addresses
     * @name PostAddressesUsed
     * @request POST:/addresses/used
     */
    postAddressesUsed: (data?: string[], params: RequestParams = {}) =>
      this.request<boolean[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/used`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressExportTransactionsCsv
     * @request GET:/addresses/{address}/export-transactions/csv
     */
    getAddressesAddressExportTransactionsCsv: (
      address: string,
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
      },
      params: RequestParams = {}
    ) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/export-transactions/csv`,
        method: 'GET',
        query: query,
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressAmountHistoryDeprecated
     * @request GET:/addresses/{address}/amount-history-DEPRECATED
     * @deprecated
     */
    getAddressesAddressAmountHistoryDeprecated: (
      address: string,
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/amount-history-DEPRECATED`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressAmountHistory
     * @request GET:/addresses/{address}/amount-history
     */
    getAddressesAddressAmountHistory: (
      address: string,
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<AmountHistory, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/amount-history`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  infos = {
    /**
     * @description Get explorer informations
     *
     * @tags Infos
     * @name GetInfos
     * @request GET:/infos
     */
    getInfos: (params: RequestParams = {}) =>
      this.request<ExplorerInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List latest height for each chain
     *
     * @tags Infos
     * @name GetInfosHeights
     * @request GET:/infos/heights
     */
    getInfosHeights: (params: RequestParams = {}) =>
      this.request<PerChainHeight[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/heights`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get token supply list
     *
     * @tags Infos
     * @name GetInfosSupply
     * @request GET:/infos/supply
     */
    getInfosSupply: (
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<TokenSupply[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get the ALPH total supply
     *
     * @tags Infos
     * @name GetInfosSupplyTotalAlph
     * @request GET:/infos/supply/total-alph
     */
    getInfosSupplyTotalAlph: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply/total-alph`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get the ALPH circulating supply
     *
     * @tags Infos
     * @name GetInfosSupplyCirculatingAlph
     * @request GET:/infos/supply/circulating-alph
     */
    getInfosSupplyCirculatingAlph: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply/circulating-alph`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get the ALPH reserved supply
     *
     * @tags Infos
     * @name GetInfosSupplyReservedAlph
     * @request GET:/infos/supply/reserved-alph
     */
    getInfosSupplyReservedAlph: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply/reserved-alph`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get the ALPH locked supply
     *
     * @tags Infos
     * @name GetInfosSupplyLockedAlph
     * @request GET:/infos/supply/locked-alph
     */
    getInfosSupplyLockedAlph: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/supply/locked-alph`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get the total number of transactions
     *
     * @tags Infos
     * @name GetInfosTotalTransactions
     * @request GET:/infos/total-transactions
     */
    getInfosTotalTransactions: (params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/total-transactions`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get the average block time for each chain
     *
     * @tags Infos
     * @name GetInfosAverageBlockTimes
     * @request GET:/infos/average-block-times
     */
    getInfosAverageBlockTimes: (params: RequestParams = {}) =>
      this.request<PerChainDuration[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>(
        {
          path: `/infos/average-block-times`,
          method: 'GET',
          format: 'json',
          ...params
        }
      ).then(convertHttpResponse)
  }
  mempool = {
    /**
     * @description list mempool transactions
     *
     * @tags Mempool
     * @name GetMempoolTransactions
     * @request GET:/mempool/transactions
     */
    getMempoolTransactions: (
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<
        MempoolTransaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/mempool/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  tokens = {
    /**
     * @description List token information
     *
     * @tags Tokens
     * @name GetTokens
     * @request GET:/tokens
     */
    getTokens: (
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
        /**
         * fungible, non-fungible, non-standard or any interface id in hex-string format, e.g: 0001
         * @format string
         */
        'interface-id'?: TokenStdInterfaceId | string
      },
      params: RequestParams = {}
    ) =>
      this.request<TokenInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List given tokens information
     *
     * @tags Tokens
     * @name PostTokens
     * @request POST:/tokens
     */
    postTokens: (data?: string[], params: RequestParams = {}) =>
      this.request<TokenInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List token transactions
     *
     * @tags Tokens
     * @name GetTokensTokenIdTransactions
     * @request GET:/tokens/{token_id}/transactions
     */
    getTokensTokenIdTransactions: (
      tokenId: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens/${tokenId}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description List token addresses
     *
     * @tags Tokens
     * @name GetTokensTokenIdAddresses
     * @request GET:/tokens/{token_id}/addresses
     */
    getTokensTokenIdAddresses: (
      tokenId: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<string[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens/${tokenId}/addresses`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Return metadata for the given fungible tokens, if metadata doesn't exist or token isn't a fungible, it won't be in the output list
     *
     * @tags Tokens
     * @name PostTokensFungibleMetadata
     * @request POST:/tokens/fungible-metadata
     */
    postTokensFungibleMetadata: (data?: string[], params: RequestParams = {}) =>
      this.request<
        FungibleTokenMetadata[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/tokens/fungible-metadata`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Return metadata for the given nft tokens, if metadata doesn't exist or token isn't a nft, it won't be in the output list
     *
     * @tags Tokens
     * @name PostTokensNftMetadata
     * @request POST:/tokens/nft-metadata
     */
    postTokensNftMetadata: (data?: string[], params: RequestParams = {}) =>
      this.request<NFTMetadata[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens/nft-metadata`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Return metadata for the given nft collection addresses, if metadata doesn't exist or address isn't a nft collection, it won't be in the output list
     *
     * @tags Tokens
     * @name PostTokensNftCollectionMetadata
     * @request POST:/tokens/nft-collection-metadata
     */
    postTokensNftCollectionMetadata: (data?: string[], params: RequestParams = {}) =>
      this.request<
        NFTCollectionMetadata[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/tokens/nft-collection-metadata`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get a sorted list of top addresses by ALPH balance. Updates once per day.
     *
     * @tags Tokens
     * @name GetTokensHoldersAlph
     * @request GET:/tokens/holders/alph
     */
    getTokensHoldersAlph: (
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<HolderInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens/holders/alph`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get a sorted list of top addresses by {token_id} balance. Updates once per day.
     *
     * @tags Tokens
     * @name GetTokensHoldersTokenTokenId
     * @request GET:/tokens/holders/token/{token_id}
     */
    getTokensHoldersTokenTokenId: (
      tokenId: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<HolderInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/tokens/holders/token/${tokenId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  charts = {
    /**
     * @description `interval-type` query param: hourly, daily
     *
     * @tags Charts
     * @name GetChartsHashrates
     * @summary Get hashrate chart in H/s
     * @request GET:/charts/hashrates
     */
    getChartsHashrates: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<Hashrate[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/charts/hashrates`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description `interval-type` query param: hourly, daily
     *
     * @tags Charts
     * @name GetChartsTransactionsCount
     * @summary Get transaction count history
     * @request GET:/charts/transactions-count
     */
    getChartsTransactionsCount: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<TimedCount[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/charts/transactions-count`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description `interval-type` query param: hourly, daily
     *
     * @tags Charts
     * @name GetChartsTransactionsCountPerChain
     * @summary Get transaction count history per chain
     * @request GET:/charts/transactions-count-per-chain
     */
    getChartsTransactionsCountPerChain: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs: number
        'interval-type': IntervalType
      },
      params: RequestParams = {}
    ) =>
      this.request<
        PerChainTimedCount[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/charts/transactions-count-per-chain`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  contractEvents = {
    /**
     * @description Get contract events by transaction id
     *
     * @tags Contract events
     * @name GetContractEventsTransactionIdTransactionId
     * @request GET:/contract-events/transaction-id/{transaction_id}
     */
    getContractEventsTransactionIdTransactionId: (transactionId: string, params: RequestParams = {}) =>
      this.request<Event[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contract-events/transaction-id/${transactionId}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get contract events by contract address
     *
     * @tags Contract events
     * @name GetContractEventsContractAddressContractAddress
     * @request GET:/contract-events/contract-address/{contract_address}
     */
    getContractEventsContractAddressContractAddress: (
      contractAddress: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<Event[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contract-events/contract-address/${contractAddress}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get contract events by contract and input addresses
     *
     * @tags Contract events
     * @name GetContractEventsContractAddressContractAddressInputAddressInputAddress
     * @request GET:/contract-events/contract-address/{contract_address}/input-address/{input_address}
     */
    getContractEventsContractAddressContractAddressInputAddressInputAddress: (
      contractAddress: string,
      inputAddress: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<Event[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contract-events/contract-address/${contractAddress}/input-address/${inputAddress}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  contracts = {
    /**
     * @description Get contract liveness
     *
     * @tags Contracts
     * @name GetContractsContractAddressCurrentLiveness
     * @request GET:/contracts/{contract_address}/current-liveness
     */
    getContractsContractAddressCurrentLiveness: (contractAddress: string, params: RequestParams = {}) =>
      this.request<ContractLiveness, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${contractAddress}/current-liveness`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get contract parent address if exist
     *
     * @tags Contracts
     * @name GetContractsContractAddressParent
     * @request GET:/contracts/{contract_address}/parent
     */
    getContractsContractAddressParent: (contractAddress: string, params: RequestParams = {}) =>
      this.request<ContractParent, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${contractAddress}/parent`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Get sub contract addresses
     *
     * @tags Contracts
     * @name GetContractsContractAddressSubContracts
     * @request GET:/contracts/{contract_address}/sub-contracts
     */
    getContractsContractAddressSubContracts: (
      contractAddress: string,
      query?: {
        /**
         * Page number
         * @format int32
         * @min 1
         */
        page?: number
        /**
         * Number of items per page
         * @format int32
         * @min 0
         * @max 100
         */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<SubContracts, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${contractAddress}/sub-contracts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  market = {
    /**
     * No description
     *
     * @tags Market
     * @name PostMarketPrices
     * @request POST:/market/prices
     */
    postMarketPrices: (
      query: {
        currency: string
      },
      data?: string[],
      params: RequestParams = {}
    ) =>
      this.request<number[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/market/prices`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Market
     * @name GetMarketPricesSymbolCharts
     * @request GET:/market/prices/{symbol}/charts
     */
    getMarketPricesSymbolCharts: (
      symbol: string,
      query: {
        currency: string
      },
      params: RequestParams = {}
    ) =>
      this.request<TimedPrices, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/market/prices/${symbol}/charts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  utils = {
    /**
     * @description Perform a sanity check
     *
     * @tags Utils
     * @name PutUtilsSanityCheck
     * @request PUT:/utils/sanity-check
     */
    putUtilsSanityCheck: (params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/sanity-check`,
        method: 'PUT',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Update global log level, accepted: TRACE, DEBUG, INFO, WARN, ERROR
     *
     * @tags Utils
     * @name PutUtilsUpdateGlobalLoglevel
     * @request PUT:/utils/update-global-loglevel
     */
    putUtilsUpdateGlobalLoglevel: (data: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/update-global-loglevel`,
        method: 'PUT',
        body: data,
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Update logback values
     *
     * @tags Utils
     * @name PutUtilsUpdateLogConfig
     * @request PUT:/utils/update-log-config
     */
    putUtilsUpdateLogConfig: (data?: LogbackValue[], params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/update-log-config`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params
      }).then(convertHttpResponse)
  }
}
