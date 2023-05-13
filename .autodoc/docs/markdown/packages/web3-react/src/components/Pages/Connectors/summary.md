[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Pages/Connectors)

The `Connectors` component in `index.tsx` is a crucial part of the Alephium Web3 project, as it enables users to connect their wallets to the Alephium network. It renders a list of supported wallet connectors based on the user's device type (mobile or desktop) and allows users to select the desired connector. The component imports the `useAlephiumConnectContext` hook, which provides access to the current connector and route, and the `supportedConnectors` constant, which defines the various wallet connectors supported by the Alephium network.

The `styles.ts` file contains styled components for the user interface, including `ConnectorsContainer`, `ConnectorButton`, `MobileConnectorsContainer`, and `MobileConnectorButton`. These components are designed to display a list of available connectors to the user and initiate connections to the corresponding blockchain networks. The use of styled components allows for easy customization of the appearance of these buttons, ensuring a consistent user interface across different parts of the application.

Here's an example of how these components might be used:

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

In this example, the `ConnectorList` function renders a `ConnectorsContainer` component containing three `ConnectorButton` components for Ethereum, Binance Smart Chain, and Polkadot networks. Each button includes a label and an icon, and when clicked, initiates a connection to the corresponding network.

In summary, the code in the `Connectors` folder provides a simple and intuitive way for users to connect their wallets to the Alephium network. By rendering a list of supported wallet connectors and allowing users to select the one they want to use, the `Connectors` component makes it easy for users to get started with the Alephium network. The styled components in `styles.ts` ensure a consistent and customizable user interface, which is essential for a seamless user experience.
