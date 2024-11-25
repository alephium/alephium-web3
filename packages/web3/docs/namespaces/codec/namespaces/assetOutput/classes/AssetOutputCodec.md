[**Web3 SDK v1.9.0**](../../../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../../../globals.md) / [codec](../../../README.md) / [assetOutput](../README.md) / AssetOutputCodec

# Class: AssetOutputCodec

## Extends

- `ObjectCodec`\<[`AssetOutput`](../interfaces/AssetOutput.md)\>

## Constructors

### new AssetOutputCodec()

> **new AssetOutputCodec**(`codecs`): [`AssetOutputCodec`](AssetOutputCodec.md)

#### Parameters

• **codecs**

• **codecs.additionalData**: [`Codec`](../../../classes/Codec.md)\<`Uint8Array`\>

• **codecs.amount**: [`Codec`](../../../classes/Codec.md)\<`bigint`\>

• **codecs.lockTime**: [`Codec`](../../../classes/Codec.md)\<`bigint`\>

• **codecs.lockupScript**: [`Codec`](../../../classes/Codec.md)\<[`LockupScript`](../../lockupScript/type-aliases/LockupScript.md)\>

• **codecs.tokens**: [`Codec`](../../../classes/Codec.md)\<[`Token`](../../token/interfaces/Token.md)[]\>

#### Returns

[`AssetOutputCodec`](AssetOutputCodec.md)

#### Inherited from

`ObjectCodec<AssetOutput>.constructor`

#### Defined in

[src/codec/codec.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L71)

## Methods

### \_decode()

> **\_decode**(`input`): [`AssetOutput`](../interfaces/AssetOutput.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`AssetOutput`](../interfaces/AssetOutput.md)

#### Inherited from

`ObjectCodec._decode`

#### Defined in

[src/codec/codec.ts:84](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L84)

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

`ObjectCodec.bimap`

#### Defined in

[src/codec/codec.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L31)

***

### decode()

> **decode**(`input`): [`AssetOutput`](../interfaces/AssetOutput.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`AssetOutput`](../interfaces/AssetOutput.md)

#### Inherited from

`ObjectCodec.decode`

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`value`): `Uint8Array`

#### Parameters

• **value**: [`AssetOutput`](../interfaces/AssetOutput.md)

#### Returns

`Uint8Array`

#### Inherited from

`ObjectCodec.encode`

#### Defined in

[src/codec/codec.ts:76](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L76)

***

### fromFixedAssetOutput()

> `static` **fromFixedAssetOutput**(`fixedOutput`): [`AssetOutput`](../interfaces/AssetOutput.md)

#### Parameters

• **fixedOutput**: [`FixedAssetOutput`](../../../../node/interfaces/FixedAssetOutput.md)

#### Returns

[`AssetOutput`](../interfaces/AssetOutput.md)

#### Defined in

[src/codec/asset-output-codec.ts:80](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/asset-output-codec.ts#L80)

***

### fromFixedAssetOutputs()

> `static` **fromFixedAssetOutputs**(`fixedOutputs`): [`AssetOutput`](../interfaces/AssetOutput.md)[]

#### Parameters

• **fixedOutputs**: [`FixedAssetOutput`](../../../../node/interfaces/FixedAssetOutput.md)[]

#### Returns

[`AssetOutput`](../interfaces/AssetOutput.md)[]

#### Defined in

[src/codec/asset-output-codec.ts:74](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/asset-output-codec.ts#L74)

***

### toFixedAssetOutput()

> `static` **toFixedAssetOutput**(`txIdBytes`, `output`, `index`): [`FixedAssetOutput`](../../../../node/interfaces/FixedAssetOutput.md)

#### Parameters

• **txIdBytes**: `Uint8Array`

• **output**: [`AssetOutput`](../interfaces/AssetOutput.md)

• **index**: `number`

#### Returns

[`FixedAssetOutput`](../../../../node/interfaces/FixedAssetOutput.md)

#### Defined in

[src/codec/asset-output-codec.ts:43](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/asset-output-codec.ts#L43)

***

### toFixedAssetOutputs()

> `static` **toFixedAssetOutputs**(`txIdBytes`, `outputs`): [`FixedAssetOutput`](../../../../node/interfaces/FixedAssetOutput.md)[]

#### Parameters

• **txIdBytes**: `Uint8Array`

• **outputs**: [`AssetOutput`](../interfaces/AssetOutput.md)[]

#### Returns

[`FixedAssetOutput`](../../../../node/interfaces/FixedAssetOutput.md)[]

#### Defined in

[src/codec/asset-output-codec.ts:39](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/asset-output-codec.ts#L39)
