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
import { useAlephiumConnectContext, useConnectSettingContext } from '../contexts/alephiumConnect'
import { useCallback, useMemo } from 'react'
import { removeLastConnectedAccount } from '../utils/storage'
import { ConnectResult, getConnectorById } from '../utils/connector'

export function useConnect() {
  const { connectorId } = useConnectSettingContext()
  const { signerProvider, setSignerProvider, setAccount, addressGroup, network, keyType } = useAlephiumConnectContext()

  const onDisconnected = useCallback(() => {
    removeLastConnectedAccount()
    setSignerProvider(undefined)
    setAccount(undefined)
  }, [setSignerProvider, setAccount])

  const onConnected = useCallback(
    (connectResult: ConnectResult) => {
      setAccount(connectResult.account)
      setSignerProvider(connectResult.signerProvider)
    },
    [setAccount, setSignerProvider]
  )

  const connectOptions = useMemo(() => {
    return {
      network,
      addressGroup,
      keyType,
      onDisconnected,
      onConnected
    }
  }, [onDisconnected, onConnected, network, addressGroup, keyType])

  const connector = useMemo(() => {
    return getConnectorById(connectorId)
  }, [connectorId])

  const connect = useMemo(() => {
    return () => connector.connect(connectOptions)
  }, [connector, connectOptions])

  const disconnect = useMemo(() => {
    return () => {
      signerProvider && connector.disconnect(signerProvider)
    }
  }, [connector, signerProvider])

  return useMemo(() => ({ connect, disconnect }), [connect, disconnect])
}
