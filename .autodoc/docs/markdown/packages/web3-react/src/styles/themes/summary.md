[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-react/src/styles/themes)

The `.autodoc/docs/json/packages/web3-react/src/styles/themes` folder contains a collection of theme files that define the styling for various UI components in the Alephium Web3 project. These theme files export JavaScript objects containing CSS variables, which are used to maintain a consistent look and feel across the application. By using these variables, developers can easily apply and customize the styling of components, ensuring a cohesive user experience.

For example, the `base.ts` file exports an object containing CSS variables for both light and dark themes. These variables are used to style buttons, modals, tooltips, and the network dropdown. Developers can use these variables to create a consistent and visually appealing UI for their users.

```html
<!-- Connect Wallet button -->
<button class="connect-wallet-button">Connect Wallet</button>

<!-- Primary button -->
<button class="primary-button">Submit</button>

<!-- Modal -->
<div class="modal">
  <div class="modal-content">
    <h2>Important Information</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <button class="close-modal-button">Close</button>
  </div>
</div>

<!-- Tooltip -->
<div class="tooltip">
  <span class="tooltip-text">Tooltip text</span>
  <span class="tooltip-icon">?</span>
</div>

<!-- Network dropdown -->
<div class="network-dropdown">
  <button class="dropdown-button">Mainnet</button>
  <div class="dropdown-content">
    <a href="#">Testnet</a>
    <a href="#">Rinkeby</a>
  </div>
</div>
```

The `index.ts` file exports an object containing various themes for the Alephium Web3 interface library. Users can import the desired theme from this file and pass it to the appropriate component in the library to customize the look and feel of the interface.

```javascript
import { web95 } from 'alephium-web3/themes';

<SomeComponent theme={web95} />
```

Other theme files, such as `midnight.ts`, `minimal.ts`, `nouns.ts`, `retro.ts`, `rounded.ts`, `soft.ts`, and `web95.ts`, define the styling for various components like buttons, dropdowns, modals, and tooltips. Developers can use these variables in their CSS files to apply the defined styling to their components.

```css
.my-button {
  background-color: var(--ck-primary-button-background);
  /* other styles */
}
```

In summary, the code in the `themes` folder plays a crucial role in defining the visual style of the Alephium Web3 project and ensuring that it is consistent across different components. By using the CSS variables defined in these files, developers can create a consistent and visually appealing UI for their users.
