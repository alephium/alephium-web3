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
import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import type { EnableOptionsBase } from '@alephium/web3'
import { useContext } from '../components/AlephiumConnect'
import { useCallback } from 'react'

export type ConnectOptions = Omit<EnableOptionsBase, 'onDisconnected'>

export function useConnect(options: ConnectOptions) {
  const context = useContext()

  const disconnectAlephium = useCallback(() => {
    getDefaultAlephiumWallet()
      .then((alephium) => {
        if (!!alephium) {
          alephium.disconnect()
          context.setAccount(undefined)
          context.setSignerProvider(undefined)
        }
      })
      .catch((error: any) => {
        console.error(error)
      })
  }, [context])

  const connectAlephium = useCallback(async () => {
    const windowAlephium = await getDefaultAlephiumWallet()

    const enabledAccount = await windowAlephium
      ?.enable({
        ...options,
        onDisconnected: disconnectAlephium
      })
      .catch(() => undefined) // Need to catch the exception here

    if (windowAlephium && enabledAccount) {
      context.setSignerProvider(windowAlephium)
      context.setAccount(enabledAccount)
    }

    return enabledAccount
  }, [context])

  return { connect: connectAlephium, disconnect: disconnectAlephium }
}
