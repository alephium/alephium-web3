[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / TestContractResult

# Interface: TestContractResult\<R, M\>

## Type Parameters

• **R**

• **M** *extends* `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\> = `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>

## Properties

### contractAddress

> **contractAddress**: `string`

#### Defined in

[src/contract/contract.ts:976](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L976)

***

### contractId

> **contractId**: `string`

#### Defined in

[src/contract/contract.ts:975](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L975)

***

### contracts

> **contracts**: [`ContractStateWithMaps`](ContractStateWithMaps.md)\<[`NamedVals`](../type-aliases/NamedVals.md), `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>\>[]

#### Defined in

[src/contract/contract.ts:980](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L980)

***

### debugMessages

> **debugMessages**: [`DebugMessage`](../namespaces/node/interfaces/DebugMessage.md)[]

#### Defined in

[src/contract/contract.ts:983](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L983)

***

### events

> **events**: [`ContractEvent`](ContractEvent.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>[]

#### Defined in

[src/contract/contract.ts:982](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L982)

***

### gasUsed

> **gasUsed**: `number`

#### Defined in

[src/contract/contract.ts:978](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L978)

***

### maps?

> `optional` **maps**: `M`

#### Defined in

[src/contract/contract.ts:979](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L979)

***

### returns

> **returns**: `R`

#### Defined in

[src/contract/contract.ts:977](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L977)

***

### txOutputs

> **txOutputs**: [`Output`](../type-aliases/Output.md)[]

#### Defined in

[src/contract/contract.ts:981](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L981)
