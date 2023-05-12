[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3/src/signer/fixtures)

The `fixtures` folder in the `alephium-web3` project contains two JSON files, `genesis.json` and `wallets.json`, which are used for testing purposes and simulating interactions with the Alephium blockchain.

`genesis.json` contains an array of four user accounts, each with an address, public key, private key, and mnemonic phrase. Developers can use these test accounts to simulate transactions and interactions with the blockchain without using real funds or accounts. For instance, a developer may use this code to create test accounts for a smart contract they are developing and test the functionality of the contract, such as sending and receiving tokens.

Example usage of `genesis.json`:

```javascript
const accounts = require('./genesis.json');

// Accessing the first account's address
console.log(accounts[0].address); // Output: 19XWyoWy6DjrRp7erWqPfBnh7HL1Sb2Ub8SVjux2d71Eb
```

`wallets.json` contains an array of wallet objects, each with a mnemonic, seed, password, and encrypted file. The mnemonic and seed can be used to generate the private key for the wallet, while the password is used to encrypt and decrypt the wallet file. This code is likely used in the larger project to store and manage multiple wallets, allowing users to easily manage and switch between different wallets within the application.

Example usage of `wallets.json`:

```javascript
const wallets = require('./wallets.json');
const wallet = wallets[0];

// Decrypt the wallet file using the password
const decrypted = decryptWallet(wallet.file, wallet.password);

// Use the decrypted wallet data to interact with the blockchain
const privateKey = generatePrivateKey(wallet.mnemonic);
const web3 = new Web3('https://api.alephium.org');
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.getBalance(account.address).then(console.log);
```

In this example, the first wallet in the array is selected, and its file is decrypted using the password. The mnemonic is then used to generate the private key, which is used to create a new account on the Alephium blockchain. Finally, the balance of the account is retrieved and logged to the console.

In summary, the `fixtures` folder provides developers with test accounts and wallets to simulate transactions and interactions with the Alephium blockchain, allowing them to test their smart contracts and other functionalities without using real funds or accounts.
