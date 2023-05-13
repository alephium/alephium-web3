[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/web3/src/token)

The code in the `token` folder of the `alephium-web3` project focuses on providing functionality related to non-fungible tokens (NFTs) and their metadata. The folder contains two files: `index.ts` and `nft.ts`.

`index.ts` serves as the entry point for the `nft` module, exporting all the named exports from the `nft` module. This allows other modules within the `alephium-web3` project to easily import and use the functionality provided by the `nft` module. For example, if another module needs to create or interact with NFTs, it can simply import the `nft` module from this file and use its functions and classes:

```javascript
import { createNFT, transferNFT } from 'alephium-web3';

const myNFT = createNFT('My NFT', 'https://example.com/image.png');
transferNFT(myNFT, '0x1234567890abcdef', '0x0987654321fedcba');
```

`nft.ts` defines two interfaces, `NFTMetadata` and `NFTCollectionMetadata`, which represent the JSON schema for the metadata of NFTs and NFT collections, respectively. These interfaces are used throughout the `alephium-web3` project to define the structure of NFT and NFT collection metadata, ensuring that the metadata has the correct structure when interacting with smart contracts on the blockchain.

For example, when retrieving NFT metadata from a smart contract, the returned data can be validated against the `NFTMetadata` interface:

```typescript
import { NFTMetadata, NFTCollectionMetadata } from 'alephium-web3'

// Retrieve NFT metadata from a smart contract
const nftMetadata: NFTMetadata = await nftContract.getTokenUri(tokenId)
```

Similarly, when retrieving NFT collection metadata, the returned data can be validated against the `NFTCollectionMetadata` interface:

```typescript
// Retrieve NFT collection metadata from a smart contract
const collectionMetadata: NFTCollectionMetadata = await collectionContract.getCollectionUri(collectionId)
```

In summary, the code in the `token` folder of the `alephium-web3` project provides essential functionality for working with NFTs and their metadata. The `index.ts` file exports the `nft` module, making it easy for other modules to import and use its functions and classes. The `nft.ts` file defines the `NFTMetadata` and `NFTCollectionMetadata` interfaces, which are used to validate the structure of NFT and NFT collection metadata when interacting with smart contracts on the blockchain.
