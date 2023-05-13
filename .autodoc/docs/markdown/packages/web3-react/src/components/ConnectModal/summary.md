[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/ConnectModal)

The `ConnectModal` folder contains components that handle connecting to the Alephium network using various methods, such as browser extensions (injectors), desktop wallets, and WalletConnect protocol. These components are designed to be reusable and can be easily integrated into other parts of the Alephium Web3 project.

For example, the `ConnectUsing` component provides a consistent way for users to connect to the Alephium network using different methods. It can be used in the `ConnectWalletModal` component to allow users to connect their wallets to the Alephium network:

```jsx
import ConnectUsing from 'alephium-web3/components/ConnectModal/ConnectUsing'

function MyComponent() {
  return (
    <div>
      <ConnectUsing connectorId="metamask" />
    </div>
  )
}
```

In this example, the `ConnectUsing` component is used with the MetaMask connector to handle the connection process.

The `ConnectWithDesktopWallet` component allows users to connect their desktop wallets to the Alephium blockchain. It provides a simple way for users to access their wallet information and perform various blockchain-related tasks, such as sending and receiving transactions:

```jsx
import ConnectWithDesktopWallet from 'alephium-web3/components/ConnectModal/ConnectWithDesktopWallet'

function MyComponent() {
  return (
    <div>
      <ConnectWithDesktopWallet />
    </div>
  )
}
```

The `ConnectWithWalletConnect` component provides users with a way to connect to a wallet using the WalletConnect protocol. Developers can customize the `addressGroup`, `keyType`, and `networkId` properties to configure the connection to the wallet:

```jsx
import ConnectWithWalletConnect from 'alephium-web3/components/ConnectModal/ConnectWithWalletConnect'

function MyComponent() {
  return (
    <div>
      <ConnectWithWalletConnect />
    </div>
  )
}
```

The `ConnectWithInjector` component, located in the `ConnectWithInjector` subfolder, manages the connection between the Alephium wallet and supported browser extensions (injectors). It handles various connection states and renders different content based on the current state:

```jsx
import ConnectWithInjector from 'alephium-web3/components/ConnectModal/ConnectWithInjector'

function MyComponent() {
  return (
    <div>
      <ConnectWithInjector connectorId="metamask" />
    </div>
  )
}
```

In this example, the `ConnectWithInjector` component is used with the MetaMask connector to handle the connection process.

Overall, the components in the `ConnectModal` folder provide a simple and flexible way to connect to the Alephium network and manage the connection state. They can be used in conjunction with other components and hooks from the `alephium-web3` project to build more complex applications that interact with the Alephium network.
