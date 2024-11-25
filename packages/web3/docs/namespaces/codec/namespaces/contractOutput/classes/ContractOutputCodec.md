[**Web3 SDK v1.9.0**](../../../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../../../globals.md) / [codec](../../../README.md) / [contractOutput](../README.md) / ContractOutputCodec

# Class: ContractOutputCodec

## Extends

- `ObjectCodec`\<[`ContractOutput`](../interfaces/ContractOutput.md)\>

## Constructors

### new ContractOutputCodec()

> **new ContractOutputCodec**(`codecs`): [`ContractOutputCodec`](ContractOutputCodec.md)

#### Parameters

• **codecs**

• **codecs.amount**: [`Codec`](../../../classes/Codec.md)\<`bigint`\>

• **codecs.lockupScript**: [`Codec`](../../../classes/Codec.md)\<`Uint8Array`\>

• **codecs.tokens**: [`Codec`](../../../classes/Codec.md)\<[`Token`](../../token/interfaces/Token.md)[]\>

#### Returns

[`ContractOutputCodec`](ContractOutputCodec.md)

#### Inherited from

`ObjectCodec<ContractOutput>.constructor`

#### Defined in

[src/codec/codec.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L71)

## Methods

### \_decode()

> **\_decode**(`input`): [`ContractOutput`](../interfaces/ContractOutput.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`ContractOutput`](../interfaces/ContractOutput.md)

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

> **decode**(`input`): [`ContractOutput`](../interfaces/ContractOutput.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`ContractOutput`](../interfaces/ContractOutput.md)

#### Inherited from

`ObjectCodec.decode`

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L24)

***

### encode()

> **encode**(`value`): `Uint8Array`

#### Parameters

• **value**: [`ContractOutput`](../interfaces/ContractOutput.md)

#### Returns

`Uint8Array`

#### Inherited from

`ObjectCodec.encode`

#### Defined in

[src/codec/codec.ts:76](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L76)

***

### convertToApiContractOutput()

> `static` **convertToApiContractOutput**(`txIdBytes`, `output`, `index`): [`ContractOutput`](../../../../node/interfaces/ContractOutput.md)

#### Parameters

• **txIdBytes**: `Uint8Array`

• **output**: [`ContractOutput`](../interfaces/ContractOutput.md)

• **index**: `number`

#### Returns

[`ContractOutput`](../../../../node/interfaces/ContractOutput.md)

#### Defined in

[src/codec/contract-output-codec.ts:35](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/contract-output-codec.ts#L35)

***

### convertToOutput()

> `static` **convertToOutput**(`apiContractOutput`): [`ContractOutput`](../interfaces/ContractOutput.md)

#### Parameters

• **apiContractOutput**: [`ContractOutput`](../../../../node/interfaces/ContractOutput.md)

#### Returns

[`ContractOutput`](../interfaces/ContractOutput.md)

#### Defined in

[src/codec/contract-output-codec.ts:49](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/contract-output-codec.ts#L49)
