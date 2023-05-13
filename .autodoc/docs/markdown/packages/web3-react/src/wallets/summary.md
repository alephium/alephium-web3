[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/wallets)

The code in the `wallets` folder of the `alephium-web3` project provides a set of functions and interfaces to interact with different types of cryptocurrency wallets. It includes three wallet connectors (`injected`, `walletConnect`, and `desktopWallet`) that can be used to interact with wallets such as MetaMask, Trust Wallet, and Alephium Desktop Wallet.

The `getWallets` function in `index.ts` returns an array of these wallet connectors, which can be used in other parts of the Alephium project to interact with different types of wallets. For example:

```javascript
import { getWallets } from 'alephium-web3'

const wallets = getWallets({})
console.log(wallets) // [injected({}), walletConnect({}), desktopWallet()]
```

The `useDefaultWallets.tsx` file provides a function called `useDefaultWallets` that returns an array of `WalletProps` objects, which can be used to display a list of default wallets in a user interface or for testing purposes. Here's an example of how it might be used in a React component:

```javascript
import React from 'react'
import useDefaultWallets from 'alephium-web3'

function WalletList() {
  const wallets = useDefaultWallets()

  return (
    <ul>
      {wallets.map(wallet => (
        <li key={wallet.address}>
          {wallet.address} - {wallet.balance}
        </li>
      ))}
    </ul>
  )
}
```

The `wallet.ts` file defines two interfaces, `WalletOptions` and `WalletProps`, which are used to define the options and properties of a wallet component in the Alephium project. These interfaces can be used by developers to create new wallet components and pass in the appropriate options and properties:

```javascript
import { WalletOptions, WalletProps } from 'alephium-web3'

const walletOptions: WalletOptions = {
  appName: 'My App',
  shimDisconnect: true
}

const walletProps: WalletProps = {
  id: 'my-wallet',
  name: 'My Wallet',
  shortName: 'MW',
  logos: {
    default: <MyWalletLogo />,
    transparent: <MyWalletLogoTransparent />,
    connectorButton: <MyWalletConnectorButton />,
    qrCode: <MyWalletQRCode />,
    appIcon: <MyWalletAppIcon />,
    mobile: <MyWalletMobileLogo />
  },
  logoBackground: '#FFFFFF',
  scannable: true,
  installed: true,
  downloadUrls: {
    windows: 'https://my-wallet.com/windows',
    mac: 'https://my-wallet.com/mac',
    linux: 'https://my-wallet.com/linux'
  }
}
```

The `connectors` subfolder contains functions that return wallet connector configurations for different types of wallets. These configurations can be used by other parts of the Alephium project to interact with wallets and display wallet options to the user. For example, to display a list of available wallet connectors:

```javascript
import { walletConnect } from 'alephium-web3'

const walletConnectProps = walletConnect()
// Display walletConnectProps in a list of available wallet connectors
```

Overall, the code in the `wallets` folder provides a set of functions and interfaces for interacting with different types of cryptocurrency wallets in the Alephium project. These functions and interfaces can be used by developers to create new wallet components, display wallet options to users, and interact with wallets for various transactions.
