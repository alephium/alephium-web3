[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / MethodCodec

# Class: MethodCodec

## Extends

- [`Codec`](Codec.md)\<[`Method`](../interfaces/Method.md)\>

## Constructors

### new MethodCodec()

> **new MethodCodec**(): [`MethodCodec`](MethodCodec.md)

#### Returns

[`MethodCodec`](MethodCodec.md)

#### Inherited from

[`Codec`](Codec.md).[`constructor`](Codec.md#constructors)

## Methods

### \_decode()

> **\_decode**(`input`): [`Method`](../interfaces/Method.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`Method`](../interfaces/Method.md)

#### Overrides

[`Codec`](Codec.md).[`_decode`](Codec.md#_decode)

#### Defined in

[src/codec/method-codec.ts:84](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/method-codec.ts#L84)

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

> **decode**(`input`): [`Method`](../interfaces/Method.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`Method`](../interfaces/Method.md)

#### Inherited from

[`Codec`](Codec.md).[`decode`](Codec.md#decode)

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`method`): `Uint8Array`

#### Parameters

• **method**: [`Method`](../interfaces/Method.md)

#### Returns

`Uint8Array`

#### Overrides

[`Codec`](Codec.md).[`encode`](Codec.md#encode)

#### Defined in

[src/codec/method-codec.ts:73](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/method-codec.ts#L73)
