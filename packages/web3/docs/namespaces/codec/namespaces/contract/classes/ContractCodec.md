[**Web3 SDK v1.9.0**](../../../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../../../globals.md) / [codec](../../../README.md) / [contract](../README.md) / ContractCodec

# Class: ContractCodec

## Extends

- [`Codec`](../../../classes/Codec.md)\<[`HalfDecodedContract`](../interfaces/HalfDecodedContract.md)\>

## Constructors

### new ContractCodec()

> **new ContractCodec**(): [`ContractCodec`](ContractCodec.md)

#### Returns

[`ContractCodec`](ContractCodec.md)

#### Inherited from

[`Codec`](../../../classes/Codec.md).[`constructor`](../../../classes/Codec.md#constructors)

## Methods

### \_decode()

> **\_decode**(`input`): [`HalfDecodedContract`](../interfaces/HalfDecodedContract.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`HalfDecodedContract`](../interfaces/HalfDecodedContract.md)

#### Overrides

[`Codec`](../../../classes/Codec.md).[`_decode`](../../../classes/Codec.md#_decode)

#### Defined in

[src/codec/contract-codec.ts:44](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/contract-codec.ts#L44)

***

### bimap()

> **bimap**\<`R`\>(`from`, `to`): [`Codec`](../../../classes/Codec.md)\<`R`\>

#### Type Parameters

• **R**

#### Parameters

• **from**

• **to**

#### Returns

[`Codec`](../../../classes/Codec.md)\<`R`\>

#### Inherited from

[`Codec`](../../../classes/Codec.md).[`bimap`](../../../classes/Codec.md#bimap)

#### Defined in

[src/codec/codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L31)

***

### decode()

> **decode**(`input`): [`HalfDecodedContract`](../interfaces/HalfDecodedContract.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`HalfDecodedContract`](../interfaces/HalfDecodedContract.md)

#### Inherited from

[`Codec`](../../../classes/Codec.md).[`decode`](../../../classes/Codec.md#decode)

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L24)

***

### decodeContract()

> **decodeContract**(`input`): [`Contract`](../interfaces/Contract.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`Contract`](../interfaces/Contract.md)

#### Defined in

[src/codec/contract-codec.ts:51](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/contract-codec.ts#L51)

***

### encode()

> **encode**(`input`): `Uint8Array`

#### Parameters

• **input**: [`HalfDecodedContract`](../interfaces/HalfDecodedContract.md)

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](../../../classes/Codec.md).[`encode`](../../../classes/Codec.md#encode)

#### Defined in

[src/codec/contract-codec.ts:40](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/contract-codec.ts#L40)

***

### encodeContract()

> **encodeContract**(`contract`): `Uint8Array`

#### Parameters

• **contract**: [`Contract`](../interfaces/Contract.md)

#### Returns

`Uint8Array`

#### Defined in

[src/codec/contract-codec.ts:66](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/contract-codec.ts#L66)
