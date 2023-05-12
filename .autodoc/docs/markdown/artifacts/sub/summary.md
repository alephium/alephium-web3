[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/artifacts/sub)

The `sub.ral.json` file in the `alephium-web3` project contains a Solidity smart contract named "Sub" (version v2.3.1) that performs a simple subtraction operation on two unsigned 256-bit integers. This contract can be used as a building block for more complex decentralized applications that require arithmetic operations on the Ethereum blockchain.

The compiled code for the contract is stored in the "bytecode" field, which will be executed on the Ethereum Virtual Machine (EVM) when the contract is deployed. The "codeHash" field serves as a unique identifier for the compiled code.

The contract has a single state variable named "result" of type "U256" (unsigned 256-bit integer), which can be modified. The "fieldsSig" object describes this state variable.

The "eventsSig" array describes the events that can be emitted by the contract. In this case, there is only one event named "Sub" that takes two arguments of type "U256".

The "functions" array describes the functions that can be called on the contract. In this case, there is only one function named "sub" that takes an array of two "U256" values as input and returns a single "U256" value. The function is marked as public, meaning it can be called by anyone, and does not use any preapproved or in-contract assets.

Here's an example of how this code might be used:

```javascript
// Deploy the contract
const contract = new web3.eth.Contract(contractAbi);
const deployedContract = await contract.deploy({
  data: bytecode,
}).send({
  from: accounts[0],
  gas: 1500000,
});

// Call the "sub" function
const result = await deployedContract.methods.sub([10, 5]).call();
console.log(result); // Output: 5
```

In this example, the "Sub" contract is first deployed to the Ethereum network using the `web3.eth.Contract` constructor and the `deploy` method. The contract is then sent to the network using the `send` method, specifying the sender's account and the gas limit.

After the contract is deployed, the "sub" function can be called using the `methods.sub` method on the deployed contract instance. In this case, the function is called with the input values `[10, 5]`, and the result `5` is logged to the console.

This simple subtraction contract can be integrated into more complex decentralized applications that require arithmetic operations, serving as a reusable component for developers working with the Ethereum blockchain.
