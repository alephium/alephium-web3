[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/cli/templates/base)

The `alephium.config.ts` file in the `alephium-web3` project serves as a central configuration file for network and settings information. It defines a `Settings` type with a single property `issueTokenAmount` of type `Number256` and a `defaultSettings` object with a default value of 100n for the `issueTokenAmount` property. The configuration object has three network configurations: `devnet`, `testnet`, and `mainnet`, each with a `nodeUrl` property specifying the Alephium node URL to connect to. The `devnet` network configuration also has a `privateKeys` property for deploying contracts.

Example usage of the configuration file:

```typescript
import configuration, { Settings } from './configuration'

// Connect to the devnet network
const devnetSettings: Settings = configuration.networks.devnet.settings
const nodeUrl: string = configuration.networks.devnet.nodeUrl
const privateKeys: string[] = configuration.networks.devnet.privateKeys

// Use the settings and nodeUrl to connect to the Alephium node and deploy contracts
// Use the privateKeys to sign transactions
```

The `scripts` folder contains the `0_deploy_faucet.ts` script, which deploys the `TokenFaucet` contract on the Alephium blockchain network. The script imports necessary modules and defines a `deploy` function that takes in a `Deployer` object and a `Network` object as parameters. The `Deployer` object is used to deploy the contract, while the `Network` object provides access to the network settings.

Example usage of the `deployFaucet` script:

```javascript
import deployFaucet from './deployFaucet'

deployFaucet()
```

The `src` folder contains the `token.ts` file, which demonstrates how to interact with a smart contract deployed on the Alephium blockchain using the `@alephium/web3` library. The script focuses on withdrawing tokens from a `TokenFaucet` contract and printing the latest state of the contract. The main function in the script is the asynchronous `withdraw()` function, which sets the current node provider, builds the contracts, retrieves a test wallet, loads the deployments, and iterates through each account in the test wallet to withdraw tokens and print the state of the contract.

Developers can modify the code in the `token.ts` file to interact with other contracts and networks by changing the configuration file and the contract names. For example, to interact with a different contract, developers can import the contract artifacts and replace the `TokenFaucet` and `Withdraw` imports with the new contract and transaction script. Additionally, developers can change the node provider URL and network configuration to work with different networks.
