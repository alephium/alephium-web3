[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / RalphMap

# Class: RalphMap\<K, V\>

## Type Parameters

• **K** *extends* [`Val`](../type-aliases/Val.md)

• **V** *extends* [`Val`](../type-aliases/Val.md)

## Constructors

### new RalphMap()

> **new RalphMap**\<`K`, `V`\>(`parentContract`, `parentContractId`, `mapName`): [`RalphMap`](RalphMap.md)\<`K`, `V`\>

#### Parameters

• **parentContract**: [`Contract`](Contract.md)

• **parentContractId**: `string`

• **mapName**: `string`

#### Returns

[`RalphMap`](RalphMap.md)\<`K`, `V`\>

#### Defined in

[src/contract/contract.ts:1536](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1536)

## Methods

### contains()

> **contains**(`key`): `Promise`\<`boolean`\>

#### Parameters

• **key**: `K`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/contract/contract.ts:1548](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1548)

***

### get()

> **get**(`key`): `Promise`\<`undefined` \| `V`\>

#### Parameters

• **key**: `K`

#### Returns

`Promise`\<`undefined` \| `V`\>

#### Defined in

[src/contract/contract.ts:1544](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1544)

***

### toJSON()

> **toJSON**(): `object`

#### Returns

`object`

##### groupIndex

> **groupIndex**: `number`

##### mapName

> **mapName**: `string`

##### parentContractId

> **parentContractId**: `string`

#### Defined in

[src/contract/contract.ts:1552](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1552)
