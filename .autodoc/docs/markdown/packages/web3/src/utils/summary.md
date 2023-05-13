[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3/src/utils)

The `utils` folder in the `alephium-web3` project contains various utility functions and classes that are used throughout the project for tasks such as encoding and decoding data, hashing, signing and verifying data, and working with numbers and addresses. These utilities are essential for the proper functioning of the project and can be used in different parts of the project as needed.

For example, the `address.ts` file provides a function called `addressToGroup` that maps an Ethereum address to a specific group number based on the total number of groups specified. This can be useful for partitioning a large set of addresses into smaller groups for more efficient processing. The usage of this function might look like this:

```javascript
import { addressToGroup } from 'alephium-web3/utils/address';

const ethAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
const numberOfGroups = 10;
const groupNumber = addressToGroup(ethAddress, numberOfGroups);
console.log(`Group number for address ${ethAddress}: ${groupNumber}`);
```

The `bs58.ts` file provides a library for encoding and decoding data using the Base58 algorithm, which is commonly used in cryptocurrencies. This can be used to encode and decode cryptocurrency addresses or transaction data. An example usage might be:

```javascript
import bs58 from 'alephium-web3/utils/bs58';

const encodedData = '5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr';
const decodedData = bs58.decode(encodedData);
console.log(`Decoded data: ${decodedData.toString('hex')}`);
```

The `djb2.ts` file exports a hash function that generates a hash value for a given input `Uint8Array` of bytes using the djb2 algorithm. This can be used for indexing data in a hash table or verifying the integrity of data. Example usage:

```javascript
import djb2 from 'alephium-web3/utils/djb2';

const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
const hash = djb2(data);
console.log(`Hash value: ${hash}`);
```

The `number.ts` file provides utility functions for formatting and converting numbers used in the Alephium project. These functions can be used to ensure consistent formatting and conversion of numbers. Example usage:

```javascript
import { prettifyAttoAlphAmount } from 'alephium-web3/utils/number';

const rawAmount = '1000000000000000000';
const formattedAmount = prettifyAttoAlphAmount(rawAmount);
console.log(`Formatted amount: ${formattedAmount}`);
```

In summary, the `utils` folder contains essential utility functions and classes that are used throughout the `alephium-web3` project to perform various tasks such as encoding, decoding, hashing, signing, verifying, and working with numbers and addresses. These utilities can be imported and used in different parts of the project as needed.
