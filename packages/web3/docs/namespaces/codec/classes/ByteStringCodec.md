[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / ByteStringCodec

# Class: ByteStringCodec

## Extends

- [`Codec`](Codec.md)\<[`ByteString`](../type-aliases/ByteString.md)\>

## Constructors

### new ByteStringCodec()

> **new ByteStringCodec**(): [`ByteStringCodec`](ByteStringCodec.md)

#### Returns

[`ByteStringCodec`](ByteStringCodec.md)

#### Inherited from

[`Codec`](Codec.md).[`constructor`](Codec.md#constructors)

## Methods

### \_decode()

> **\_decode**(`input`): `Uint8Array`

#### Parameters

• **input**: `Reader`

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](Codec.md).[`_decode`](Codec.md#_decode)

#### Defined in

[src/codec/bytestring-codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/bytestring-codec.ts#L31)

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

> **decode**(`input`): `Uint8Array`

#### Parameters

• **input**: `Uint8Array`

#### Returns

`Uint8Array`

#### Inherited from

[`Codec`](Codec.md).[`decode`](Codec.md#decode)

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`input`): `Uint8Array`

#### Parameters

• **input**: `Uint8Array`

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](Codec.md).[`encode`](Codec.md#encode)

#### Defined in

[src/codec/bytestring-codec.ts:27](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/bytestring-codec.ts#L27)
