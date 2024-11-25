[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / UnSigned

# Class: UnSigned

## Constructors

### new UnSigned()

> **new UnSigned**(): [`UnSigned`](UnSigned.md)

#### Returns

[`UnSigned`](UnSigned.md)

## Properties

### fourByteBound

> `readonly` `static` **fourByteBound**: `bigint`

#### Defined in

[src/codec/compact-int-codec.ts:58](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L58)

***

### oneByteBound

> `readonly` `static` **oneByteBound**: `bigint`

#### Defined in

[src/codec/compact-int-codec.ts:56](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L56)

***

### twoByteBound

> `readonly` `static` **twoByteBound**: `bigint`

#### Defined in

[src/codec/compact-int-codec.ts:57](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L57)

***

### u256UpperBound

> `readonly` `static` **u256UpperBound**: `bigint`

#### Defined in

[src/codec/compact-int-codec.ts:59](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L59)

***

### u32UpperBound

> `readonly` `static` **u32UpperBound**: `number`

#### Defined in

[src/codec/compact-int-codec.ts:60](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L60)

## Methods

### decodeInt()

> `static` **decodeInt**(`mode`, `body`): `number`

#### Parameters

• **mode**: `FixedWidthMode`

• **body**: `Uint8Array`

#### Returns

`number`

#### Defined in

[src/codec/compact-int-codec.ts:103](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L103)

***

### decodeU256()

> `static` **decodeU256**(`mode`, `body`): `bigint`

#### Parameters

• **mode**: `Mode`

• **body**: `Uint8Array`

#### Returns

`bigint`

#### Defined in

[src/codec/compact-int-codec.ts:135](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L135)

***

### decodeU32()

> `static` **decodeU32**(`mode`, `body`): `number`

#### Parameters

• **mode**: `Mode`

• **body**: `Uint8Array`

#### Returns

`number`

#### Defined in

[src/codec/compact-int-codec.ts:119](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L119)

***

### encodeU256()

> `static` **encodeU256**(`value`): `Uint8Array`

#### Parameters

• **value**: `bigint`

#### Returns

`Uint8Array`

#### Defined in

[src/codec/compact-int-codec.ts:87](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L87)

***

### encodeU32()

> `static` **encodeU32**(`value`): `Uint8Array`

#### Parameters

• **value**: `number`

#### Returns

`Uint8Array`

#### Defined in

[src/codec/compact-int-codec.ts:62](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L62)
