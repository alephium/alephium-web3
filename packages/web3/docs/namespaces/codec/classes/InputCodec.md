[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / InputCodec

# Class: InputCodec

## Extends

- `ObjectCodec`\<[`Input`](../interfaces/Input.md)\>

## Constructors

### new InputCodec()

> **new InputCodec**(`codecs`): [`InputCodec`](InputCodec.md)

#### Parameters

• **codecs**

• **codecs.hint**: [`Codec`](Codec.md)\<`number`\>

• **codecs.key**: [`Codec`](Codec.md)\<`Uint8Array`\>

• **codecs.unlockScript**: [`Codec`](Codec.md)\<[`UnlockScript`](../namespaces/unlockScript/type-aliases/UnlockScript.md)\>

#### Returns

[`InputCodec`](InputCodec.md)

#### Inherited from

`ObjectCodec<Input>.constructor`

#### Defined in

[src/codec/codec.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L71)

## Methods

### \_decode()

> **\_decode**(`input`): [`Input`](../interfaces/Input.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`Input`](../interfaces/Input.md)

#### Inherited from

`ObjectCodec._decode`

#### Defined in

[src/codec/codec.ts:84](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L84)

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

[src/codec/codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L31)

***

### decode()

> **decode**(`input`): [`Input`](../interfaces/Input.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`Input`](../interfaces/Input.md)

#### Inherited from

`ObjectCodec.decode`

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`value`): `Uint8Array`

#### Parameters

• **value**: [`Input`](../interfaces/Input.md)

#### Returns

`Uint8Array`

#### Inherited from

`ObjectCodec.encode`

#### Defined in

[src/codec/codec.ts:76](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L76)

***

### fromAssetInputs()

> `static` **fromAssetInputs**(`inputs`): [`Input`](../interfaces/Input.md)[]

#### Parameters

• **inputs**: [`AssetInput`](../../node/interfaces/AssetInput.md)[]

#### Returns

[`Input`](../interfaces/Input.md)[]

#### Defined in

[src/codec/input-codec.ts:44](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/input-codec.ts#L44)

***

### toAssetInputs()

> `static` **toAssetInputs**(`inputs`): [`AssetInput`](../../node/interfaces/AssetInput.md)[]

#### Parameters

• **inputs**: [`Input`](../interfaces/Input.md)[]

#### Returns

[`AssetInput`](../../node/interfaces/AssetInput.md)[]

#### Defined in

[src/codec/input-codec.ts:32](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/input-codec.ts#L32)
