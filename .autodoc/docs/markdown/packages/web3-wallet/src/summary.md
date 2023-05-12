[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-wallet/src)

The code in this folder provides key functionality for managing Alephium wallets and interacting with the Alephium network. It contains several modules that handle different aspects of wallet management and cryptographic operations.

The `hd-wallet.ts` module provides functions and classes related to HD wallets and private key derivation. It exports functions for deriving private keys from a mnemonic phrase and for specific groups, as well as utility functions for constructing HD wallet paths. The `HDWallet` class provides an in-memory HD wallet implementation, allowing users to derive and add new accounts and sign raw transactions.

Example usage of the `HDWallet` class:

```javascript
import { HDWallet } from './hd-wallet';

const mnemonic = 'your mnemonic phrase';
const keyType = 'default';
const nodeProvider = 'your node provider';
const explorerProvider = 'your explorer provider';

const wallet = new HDWallet(mnemonic, keyType, nodeProvider, explorerProvider);
```

The `index.ts` module exports four modules: `hd-wallet`, `node-wallet`, `privatekey-wallet`, and `password-crypto`. These modules provide functionality for generating hierarchical deterministic wallets, interacting with a remote Alephium node, managing wallets based on a single private key, and encrypting/decrypting sensitive data using a user-provided password.

The `noble-wrapper.ts` module provides utility functions for working with elliptic curve cryptography (ECC) using the secp256k1 curve. These functions are used throughout the project to provide secure key management and transaction signing functionality.

The `node-wallet.ts` module contains the `NodeWallet` class, which is used to interact with a wallet on the Alephium blockchain network. It provides methods for getting a list of accounts associated with the wallet, setting the active account, signing transactions, and locking/unlocking the wallet.

Example usage of the `NodeWallet` class:

```javascript
import { NodeWallet } from './node-wallet';

const walletName = 'your wallet name';
const nodeProvider = 'your node provider';
const explorerProvider = 'your explorer provider';

const wallet = new NodeWallet(walletName, nodeProvider, explorerProvider);
```

The `password-crypto.ts` module provides functions for encrypting and decrypting data using the AES-256-GCM algorithm. This module can be used to securely store and manage user data, such as private keys and seed phrases.

Example usage of the `encrypt` and `decrypt` functions:

```javascript
import { encrypt, decrypt } from './password-crypto';

const password = 'mysecretpassword';
const data = 'sensitivedata';

const encrypted = encrypt(password, data);
console.log(encrypted);

const decrypted = decrypt(password, encrypted);
console.log(decrypted);
```

The `privatekey-wallet.ts` module provides the `PrivateKeyWallet` class, which is an in-memory HDWallet for simple use cases. It can be used to generate and manage private keys and sign transactions for the Alephium blockchain.

Example usage of the `PrivateKeyWallet` class:

```javascript
import { PrivateKeyWallet } from './privatekey-wallet';

const privateKey = 'your private key';
const keyType = 'default';
const nodeProvider = 'your node provider';
const explorerProvider = 'your explorer provider';

const wallet = new PrivateKeyWallet(privateKey, keyType, nodeProvider, explorerProvider);
```

Overall, the code in this folder provides essential functionality for managing Alephium wallets and interacting with the Alephium network, allowing developers to build decentralized applications on the Alephium blockchain.
