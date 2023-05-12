[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/wallets/connectors)

The code in the `connectors` folder provides a set of functions that return wallet connector configurations for different types of wallets in the Alephium project. These configurations include information such as the wallet's ID, name, logos, and whether it can be scanned (e.g., by a QR code). The functions can be imported and used by other parts of the project to display wallet options to the user or to determine which wallet to use for a particular transaction.

For example, the `desktopWallet.tsx` file defines a function called `desktopWallet` that returns a `WalletProps` object for the desktop wallet connector. This function can be imported and used by other parts of the project to retrieve the necessary configuration information for the desktop wallet:

```javascript
import { desktopWallet } from 'alephium-web3'

const walletConfig = desktopWallet()
console.log(walletConfig) // outputs the desktop wallet connector configuration as a WalletProps object
```

Similarly, the `injected.tsx` file defines a function called `injected` that returns an object with properties related to a wallet that is injected into a web3 provider. This function can be used to detect the presence of a wallet and provide information about it to the user:

```javascript
import { injected } from 'alephium-web3'

const injectedWallet = injected()
console.log(injectedWallet) // outputs an object with properties related to the injected wallet
```

Lastly, the `walletConnect.tsx` file defines a function called `walletConnect` that returns an object with properties representing a wallet connector. This function can be imported and used by other parts of the project to display a list of available wallet connectors to the user:

```javascript
import { walletConnect } from 'alephium-web3'

const walletConnectProps = walletConnect()
// Display walletConnectProps in a list of available wallet connectors
```

Overall, the code in the `connectors` folder provides a set of functions that return standardized wallet connector configurations for different types of wallets. These configurations can be used by other parts of the Alephium project to interact with wallets and display wallet options to the user.
