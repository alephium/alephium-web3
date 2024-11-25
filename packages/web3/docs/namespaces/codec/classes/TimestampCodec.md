[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / TimestampCodec

# Class: TimestampCodec

## Extends

- [`Codec`](Codec.md)\<`bigint`\>

## Constructors

### new TimestampCodec()

> **new TimestampCodec**(): [`TimestampCodec`](TimestampCodec.md)

#### Returns

[`TimestampCodec`](TimestampCodec.md)

#### Inherited from

[`Codec`](Codec.md).[`constructor`](Codec.md#constructors)

## Properties

### max

> `static` **max**: `bigint`

#### Defined in

[src/codec/timestamp-codec.ts:23](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/timestamp-codec.ts#L23)

## Methods

### \_decode()

> **\_decode**(`input`): `bigint`

#### Parameters

• **input**: `Reader`

#### Returns

`bigint`

#### Overrides

[`Codec`](Codec.md).[`_decode`](Codec.md#_decode)

#### Defined in

[src/codec/timestamp-codec.ts:36](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/timestamp-codec.ts#L36)

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

[src/codec/codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L31)

***

### decode()

> **decode**(`input`): `bigint`

#### Parameters

• **input**: `Uint8Array`

#### Returns

`bigint`

#### Inherited from

[`Codec`](Codec.md).[`decode`](Codec.md#decode)

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`input`): `Uint8Array`

#### Parameters

• **input**: `bigint`

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](Codec.md).[`encode`](Codec.md#encode)

#### Defined in

[src/codec/timestamp-codec.ts:25](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/timestamp-codec.ts#L25)
