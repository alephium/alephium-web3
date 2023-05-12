[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3/src/api)

The `.autodoc/docs/json/packages/web3/src/api` folder contains the core implementation of the `alephium-web3` project, which provides a convenient and flexible way to interact with the Alephium blockchain through its web3 API. The folder consists of several TypeScript files that define classes, utility functions, and types for interacting with the Alephium blockchain explorer API and the Alephium node API.

The `explorer-provider.ts` file defines the `ExplorerProvider` class, which acts as a wrapper around the `ExplorerApi` class. This class provides a simplified interface for interacting with the Alephium blockchain explorer API, with methods corresponding to different API endpoints such as `blocks`, `transactions`, `addresses`, and more. For example, to fetch information about a specific block:

```typescript
import { ExplorerProvider } from 'alephium-web3';

const explorer = new ExplorerProvider();
const blockInfo = await explorer.blocks.get('block-hash');
```

The `node-provider.ts` file defines the `NodeProvider` class, which serves as a wrapper around the Alephium node API. This class exposes methods that correspond to various API endpoints, such as `wallets`, `infos`, `blockflow`, and more. For example, to fetch the balance of an address:

```typescript
import { NodeProvider } from 'alephium-web3';

const node = new NodeProvider();
const balance = await node.addresses.getBalance('address');
```

The `types.ts` file contains utility functions and type definitions for interacting with the Alephium blockchain through its web3 API. It defines several functions for converting between different data types used in the API and the corresponding JavaScript types, as well as functions for parsing API responses and converting them into JavaScript objects.

The `utils.ts` file contains utility functions for making HTTP requests to an API and handling rate limiting and retries. These functions are designed to be used in the larger Alephium project, which likely involves interacting with an external API. For example, to make a rate-limited fetch request:

```typescript
import { throttledFetch, convertHttpResponse } from 'alephium-web3';

const fetch = throttledFetch(5); // limit to 5 requests per second
const response = await fetch('https://api.example.com/data');
const data = await convertHttpResponse(response);
console.log(data);
```

The `index.ts` file serves as a central point for exporting all the important modules and functions from the alephium-web3 project, making them easily accessible for use in other parts of the project or in external projects that depend on alephium-web3.

Overall, the code in this folder provides a convenient and flexible way to interact with the Alephium blockchain through its web3 API, allowing developers to easily make requests to different API endpoints and handle responses in a type-safe manner.
