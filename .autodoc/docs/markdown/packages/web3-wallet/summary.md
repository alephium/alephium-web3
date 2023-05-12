[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3-wallet)

The `alephium-web3` project provides a library for developers to interact with the Alephium blockchain. The code in the `web3-wallet` folder focuses on managing Alephium wallets and performing cryptographic operations.

The `hd-wallet.ts` module offers functions and classes related to HD wallets and private key derivation. For example, developers can use the `HDWallet` class to create an in-memory HD wallet, derive new accounts, and sign raw transactions:

```javascript
import { HDWallet } from './hd-wallet';

const mnemonic = 'your mnemonic phrase';
const keyType = 'default';
const nodeProvider = 'your node provider';
const explorerProvider = 'your explorer provider';

const wallet = new HDWallet(mnemonic, keyType, nodeProvider, explorerProvider);
```

The `index.ts` module exports four modules that provide functionality for generating hierarchical deterministic wallets, interacting with a remote Alephium node, managing wallets based on a single private key, and encrypting/decrypting sensitive data using a user-provided password.

The `noble-wrapper.ts` module offers utility functions for working with elliptic curve cryptography (ECC) using the secp256k1 curve, which are used throughout the project for secure key management and transaction signing.

The `node-wallet.ts` module contains the `NodeWallet` class for interacting with a wallet on the Alephium blockchain network. Developers can use this class to manage accounts, sign transactions, and lock/unlock the wallet:

```javascript
import { NodeWallet } from './node-wallet';

const walletName = 'your wallet name';
const nodeProvider = 'your node provider';
const explorerProvider = 'your explorer provider';

const wallet = new NodeWallet(walletName, nodeProvider, explorerProvider);
```

The `password-crypto.ts` module provides functions for encrypting and decrypting data using the AES-256-GCM algorithm, which can be used to securely store and manage user data, such as private keys and seed phrases:

```javascript
import { encrypt, decrypt } from './password-crypto';

const password = 'mysecretpassword';
const data = 'sensitivedata';

const encrypted = encrypt(password, data);
console.log(encrypted);

const decrypted = decrypt(password, encrypted);
console.log(decrypted);
```

The `privatekey-wallet.ts` module offers the `PrivateKeyWallet` class for simple use cases, such as generating and managing private keys and signing transactions for the Alephium blockchain:

```javascript
import { PrivateKeyWallet } from './privatekey-wallet';

const privateKey = 'your private key';
const keyType = 'default';
const nodeProvider = 'your node provider';
const explorerProvider = 'your explorer provider';

const wallet = new PrivateKeyWallet(privateKey, keyType, nodeProvider, explorerProvider);
```

In summary, the code in the `web3-wallet` folder provides essential functionality for managing Alephium wallets and interacting with the Alephium network, allowing developers to build decentralized applications on the Alephium blockchain.
