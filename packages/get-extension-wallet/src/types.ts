import {
  Account,
  EnableOptionsBase,
  InteractiveSignerProvider,
} from "@alephium/web3"

export type EnableOptions = EnableOptionsBase

export abstract class AlephiumWindowObject extends InteractiveSignerProvider<EnableOptions> {
  abstract id: string
  abstract name: string
  abstract icon: string
  abstract version: string

  abstract isPreauthorized: (options: EnableOptions) => Promise<boolean>
  enableIfConnected = async (
    options: EnableOptions,
  ): Promise<Account | undefined> => {
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
