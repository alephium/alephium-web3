[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/cli)

The `cli` folder in the `alephium-web3` project provides a command-line interface (CLI) for developers to interact with the Alephium blockchain network. It contains essential scripts and tools for managing and interacting with a smart contract project built on the Alephium blockchain.

The `cli.js` script serves as an entry point for the Alephium CLI, allowing users to execute various commands through a terminal interface. For example, to print the version of the Alephium CLI, a user would run:

```bash
npx @alephium/cli@latest version
```

The `cli_internal.ts` file contains the actual implementation of the CLI commands, such as creating a new project, starting or stopping a local development network, compiling smart contracts, running tests, and deploying contracts to a specified network. These commands can be executed from the command line to perform various tasks.

The `devnet-user.conf` file sets various configuration parameters for the Alephium blockchain network, such as the initial distribution of tokens, consensus parameters, network-related parameters, wallet-related parameters, mempool-related parameters, node-related parameters, and mining-related parameters.

The `jest-config.json` file configures Jest, a JavaScript testing framework, to run tests for the `alephium-web3` project, including collecting code coverage information. It specifies which files to include and exclude from testing and how to transform certain file types.

The `tsconfig.json` file is a configuration file for the TypeScript compiler, specifying various options for the compiler to use when compiling TypeScript code into JavaScript.

The `cli/scripts` folder contains several scripts for various purposes, such as setting up new projects, deploying smart contracts, and managing a local Alephium development network (devnet).

The `cli/src` folder provides essential tools for developers to interact with the Alephium blockchain, simplifying the process of generating TypeScript interfaces, deploying smart contracts and scripts, and managing configurations and networks.

The `cli/templates` folder contains templates for the `alephium-web3` project, providing a starting point for developers to build applications that interact with the Alephium blockchain using the `@alephium/web3` library.

Overall, the code in the `cli` folder of the `alephium-web3` project is essential for developers working with the Alephium blockchain. It provides a convenient and powerful CLI for managing smart contract projects, as well as essential tools and templates for building applications that interact with the Alephium blockchain.
