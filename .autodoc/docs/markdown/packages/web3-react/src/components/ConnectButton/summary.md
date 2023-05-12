[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/ConnectButton)

The `ConnectButton` folder in the `alephium-web3` project contains code for a React component that allows users to connect their Alephium wallet to a web application. The main component, `AlephiumConnectButton`, renders a button that opens a modal for wallet connection or profile viewing. It takes several optional props, such as a label, an `onClick` function, and a `displayAccount` function.

For example, to use the `AlephiumConnectButton` in a web application, you would import it and include it in your JSX:

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

The `ConnectButtonRenderer` component is a helper component that renders the content of the modal. It takes a `displayAccount` prop to display the user's account information in the modal. This component can be used externally if a custom modal is desired.

The `useAlephiumConnectContext` hook provides access to the Alephium Connect context, which contains information about the user's wallet connection status and theme. The `useAccount` hook is used to access the user's account information, including their address.

The `styles.ts` file defines a styled component called `TextContainer` using the `styled-components` library. This component is a `motion.div` element imported from the `framer-motion` library, which provides animation capabilities. The `TextContainer` component is designed to be used as a container for text elements, with properties that center and align the text within the container.

For example, to use the `TextContainer` component in a web application, you would import it and include it in your JSX:

```javascript
import { TextContainer } from 'alephium-web3';

const MyText = () => {
  return (
    <TextContainer animate={{ scale: 1.2 }} transition={{ duration: 1 }}>
      <h1>Hello World!</h1>
    </TextContainer>
  );
};
```

In this example, the `TextContainer` component is used to wrap an `h1` element that says "Hello World!". The `animate` and `transition` props are passed to the `TextContainer` component to provide animation effects.

In summary, the `ConnectButton` folder contains code for a customizable button component that allows users to connect their Alephium wallet to a web application. It demonstrates the use of React hooks, styled components, and the `framer-motion` library to create dynamic and visually appealing user interfaces.
