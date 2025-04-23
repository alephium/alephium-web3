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
  ApiRequestArguments,
  ApiRequestHandler,
  forwardRequests,
  request,
  FungibleTokenMetaData,
  NFTMetaData,
  NFTCollectionMetaData,
  StdInterfaceIds,
  requestWithLog
} from './types'
import { Api as NodeApi, CallContractFailed, CallContractSucceeded } from './api-alephium'
import { HexString, hexToString, isHexString, toNonNegativeBigInt } from '../utils'
import { addressFromContractId, addressFromTokenId, groupOfAddress } from '../address'
import * as node from '../api/api-alephium'

function initializeNodeApi(baseUrl: string, apiKey?: string, customFetch?: typeof fetch): NodeApi<string> {
  const nodeApi = new NodeApi<string>({
    baseUrl: baseUrl,
    baseApiParams: { secure: true },
    securityWorker: (accessToken) => (accessToken !== null ? { headers: { 'X-API-KEY': `${accessToken}` } } : {}),
    customFetch: customFetch ?? ((...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams))
  })
  nodeApi.setSecurityData(apiKey ?? null)
  return nodeApi
}

interface NodeProviderApis {
  wallets: NodeApi<string>['wallets']
  infos: NodeApi<string>['infos']
  blockflow: NodeApi<string>['blockflow']
  addresses: NodeApi<string>['addresses']
  transactions: NodeApi<string>['transactions']
  mempool: NodeApi<string>['mempool']
  contracts: NodeApi<string>['contracts']
  multisig: NodeApi<string>['multisig']
  utils: NodeApi<string>['utils']
  miners: NodeApi<string>['miners']
  events: NodeApi<string>['events']
}

export class NodeProvider implements NodeProviderApis {
  readonly wallets: NodeApi<string>['wallets']
  readonly infos: NodeApi<string>['infos']
  readonly blockflow: NodeApi<string>['blockflow']
  readonly addresses: NodeApi<string>['addresses']
  readonly transactions: NodeApi<string>['transactions']
  readonly mempool: NodeApi<string>['mempool']
  readonly contracts: NodeApi<string>['contracts']
  readonly multisig: NodeApi<string>['multisig']
  readonly utils: NodeApi<string>['utils']
  readonly miners: NodeApi<string>['miners']
  readonly events: NodeApi<string>['events']

  constructor(baseUrl: string, apiKey?: string, customFetch?: typeof fetch)
  constructor(provider: NodeProvider)
  constructor(handler: ApiRequestHandler)
  constructor(param0: string | NodeProvider | ApiRequestHandler, apiKey?: string, customFetch?: typeof fetch) {
    let nodeApi: NodeProviderApis
    if (typeof param0 === 'string') {
      nodeApi = initializeNodeApi(param0, apiKey, customFetch)
    } else if (typeof param0 === 'function') {
      nodeApi = new NodeProvider('https://1.2.3.4:0')
      forwardRequests(nodeApi, param0 as ApiRequestHandler)
    } else {
      nodeApi = param0 as NodeProvider
    }

    this.wallets = { ...nodeApi.wallets }
    this.infos = { ...nodeApi.infos }
    this.blockflow = { ...nodeApi.blockflow }
    this.addresses = { ...nodeApi.addresses }
    this.transactions = { ...nodeApi.transactions }
    this.mempool = { ...nodeApi.mempool }
    this.contracts = { ...nodeApi.contracts }
    this.multisig = { ...nodeApi.multisig }
    this.utils = { ...nodeApi.utils }
    this.miners = { ...nodeApi.miners }
    this.events = { ...nodeApi.events }
    requestWithLog(this)
  }

  request = (args: ApiRequestArguments): Promise<any> => {
    return request(this, args)
  }

  // This can prevent the proxied node provider from being modified
  static Proxy(nodeProvider: NodeProvider): NodeProvider {
    return new NodeProvider(nodeProvider)
  }

  static Remote(handler: ApiRequestHandler): NodeProvider {
    return new NodeProvider(handler)
  }

  // Only use this when the token follows the fungible token interface, check `guessTokenType` first
  fetchFungibleTokenMetaData = async (tokenId: HexString): Promise<FungibleTokenMetaData> => {
    const address = addressFromTokenId(tokenId)
    const group = groupOfAddress(address)
    const calls = Array.from([0, 1, 2, 3], (index) => ({ methodIndex: index, group: group, address: address }))
    const result = await this.contracts.postContractsMulticallContract({
      calls: calls
    })
    const callResults = result.results.map((r) => tryGetCallResult(r))
    return {
      symbol: callResults[0].returns[0].value as any as string,
      name: callResults[1].returns[0].value as any as string,
      decimals: Number(callResults[2].returns[0].value as any as string),
      totalSupply: BigInt(callResults[3].returns[0].value as any as string)
    }
  }

  // Only use this when the token follows the non-fungile token interface, check `guessTokenType` first
  fetchNFTMetaData = async (tokenId: HexString): Promise<NFTMetaData> => {
    const address = addressFromTokenId(tokenId)
    const group = groupOfAddress(address)
    const calls = Array.from([0, 1], (index) => ({ methodIndex: index, group: group, address: address }))
    const result = await this.contracts.postContractsMulticallContract({
      calls: calls
    })
    const tokenUri = hexToString(tryGetCallResult(result.results[0]).returns[0].value as any as string)
    const collectionIndexResult = result.results[1]
    if (collectionIndexResult.type === 'CallContractSucceeded') {
      const successfulCollectionIndexResult = result.results[1] as CallContractSucceeded
      const contractIdReturnResult = successfulCollectionIndexResult.returns[0]
      if (contractIdReturnResult === undefined) {
        throw new Error('Deprecated NFT contract')
      }
      const collectionId = successfulCollectionIndexResult.returns[0].value as any as string
      if (collectionId === undefined || !isHexString(collectionId) || collectionId.length !== 64) {
        throw new Error('Deprecated NFT contract')
      }

      const nftIndexReturnResult = successfulCollectionIndexResult.returns[1]
      if (nftIndexReturnResult === undefined) {
        throw new Error('Deprecated NFT contract')
      }
      const nftIndex = toNonNegativeBigInt(nftIndexReturnResult.value as any as string)
      if (nftIndex === undefined) {
        throw new Error('Deprecated NFT contract')
      }

      // If there are more return values, it is also a deprecated NFT contract
      const thirdResult = successfulCollectionIndexResult.returns[2]
      if (thirdResult !== undefined) {
        throw new Error('Deprecated NFT contract')
      }

      return { tokenUri, collectionId, nftIndex }
    } else {
      const failedCollectionIndexResult = result.results[1] as CallContractFailed
      if (failedCollectionIndexResult.error.startsWith('VM execution error: Invalid method index')) {
        throw new Error('Deprecated NFT contract')
      } else {
        throw new Error(`Failed to call contract, error: ${failedCollectionIndexResult.error}`)
      }
    }
  }

  // Only use this when the contract follows the NFT collection interface, check `guessFollowsNFTCollectionStd` first
  fetchNFTCollectionMetaData = async (collectionId: HexString): Promise<NFTCollectionMetaData> => {
    const address = addressFromContractId(collectionId)
    const group = groupOfAddress(address)
    const calls = Array.from([0, 1], (index) => ({ methodIndex: index, group: group, address: address }))
    const result = await this.contracts.postContractsMulticallContract({ calls })
    const callResults = result.results.map((r) => tryGetCallResult(r))
    return {
      collectionUri: hexToString(callResults[0].returns[0].value as any as string),
      totalSupply: BigInt(callResults[1].returns[0].value as any as string)
    }
  }

  // Only use this when the contract follows the NFT collection with royalty interface, check `guessFollowsNFTCollectionWithRoyaltyStd` first
  fetchNFTRoyaltyAmount = async (collectionId: HexString, tokenId: HexString, salePrice: bigint): Promise<bigint> => {
    const address = addressFromContractId(collectionId)
    const group = groupOfAddress(address)
    const apiResult = await this.contracts.postContractsCallContract({
      address: address,
      group: group,
      methodIndex: 4,
      args: [
        {
          type: 'ByteVec',
          value: tokenId
        },
        {
          type: 'U256',
          value: salePrice.toString()
        }
      ]
    })

    const result = tryGetCallResult(apiResult)
    return BigInt(result.returns[0].value as any as string)
  }

  guessStdInterfaceId = async (tokenId: HexString): Promise<HexString | undefined> => {
    const address = addressFromTokenId(tokenId)
    const rawState = await this.contracts.getContractsAddressState(address)
    const lastImmField = rawState.immFields.slice(-1).pop()?.value
    const interfaceIdPrefix = '414c5048' // the hex of 'ALPH'
    if (typeof lastImmField === 'string' && lastImmField.startsWith(interfaceIdPrefix)) {
      return lastImmField.slice(8)
    } else {
      return undefined
    }
  }

  guessFollowsNFTCollectionStd = async (contractId: HexString): Promise<boolean> => {
    const interfaceId = await this.guessStdInterfaceId(contractId)
    return !!interfaceId && interfaceId.startsWith(StdInterfaceIds.NFTCollection)
  }

  guessFollowsNFTCollectionWithRoyaltyStd = async (contractId: HexString): Promise<boolean> => {
    const interfaceId = await this.guessStdInterfaceId(contractId)
    return interfaceId === StdInterfaceIds.NFTCollectionWithRoyalty
  }

  guessStdTokenType = async (tokenId: HexString): Promise<'fungible' | 'non-fungible' | undefined> => {
    const interfaceId = await this.guessStdInterfaceId(tokenId)
    switch (true) {
      case interfaceId?.startsWith(StdInterfaceIds.FungibleToken):
        return 'fungible'
      case interfaceId?.startsWith(StdInterfaceIds.NFT):
        return 'non-fungible'
      default:
        return undefined
    }
  }
}

export function tryGetCallResult(result: node.CallContractResult): node.CallContractSucceeded {
  if (result.type === 'CallContractFailed') {
    throw new Error(`Failed to call contract, error: ${(result as node.CallContractFailed).error}`)
  }
  return result as node.CallContractSucceeded
}
