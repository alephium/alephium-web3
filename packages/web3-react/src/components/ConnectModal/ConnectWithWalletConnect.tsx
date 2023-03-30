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
import React, { useCallback, useEffect } from 'react'
import { PageContent } from '../Common/Modal/styles'
import { useContext } from '../AlephiumConnect'
import { Container } from './ConnectWithInjector/styles'
import { WalletConnectProvider, QRCodeModal } from '@alephium/walletconnect-provider'

let _init = false

const ConnectWithWalletConnect: React.FC = () => {
  const context = useContext()

  const onQrClose = useCallback(() => {
    console.log('qr closed')
  }, [])

  const wcConnect = async () => {
    const wcProvider = await WalletConnectProvider.init({
      projectId: '6e2562e43678dd68a9070a62b6d52207',
      networkId: 0
    })

    wcProvider.on('displayUri', (uri) => {
      context.setOpen(false)
      QRCodeModal.open(uri, onQrClose)
    })

    try {
      await wcProvider.connect()

      context.setAccount(wcProvider.account)
      context.setSignerProvider(wcProvider as any)
      _init = true
    } catch (e) {
      _init = false
      console.log('wallet connect error')
      console.error(e)
    }

    QRCodeModal.close()
  }

  useEffect(() => {
    if (_init) {
      return
    }

    _init = true
    wcConnect()
  }, [])

  return (
    <PageContent>
      <Container>{'Connecting to wallet connect'}</Container>
    </PageContent>
  )
}

export default ConnectWithWalletConnect
