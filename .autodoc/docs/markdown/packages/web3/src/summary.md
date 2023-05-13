[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3/src)

The `.autodoc/docs/json/packages/web3/src` folder contains essential modules and files for the `alephium-web3` project, which provides a convenient and flexible way to interact with the Alephium blockchain through its web3 API. The folder consists of several TypeScript files that define constants, global settings, and utility functions, as well as subfolders containing code for handling transactions, smart contracts, tokens, and more.

For example, the `constants.ts` file defines several constants used throughout the project, such as the total number of groups in the Alephium network (`TOTAL_NUMBER_OF_GROUPS`) and the minimum amount of tokens that can be sent in a transaction (`DUST_AMOUNT`). These constants help ensure the proper functioning of the network and prevent spam attacks.

The `global.ts` file provides functions for setting and getting the current node and explorer providers for the Alephium project. By setting the current providers, other modules in the project can easily access them without having to create new instances. For example, a module that needs to make API calls to the current node provider can simply call `getCurrentNodeProvider()` to get the current provider object.

```javascript
import { setCurrentNodeProvider, getCurrentNodeProvider } from 'alephium-web3'

// Set the current node provider
setCurrentNodeProvider('https://my-node.com', 'my-api-key')

// Get the current node provider
const nodeProvider = getCurrentNodeProvider()

// Use the node provider to make an API call
const response = await nodeProvider.makeApiCall('/my-endpoint')
```

The `index.ts` file serves as a central point for exporting all the important modules and functions from the `alephium-web3` project, making them easily accessible for use in other parts of the project or in external projects that depend on `alephium-web3`. By importing this file, developers can easily access all the functionality they need to interact with the Alephium blockchain.

```javascript
import { transaction } from 'alephium-web3'

const tx = await transaction.send({
  from: '0x123...',
  to: '0x456...',
  value: 1000
})
```

The subfolders in this folder provide more specific functionality related to the Alephium blockchain, such as interacting with the Alephium blockchain explorer API (`api`), handling transactions and signing (`transaction`), working with smart contracts and events (`contract`), and managing non-fungible tokens (NFTs) and their metadata (`token`).

Overall, the code in this folder and its subfolders provide a comprehensive set of tools and utilities for interacting with the Alephium blockchain through its web3 API. By using these modules and functions, developers can easily build decentralized applications on the Alephium network, send transactions, interact with smart contracts, and manage tokens.
