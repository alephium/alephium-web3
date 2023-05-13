[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/artifacts)

The `.autodoc/docs/json/artifacts` folder contains JSON files that provide metadata about smart contracts in the `alephium-web3` project. These files include information about the contract's bytecode, fields, functions, and events, which can be used by developers to interact with the contracts and build applications on top of them.

For example, the `greeter_main.ral.json` file contains metadata about a contract called "GreeterMain". The contract's bytecode template can be used to deploy the contract to a blockchain network, and the function metadata can be used to call the "main" function with the correct parameters:

```javascript
const contractMetadata = {
  // ... (metadata from greeter_main.ral.json)
}

// Deploy the contract to the blockchain
const bytecode = contractMetadata.bytecodeTemplate.replace('{0}', '0123456789abcdef')
const deployedContract = web3.eth.contract(contractMetadata.fieldsSig.types).new(
  '0123456789abcdef',
  {
    data: bytecode,
    from: web3.eth.accounts[0],
    gas: 1000000
  },
  (err, contract) => {
    if (err) {
      console.error(err)
      return
    }
    if (contract.address) {
      console.log('Contract deployed at address:', contract.address)
    }
  }
)

// Call the "main" function on the contract
deployedContract.main((err, result) => {
  if (err) {
    console.error(err)
    return
  }
  console.log('Main function result:', result)
})
```

Similarly, the `main.ral.json` file provides metadata about a "Main" contract, which can be used to deploy the contract and call its functions. The `add` subfolder contains JSON files for contracts that perform addition operations and manage assets, while the `greeter` subfolder contains a simple "Greeter" contract that returns a greeting message. The `sub` subfolder contains a "Sub" contract that performs subtraction operations.

These contracts can be used as building blocks for more complex decentralized applications on the Alephium blockchain network. For example, a developer could use the "Add" contract from the `add` subfolder to create a new contract that performs arithmetic operations on user-provided input:

```solidity
contract MyContract {
  function addNumbers(uint256 a, uint256 b) public returns (uint256[2] memory) {
    uint256[2] memory input = [a, b];
    return Add.add(input);
  }
}
```

In summary, the code in the `.autodoc/docs/json/artifacts` folder provides metadata about various smart contracts in the `alephium-web3` project, which can be used by developers to interact with the contracts and build applications on top of them. The JSON files include information about the contract's bytecode, fields, functions, and events, allowing developers to deploy the contracts, call their functions, and emit events as needed.
