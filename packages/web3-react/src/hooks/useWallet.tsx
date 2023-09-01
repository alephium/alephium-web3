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
import { useMemo } from 'react'
import { ConnectionStatus, useAlephiumConnectContext } from '../contexts/alephiumConnect'
import { NodeProvider, SignerProvider, Account, NetworkId } from '@alephium/web3'

export interface Wallet {
  signer: SignerProvider | undefined
  account: (Account & { network: NetworkId }) | undefined
  connectionStatus: ConnectionStatus
  nodeProvider: NodeProvider | undefined
}

export function useWallet() {
  const { account, signerProvider, connectionStatus, network } = useAlephiumConnectContext()

  return useMemo<Wallet>(() => {
    return {
      signer: signerProvider,
      account: account === undefined ? undefined : { ...account, network },
      connectionStatus,
      nodeProvider: signerProvider?.nodeProvider
    }
  }, [signerProvider, account, network, connectionStatus])
}
