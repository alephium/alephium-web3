[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / Codec

# Class: `abstract` Codec\<T\>

## Extended by

- [`ScriptCodec`](../namespaces/script/classes/ScriptCodec.md)
- [`ContractCodec`](../namespaces/contract/classes/ContractCodec.md)
- [`ArrayCodec`](ArrayCodec.md)
- [`ByteStringCodec`](ByteStringCodec.md)
- [`InstrCodec`](InstrCodec.md)
- [`TimestampCodec`](TimestampCodec.md)
- [`MethodCodec`](MethodCodec.md)
- [`IntAs4BytesCodec`](IntAs4BytesCodec.md)

## Type Parameters

• **T**

## Constructors

### new Codec()

> **new Codec**\<`T`\>(): [`Codec`](Codec.md)\<`T`\>

#### Returns

[`Codec`](Codec.md)\<`T`\>

## Methods

### \_decode()

> `abstract` **\_decode**(`input`): `T`

#### Parameters

• **input**: `Reader`

#### Returns

`T`

#### Defined in

[src/codec/codec.ts:29](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L29)

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

#### Defined in

[src/codec/codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L31)

***

### decode()

> **decode**(`input`): `T`

#### Parameters

• **input**: `Uint8Array`

#### Returns

`T`

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> `abstract` **encode**(`input`): `Uint8Array`

#### Parameters

• **input**: `T`

#### Returns

`Uint8Array`

#### Defined in

[src/codec/codec.ts:23](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L23)
