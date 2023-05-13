[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/ConnectModal/ConnectWithInjector)

The `ConnectWithInjector` component, located in the `index.tsx` file, is responsible for managing the connection between the Alephium wallet and supported browser extensions (injectors). It handles various connection states and renders different content based on the current state. For example, when connecting, it displays a spinner animation with the logo of the selected connector. If the state is `failed` or `rejected`, it shows an error message and a retry button. If the state is `unavailable`, it suggests installing the required browser extension.

Here's an example of how to use the `ConnectWithInjector` component:

```jsx
<ConnectWithInjector
  connectorId="metamask"
  switchConnectMethod={switchConnectMethod}
/>
```

This will render the component with the MetaMask connector and handle the connection process accordingly.

The `styles.ts` file contains styled components for a loading spinner and retry button that are used in the Alephium web3 project. These components provide visual feedback to the user during loading and error states. The use of styled components allows for easy customization of the visual appearance of these components, making it simple to match the design of the loading spinner and retry button to the overall look and feel of the Alephium web3 project.

The `CircleSpinner` component, located in the `CircleSpinner` subfolder, is a crucial part of the Alephium Web3 project as it provides a visual indication of loading or connecting states. It is a React component that renders a circular spinner animation with an optional logo. The spinner animation is created using SVG and Framer Motion, with the `AnimatePresence` component animating the spinner in and out of the DOM.

Here's an example of how the `CircleSpinner` component might be used:

```jsx
import CircleSpinner from 'alephium-web3/components/CircleSpinner'

function MyComponent() {
  return (
    <div>
      <CircleSpinner connecting />
      <p>Loading...</p>
    </div>
  )
}
```

In this example, the `CircleSpinner` component is used alongside a paragraph element to display a loading message. The spinner will be visible and animated when the `connecting` prop is true. This component can be easily integrated into various parts of the Alephium Web3 project, providing a consistent and visually appealing user interface for loading and connecting states.
