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
import { useAlephiumConnectContext } from '../contexts/alephiumConnect'
import { NodeProvider, SignerProvider, Account, NetworkId } from '@alephium/web3'

export type Wallet =
  | {
      signer: SignerProvider
      account: Account & { network: NetworkId }
      connectionStatus: 'connected'
      nodeProvider: NodeProvider | undefined
    }
  | {
      signer: SignerProvider | undefined
      account: (Account & { network: NetworkId }) | undefined
      connectionStatus: 'connecting'
      nodeProvider: NodeProvider | undefined
    }
  | {
      signer: undefined
      account: undefined
      connectionStatus: 'disconnected'
      nodeProvider: undefined
    }

export function useWallet() {
  const { account, signerProvider, connectionStatus, network } = useAlephiumConnectContext()

  return useMemo<Wallet>(() => {
    return connectionStatus === 'connected'
      ? {
          signer: signerProvider as SignerProvider,
          account: { ...(account as Account), network },
          connectionStatus,
          nodeProvider: signerProvider?.nodeProvider
        }
      : connectionStatus === 'disconnected'
      ? {
          signer: undefined,
          account: undefined,
          connectionStatus,
          nodeProvider: undefined
        }
      : {
          signer: undefined,
          account: account === undefined ? undefined : { ...account, network },
          connectionStatus,
          nodeProvider: undefined
        }
  }, [signerProvider, account, network, connectionStatus])
}
