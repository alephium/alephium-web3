[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Common/ThemedButton)

The `ThemedButton` component in the `index.tsx` file is a customizable button component that can be used throughout the Alephium Web3 project. It accepts several props, such as `variant`, `autoSize`, `duration`, and `style`, allowing developers to create buttons with different color schemes, animations, and custom styling.

The component utilizes the `useMeasure` hook from the `react-use-measure` library to measure the size of the button content and adjust the button width accordingly. The `Container` and `ThemeContainer` styled components from the `styles.ts` file are used to apply the appropriate theme and animation to the button.

For example, to create a primary button with a blue color scheme and a secondary button with a gray color scheme, you can use the following code:

```javascript
import ThemedButton from './ThemedButton'

function MyComponent() {
  return (
    <div>
      <ThemedButton variant="primary" onClick={() => console.log('Clicked!')}>
        Click me!
      </ThemedButton>
      <ThemedButton variant="secondary" autoSize={false}>
        Fixed width button
      </ThemedButton>
    </div>
  )
}
```

The `styles.ts` file contains two styled components, `Container` and `ThemeContainer`, which are responsible for styling the buttons. The `Container` component is a `motion.div` styled component that accepts a `$variant` prop and applies different styles based on the variant. It has two variants, `primary` and `secondary`, each with different color, background, box-shadow, and border-radius properties.

The `ThemeContainer` component is a styled button that sets all CSS properties to initial values and applies additional styling, such as user-select, position, padding, margin, and background. It also has a `disabled` state and hover and active states that change the appearance of the `Container` component when the button is hovered over or clicked.

These styled components can be used to create buttons with different styles throughout the Alephium Web3 project. For example, a button with the `primary` variant can be used for primary actions, while a button with the `secondary` variant can be used for secondary actions. The `ThemeContainer` component can be used to wrap any content that needs to be styled as a button.
