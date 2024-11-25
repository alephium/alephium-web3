[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / TestContractParams

# Interface: TestContractParams\<F, A, M\>

## Type Parameters

• **F** *extends* [`Fields`](../type-aliases/Fields.md) = [`Fields`](../type-aliases/Fields.md)

• **A** *extends* [`Arguments`](../type-aliases/Arguments.md) = [`Arguments`](../type-aliases/Arguments.md)

• **M** *extends* `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\> = `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>

## Properties

### address?

> `optional` **address**: `string`

#### Defined in

[src/contract/contract.ts:948](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L948)

***

### blockHash?

> `optional` **blockHash**: `string`

#### Defined in

[src/contract/contract.ts:950](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L950)

***

### blockTimeStamp?

> `optional` **blockTimeStamp**: `number`

#### Defined in

[src/contract/contract.ts:951](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L951)

***

### callerAddress?

> `optional` **callerAddress**: `string`

#### Defined in

[src/contract/contract.ts:949](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L949)

***

### existingContracts?

> `optional` **existingContracts**: [`ContractStateWithMaps`](ContractStateWithMaps.md)\<[`NamedVals`](../type-aliases/NamedVals.md), `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>\>[]

#### Defined in

[src/contract/contract.ts:957](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L957)

***

### group?

> `optional` **group**: `number`

#### Defined in

[src/contract/contract.ts:947](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L947)

***

### initialAsset?

> `optional` **initialAsset**: [`Asset`](Asset.md)

#### Defined in

[src/contract/contract.ts:955](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L955)

***

### initialFields

> **initialFields**: `F`

#### Defined in

[src/contract/contract.ts:953](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L953)

***

### initialMaps?

> `optional` **initialMaps**: `M`

#### Defined in

[src/contract/contract.ts:954](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L954)

***

### inputAssets?

> `optional` **inputAssets**: [`InputAsset`](InputAsset.md)[]

#### Defined in

[src/contract/contract.ts:958](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L958)

***

### testArgs

> **testArgs**: `A`

#### Defined in

[src/contract/contract.ts:956](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L956)

***

### txId?

> `optional` **txId**: `string`

#### Defined in

[src/contract/contract.ts:952](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L952)
