[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/components/Common/CopyToClipboard)

The `CopyToClipboard` component in the `alephium-web3` project provides a simple and reusable way to copy a given string to the clipboard. It can be used in various contexts, such as copying a URL, a code snippet, or any other text content. The component can be rendered either as a standalone icon or as a button with the icon.

The `CopyToClipboardIcon.tsx` file defines a `CopyToClipboardIcon` component that renders an icon for copying content to the clipboard. It uses the `styled-components` and `framer-motion` libraries to style the icon and add animation effects. The component takes two optional props: `copied` and `small`. If `copied` is true, the icon is styled with the `$clipboard` prop set to true, indicating that the content has been copied to the clipboard. If `small` is true, the icon is rendered in a smaller size.

The `index.tsx` file defines a `CopyToClipboard` component that provides a way to copy a given string to the clipboard. The component takes three props: `string`, `children`, and `variant`. The `string` prop is the string that will be copied to the clipboard when the user clicks the copy icon or button. The `children` prop is the content that will be displayed alongside the copy icon or button. The `variant` prop determines whether the component should be rendered as a standalone component or a button.

Here's an example of how the `CopyToClipboard` component can be used:

```jsx
import CopyToClipboard from './path/to/CopyToClipboard'

function MyComponent() {
  return (
    <div>
      <CopyToClipboard string="https://example.com" variant="button">
        Copy URL
      </CopyToClipboard>
    </div>
  )
}
```

In this example, the `CopyToClipboard` component is used to create a button that copies the given URL to the clipboard when clicked. The `variant` prop is set to `"button"` to render the component as a button, and the `children` prop is used to display the text "Copy URL" alongside the copy icon.

Overall, the `CopyToClipboard` component and its related files provide a flexible and reusable way to add clipboard functionality to the `alephium-web3` project.
