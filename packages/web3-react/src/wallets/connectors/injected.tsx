import { WalletProps } from './../wallet'

import { isMobile } from '../../utils'
import Logos from './../../assets/logos'

export const injected = (_walletOptions): WalletProps => {
  const isInstalled = typeof window !== 'undefined'

  const shouldUseWalletConnect = isMobile() && !isInstalled

  return {
    id: 'injected',
    name: 'Extension Wallet',
    shortName: 'browser',
    scannable: false,
    logos: { default: <Logos.AlephiumIcon /> },
    installed: Boolean(!shouldUseWalletConnect ? isInstalled : false)
  }
}
