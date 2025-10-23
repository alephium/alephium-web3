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
import { NodeProvider, SignerProvider, Account, NetworkId, ExplorerProvider } from '@alephium/web3'
import { KeyType } from '@alephium/web3'

export type Wallet =
  | {
      connectionStatus: 'connected'
      signer: SignerProvider
      account: Account & { network: NetworkId }
      nodeProvider: NodeProvider | undefined
      explorerProvider: ExplorerProvider | undefined
    }
  | {
      connectionStatus: 'connecting'
      signer: undefined
      account: (Account & { network: NetworkId }) | undefined
      nodeProvider: undefined
      explorerProvider: undefined
    }
  | {
      connectionStatus: 'disconnected'
      signer: undefined
      account: undefined
      nodeProvider: undefined
      explorerProvider: undefined
    }

export function useWallet() {
  const { account, signerProvider, connectionStatus, network } = useAlephiumConnectContext()

  return useMemo<Wallet>(() => {
    return connectionStatus === 'connected'
      ? {
          connectionStatus,
          signer: signerProvider as SignerProvider,
          account: { ...(account as Account), network },
          nodeProvider: signerProvider?.nodeProvider,
          explorerProvider: signerProvider?.explorerProvider
        }
      : connectionStatus === 'disconnected'
      ? {
          connectionStatus,
          signer: undefined,
          account: undefined,
          nodeProvider: undefined,
          explorerProvider: undefined
        }
      : {
          connectionStatus,
          signer: undefined,
          account: account === undefined ? undefined : { ...account, network },
          nodeProvider: undefined,
          explorerProvider: undefined
        }
  }, [signerProvider, account, network, connectionStatus])
}

export type WalletConfig = {
  network: NetworkId
  setNetwork: (network: NetworkId) => void
  addressGroup?: number
  setAddressGroup: (addressGroup: number | undefined) => void
  keyType?: KeyType
  setKeyType: (keyType: KeyType) => void
}

export function useWalletConfig() {
  const { network, setNetwork, addressGroup, setAddressGroup, keyType, setKeyType } = useAlephiumConnectContext()
  return useMemo<WalletConfig>(
    () => ({
      network,
      setNetwork,
      addressGroup,
      setAddressGroup,
      keyType,
      setKeyType
    }),
    [network, setNetwork, addressGroup, setAddressGroup, keyType, setKeyType]
  )
}
