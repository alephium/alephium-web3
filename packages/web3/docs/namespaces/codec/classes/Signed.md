[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / Signed

# Class: Signed

## Constructors

### new Signed()

> **new Signed**(): [`Signed`](Signed.md)

#### Returns

[`Signed`](Signed.md)

## Properties

### fourByteBound

> `readonly` `static` **fourByteBound**: `bigint`

#### Defined in

[src/codec/compact-int-codec.ts:171](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L171)

***

### i256LowerBound

> `readonly` `static` **i256LowerBound**: `bigint` = `-Signed.i256UpperBound`

#### Defined in

[src/codec/compact-int-codec.ts:173](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L173)

***

### i256UpperBound

> `readonly` `static` **i256UpperBound**: `bigint`

#### Defined in

[src/codec/compact-int-codec.ts:172](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L172)

***

### i32LowerBound

> `readonly` `static` **i32LowerBound**: `number` = `-Signed.i32UpperBound`

#### Defined in

[src/codec/compact-int-codec.ts:175](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L175)

***

### i32UpperBound

> `readonly` `static` **i32UpperBound**: `number`

#### Defined in

[src/codec/compact-int-codec.ts:174](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L174)

***

### oneByteBound

> `readonly` `static` **oneByteBound**: `bigint`

#### Defined in

[src/codec/compact-int-codec.ts:169](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L169)

***

### signFlag

> `readonly` `static` **signFlag**: `32` = `0x20`

#### Defined in

[src/codec/compact-int-codec.ts:168](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L168)

***

### twoByteBound

> `readonly` `static` **twoByteBound**: `bigint`

#### Defined in

[src/codec/compact-int-codec.ts:170](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L170)

## Methods

### decodeI256()

> `static` **decodeI256**(`mode`, `body`): `bigint`

#### Parameters

• **mode**: `Mode`

• **body**: `Uint8Array`

#### Returns

`bigint`

#### Defined in

[src/codec/compact-int-codec.ts:294](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L294)

***

### decodeI32()

> `static` **decodeI32**(`mode`, `body`): `number`

#### Parameters

• **mode**: `Mode`

• **body**: `Uint8Array`

#### Returns

`number`

#### Defined in

[src/codec/compact-int-codec.ts:279](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L279)

***

### decodeInt()

> `static` **decodeInt**(`mode`, `body`): `number`

#### Parameters

• **mode**: `FixedWidthMode`

• **body**: `Uint8Array`

#### Returns

`number`

#### Defined in

[src/codec/compact-int-codec.ts:244](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L244)

***

### decodeNegativeInt()

> `static` **decodeNegativeInt**(`mode`, `body`): `number`

#### Parameters

• **mode**: `FixedWidthMode`

• **body**: `Uint8Array`

#### Returns

`number`

#### Defined in

[src/codec/compact-int-codec.ts:266](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L266)

***

### decodePositiveInt()

> `static` **decodePositiveInt**(`mode`, `body`): `number`

#### Parameters

• **mode**: `FixedWidthMode`

• **body**: `Uint8Array`

#### Returns

`number`

#### Defined in

[src/codec/compact-int-codec.ts:253](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L253)

***

### encodeI256()

> `static` **encodeI256**(`value`): `Uint8Array`

#### Parameters

• **value**: `bigint`

#### Returns

`Uint8Array`

#### Defined in

[src/codec/compact-int-codec.ts:232](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L232)

***

### encodeI32()

> `static` **encodeI32**(`value`): `Uint8Array`

#### Parameters

• **value**: `number`

#### Returns

`Uint8Array`

#### Defined in

[src/codec/compact-int-codec.ts:177](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L177)

***

### encodeNegativeI32()

> `static` **encodeNegativeI32**(`value`): `Uint8Array`

#### Parameters

• **value**: `number`

#### Returns

`Uint8Array`

#### Defined in

[src/codec/compact-int-codec.ts:209](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L209)

***

### encodePositiveI32()

> `static` **encodePositiveI32**(`value`): `Uint8Array`

#### Parameters

• **value**: `number`

#### Returns

`Uint8Array`

#### Defined in

[src/codec/compact-int-codec.ts:186](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/compact-int-codec.ts#L186)
