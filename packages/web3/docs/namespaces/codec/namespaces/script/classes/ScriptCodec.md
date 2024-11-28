[**Web3 SDK v1.9.0**](../../../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../../../globals.md) / [codec](../../../README.md) / [script](../README.md) / ScriptCodec

# Class: ScriptCodec

## Extends

- [`Codec`](../../../classes/Codec.md)\<[`Script`](../interfaces/Script.md)\>

## Constructors

### new ScriptCodec()

> **new ScriptCodec**(): [`ScriptCodec`](ScriptCodec.md)

#### Returns

[`ScriptCodec`](ScriptCodec.md)

#### Inherited from

[`Codec`](../../../classes/Codec.md).[`constructor`](../../../classes/Codec.md#constructors)

## Methods

### \_decode()

> **\_decode**(`input`): [`Script`](../interfaces/Script.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`Script`](../interfaces/Script.md)

#### Overrides

[`Codec`](../../../classes/Codec.md).[`_decode`](../../../classes/Codec.md#_decode)

#### Defined in

[src/codec/script-codec.ts:33](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/script-codec.ts#L33)

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

[src/codec/codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L31)

***

### decode()

> **decode**(`input`): [`Script`](../interfaces/Script.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`Script`](../interfaces/Script.md)

#### Inherited from

[`Codec`](../../../classes/Codec.md).[`decode`](../../../classes/Codec.md#decode)

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`input`): `Uint8Array`

#### Parameters

• **input**: [`Script`](../interfaces/Script.md)

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](../../../classes/Codec.md).[`encode`](../../../classes/Codec.md#encode)

#### Defined in

[src/codec/script-codec.ts:29](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/script-codec.ts#L29)
