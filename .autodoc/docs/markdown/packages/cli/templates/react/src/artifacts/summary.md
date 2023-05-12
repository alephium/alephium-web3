[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/cli/templates/react/src/artifacts)

The `.autodoc/docs/json/packages/cli/templates/react/src/artifacts` folder contains JSON files that provide information about smart contracts used in the alephium-web3 project. These contracts are designed to interact with the Alephium blockchain and can be used as building blocks for decentralized applications.

### greeter.ral.json

This file contains information about a simple smart contract called "Greeter" (version v2.0.4) written in Solidity. The contract has a single state variable named "btcPrice" of type "U256" (unsigned 256-bit integer), which is not mutable. The contract does not emit any events, as indicated by the empty "eventsSig" field.

The contract has one public function named "greet" that takes no parameters and returns a single value of type "U256". This function can be called from outside the contract to retrieve the value of the "btcPrice" state variable.

Example usage:

```javascript
// Deploy the contract
const Greeter = await ethers.getContractFactory("Greeter");
const greeter = await Greeter.deploy();

// Call the greet function
const result = await greeter.greet();
console.log(result.toString()); // Output: "0"
```

### greeter_main.ral.json

This file contains information about another smart contract called "GreeterMain". The contract has a single field named "greeterContractId" of type "ByteVec" that is not mutable. The contract has one public function named "main" that does not take any parameters or return any values. The "usePreapprovedAssets" and "useAssetsInContract" fields indicate whether the function can use pre-approved assets or assets that are already in the contract, respectively.

Developers can use the information in this file to interact with the GreeterMain contract and build applications on top of the Alephium blockchain. For example, they can use the bytecode to deploy the contract or call the "main" function to perform some action on the contract.

In summary, the files in the `artifacts` folder provide essential information about smart contracts used in the alephium-web3 project. Developers can use this information to deploy and interact with these contracts, enabling them to build decentralized applications on the Alephium blockchain.
