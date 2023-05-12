[View code on GitHub](https://github.com/alephium/alephium-web3/packages/web3/src/contract/events.ts)

This file contains code for an event subscription class and a function to subscribe to events. The purpose of this code is to allow users to subscribe to events emitted by a smart contract on the Alephium blockchain. 

The `EventSubscription` class extends a `Subscription` class and takes in a `SubscribeOptions` object and a contract address as parameters. It also has a `fromCount` property that keeps track of the number of events that have been processed so far. The `startPolling` method sets up an event listener that triggers the `polling` method to fetch new events. The `polling` method fetches events emitted by the contract using the `web3` library and processes them by calling the `messageCallback` function. If there are more events to fetch, the `fromCount` property is updated and the `polling` method is called again. 

The `subscribeToEvents` function takes in the same parameters as the `EventSubscription` class and returns a new instance of the `EventSubscription` class. This function can be used by developers to subscribe to events emitted by a smart contract on the Alephium blockchain. 

Here is an example of how this code can be used:

```
import { subscribeToEvents } from 'alephium-web3'

const contractAddress = '0x1234567890abcdef'
const options = {
  messageCallback: (event) => console.log(event),
  errorCallback: (err) => console.error(err),
  pollingInterval: 5000
}

const subscription = subscribeToEvents(options, contractAddress)
```

In this example, we import the `subscribeToEvents` function from the `alephium-web3` library and pass in the contract address and subscription options. The `messageCallback` function logs the event to the console, the `errorCallback` function logs any errors to the console, and the `pollingInterval` is set to 5 seconds. The `subscribeToEvents` function returns a new instance of the `EventSubscription` class, which can be used to start listening for events emitted by the specified contract.
## Questions: 
 1. What is the purpose of this code and what does it do?
   
   This code defines a class `EventSubscription` and a function `subscribeToEvents` that allow developers to subscribe to events emitted by a smart contract on the Alephium blockchain. The `EventSubscription` class extends a `Subscription` class and overrides some of its methods to implement polling for new events and handling of event data.

2. What is the license for this code and where can I find more information about it?
   
   This code is licensed under the GNU Lesser General Public License (LGPL) version 3 or later. Developers can find more information about the license and its terms at <http://www.gnu.org/licenses/>.

3. What are the parameters for the `subscribeToEvents` function and how do I use it?
   
   The `subscribeToEvents` function takes three parameters: `options`, `contractAddress`, and `fromCount`. `options` is an object that specifies the callback functions to be called when new events are received or when an error occurs. `contractAddress` is a string that specifies the address of the smart contract to subscribe to. `fromCount` is an optional parameter that specifies the starting event count for polling. Developers can use this function to create a new `EventSubscription` object and start receiving events from the specified smart contract.