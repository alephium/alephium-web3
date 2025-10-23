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

import { ExplorerProvider, NodeProvider } from './api'
import { NetworkId } from './utils'

let _currentNodeProvider: NodeProvider | undefined = undefined

export function setCurrentNodeProvider(provider: NodeProvider): void
export function setCurrentNodeProvider(baseUrl: string, apiKey?: string, customFetch?: typeof fetch): void
export function setCurrentNodeProvider(
  provider: NodeProvider | string,
  apiKey?: string,
  customFetch?: typeof fetch
): void {
  if (typeof provider == 'string') {
    _currentNodeProvider = new NodeProvider(provider, apiKey, customFetch)
  } else {
    _currentNodeProvider = provider
  }
}

export function getCurrentNodeProvider(): NodeProvider {
  if (typeof _currentNodeProvider === 'undefined') {
    throw Error('No node provider is set.')
  }
  return _currentNodeProvider
}

let _currentExplorerProvider: ExplorerProvider | undefined = undefined

export function setCurrentExplorerProvider(provider: ExplorerProvider): void
export function setCurrentExplorerProvider(baseUrl: string, apiKey?: string, customFetch?: typeof fetch): void
export function setCurrentExplorerProvider(
  provider: ExplorerProvider | string,
  apiKey?: string,
  customFetch?: typeof fetch
): void {
  if (typeof provider == 'string') {
    _currentExplorerProvider = new ExplorerProvider(provider, apiKey, customFetch)
  } else {
    _currentExplorerProvider = provider
  }
}

// Different from `NodeProvider`, this may return `undefined`
// as ExplorerProvider is not necessary for all applications
export function getCurrentExplorerProvider(): ExplorerProvider | undefined {
  return _currentExplorerProvider
}

const DEFAULT_PROVIDER_URLS = {
  mainnet: {
    nodeUrl: 'https://node.mainnet.alephium.org',
    explorerUrl: 'https://backend.mainnet.alephium.org'
  },
  testnet: {
    nodeUrl: 'https://node.testnet.alephium.org',
    explorerUrl: 'https://backend.testnet.alephium.org'
  },
  devnet: {
    nodeUrl: 'http://127.0.0.1:22973',
    explorerUrl: 'http://127.0.0.1:9090'
  }
}

export function getDefaultNodeProvider(networkId: NetworkId): NodeProvider {
  return new NodeProvider(DEFAULT_PROVIDER_URLS[networkId].nodeUrl)
}

export function getDefaultExplorerProvider(networkId: NetworkId): ExplorerProvider {
  return new ExplorerProvider(DEFAULT_PROVIDER_URLS[networkId].explorerUrl)
}
