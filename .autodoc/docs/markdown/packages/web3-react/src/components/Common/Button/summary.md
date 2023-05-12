[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Common/Button)

The `Button` component in the `index.tsx` file is a reusable and customizable UI element that can be used throughout the Alephium web3 project to create clickable buttons with various styles and features. It accepts a wide range of props, allowing developers to easily configure the appearance and behavior of the button. For example, a developer can create a primary button with an icon and a click handler like this:

```tsx
import Button from 'alephium-web3/components/Common/Button'

<Button variant="primary" icon="plus" onClick={() => console.log('Button clicked')}>
  Add Item
</Button>
```

The `styles.ts` file contains styled components for buttons and icons, which are used by the `Button` component to create its visual appearance. Developers can customize the appearance of buttons by passing different values for the `$variant` prop, and can add icons with optional rounded borders using the `IconContainer` component.

The `types.ts` file defines a TypeScript interface called `ButtonProps`, which is used as a type for the props passed to the `Button` component. This ensures that the component only receives valid props and provides type checking and autocompletion for those props in development environments.

In summary, the code in this folder provides a flexible and customizable `Button` component that can be used throughout the Alephium web3 project to create clickable buttons with various styles and features. The component is built using styled components and TypeScript, ensuring a consistent appearance and strong type checking for its props.
