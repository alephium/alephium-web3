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
import { AnimatePresence, Variants } from 'framer-motion'
import { Container, ConnectingContainer, ConnectingAnimation, RetryButton, RetryIconContainer, Content } from './styles'

import { useContext } from '../../AlephiumConnect'
import supportedConnectors from '../../../constants/supportedConnectors'

import {
  PageContent,
  ModalHeading,
  ModalBody,
  ModalH1,
  ModalContentContainer,
  ModalContent
} from '../../Common/Modal/styles'
import { OrDivider } from '../../Common/Modal'
import Button from '../../Common/Button'
import Tooltip from '../../Common/Tooltip'
import Alert from '../../Common/Alert'

import CircleSpinner from './CircleSpinner'

import { RetryIconCircle, Scan } from '../../../assets/icons'
import BrowserIcon from '../../Common/BrowserIcon'
import { AlertIcon, TickIcon } from '../../../assets/icons'
import { detectBrowser } from '../../../utils'
import { useConnect } from '../../../hooks/useConnect'

const states = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  EXPIRING: 'expiring',
  FAILED: 'failed',
  REJECTED: 'rejected',
  NOTCONNECTED: 'notconnected',
  UNAVAILABLE: 'unavailable'
}

const contentVariants: Variants = {
  initial: {
    willChange: 'transform,opacity',
    position: 'relative',
    opacity: 0,
    scale: 0.95
  },
  animate: {
    position: 'relative',
    opacity: 1,
    scale: 1,
    transition: {
      ease: [0.16, 1, 0.3, 1],
      duration: 0.4,
      delay: 0.05,
      position: { delay: 0 }
    }
  },
  exit: {
    position: 'absolute',
    opacity: 0,
    scale: 0.95,
    transition: {
      ease: [0.16, 1, 0.3, 1],
      duration: 0.3
    }
  }
}

const ConnectWithInjector: React.FC<{
  connectorId: string
  switchConnectMethod: (id?: string) => void
  forceState?: typeof states
}> = ({ connectorId, switchConnectMethod, forceState }) => {
  const context = useContext()

  const { connect } = useConnect({
    chainGroup: context.addressGroup,
    keyType: context.keyType,
    networkId: context.network
  })

  const [id, setId] = useState(connectorId)
  const [showTryAgainTooltip, setShowTryAgainTooltip] = useState(false)
  const connector = supportedConnectors.filter((c) => c.id === id)[0]

  const expiryDefault = 9 // Starting at 10 causes layout shifting, better to start at 9
  const [expiryTimer, setExpiryTimer] = useState<number>(expiryDefault)

  const hasExtensionInstalled = connector.extensionIsInstalled && connector.extensionIsInstalled()

  const browser = detectBrowser()
  const extensionUrl = connector.extensions ? connector.extensions[browser] : undefined

  const suggestedExtension = connector.extensions
    ? {
        name: Object.keys(connector.extensions)[0],
        label:
          Object.keys(connector.extensions)[0].charAt(0).toUpperCase() + Object.keys(connector.extensions)[0].slice(1), // Capitalise first letter, but this might be better suited as a lookup table
        url: connector.extensions[Object.keys(connector.extensions)[0]]
      }
    : undefined

  const [status, setStatus] = useState(
    forceState ? forceState : !hasExtensionInstalled ? states.UNAVAILABLE : states.CONNECTING
  )

  const runConnect = () => {
    if (!hasExtensionInstalled) return

    connect().then((address) => {
      if (!!address) {
        setStatus(states.CONNECTED)
      }
      context.setOpen(false)
    })
  }

  let connectTimeout: any
  useEffect(() => {
    if (status === states.UNAVAILABLE) return

    // UX: Give user time to see the UI before opening the extension
    connectTimeout = setTimeout(runConnect, 600)
    return () => {
      clearTimeout(connectTimeout)
    }
  }, [])

  /** Timeout functionality if necessary
  let expiryTimeout: any;
  useEffect(() => {
    if (status === states.EXPIRING) {
      expiryTimeout = setTimeout(
        () => {
          if (expiryTimer <= 0) {
            setStatus(states.FAILED);
            setExpiryTimer(expiryDefault);
          } else {
            setExpiryTimer(expiryTimer - 1);
          }
        },
        expiryTimer === 9 ? 1500 : 1000 // Google: Chronostasis
      );
    }
    return () => {
      clearTimeout(expiryTimeout);
    };
  }, [status, expiryTimer]);
  */

  if (!connector)
    return (
      <PageContent>
        <Container>
          <ModalHeading>Invalid State</ModalHeading>
          <ModalContent>
            <Alert>No connectors match the id given. This state should never happen.</Alert>
          </ModalContent>
        </Container>
      </PageContent>
    )

  // TODO: Make this more generic
  if (connector.id === 'walletConnect')
    return (
      <PageContent>
        <Container>
          <ModalHeading>Invalid State</ModalHeading>
          <ModalContent>
            <Alert>WalletConnect does not have an injection flow. This state should never happen.</Alert>
          </ModalContent>
        </Container>
      </PageContent>
    )

  return (
    <PageContent>
      <Container>
        <ConnectingContainer>
          <ConnectingAnimation $shake={status === states.FAILED || status === states.REJECTED} $circle>
            <AnimatePresence>
              {(status === states.FAILED || status === states.REJECTED) && (
                <RetryButton
                  aria-label="Retry"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                  onClick={runConnect}
                >
                  <RetryIconContainer>
                    <Tooltip
                      open={showTryAgainTooltip && (status === states.FAILED || status === states.REJECTED)}
                      message={'try again'}
                      xOffset={-6}
                    >
                      <RetryIconCircle />
                    </Tooltip>
                  </RetryIconContainer>
                </RetryButton>
              )}
            </AnimatePresence>

            {/*
            <Tooltip
              open={status === states.EXPIRING}
              message={
                <span
                  style={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copy.expiring.requestWillExpiryIn}{' '}
                  <span style={{ position: 'relative' }}>
                    <AnimatePresence>
                      <motion.span
                        key={expiryTimer}
                        style={{
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                        initial={{
                          willChange: 'transform,opacity',
                          position: 'relative',
                          opacity: 0,
                          scale: 0.5,
                          y: 0,
                        }}
                        animate={{
                          position: 'relative',
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: {
                            ease: 'easeOut',
                            duration: 0.2,
                            delay: 0.2,
                          },
                        }}
                        exit={{
                          position: 'absolute',
                          opacity: 0,
                          scale: 0.5,
                          y: 0,
                          transition: {
                            ease: 'easeIn',
                            duration: 0.2,
                          },
                        }}
                      >
                        {expiryTimer}
                      </motion.span>
                    </AnimatePresence>
                    s
                  </span>
                </span>
              }
              xOffset={-2}
            >
            */}
            <CircleSpinner
              logo={
                status === states.UNAVAILABLE ? (
                  <div
                    style={{
                      transform: 'scale(1.14)',
                      position: 'relative',
                      width: '100%'
                    }}
                  >
                    {connector.logos.transparent ?? connector.logos.default}
                  </div>
                ) : (
                  <>{connector.logos.transparent ?? connector.logos.default}</>
                )
              }
              smallLogo={connector.id === 'injected'}
              connecting={status === states.CONNECTING}
              unavailable={status === states.UNAVAILABLE}
              countdown={status === states.EXPIRING}
            />
            {/* </Tooltip> */}
          </ConnectingAnimation>
        </ConnectingContainer>
        <ModalContentContainer>
          <AnimatePresence initial={false}>
            {status === states.FAILED && (
              <Content
                key={states.FAILED}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent>
                  <ModalH1 $error>
                    <AlertIcon />
                    {'failed'}
                  </ModalH1>
                  <ModalBody>{'failed'}</ModalBody>
                </ModalContent>
                {/* Reason: Coinbase Wallet does not expose a QRURI when extension is installed */}
                {connector.scannable && connector.id !== 'coinbaseWallet' && (
                  <>
                    <OrDivider />
                    <Button icon={<Scan />} onClick={() => switchConnectMethod(id)}>
                      {'scan qr code'}
                    </Button>
                  </>
                )}
              </Content>
            )}
            {status === states.REJECTED && (
              <Content
                key={states.REJECTED}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent style={{ paddingBottom: 28 }}>
                  <ModalH1>{'rejected'}</ModalH1>
                  <ModalBody>{'rejected'}</ModalBody>
                </ModalContent>

                {/* Reason: Coinbase Wallet does not expose a QRURI when extension is installed */}
                {connector.scannable && connector.id !== 'coinbaseWallet' && (
                  <>
                    <OrDivider />
                    <Button icon={<Scan />} onClick={() => switchConnectMethod(id)}>
                      {'scan the qr code'}
                    </Button>
                  </>
                )}
              </Content>
            )}
            {(status === states.CONNECTING || status === states.EXPIRING) && (
              <Content
                key={states.CONNECTING}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent style={{ paddingBottom: 28 }}>
                  <ModalH1>{connector.id === 'injected' ? 'connecting' : 'rejected'}</ModalH1>
                </ModalContent>
              </Content>
            )}
            {status === states.CONNECTED && (
              <Content
                key={states.CONNECTED}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent>
                  <ModalH1 $valid>
                    <TickIcon /> {'Connected'}
                  </ModalH1>
                </ModalContent>
              </Content>
            )}
            {status === states.NOTCONNECTED && (
              <Content
                key={states.NOTCONNECTED}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent>
                  <ModalH1>{'Not Connected'}</ModalH1>
                </ModalContent>
              </Content>
            )}
            {status === states.UNAVAILABLE && (
              <Content
                key={states.UNAVAILABLE}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                {!extensionUrl ? (
                  <>
                    <ModalContent style={{ paddingBottom: 12 }}>
                      <ModalH1>{'Not Available'}</ModalH1>
                    </ModalContent>

                    {/**
                  <OrDivider />
                  <Button
                    icon={<Scan />}
                    onClick={() =>
                      switchConnectMethod(
                        !connector.scannable ? 'walletConnect' : id
                      )
                    }
                  >
                    {locales.scanTheQRCode}
                  </Button>
                  */}
                    {!hasExtensionInstalled && suggestedExtension && (
                      <Button href={suggestedExtension?.url} icon={<BrowserIcon browser={suggestedExtension?.name} />}>
                        Install on {suggestedExtension?.label}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <ModalContent style={{ paddingBottom: 18 }}>
                      <ModalH1>{'Install'}</ModalH1>
                    </ModalContent>
                    {/**
                  {(connector.scannable &&|
                    (!hasExtensionInstalled && extensionUrl)) && <OrDivider />}

                  {connector.scannable && (
                    <Button icon={<Scan />} onClick={switchConnectMethod}>
                      {locales.scanTheQRCode}
                    </Button>
                  )}
                  */}
                    {!hasExtensionInstalled && extensionUrl && (
                      <Button href={extensionUrl} icon={<BrowserIcon />}>
                        {'Install the extension'}
                      </Button>
                    )}
                  </>
                )}
              </Content>
            )}
          </AnimatePresence>
        </ModalContentContainer>
      </Container>
    </PageContent>
  )
}

export default ConnectWithInjector
