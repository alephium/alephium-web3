[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / ContractStateWithMaps

# Interface: ContractStateWithMaps\<T, M\>

## Extends

- [`ContractState`](ContractState.md)\<`T`\>

## Type Parameters

• **T** *extends* [`Fields`](../type-aliases/Fields.md) = [`Fields`](../type-aliases/Fields.md)

• **M** *extends* `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\> = `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>

## Properties

### address

> **address**: `string`

#### Inherited from

[`ContractState`](ContractState.md).[`address`](ContractState.md#address)

#### Defined in

[src/contract/contract.ts:883](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L883)

***

### asset

> **asset**: [`Asset`](Asset.md)

#### Inherited from

[`ContractState`](ContractState.md).[`asset`](ContractState.md#asset)

#### Defined in

[src/contract/contract.ts:890](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L890)

***

### bytecode

> **bytecode**: `string`

#### Inherited from

[`ContractState`](ContractState.md).[`bytecode`](ContractState.md#bytecode)

#### Defined in

[src/contract/contract.ts:885](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L885)

***

### codeHash

> **codeHash**: `string`

#### Inherited from

[`ContractState`](ContractState.md).[`codeHash`](ContractState.md#codehash)

#### Defined in

[src/contract/contract.ts:887](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L887)

***

### contractId

> **contractId**: `string`

#### Inherited from

[`ContractState`](ContractState.md).[`contractId`](ContractState.md#contractid)

#### Defined in

[src/contract/contract.ts:884](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L884)

***

### fields

> **fields**: `T`

#### Inherited from

[`ContractState`](ContractState.md).[`fields`](ContractState.md#fields)

#### Defined in

[src/contract/contract.ts:888](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L888)

***

### fieldsSig

> **fieldsSig**: [`FieldsSig`](../namespaces/node/interfaces/FieldsSig.md)

#### Inherited from

[`ContractState`](ContractState.md).[`fieldsSig`](ContractState.md#fieldssig)

#### Defined in

[src/contract/contract.ts:889](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L889)

***

### initialStateHash?

> `optional` **initialStateHash**: `string`

#### Inherited from

[`ContractState`](ContractState.md).[`initialStateHash`](ContractState.md#initialstatehash)

#### Defined in

[src/contract/contract.ts:886](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L886)

***

### maps?

> `optional` **maps**: `M`

#### Defined in

[src/contract/contract.ts:897](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L897)
