# My React dApp

This template monorepo was designed to provide a developer-friendly experience to Alephium ecosystem newcomers. It is split into 2 parts:

- app: contains the React frontend part of the dApp
- contracts: contains the dApp contracts

It uses **yarn workspaces** to manage both app and contract projects from the monorepo root.

## Local development

To get started quickly, follow these steps:

### Set up a devnet

Start a local devnet for testing and development. Please refer to the [Getting Started documentation](https://docs.alephium.org/full-node/getting-started#devnet).

### Install dependencies

```
yarn install
```

### Compile the contracts

```
yarn compile
```

### Deploy the contracts

```
yarn deploy
```

### Build the contracts package

```
yarn build:contracts
```

### Run the app

```
yarn start
```

### Install an Alephium wallet

Download an [Alephium wallet](https://alephium.org/#wallets), and connect it to your devnet dApp.

## Testnet, Mainnet, and More

You could use yarn workspace to run commands in the contracts or app directory.

```
yarn <my-contracts|my-dapp> <command>
```

You could also get some testnet tokens from the [Faucet](https://docs.alephium.org/infrastructure/public-services/#testnet-faucet).

To learn more about smart contract development on Alephium, take a look at the [documentation](https://docs.alephium.org/dapps/).
