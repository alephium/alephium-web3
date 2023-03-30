import { ReactNode } from 'react'
import Logos from './../assets/logos'

let supportedConnectors: {
  id: string
  name?: string
  shortName?: string
  logos: {
    default: ReactNode
    transparent?: ReactNode
    connectorButton?: ReactNode
    qrCode?: ReactNode
    appIcon?: ReactNode
    mobile?: ReactNode
  }
  logoBackground?: string
  scannable?: boolean
  extensions?: { [key: string]: string }
  appUrls?: { [key: string]: string }
  extensionIsInstalled?: () => any
  defaultConnect?: () => any
}[] = []

if (typeof window != 'undefined') {
  interface IDictionary {
    [index: string]: string
  }

  supportedConnectors = [
    {
      id: 'injected',
      name: 'Extension Wallet',
      shortName: 'Browser',
      logos: {
        default: <Logos.AlephiumIcon />,
        mobile: (
          <div
            style={{
              padding: 5,
              background: 'var(--ck-body-background-tertiary)',
              borderRadius: '27%',
              boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div
              style={{
                transform: 'scale(0.75)',
                position: 'relative',
                width: '100%'
              }}
            >
              <Logos.AlephiumIcon />
            </div>
          </div>
        ),
        transparent: <Logos.AlephiumIcon />
      },
      scannable: false,
      extensionIsInstalled: () => {
        return Boolean(window['alephiumProviders'])
      }
    },
    {
      id: 'walletConnect',
      name: 'WalletConnect',
      shortName: 'WalletConnect',
      logos: {
        default: <Logos.WalletConnect />,
        mobile: (
          <div
            style={{
              padding: 5,
              background: 'var(--ck-body-background-secondary)',
              borderRadius: '21%',
              boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.02)'
            }}
          >
            <Logos.WalletConnect />
          </div>
        ),
        transparent: <Logos.WalletConnect background={false} />,
        connectorButton: <Logos.WalletConnect />,
        qrCode: <Logos.WalletConnect background={true} />
      },
      logoBackground: 'var(--ck-brand-walletConnect)',
      scannable: true,
      defaultConnect: () => {}
    }
  ]
}

export default supportedConnectors
