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

import { Account, NetworkId } from '@alephium/web3'
import { ConnectorId } from '../types'

export const LastConnectedAccountKey = 'alph:lastConnectedAccount'

export type ConnectedAccount = {
  connectorId: ConnectorId
  account: Account
  network: NetworkId
}

function getStorage() {
  return window === undefined ? undefined : window.localStorage
}

export function getLastConnectedAccount(): ConnectedAccount | undefined {
  const storage = getStorage()
  if (storage === undefined) {
    return undefined
  }
  const raw = storage.getItem(LastConnectedAccountKey)
  return raw === null ? undefined : (JSON.parse(raw) as ConnectedAccount)
}

export function setLastConnectedAccount(connectorId: ConnectorId, account: Account, network: NetworkId) {
  const storage = getStorage()
  if (storage !== undefined) {
    const connectedAccount: ConnectedAccount = { connectorId, account, network }
    storage.setItem(LastConnectedAccountKey, JSON.stringify(connectedAccount))
  }
}

export function removeLastConnectedAccount() {
  const storage = getStorage()
  if (storage !== undefined) {
    storage.removeItem(LastConnectedAccountKey)
  }
}
