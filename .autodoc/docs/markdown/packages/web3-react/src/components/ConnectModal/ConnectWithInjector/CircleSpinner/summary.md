[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/ConnectModal/ConnectWithInjector/CircleSpinner)

The `CircleSpinner` component, located in the `index.tsx` file, is a crucial part of the Alephium Web3 project as it provides a visual indication of loading or connecting states. It is a React component that renders a circular spinner animation with an optional logo. The component accepts several props, such as `logo`, `smallLogo`, `connecting`, `unavailable`, and `countdown`, which allow customization of the spinner's appearance and behavior.

The spinner animation is created using SVG and Framer Motion, with the `AnimatePresence` component animating the spinner in and out of the DOM. Depending on the provided props, the spinner can have different animations, such as a fade-in animation when `connecting` is true or a countdown animation when `countdown` is true.

In the `styles.ts` file, you'll find styled components for the logo and spinner, which define the appearance of these elements. The `LogoContainer` component acts as a wrapper for the logo and spinner components, while the `ExpiringSpinner` and `Spinner` components represent different spinner animations.

The `CircleSpinner` component can be used in various parts of the Alephium Web3 project to indicate loading or connecting states. For instance, it can be combined with other components to create a more complex loading or connecting UI, such as in a modal or overlay to indicate a background process.

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
