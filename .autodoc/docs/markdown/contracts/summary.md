[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/contracts)

The `.autodoc/docs/json/contracts` folder contains the `sub.ral` file, which defines a smart contract function named `sub` that performs subtraction of two `U256` values and returns the result. This function is part of the Alephium Web3 project, a library for interacting with the Alephium blockchain.

The `sub` function takes an array of two `U256` values as input and emits an event with the two values before performing the subtraction. The result of the subtraction is stored in a mutable variable called `result`, which is declared as an argument to the contract.

The `@using` decorator above the `sub` function sets two options for the function:

1. `checkExternalCaller`: Set to `false`, allowing any account on the blockchain to call the function, not just the contract owner.
2. `updateFields`: Set to `true`, enabling the `result` variable to be updated by the function.

The `sub` function can be called by other contracts or external accounts to perform subtraction operations on the blockchain. The emitted event can be used to track the history of these operations and provide transparency to users of the blockchain.

Here's an example of how the `sub` function could be called from another contract:

```solidity
contract MyContract {
    function myFunction() public returns (U256) {
        U256[2] memory values = [U256(10), U256(5)];
        U256 result = Sub(values);
        return result;
    }
}
```

In this example, the `myFunction` function in the `MyContract` contract calls the `sub` function in the `Sub` contract with an array of two `U256` values. The result of the subtraction is stored in a variable called `result` and returned to the caller.

In summary, the `sub.ral` file defines a smart contract function that performs subtraction of two `U256` values on the Alephium blockchain. This function can be called by other contracts or external accounts, and the emitted event can be used to track the history of subtraction operations, providing transparency to users of the blockchain.
