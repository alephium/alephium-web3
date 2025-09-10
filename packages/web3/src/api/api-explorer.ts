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
  conflicted?: boolean
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
  conflictedTxs?: string[]
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
  /** @format int64 */
  timestamp: number
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

/** GatewayTimeout */
export interface GatewayTimeout {
  detail: string
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
  conflicted?: boolean
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
  Aud = 'aud',
  Hkd = 'hkd',
  Thb = 'thb',
  Cny = 'cny'
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
     * No description
     *
     * @tags Blocks
     * @name GetBlocks
     * @summary List latest blocks
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
      this.request<
        ListBlocks,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/blocks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blocks
     * @name GetBlocksBlockHash
     * @summary Get a block with hash
     * @request GET:/blocks/{block_hash}
     */
    getBlocksBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<
        BlockEntry,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/blocks/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blocks
     * @name GetBlocksBlockHashTransactions
     * @summary Get block's transactions
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
      this.request<
        Transaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/blocks/${blockHash}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  transactions = {
    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsTransactionHash
     * @summary Get a transaction with hash
     * @request GET:/transactions/{transaction_hash}
     */
    getTransactionsTransactionHash: (transactionHash: string, params: RequestParams = {}) =>
      this.request<
        TransactionLike,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/transactions/${transactionHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  addresses = {
    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddress
     * @summary Get address information
     * @request GET:/addresses/{address}
     */
    getAddressesAddress: (address: string, params: RequestParams = {}) =>
      this.request<
        AddressInfo,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressTransactions
     * @summary List transactions of a given address
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
      this.request<
        Transaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name PostAddressesTransactions
     * @summary List transactions for given addresses
     * @request POST:/addresses/transactions
     * @deprecated
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
      this.request<
        Transaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/transactions`,
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
     * @tags Addresses
     * @name GetAddressesAddressTimerangedTransactions
     * @summary List transactions of a given address within a time-range
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
      this.request<
        Transaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/timeranged-transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressTotalTransactions
     * @summary Get total transactions of a given address
     * @request GET:/addresses/{address}/total-transactions
     */
    getAddressesAddressTotalTransactions: (address: string, params: RequestParams = {}) =>
      this.request<
        number,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/total-transactions`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressLatestTransaction
     * @summary Get latest transaction information of a given address
     * @request GET:/addresses/{address}/latest-transaction
     */
    getAddressesAddressLatestTransaction: (address: string, params: RequestParams = {}) =>
      this.request<
        TransactionInfo,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/latest-transaction`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressMempoolTransactions
     * @summary List mempool transactions of a given address
     * @request GET:/addresses/{address}/mempool/transactions
     */
    getAddressesAddressMempoolTransactions: (address: string, params: RequestParams = {}) =>
      this.request<
        MempoolTransaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/mempool/transactions`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressBalance
     * @summary Get address balance
     * @request GET:/addresses/{address}/balance
     */
    getAddressesAddressBalance: (address: string, params: RequestParams = {}) =>
      this.request<
        AddressBalance,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/balance`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressTokens
     * @summary List address tokens
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
      this.request<
        string[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/tokens`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressTokensTokenIdTransactions
     * @summary List address tokens
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
      this.request<
        Transaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/tokens/${tokenId}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressTokensTokenIdBalance
     * @summary Get address balance of given token
     * @request GET:/addresses/{address}/tokens/{token_id}/balance
     */
    getAddressesAddressTokensTokenIdBalance: (address: string, tokenId: string, params: RequestParams = {}) =>
      this.request<
        AddressTokenBalance,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/tokens/${tokenId}/balance`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressPublicKey
     * @summary Use `/addresses/{address}/typed-public-key` instead
     * @request GET:/addresses/{address}/public-key
     * @deprecated
     */
    getAddressesAddressPublicKey: (address: string, params: RequestParams = {}) =>
      this.request<
        string,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/public-key`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressTokensBalance
     * @summary Get address tokens with balance
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
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/tokens-balance`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses, Addresses
     * @name PostAddressesUsed
     * @summary Are the addresses used (at least 1 transaction)
     * @request POST:/addresses/used
     */
    postAddressesUsed: (data?: string[], params: RequestParams = {}) =>
      this.request<
        boolean[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
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
      this.request<
        string,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
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
     * @name GetAddressesAddressAmountHistory
     * @request GET:/addresses/{address}/amount-history
     * @deprecated
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
      this.request<
        AmountHistory,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/addresses/${address}/amount-history`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  infos = {
    /**
     * No description
     *
     * @tags Infos
     * @name GetInfos
     * @summary Get explorer informations
     * @request GET:/infos
     */
    getInfos: (params: RequestParams = {}) =>
      this.request<
        ExplorerInfo,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosHeights
     * @summary List latest height for each chain
     * @request GET:/infos/heights
     */
    getInfosHeights: (params: RequestParams = {}) =>
      this.request<
        PerChainHeight[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos/heights`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosSupply
     * @summary Get token supply list
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
      this.request<
        TokenSupply[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos/supply`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosSupplyTotalAlph
     * @summary Get the ALPH total supply
     * @request GET:/infos/supply/total-alph
     */
    getInfosSupplyTotalAlph: (params: RequestParams = {}) =>
      this.request<
        number,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos/supply/total-alph`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosSupplyCirculatingAlph
     * @summary Get the ALPH circulating supply
     * @request GET:/infos/supply/circulating-alph
     */
    getInfosSupplyCirculatingAlph: (params: RequestParams = {}) =>
      this.request<
        number,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos/supply/circulating-alph`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosSupplyReservedAlph
     * @summary Get the ALPH reserved supply
     * @request GET:/infos/supply/reserved-alph
     */
    getInfosSupplyReservedAlph: (params: RequestParams = {}) =>
      this.request<
        number,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos/supply/reserved-alph`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosSupplyLockedAlph
     * @summary Get the ALPH locked supply
     * @request GET:/infos/supply/locked-alph
     */
    getInfosSupplyLockedAlph: (params: RequestParams = {}) =>
      this.request<
        number,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos/supply/locked-alph`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosTotalTransactions
     * @summary Get the total number of transactions
     * @request GET:/infos/total-transactions
     */
    getInfosTotalTransactions: (params: RequestParams = {}) =>
      this.request<
        number,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos/total-transactions`,
        method: 'GET',
        format: 'text',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosAverageBlockTimes
     * @summary Get the average block time for each chain
     * @request GET:/infos/average-block-times
     */
    getInfosAverageBlockTimes: (params: RequestParams = {}) =>
      this.request<
        PerChainDuration[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/infos/average-block-times`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  mempool = {
    /**
     * No description
     *
     * @tags Mempool
     * @name GetMempoolTransactions
     * @summary list mempool transactions
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
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
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
     * No description
     *
     * @tags Tokens
     * @name GetTokens
     * @summary List token information
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
      this.request<
        TokenInfo[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/tokens`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Tokens
     * @name PostTokens
     * @summary List given tokens information
     * @request POST:/tokens
     */
    postTokens: (data?: string[], params: RequestParams = {}) =>
      this.request<
        TokenInfo[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/tokens`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Tokens
     * @name GetTokensTokenIdTransactions
     * @summary List token transactions
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
      this.request<
        Transaction[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/tokens/${tokenId}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Tokens
     * @name GetTokensTokenIdAddresses
     * @summary List token addresses
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
      this.request<
        string[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/tokens/${tokenId}/addresses`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description If metadata doesn't exist or token isn't a fungible, it won't be in the output list
     *
     * @tags Tokens
     * @name PostTokensFungibleMetadata
     * @summary Return metadata for the given fungible tokens
     * @request POST:/tokens/fungible-metadata
     */
    postTokensFungibleMetadata: (data?: string[], params: RequestParams = {}) =>
      this.request<
        FungibleTokenMetadata[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/tokens/fungible-metadata`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description If metadata doesn't exist or token isn't a nft, it won't be in the output list
     *
     * @tags Tokens
     * @name PostTokensNftMetadata
     * @summary Return metadata for the given nft tokens
     * @request POST:/tokens/nft-metadata
     */
    postTokensNftMetadata: (data?: string[], params: RequestParams = {}) =>
      this.request<
        NFTMetadata[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/tokens/nft-metadata`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description If metadata doesn't exist or address isn't a nft collection, it won't be in the output list
     *
     * @tags Tokens
     * @name PostTokensNftCollectionMetadata
     * @summary Return metadata for the given nft collection addresses
     * @request POST:/tokens/nft-collection-metadata
     */
    postTokensNftCollectionMetadata: (data?: string[], params: RequestParams = {}) =>
      this.request<
        NFTCollectionMetadata[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/tokens/nft-collection-metadata`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Updates once per day.
     *
     * @tags Tokens
     * @name GetTokensHoldersAlph
     * @summary Get a sorted list of top addresses by ALPH balance
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
      this.request<
        HolderInfo[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/tokens/holders/alph`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Updates once per day.
     *
     * @tags Tokens
     * @name GetTokensHoldersTokenTokenId
     * @summary Get a sorted list of top addresses by {token_id} balance. Updates once per day.
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
      this.request<
        HolderInfo[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
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
      this.request<
        Hashrate[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
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
      this.request<
        TimedCount[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
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
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
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
     * No description
     *
     * @tags Contract events
     * @name GetContractEventsTransactionIdTransactionId
     * @summary Get contract events by transaction id
     * @request GET:/contract-events/transaction-id/{transaction_id}
     */
    getContractEventsTransactionIdTransactionId: (transactionId: string, params: RequestParams = {}) =>
      this.request<
        Event[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/contract-events/transaction-id/${transactionId}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contract events
     * @name GetContractEventsContractAddressContractAddress
     * @summary Get contract events by contract address
     * @request GET:/contract-events/contract-address/{contract_address}
     */
    getContractEventsContractAddressContractAddress: (
      contractAddress: string,
      query?: {
        /** @format int32 */
        event_index?: number
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
        Event[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/contract-events/contract-address/${contractAddress}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contract events
     * @name GetContractEventsContractAddressContractAddressInputAddressInputAddress
     * @summary Get contract events by contract and input addresses
     * @request GET:/contract-events/contract-address/{contract_address}/input-address/{input_address}
     */
    getContractEventsContractAddressContractAddressInputAddressInputAddress: (
      contractAddress: string,
      inputAddress: string,
      query?: {
        /** @format int32 */
        event_index?: number
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
        Event[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/contract-events/contract-address/${contractAddress}/input-address/${inputAddress}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  contracts = {
    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsContractAddressCurrentLiveness
     * @summary Get contract liveness
     * @request GET:/contracts/{contract_address}/current-liveness
     */
    getContractsContractAddressCurrentLiveness: (contractAddress: string, params: RequestParams = {}) =>
      this.request<
        ContractLiveness,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/contracts/${contractAddress}/current-liveness`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsContractAddressParent
     * @summary Get contract parent address if exist
     * @request GET:/contracts/{contract_address}/parent
     */
    getContractsContractAddressParent: (contractAddress: string, params: RequestParams = {}) =>
      this.request<
        ContractParent,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/contracts/${contractAddress}/parent`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsContractAddressSubContracts
     * @summary Get sub contract addresses
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
      this.request<
        SubContracts,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
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
      this.request<
        number[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
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
      this.request<
        TimedPrices,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/market/prices/${symbol}/charts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  utils = {
    /**
     * No description
     *
     * @tags Utils
     * @name PutUtilsSanityCheck
     * @summary Perform a sanity check
     * @request PUT:/utils/sanity-check
     */
    putUtilsSanityCheck: (params: RequestParams = {}) =>
      this.request<
        void,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/utils/sanity-check`,
        method: 'PUT',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Utils
     * @name PutUtilsUpdateGlobalLoglevel
     * @summary Update global log level, accepted: TRACE, DEBUG, INFO, WARN, ERROR
     * @request PUT:/utils/update-global-loglevel
     */
    putUtilsUpdateGlobalLoglevel: (data: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', params: RequestParams = {}) =>
      this.request<
        void,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/utils/update-global-loglevel`,
        method: 'PUT',
        body: data,
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Utils
     * @name PutUtilsUpdateLogConfig
     * @summary Update logback values
     * @request PUT:/utils/update-log-config
     */
    putUtilsUpdateLogConfig: (data?: LogbackValue[], params: RequestParams = {}) =>
      this.request<
        void,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/utils/update-log-config`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params
      }).then(convertHttpResponse)
  }
}
