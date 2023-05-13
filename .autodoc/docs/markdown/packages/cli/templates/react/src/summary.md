[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/cli/templates/react/src)

The `App.tsx` file in the `.autodoc/docs/json/packages/cli/templates/react/src` folder serves as the entry point for a React application that interacts with the Alephium blockchain using the `@alephium/web3` library. The application provides a simple dashboard that displays the total number of blocks on the blockchain and information about smart contracts and scripts.

The `Dashboard` component is responsible for fetching and displaying the total number of blocks on the Alephium blockchain. It uses the `api.blocks.getBlocks` method to fetch the data and stores it in the component's state using the `useState` hook. The `useEffect` hook ensures that the data is fetched when the component mounts.

```javascript
const [blocks, setBlocks] = useState<number>(0);

useEffect(() => {
  api.blocks.getBlocks().then((result) => {
    setBlocks(result.length);
  });
}, []);
```

The `App` component renders the `Dashboard` component in the header of the page, providing a simple user interface for the application.

```javascript
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Dashboard />
      </header>
    </div>
  );
}
```

The `contractJson` and `scriptJson` variables are JSON files that contain the ABI and bytecode of a smart contract and a script, respectively. These files are located in the `artifacts` subfolder and can be used to create instances of the `Contract` and `Script` classes using the `Contract.fromJson` and `Script.fromJson` methods. The instances can then be converted to strings and displayed in the `Dashboard` component.

```javascript
const contract = Contract.fromJson(contractJson);
const script = Script.fromJson(scriptJson);

return (
  <div>
    <p>Total blocks: {blocks}</p>
    <p>Contract: {contract.toString()}</p>
    <p>Script: {script.toString()}</p>
  </div>
);
```

Developers can use this code as a starting point for building web applications that interact with the Alephium blockchain. They can modify the `Dashboard` component to display additional information, such as the latest transactions or the current gas price. They can also use the `Contract` and `Script` classes to interact with smart contracts on the blockchain, such as deploying a new smart contract or calling a method on an existing smart contract.

For example, to deploy a new smart contract, developers can use the following code snippet:

```javascript
const contractFactory = new ContractFactory(contractJson.abi, contractJson.bytecode);
const deployedContract = await contractFactory.deploy();
```

To call a method on an existing smart contract, developers can use the following code snippet:

```javascript
const contractInstance = new Contract(contractJson.abi, contractJson.bytecode, contractAddress);
const result = await contractInstance.methods.myMethod().call();
```

In summary, the code in the `App.tsx` file and its subfolders provides a foundation for building web applications that interact with the Alephium blockchain using the `@alephium/web3` library. Developers can extend this code to create more complex applications that leverage the power of the Alephium blockchain and its smart contracts.
