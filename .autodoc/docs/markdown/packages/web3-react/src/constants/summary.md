[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/constants)

The code in the `constants` folder of the `alephium-web3` project provides essential constant values and configurations that are used throughout the project. These constants ensure consistency and maintainability in the codebase.

In `defaultTheme.ts`, a constant value for the minimum width of a mobile device screen is exported. This value, called `mobileWidth`, can be used by developers working on responsive designs for websites using the alephium-web3 library. By utilizing this constant, developers can ensure that the website will look and function properly on mobile devices without having to hardcode a specific pixel value for the mobile breakpoint. For example:

```css
@media (max-width: ${mobileWidth}px) {
  /* apply mobile-specific styles here */
}
```

In `supportedConnectors.tsx`, an array of supported blockchain wallet connectors for the Alephium project is defined. The `supportedConnectors` array contains three objects, each representing a different wallet connector: `injected`, `desktopWallet`, and `walletConnect`. These connectors have properties such as `name`, `shortName`, `logos`, `scannable`, and `extensionIsInstalled` (for the `injected` connector) that provide information about the wallet and its capabilities.

The code checks if the `window` object is defined, indicating that it is running in a browser environment. If so, the `supportedConnectors` array is initialized with the three connectors described above. Otherwise, the array remains empty.

The `supportedConnectors` array can be imported and used in other parts of the Alephium project, such as the user interface, to display a list of available wallets to the user. This allows users to choose which wallet to use for their transactions. For example:

```javascript
import { supportedConnectors } from './constants/supportedConnectors';

// Display the list of supported connectors in the UI
supportedConnectors.forEach((connector) => {
  console.log(connector.name);
});
```

In summary, the code in the `constants` folder provides essential constant values and configurations for the alephium-web3 project. These constants ensure consistency and maintainability in the codebase, allowing developers to create responsive designs and interact with supported wallet connectors seamlessly.
