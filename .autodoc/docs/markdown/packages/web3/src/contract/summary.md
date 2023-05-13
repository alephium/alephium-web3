[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3/src/contract)

The `alephium-web3` project provides a set of tools for developers to interact with the Alephium blockchain and smart contracts. In the `contract` folder, there are two main files: `events.ts` and `index.ts`.

`events.ts` contains the `EventSubscription` class and the `subscribeToEvents` function. The `EventSubscription` class is designed to allow users to subscribe to events emitted by a smart contract on the Alephium blockchain. It extends a `Subscription` class and takes in a `SubscribeOptions` object and a contract address as parameters. The class has a `fromCount` property to keep track of the number of events processed so far. The `startPolling` method sets up an event listener that triggers the `polling` method to fetch new events. The `polling` method fetches events emitted by the contract using the `web3` library and processes them by calling the `messageCallback` function. If there are more events to fetch, the `fromCount` property is updated, and the `polling` method is called again.

Developers can use the `subscribeToEvents` function to subscribe to events emitted by a smart contract on the Alephium blockchain. Here's an example:

```javascript
import { subscribeToEvents } from 'alephium-web3'

const contractAddress = '0x1234567890abcdef'
const options = {
  messageCallback: (event) => console.log(event),
  errorCallback: (err) => console.error(err),
  pollingInterval: 5000
}

const subscription = subscribeToEvents(options, contractAddress)
```

`index.ts` exports three modules from the `alephium-web3` project: `ralph`, `contract`, and `events`. These modules provide various functionalities for interacting with the Alephium blockchain, smart contracts, and events. By exporting these modules, other parts of the `alephium-web3` project can import and use them as needed.

For example, a developer building a decentralized application on the Alephium blockchain could import the `contract` module to interact with their smart contracts:

```javascript
import { Contract } from 'alephium-web3'

const myContract = new Contract('0x123abc...', abi)

// Call a function on the contract
const result = await myContract.methods.myFunction().call()

// Send a transaction to the contract
await myContract.methods.myFunction().send({ from: '0x456def...', value: 100 })
```

In summary, the `contract` folder in the `alephium-web3` project provides tools for developers to interact with smart contracts and events on the Alephium blockchain. The `EventSubscription` class and `subscribeToEvents` function enable developers to subscribe to and handle events emitted by smart contracts, while the exported modules in `index.ts` allow for easy integration with other parts of the project.
