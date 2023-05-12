[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Common/BrowserIcon)

The `alephium-web3` project contains a reusable React component called `BrowserIcon` that renders an icon for a specific web browser. The component is located in the `.autodoc/docs/json/packages/web3-react/src/components/Common/BrowserIcon` folder and consists of three files: `index.tsx`, `styles.ts`, and `types.ts`.

`index.tsx` defines the `BrowserIcon` component, which takes a `browser` prop to specify which browser icon to render. If the `browser` prop is not provided, the component will attempt to detect the current browser using the `detectBrowser` utility function imported from the `utils` module. The `browsers` object, containing SVG icons for each supported browser, is imported from the `assets/browsers` module. The `BrowserIcon` component selects the appropriate icon based on the `currentBrowser` value and renders it inside a `BrowserIconContainer` component, defined in the `styles` module.

```jsx
import BrowserIcon from 'alephium-web3';

function MyComponent() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <BrowserIcon browser="chrome" />
    </div>
  );
}
```

`styles.ts` defines a styled component called `BrowserIconContainer` using the `styled-components` library. The component is a `motion.div` element from the `framer-motion` library, which provides animation capabilities to React components. The `BrowserIconContainer` component is responsive and adjusts its size to fit the available space.

`types.ts` exports a type called `BrowserIconProps`, which is an object with an optional `browser` property of type string. This type is used to define the props for the `BrowserIcon` component.

```jsx
import { BrowserIconProps } from 'alephium-web3';

const BrowserIcon = ({ browser }: BrowserIconProps) => {
  // logic to determine which icon to display based on the browser prop
  return <img src={iconUrl} alt={`${browser} icon`} />;
};

// example usage
<BrowserIcon browser="chrome" />
```

In summary, the `BrowserIcon` component in the `alephium-web3` project provides a reusable and responsive way to display browser icons in a React application. The component can be easily integrated into other parts of the project or used in other applications that require browser-specific functionality or styling.
