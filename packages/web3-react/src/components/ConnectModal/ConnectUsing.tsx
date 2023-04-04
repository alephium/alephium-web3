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

import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import supportedConnectors from './../../constants/supportedConnectors'

import { contentVariants } from '../Common/Modal'
import ConnectWithInjector from './ConnectWithInjector'
import ConnectWithWalletConnect from './ConnectWithWalletConnect'

import Alert from '../Common/Alert'

const states = {
  QRCODE: 'qrcode',
  INJECTOR: 'injector'
}
const ConnectUsing: React.FC<{ connectorId: string }> = ({ connectorId }) => {
  const [id, setId] = useState<string>(connectorId)

  const connector = supportedConnectors.filter((c) => c.id === id)[0]

  const hasExtensionInstalled = connector.extensionIsInstalled && connector.extensionIsInstalled()

  // If cannot be scanned, display injector flow, which if extension is not installed will show CTA to install it
  const useInjector = !connector.scannable || hasExtensionInstalled

  const [status, setStatus] = useState(useInjector ? states.INJECTOR : states.QRCODE)

  if (!connector) return <Alert>Connector not found</Alert>

  if (status === states.QRCODE) return <ConnectWithWalletConnect />

  return (
    <AnimatePresence>
      {status === states.INJECTOR && (
        <motion.div
          key={states.INJECTOR}
          initial={'initial'}
          animate={'animate'}
          exit={'exit'}
          variants={contentVariants}
        >
          <ConnectWithInjector
            connectorId={id}
            switchConnectMethod={(id?: string) => {
              if (id) setId(id)
              setStatus(states.QRCODE)
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConnectUsing
