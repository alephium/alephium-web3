[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [utils](../README.md) / Narrow

# Type Alias: Narrow\<type\>

> **Narrow**\<`type`\>: `unknown` *extends* `type` ? `unknown` : `never` \| `type` *extends* `Function` ? `type` : `never` \| `type` *extends* `bigint` \| `boolean` \| `number` \| `string` ? `type` : `never` \| `type` *extends* [] ? [] : `never` \| `{ [K in keyof type]: Narrow<type[K]> }`

## Type Parameters

• **type**

## Defined in

[src/utils/utils.ts:173](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/utils.ts#L173)
