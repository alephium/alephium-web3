[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react)

The `alephium-web3` project provides a set of components, hooks, and utilities for developers to easily integrate the Alephium blockchain into their web applications. The main component, `AlephiumConnectProvider`, wraps the entire application and provides access to the web3 provider, allowing users to connect their wallets and interact with the Alephium blockchain.

For example, to use the `AlephiumConnectProvider` and `AlephiumConnectButton` components in a React application:

```javascript
import { AlephiumConnectProvider, AlephiumConnectButton } from 'alephium-web3'

function App() {
  return (
    <AlephiumConnectProvider>
      <div>
        <h1>Welcome to my Alephium app!</h1>
        <AlephiumConnectButton />
      </div>
    </AlephiumConnectProvider>
  )
}
```

The project also includes custom hooks, such as `useAccount`, `useConnect`, `useTxStatus`, and `useBalance`, which can be used to access various information related to the user's account, connection status, transaction status, and balance. For instance, the `useAccount` hook can be used to display the connected account:

```jsx
import { useAccount } from 'alephium-web3'

function MyComponent() {
  const { account, isConnected } = useAccount()

  return (
    <div>
      {isConnected ? (
        <p>Connected to account {account}</p>
      ) : (
        <p>Not connected to any account</p>
      )}
    </div>
  )
}
```

The `assets` folder contains SVG icons and logos as React components, which can be easily imported and used in other parts of the project to provide visual cues and branding. The `components` folder contains reusable components and utilities for creating a consistent and maintainable user interface, such as `Alert`, `BrowserIcon`, `Button`, and `Tooltip`.

The `constants` folder provides essential constant values and configurations that are used throughout the project, ensuring consistency and maintainability in the codebase. The `contexts` folder manages the state of the Alephium Connect feature in a React application, allowing users to connect their wallets to the Alephium network and perform transactions.

The `hooks` folder contains custom React hooks that provide various functionalities related to the Alephium blockchain, such as connecting to an Alephium wallet, retrieving account information, and subscribing to transaction status updates. The `styles` folder defines and manages the visual styles of the Alephium Web3 project, providing a centralized and flexible way to create and customize themes for different parts of the application.

Finally, the `wallets` folder provides a set of functions and interfaces to interact with different types of cryptocurrency wallets, including three wallet connectors (`injected`, `walletConnect`, and `desktopWallet`) that can be used to interact with wallets such as MetaMask, Trust Wallet, and Alephium Desktop Wallet.

Overall, the `alephium-web3` project offers a convenient way for developers to integrate the Alephium blockchain into their web applications and access various related information.
