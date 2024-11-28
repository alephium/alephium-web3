[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / UnsignedTxCodec

# Class: UnsignedTxCodec

## Extends

- `ObjectCodec`\<[`UnsignedTx`](../interfaces/UnsignedTx.md)\>

## Constructors

### new UnsignedTxCodec()

> **new UnsignedTxCodec**(`codecs`): [`UnsignedTxCodec`](UnsignedTxCodec.md)

#### Parameters

• **codecs**

• **codecs.fixedOutputs**: [`Codec`](Codec.md)\<[`AssetOutput`](../namespaces/assetOutput/interfaces/AssetOutput.md)[]\>

• **codecs.gasAmount**: [`Codec`](Codec.md)\<`number`\>

• **codecs.gasPrice**: [`Codec`](Codec.md)\<`bigint`\>

• **codecs.inputs**: [`Codec`](Codec.md)\<[`Input`](../interfaces/Input.md)[]\>

• **codecs.networkId**: [`Codec`](Codec.md)\<`number`\>

• **codecs.statefulScript**: [`Codec`](Codec.md)\<[`Option`](../type-aliases/Option.md)\<[`Script`](../namespaces/script/interfaces/Script.md)\>\>

• **codecs.version**: [`Codec`](Codec.md)\<`number`\>

#### Returns

[`UnsignedTxCodec`](UnsignedTxCodec.md)

#### Inherited from

`ObjectCodec<UnsignedTx>.constructor`

#### Defined in

[src/codec/codec.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L71)

## Methods

### \_decode()

> **\_decode**(`input`): [`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Inherited from

`ObjectCodec._decode`

#### Defined in

[src/codec/codec.ts:84](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L84)

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

`ObjectCodec.bimap`

#### Defined in

[src/codec/codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L31)

***

### decode()

> **decode**(`input`): [`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Inherited from

`ObjectCodec.decode`

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L24)

***

### decodeApiUnsignedTx()

> **decodeApiUnsignedTx**(`input`): [`UnsignedTx`](../../node/interfaces/UnsignedTx.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`UnsignedTx`](../../node/interfaces/UnsignedTx.md)

#### Defined in

[src/codec/unsigned-tx-codec.ts:44](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/unsigned-tx-codec.ts#L44)

***

### encode()

> **encode**(`value`): `Uint8Array`

#### Parameters

• **value**: [`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Returns

`Uint8Array`

#### Inherited from

`ObjectCodec.encode`

#### Defined in

[src/codec/codec.ts:76](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L76)

***

### encodeApiUnsignedTx()

> **encodeApiUnsignedTx**(`input`): `Uint8Array`

#### Parameters

• **input**: [`UnsignedTx`](../../node/interfaces/UnsignedTx.md)

#### Returns

`Uint8Array`

#### Defined in

[src/codec/unsigned-tx-codec.ts:39](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/unsigned-tx-codec.ts#L39)

***

### fromApiUnsignedTx()

> `static` **fromApiUnsignedTx**(`unsignedTx`): [`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Parameters

• **unsignedTx**: [`UnsignedTx`](../../node/interfaces/UnsignedTx.md)

#### Returns

[`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Defined in

[src/codec/unsigned-tx-codec.ts:70](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/unsigned-tx-codec.ts#L70)

***

### toApiUnsignedTx()

> `static` **toApiUnsignedTx**(`unsigned`): [`UnsignedTx`](../../node/interfaces/UnsignedTx.md)

#### Parameters

• **unsigned**: [`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Returns

[`UnsignedTx`](../../node/interfaces/UnsignedTx.md)

#### Defined in

[src/codec/unsigned-tx-codec.ts:53](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/unsigned-tx-codec.ts#L53)

***

### txId()

> `static` **txId**(`unsignedTx`): `string`

#### Parameters

• **unsignedTx**: [`UnsignedTx`](../interfaces/UnsignedTx.md)

#### Returns

`string`

#### Defined in

[src/codec/unsigned-tx-codec.ts:49](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/unsigned-tx-codec.ts#L49)
