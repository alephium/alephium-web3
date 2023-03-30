import React, { useEffect, useState } from 'react'
import { useContext } from '../../AlephiumConnect'

import { PageContent, ModalBody, ModalContent, ModalH1 } from '../../Common/Modal/styles'
import Button from '../../Common/Button'

import { DisconnectIcon } from '../../../assets/icons'
import CopyToClipboard from '../../Common/CopyToClipboard'
import { useAccount } from '../../../hooks/useAccount'
import { truncatedAddress } from '../../../utils'
import { useBalance } from '../../../hooks/useBalance'
import { AnimatePresence } from 'framer-motion'
import { Balance, BalanceContainer, LoadingBalance } from './styles'
import { prettifyAttoAlphAmount } from '@alephium/web3'
import { useConnect } from '../../../hooks/useConnect'

const Profile: React.FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  const context = useContext()
  const { account } = useAccount()
  const { balance } = useBalance()
  const { disconnect } = useConnect({
    chainGroup: context.addressGroup,
    keyType: context.keyType,
    networkId: context.network
  })
  const [shouldDisconnect, setShouldDisconnect] = useState(false)
  const address = account ? (context.displayAccount ? context.displayAccount(account) : account.address) : undefined

  useEffect(() => {
    if (!shouldDisconnect) return

    if (closeModal) {
      closeModal()
    } else {
      context.setOpen(false)
    }
    return () => {
      disconnect()
      context.setOpen(false)
    }
  }, [shouldDisconnect])

  return (
    <PageContent>
      <ModalContent style={{ paddingBottom: 22, gap: 6 }}>
        <ModalH1>
          <CopyToClipboard string={address}>{address && truncatedAddress(address)}</CopyToClipboard>
        </ModalH1>
        <ModalBody>
          <BalanceContainer>
            <AnimatePresence exitBeforeEnter initial={false}>
              {balance && (
                <Balance
                  key={`alephium`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {prettifyAttoAlphAmount(BigInt(balance.balance))} ALPH
                </Balance>
              )}
              {!balance && (
                <LoadingBalance
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  &nbsp;
                </LoadingBalance>
              )}
            </AnimatePresence>
          </BalanceContainer>
        </ModalBody>
      </ModalContent>
      <Button onClick={() => setShouldDisconnect(true)} icon={<DisconnectIcon />}>
        {'Disconnect'}
      </Button>
    </PageContent>
  )
}

export default Profile
