[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/get-extension-wallet)

The `get-extension-wallet` folder in the Alephium Web3 project provides essential functionality for interacting with Alephium wallets. It contains several functions and data structures that enable users to connect their wallets to the Alephium blockchain and ensure that only supported wallet providers are used.

For instance, the `getAlephium.ts` file contains functions like `getDefaultAlephiumWallet()`, `scanKnownWallets()`, `getKnownWallet()`, `getWalletObject()`, and `isWalletObj()`. These functions help users retrieve wallet objects from different wallet providers and interact with them. For example, to get the default Alephium wallet, one can use the following code:

```typescript
import { getDefaultAlephiumWallet } from 'get-extension-wallet/src/getAlephium'

const defaultWallet = await getDefaultAlephiumWallet()
```

The `index.ts` file exports various modules, such as `types`, `knownProviders`, and `getAlephium`, which are used throughout the Alephium Web3 project. These modules provide functionality for working with the Alephium network and can be used by other modules in the project to build more complex functionality.

The `knownProviders.ts` file defines a wallet provider for the Alephium blockchain and exports it for use in the larger project. The `alephiumProvider` object contains metadata about the provider, and the `checkProviderMetadata` function is used to verify that the user's selected wallet provider is valid and supported by the Alephium-web3 library. Example usage:

```typescript
import { alephiumProvider, knownProviders, checkProviderMetadata } from 'get-extension-wallet/src/knownProviders'

const wallet = { id: 'alephium', name: 'Alephium', version: '1.0.0' }
const isAlephiumProvider = checkProviderMetadata(wallet, alephiumProvider) // true
```

The `types.ts` file defines several classes and functions related to interacting with the Alephium blockchain network using the web3 API. The `AlephiumWindowObject` class is intended to be subclassed by concrete wallet provider implementations, which can then be used to enable users to interact with the Alephium network using their preferred wallet provider. The `WalletProvider` type is used to define the properties of a wallet provider, and the `providerInitializedEvent` function is used to emit an event when a wallet provider is initialized.

In summary, the code in the `get-extension-wallet/src` folder plays a crucial role in the Alephium Web3 project by providing the necessary functionality for users to interact with different wallet providers and retrieve wallet objects. This code can be used in conjunction with other modules in the Alephium-web3 project to enable wallet functionality for dApps and other blockchain applications.
