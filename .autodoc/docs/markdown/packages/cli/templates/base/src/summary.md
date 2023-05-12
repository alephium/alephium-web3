[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/cli/templates/base/src)

The `token.ts` file in the `alephium-web3` project demonstrates how to interact with a smart contract deployed on the Alephium blockchain using the `@alephium/web3` library. The script specifically focuses on withdrawing tokens from a `TokenFaucet` contract and printing the latest state of the contract.

To achieve this, the script imports necessary libraries and modules, such as `Deployments` from `@alephium/cli`, `web3`, `Project`, and `DUST_AMOUNT` from `@alephium/web3`, and `testNodeWallet` from `@alephium/web3-test`. It also imports `configuration` from `../alephium.config` and `TokenFaucet` and `Withdraw` from `../artifacts/ts`.

The main function in the script is the asynchronous `withdraw()` function, which performs the following steps:

1. Sets the current node provider to `http://127.0.0.1:22973`.
2. Builds the contracts of the project if they are not compiled.
3. Retrieves a test wallet for demonstration purposes.
4. Loads the deployments from the configuration file for the `devnet` network.
5. Iterates through each account in the test wallet and performs the following steps:
   1. Sets the active account to prepare and sign transactions.
   2. Retrieves the metadata of the deployed `TokenFaucet` contract in the account's group.
   3. If the contract is not deployed in the group, the script logs a message and continues to the next account.
   4. Otherwise, the script retrieves the contract ID and address.
   5. Submits a transaction to withdraw tokens from the `TokenFaucet` contract using the `Withdraw` transaction script.
   6. Retrieves the latest state of the `TokenFaucet` contract using the `TokenFaucet` contract instance.
   7. Prints the state of the contract.

The `withdraw()` function is called at the end of the script to execute the token withdrawal process.

This code serves as a reference for developers who want to interact with smart contracts on the Alephium blockchain using the `@alephium/web3` library. Developers can modify the code to interact with other contracts and networks by changing the configuration file and the contract names. For example, to interact with a different contract, developers can import the contract artifacts and replace the `TokenFaucet` and `Withdraw` imports with the new contract and transaction script. Additionally, developers can change the node provider URL and network configuration to work with different networks.
