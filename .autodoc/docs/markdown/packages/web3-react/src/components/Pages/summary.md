[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Pages)

The `Pages` folder in the Alephium web3 project contains components related to the main user interface, such as connecting wallets and displaying account information. It consists of two subfolders: `Connectors` and `Profile`.

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

The `Profile` folder in the Alephium web3 project contains code related to displaying the user's account information and balance, as well as providing a way to disconnect from the Alephium network. The folder consists of two files: `index.tsx` and `styles.ts`.

`index.tsx` defines a React functional component called `Profile` that displays the user's account information and balance. It imports several hooks and components from other files in the project, including `useAlephiumConnectContext`, `useAccount`, `useBalance`, `AnimatePresence`, `prettifyAttoAlphAmount`, and `useConnect`. The `Profile` component retrieves the user's account and balance using the `useAccount` and `useBalance` hooks and renders the account address and balance in a modal dialog using the `ModalContent`, `ModalH1`, and `ModalBody` components. The balance is displayed using the `Balance` and `LoadingBalance` components, which use the `AnimatePresence` component to animate the transition between the two states. The `prettifyAttoAlphAmount` function is used to format the balance value. The component also renders a "Disconnect" button that calls the `useConnect` hook to disconnect the user from the Alephium network.

`styles.ts` contains code related to the balance display of the Alephium web application. It exports three styled components: `BalanceContainer`, `Balance`, and `LoadingBalance`. `BalanceContainer` is a styled component that wraps around the `Balance` component and is used to position the balance display on the web page. `Balance` is a styled component that displays the balance of the user's account, while `LoadingBalance` is a styled component that displays a loading animation while the balance is being fetched from the server. The `PlaceholderKeyframes` constant is a keyframe animation that is used to animate the loading animation in `LoadingBalance`.

Here's an example of how these components might be used in the larger Alephium web application:

```javascript
import { BalanceContainer, Balance, LoadingBalance } from 'alephium-web3'

function AccountBalance() {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBalance()
  }, [])

  async function fetchBalance() {
    const balance = await fetch('/api/balance')
    setBalance(balance)
    setLoading(false)
  }

  return (
    <BalanceContainer>
      {loading ? (
        <LoadingBalance />
      ) : (
        <Balance>{balance}</Balance>
      )}
    </BalanceContainer>
  )
}
```

In this example, the `AccountBalance` component fetches the user's balance from the server and displays it using the `Balance` component. While the balance is being fetched, the `LoadingBalance` component is displayed instead. The `BalanceContainer` component is used to position the balance display on the web page.
