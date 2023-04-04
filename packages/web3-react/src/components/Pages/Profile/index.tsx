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
import React, { useEffect, useState } from 'react'
import { useAlephiumConnectContext } from '../../../contexts/alephiumConnect'

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
  const context = useAlephiumConnectContext()
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
