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
  StdInterfaceIds
} from './types'
import { Api as NodeApi } from './api-alephium'
import { HexString } from '../contract'
import { addressFromContractId, addressFromTokenId, groupOfAddress, hexToString } from '../utils'

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
    return {
      symbol: result.results[0].returns[0].value as any as string,
      name: result.results[1].returns[0].value as any as string,
      decimals: Number(result.results[2].returns[0].value as any as string),
      totalSupply: BigInt(result.results[3].returns[0].value as any as string)
    }
  }

  // Only use this when the token follows the non-fungile token interface, check `guessTokenType` first
  fetchNFTMetaData = async (tokenId: HexString): Promise<NFTMetaData> => {
    const address = addressFromTokenId(tokenId)
    const group = groupOfAddress(address)
    const result = await this.contracts.postContractsCallContract({ methodIndex: 0, group, address })
    return {
      tokenUri: hexToString(result.returns[0].value as any as string)
    }
  }

  // Only use this when the contract follows the NFT collection interface, check `guessFollowsNFTCollectionStd` first
  fetchNFTCollectionMetaData = async (contractId: HexString): Promise<NFTCollectionMetaData> => {
    const address = addressFromContractId(contractId)
    const group = groupOfAddress(address)
    const calls = Array.from([0, 1], (index) => ({ methodIndex: index, group: group, address: address }))
    const result = await this.contracts.postContractsMulticallContract({ calls })
    return {
      collectionUri: hexToString(result.results[0].returns[0].value as any as string),
      totalSupply: BigInt(result.results[1].returns[0].value as any as string)
    }
  }

  guessStdInterfaceId = async (tokenId: HexString): Promise<HexString | undefined> => {
    const address = addressFromTokenId(tokenId)
    const group = groupOfAddress(address)
    const rawState = await this.contracts.getContractsAddressState(addressFromTokenId(tokenId), { group })
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
    return interfaceId === StdInterfaceIds.NFTCollection
  }

  guessStdTokenType = async (tokenId: HexString): Promise<'fungible' | 'non-fungible' | undefined> => {
    const interfaceId = await this.guessStdInterfaceId(tokenId)
    switch (interfaceId) {
      case StdInterfaceIds.FungibleToken:
        return 'fungible'
      case StdInterfaceIds.NFT:
        return 'non-fungible'
      default:
        return undefined
    }
  }
}
