import React, { useCallback, useEffect } from 'react'
import { PageContent } from '../../Common/Modal/styles'
import { useContext } from '../../AlephiumConnect'
import { Container } from '../ConnectWithInjector/styles'
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
