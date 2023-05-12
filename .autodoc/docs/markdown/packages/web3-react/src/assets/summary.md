[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/assets)

The `assets` folder in the `alephium-web3` project contains two files, `icons.tsx` and `logos.tsx`, which define various SVG icons and logos as React components. These components can be easily imported and used in other parts of the project to provide visual cues and branding.

### icons.tsx

This file contains a collection of SVG icons defined as React functional components. The icons included are:

- `Scan`: Represents scanning or searching functionality.
- `AlertIcon`: Indicates warnings or important information.
- `DisconnectIcon`: Represents disconnection from a network or service.
- `TickIcon`: Indicates success or completion of a task.
- `RetryIconCircle`: Represents retrying an action or refreshing data.
- `CopyToClipboardIcon`: Represents the action of copying content to the clipboard.

Each icon component accepts a set of props, which can be used to customize the appearance and behavior of the icon. For example, you can change the size, color, or other attributes of the icon by passing the appropriate props.

To use one of these icons in your project, you can import the desired icon component and include it in your JSX code. For example:

```javascript
import { AlertIcon } from './path/to/this/code/file';

function MyComponent() {
  return (
    <div>
      <h1>Important Information</h1>
      <AlertIcon />
    </div>
  );
}
```

### logos.tsx

This file contains several React components that render SVG icons for the Alephium project. The components are `AlephiumIcon`, `WalletConnect`, `Ledger`, and `PlaceHolder`.

- `AlephiumIcon`: Renders the Alephium logo, a visual identifier for the project.
- `WalletConnect`: Renders an icon for the WalletConnect protocol, used to connect decentralized applications to mobile wallets. Takes an optional `background` prop.
- `Ledger`: Renders an icon for the Ledger hardware wallet, used to store cryptocurrency securely.
- `PlaceHolder`: Renders a gray square as a placeholder for components that have not yet been implemented.

These components are used throughout the Alephium project to provide visual cues and branding. They can be imported into other React components and used like any other React component. For example, to use the `WalletConnect` icon in a component, you would import it like this:

```javascript
import { WalletConnect } from 'alephium-web3'

function MyComponent() {
  return (
    <div>
      <WalletConnect />
    </div>
  )
}
```

In summary, the `assets` folder contains a set of React components that render SVG icons and logos for the Alephium project. These components can be easily imported and used in other parts of the project to provide visual cues and branding.
