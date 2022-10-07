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

import { Api as NodeApi } from './api-alephium'
import { Api as ExplorerApi } from './api-explorer'

function initializeNodeApi(baseUrl: string, apiKey?: string): NodeApi<string> {
  const nodeApi = new NodeApi<string>({
    baseUrl: baseUrl,
    baseApiParams: { secure: true },
    securityWorker: (accessToken) => (accessToken !== null ? { headers: { 'X-API-KEY': `${accessToken}` } } : {})
  })
  nodeApi.setSecurityData(apiKey ?? null)
  return nodeApi
}

export class NodeProvider {
  wallets: NodeApi<string>['wallets']
  infos: NodeApi<string>['infos']
  blockflow: NodeApi<string>['blockflow']
  addresses: NodeApi<string>['addresses']
  transactions: NodeApi<string>['transactions']
  contracts: NodeApi<string>['contracts']
  multisig: NodeApi<string>['multisig']
  utils: NodeApi<string>['utils']
  miners: NodeApi<string>['miners']
  events: NodeApi<string>['events']

  constructor(baseUrl: string, apiKey?: string) {
    const nodeApi = initializeNodeApi(baseUrl, apiKey)

    this.wallets = nodeApi.wallets
    this.infos = nodeApi.infos
    this.blockflow = nodeApi.blockflow
    this.addresses = nodeApi.addresses
    this.transactions = nodeApi.transactions
    this.contracts = nodeApi.contracts
    this.multisig = nodeApi.multisig
    this.utils = nodeApi.utils
    this.miners = nodeApi.miners
    this.events = nodeApi.events
  }
}

// TODO: use proxy provider once the endpoints are refined.
export class ExplorerProvider extends ExplorerApi<null> {
  constructor(baseUrl: string) {
    super({ baseUrl: baseUrl })
  }
}

export * as node from './api-alephium'
export * as explorer from './api-explorer'
export * from './types'
