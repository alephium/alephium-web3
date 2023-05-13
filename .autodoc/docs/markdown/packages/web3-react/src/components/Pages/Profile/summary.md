[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Pages/Profile)

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
