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
import { Account, EnableOptionsBase, InteractiveSignerProvider } from '@alephium/web3'

export type EnableOptions = EnableOptionsBase

export abstract class AlephiumWindowObject extends InteractiveSignerProvider<EnableOptions> {
  abstract id: string
  abstract name: string
  abstract icon: string
  abstract version: string

  abstract isPreauthorized: (options: EnableOptions) => Promise<boolean>
  enableIfConnected = async (options: EnableOptions): Promise<Account | undefined> => {
    const isPreauthorized = await this.isPreauthorized(options)
    if (isPreauthorized) {
      return await super.enable(options)
    } else {
      return undefined
    }
  }

  abstract get connectedAccount(): Account | undefined
  abstract get connectedNetworkId(): string | undefined
}

export type WalletProvider = {
  id: string
  name: string
  icon: string
  downloads:
    | { chrome?: `https://chrome.google.com/webstore/detail/${string}` }
    | { firefox?: `https://addons.mozilla.org/en-US/firefox/addon/${string}` }
}

export function providerInitializedEvent(id: string): string {
  return `alephiumProviders/${id}#initialized`
}
