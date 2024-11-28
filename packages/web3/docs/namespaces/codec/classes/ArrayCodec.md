[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / ArrayCodec

# Class: ArrayCodec\<T\>

## Extends

- [`Codec`](Codec.md)\<`T`[]\>

## Type Parameters

• **T**

## Constructors

### new ArrayCodec()

> **new ArrayCodec**\<`T`\>(`childCodec`): [`ArrayCodec`](ArrayCodec.md)\<`T`\>

#### Parameters

• **childCodec**: [`Codec`](Codec.md)\<`T`\>

#### Returns

[`ArrayCodec`](ArrayCodec.md)\<`T`\>

#### Overrides

[`Codec`](Codec.md).[`constructor`](Codec.md#constructors)

#### Defined in

[src/codec/array-codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/array-codec.ts#L24)

## Methods

### \_decode()

> **\_decode**(`input`): `T`[]

#### Parameters

• **input**: `Reader`

#### Returns

`T`[]

#### Overrides

[`Codec`](Codec.md).[`_decode`](Codec.md#_decode)

#### Defined in

[src/codec/array-codec.ts:36](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/array-codec.ts#L36)

***

### bimap()

> **bimap**\<`R`\>(`from`, `to`): [`Codec`](Codec.md)\<`R`\>

#### Type Parameters

• **R**

#### Parameters

• **from**

• **to**

#### Returns

[`Codec`](Codec.md)\<`R`\>

#### Inherited from

[`Codec`](Codec.md).[`bimap`](Codec.md#bimap)

#### Defined in

[src/codec/codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L31)

***

### decode()

> **decode**(`input`): `T`[]

#### Parameters

• **input**: `Uint8Array`

#### Returns

`T`[]

#### Inherited from

[`Codec`](Codec.md).[`decode`](Codec.md#decode)

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`input`): `Uint8Array`

#### Parameters

• **input**: `T`[]

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](Codec.md).[`encode`](Codec.md#encode)

#### Defined in

[src/codec/array-codec.ts:28](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/array-codec.ts#L28)
