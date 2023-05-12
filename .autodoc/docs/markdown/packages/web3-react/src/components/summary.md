[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components)

The `.autodoc/docs/json/packages/web3-react/src/components` folder contains various components and utilities for the Alephium Web3 project, which enables users to connect their wallets to the Alephium blockchain network and interact with it.

The main component, `AlephiumConnect.tsx`, provides a context for the Alephium Connect modal, allowing users to connect to the Alephium network. It takes several props to configure the modal and the context it provides. For example:

```jsx
import { AlephiumConnectProvider } from 'alephium-web3';

function MyApp() {
  return (
    <AlephiumConnectProvider network="mainnet" addressGroup="g1" keyType="secp256k1">
      <AppContent />
    </AlephiumConnectProvider>
  );
}
```

The `Common` folder contains reusable components and utilities for creating a consistent and maintainable user interface, such as `Alert`, `BrowserIcon`, `Button`, and `Tooltip`. These components can be easily integrated into various parts of the project.

The `ConnectButton` folder provides a customizable button component that allows users to connect their Alephium wallet to a web application:

```javascript
import { AlephiumConnectButton } from 'alephium-web3';

const MyApp = () => {
  return (
    <div>
      <h1>Welcome to MyApp</h1>
      <AlephiumConnectButton />
    </div>
  );
};
```

The `ConnectModal` folder contains components for connecting to the Alephium network using various methods, such as browser extensions, desktop wallets, and WalletConnect protocol. These components can be used in conjunction with other components and hooks from the `alephium-web3` project to build more complex applications:

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

The `Pages` folder contains components related to the main user interface, such as connecting wallets and displaying account information. The `Connectors` component enables users to connect their wallets to the Alephium network, while the `Profile` component displays the user's account information and balance:

```javascript
import { ConnectorsContainer, ConnectorButton } from 'alephium-web3'

function ConnectorList() {
  return (
    <ConnectorsContainer>
      <ConnectorButton>
        <ConnectorLabel>Ethereum</ConnectorLabel>
        <ConnectorIcon><EthereumIcon /></ConnectorIcon>
      </ConnectorButton>
      <ConnectorButton>
        <ConnectorLabel>Binance Smart Chain</ConnectorLabel>
        <ConnectorIcon><BinanceIcon /></ConnectorIcon>
      </ConnectorButton>
      <ConnectorButton>
        <ConnectorLabel>Polkadot</ConnectorLabel>
        <ConnectorIcon><PolkadotIcon /></ConnectorIcon>
      </ConnectorButton>
    </ConnectorsContainer>
  )
}
```

In summary, the components in this folder provide a simple and flexible way to connect to the Alephium network and manage the connection state. They can be used in conjunction with other components and hooks from the `alephium-web3` project to build more complex applications that interact with the Alephium network.
