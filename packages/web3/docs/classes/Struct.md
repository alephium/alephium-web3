[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / Struct

# Class: Struct

## Constructors

### new Struct()

> **new Struct**(`name`, `fieldNames`, `fieldTypes`, `isMutable`): [`Struct`](Struct.md)

#### Parameters

• **name**: `string`

• **fieldNames**: `string`[]

• **fieldTypes**: `string`[]

• **isMutable**: `boolean`[]

#### Returns

[`Struct`](Struct.md)

#### Defined in

[src/contract/contract.ts:130](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L130)

## Properties

### fieldNames

> **fieldNames**: `string`[]

#### Defined in

[src/contract/contract.ts:126](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L126)

***

### fieldTypes

> **fieldTypes**: `string`[]

#### Defined in

[src/contract/contract.ts:127](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L127)

***

### isMutable

> **isMutable**: `boolean`[]

#### Defined in

[src/contract/contract.ts:128](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L128)

***

### name

> **name**: `string`

#### Defined in

[src/contract/contract.ts:125](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L125)

## Methods

### toJson()

> **toJson**(): `any`

#### Returns

`any`

#### Defined in

[src/contract/contract.ts:148](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L148)

***

### fromJson()

> `static` **fromJson**(`json`): [`Struct`](Struct.md)

#### Parameters

• **json**: `any`

#### Returns

[`Struct`](Struct.md)

#### Defined in

[src/contract/contract.ts:137](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L137)

***

### fromStructSig()

> `static` **fromStructSig**(`sig`): [`Struct`](Struct.md)

#### Parameters

• **sig**: [`StructSig`](../namespaces/node/interfaces/StructSig.md)

#### Returns

[`Struct`](Struct.md)

#### Defined in

[src/contract/contract.ts:144](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L144)
