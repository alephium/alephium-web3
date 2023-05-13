[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/artifacts/add)

The `.autodoc/docs/json/artifacts/add` folder contains two JSON files that represent smart contracts for the Alephium blockchain network. These contracts are written in bytecode and provide basic functionality for adding two 256-bit unsigned integers and creating and destroying sub-contracts.

### add.ral.json

This file contains a smart contract called "Add" with four functions: `add`, `addPrivate`, `createSubContract`, and `destroy`. The `add` function is a public function that takes an array of two 256-bit unsigned integers and returns the sum of the two integers. The `addPrivate` function is similar to `add`, but it is private and can only be called by other functions within the contract.

The `createSubContract` function is a public function that creates a new sub-contract with the given parameters. The `destroy` function is a public function that destroys the contract and can only be called by the address provided as the parameter.

The contract also defines two events: "Add" and "Add1", both with fields "x" and "y" as 256-bit unsigned integers.

Example usage:

```solidity
contract MyContract {
  function addNumbers(uint256 a, uint256 b) public returns (uint256[2] memory) {
    uint256[2] memory input = [a, b];
    return Add.add(input);
  }
}
```

### destroy_add.ral.json

This file contains a smart contract template called "DestroyAdd" that allows a user to destroy a specified asset by adding it to a blacklist. The contract has two immutable fields: "add" (a ByteVec representing the asset to be destroyed) and "caller" (the address of the user calling the contract).

The contract includes a public function called "main" that takes no parameters and returns nothing. Its purpose is to add the specified asset to a blacklist, effectively destroying it. The contract offers two options for handling assets: "usePreapprovedAssets" and "useAssetsInContract".

Example usage:

Assuming the contract has been deployed on the network, a user can call the "main" function to destroy a specified asset. For example, if the asset to be destroyed is a token with the ID "0x123456", the user would call the function with the following parameters:

```javascript
add: [0x12, 0x34, 0x56]
caller: [address of user]
```

This would add the token to the blacklist and effectively destroy it.

In summary, the code in this folder provides basic functionality for adding integers and managing assets on the Alephium blockchain network. These contracts can be used as building blocks for more complex smart contracts that require these functionalities.
