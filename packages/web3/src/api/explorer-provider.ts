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

import { ApiRequestArguments, ApiRequestHandler, forwardRequests, request } from './types'
import { Api as ExplorerApi } from './api-explorer'

function initializeExplorerApi(baseUrl: string, apiKey?: string, customFetch?: typeof fetch): ExplorerApi<string> {
  const explorerApi = new ExplorerApi<string>({
    baseUrl: baseUrl,
    baseApiParams: { secure: true },
    securityWorker: (accessToken) => (accessToken !== null ? { headers: { 'X-API-KEY': `${accessToken}` } } : {}),
    customFetch: customFetch ?? ((...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams))
  })
  explorerApi.setSecurityData(apiKey ?? null)
  return explorerApi
}

export class ExplorerProvider {
  readonly blocks: ExplorerApi<string>['blocks']
  readonly transactions: ExplorerApi<string>['transactions']
  readonly addresses: ExplorerApi<string>['addresses']
  readonly infos: ExplorerApi<string>['infos']
  readonly mempool: ExplorerApi<string>['mempool']
  readonly tokens: ExplorerApi<string>['tokens']
  readonly charts: ExplorerApi<string>['charts']
  readonly contractEvents: ExplorerApi<string>['contractEvents']
  readonly contracts: ExplorerApi<string>['contracts']
  readonly market: ExplorerApi<string>['market']
  readonly utils: ExplorerApi<string>['utils']

  constructor(baseUrl: string, apiKey?: string, customFetch?: typeof fetch)
  constructor(provider: ExplorerProvider)
  constructor(handler: ApiRequestHandler)
  constructor(param0: string | ExplorerProvider | ApiRequestHandler, apiKey?: string, customFetch?: typeof fetch) {
    let explorerApi: ExplorerProvider
    if (typeof param0 === 'string') {
      explorerApi = initializeExplorerApi(param0, apiKey, customFetch)
    } else if (typeof param0 === 'function') {
      explorerApi = new ExplorerProvider('https://1.2.3.4:0')
      forwardRequests(explorerApi, param0 as ApiRequestHandler)
    } else {
      explorerApi = param0 as ExplorerProvider
    }

    this.blocks = { ...explorerApi.blocks }
    this.transactions = { ...explorerApi.transactions }
    this.addresses = { ...explorerApi.addresses }
    this.infos = { ...explorerApi.infos }
    this.mempool = { ...explorerApi.mempool }
    this.tokens = { ...explorerApi.tokens }
    this.charts = { ...explorerApi.charts }
    this.utils = { ...explorerApi.utils }
    this.contracts = { ...explorerApi.contracts }
    this.market = { ...explorerApi.market }
    this.contractEvents = { ...explorerApi.contractEvents }
  }

  request = (args: ApiRequestArguments): Promise<any> => {
    return request(this, args)
  }

  // This can prevent the proxied explorer provider from being modified
  static Proxy(explorerProvider: ExplorerProvider): ExplorerProvider {
    return new ExplorerProvider(explorerProvider)
  }

  static Remote(handler: ApiRequestHandler): ExplorerProvider {
    return new ExplorerProvider(handler)
  }
}
