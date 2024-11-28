[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / InstrCodec

# Class: InstrCodec

## Extends

- [`Codec`](Codec.md)\<[`Instr`](../type-aliases/Instr.md)\>

## Constructors

### new InstrCodec()

> **new InstrCodec**(): [`InstrCodec`](InstrCodec.md)

#### Returns

[`InstrCodec`](InstrCodec.md)

#### Inherited from

[`Codec`](Codec.md).[`constructor`](Codec.md#constructors)

## Methods

### \_decode()

> **\_decode**(`input`): [`Instr`](../type-aliases/Instr.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`Instr`](../type-aliases/Instr.md)

#### Overrides

[`Codec`](Codec.md).[`_decode`](Codec.md#_decode)

#### Defined in

[src/codec/instr-codec.ts:868](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/instr-codec.ts#L868)

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

> **decode**(`input`): [`Instr`](../type-aliases/Instr.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`Instr`](../type-aliases/Instr.md)

#### Inherited from

[`Codec`](Codec.md).[`decode`](Codec.md#decode)

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`instr`): `Uint8Array`

#### Parameters

• **instr**: [`Instr`](../type-aliases/Instr.md)

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](Codec.md).[`encode`](Codec.md#encode)

#### Defined in

[src/codec/instr-codec.ts:476](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/codec/instr-codec.ts#L476)
