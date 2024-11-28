[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [utils](../README.md) / Narrow

# Type Alias: Narrow\<type\>

> **Narrow**\<`type`\>: `unknown` *extends* `type` ? `unknown` : `never` \| `type` *extends* `Function` ? `type` : `never` \| `type` *extends* `bigint` \| `boolean` \| `number` \| `string` ? `type` : `never` \| `type` *extends* [] ? [] : `never` \| `{ [K in keyof type]: Narrow<type[K]> }`

## Type Parameters

• **type**

## Defined in

[src/utils/utils.ts:173](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/utils.ts#L173)
