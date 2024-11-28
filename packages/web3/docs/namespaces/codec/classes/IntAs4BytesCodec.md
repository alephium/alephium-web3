[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / IntAs4BytesCodec

# Class: IntAs4BytesCodec

## Extends

- [`Codec`](Codec.md)\<`number`\>

## Constructors

### new IntAs4BytesCodec()

> **new IntAs4BytesCodec**(): [`IntAs4BytesCodec`](IntAs4BytesCodec.md)

#### Returns

[`IntAs4BytesCodec`](IntAs4BytesCodec.md)

#### Inherited from

[`Codec`](Codec.md).[`constructor`](Codec.md#constructors)

## Methods

### \_decode()

> **\_decode**(`input`): `number`

#### Parameters

• **input**: `Reader`

#### Returns

`number`

#### Overrides

[`Codec`](Codec.md).[`_decode`](Codec.md#_decode)

#### Defined in

[src/codec/int-as-4bytes-codec.ts:26](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/int-as-4bytes-codec.ts#L26)

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

> **decode**(`input`): `number`

#### Parameters

• **input**: `Uint8Array`

#### Returns

`number`

#### Inherited from

[`Codec`](Codec.md).[`decode`](Codec.md#decode)

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`value`): `Uint8Array`

#### Parameters

• **value**: `number`

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](Codec.md).[`encode`](Codec.md#encode)

#### Defined in

[src/codec/int-as-4bytes-codec.ts:22](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/int-as-4bytes-codec.ts#L22)
