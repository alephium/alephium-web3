[View code on GitHub](https://github.com/alephium/alephium-web3/packages/web3/src/token/nft.ts)

This file contains two interfaces, `NFTMetadata` and `NFTCollectionMetadata`, which define the JSON schema for the metadata of non-fungible tokens (NFTs) and NFT collections, respectively. 

NFTs are unique digital assets that are stored on a blockchain and can represent anything from artwork to virtual real estate. Each NFT has its own metadata, which includes information such as the name, description, and image of the asset. The `NFTMetadata` interface defines the structure of this metadata, with properties for the name, description, and image of the NFT.

NFT collections are groups of NFTs that are managed by a smart contract on the blockchain. Each NFT collection also has its own metadata, which includes information such as the name, description, and image of the collection. The `NFTCollectionMetadata` interface defines the structure of this metadata, with properties for the name, description, and image of the collection.

These interfaces are likely used throughout the larger alephium-web3 project to define the structure of NFT and NFT collection metadata. For example, when retrieving NFT metadata from a smart contract, the returned data can be validated against the `NFTMetadata` interface to ensure that it has the correct structure. Similarly, when retrieving NFT collection metadata, the returned data can be validated against the `NFTCollectionMetadata` interface. 

Here is an example of how these interfaces might be used in TypeScript code:

```typescript
import { NFTMetadata, NFTCollectionMetadata } from 'alephium-web3'

// Retrieve NFT metadata from a smart contract
const nftMetadata: NFTMetadata = await nftContract.getTokenUri(tokenId)

// Retrieve NFT collection metadata from a smart contract
const collectionMetadata: NFTCollectionMetadata = await collectionContract.getCollectionUri(collectionId)
```
## Questions: 
 1. What license is this code released under?
- This code is released under the GNU Lesser General Public License.

2. What is the purpose of the `NFTMetadata` interface?
- The `NFTMetadata` interface defines the JSON schema for the metadata of a non-fungible token (NFT), including its name, description, and image.

3. What is the purpose of the `NFTCollectionMetadata` interface?
- The `NFTCollectionMetadata` interface defines the JSON schema for the metadata of an NFT collection, including its name, description, and image.