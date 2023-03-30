import { WalletProps } from './../wallet'

import Logos from './../../assets/logos'

export const walletConnect = (_walletOptions): WalletProps => {
  return {
    id: 'walletConnect',
    name: 'Other Wallets',
    logos: {
      default: <Logos.WalletConnect />,
      mobile: <Logos.WalletConnect />,
      transparent: <Logos.WalletConnect background={false} />,
      connectorButton: <Logos.WalletConnect />,
      qrCode: <Logos.WalletConnect background={true} />
    },
    logoBackground: 'var(--ck-brand-walletConnect)',
    scannable: true
  }
}
