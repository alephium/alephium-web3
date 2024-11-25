[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [codec](../README.md) / TransactionCodec

# Class: TransactionCodec

## Extends

- `ObjectCodec`\<[`Transaction`](../interfaces/Transaction.md)\>

## Constructors

### new TransactionCodec()

> **new TransactionCodec**(`codecs`): [`TransactionCodec`](TransactionCodec.md)

#### Parameters

• **codecs**

• **codecs.contractInputs**: [`Codec`](Codec.md)\<[`ContractOutputRef`](../interfaces/ContractOutputRef.md)[]\>

• **codecs.generatedOutputs**: [`Codec`](Codec.md)\<`Output`[]\>

• **codecs.inputSignatures**: [`Codec`](Codec.md)\<`Uint8Array`[]\>

• **codecs.scriptExecutionOk**: [`Codec`](Codec.md)\<`number`\>

• **codecs.scriptSignatures**: [`Codec`](Codec.md)\<`Uint8Array`[]\>

• **codecs.unsigned**: [`Codec`](Codec.md)\<[`UnsignedTx`](../interfaces/UnsignedTx.md)\>

#### Returns

[`TransactionCodec`](TransactionCodec.md)

#### Inherited from

`ObjectCodec<Transaction>.constructor`

#### Defined in

[src/codec/codec.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L71)

## Methods

### \_decode()

> **\_decode**(`input`): [`Transaction`](../interfaces/Transaction.md)

#### Parameters

• **input**: `Reader`

#### Returns

[`Transaction`](../interfaces/Transaction.md)

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

> **decode**(`input`): [`Transaction`](../interfaces/Transaction.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`Transaction`](../interfaces/Transaction.md)

#### Inherited from

`ObjectCodec.decode`

#### Defined in

[src/codec/codec.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L24)

***

### decodeApiTransaction()

> **decodeApiTransaction**(`input`): [`Transaction`](../../node/interfaces/Transaction.md)

#### Parameters

• **input**: `Uint8Array`

#### Returns

[`Transaction`](../../node/interfaces/Transaction.md)

#### Defined in

[src/codec/transaction-codec.ts:46](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/transaction-codec.ts#L46)

***

### encode()

> **encode**(`value`): `Uint8Array`

#### Parameters

• **value**: [`Transaction`](../interfaces/Transaction.md)

#### Returns

`Uint8Array`

#### Inherited from

`ObjectCodec.encode`

#### Defined in

[src/codec/codec.ts:76](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/codec.ts#L76)

***

### encodeApiTransaction()

> **encodeApiTransaction**(`input`): `Uint8Array`

#### Parameters

• **input**: [`Transaction`](../../node/interfaces/Transaction.md)

#### Returns

`Uint8Array`

#### Defined in

[src/codec/transaction-codec.ts:41](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/transaction-codec.ts#L41)

***

### fromApiTransaction()

> `static` **fromApiTransaction**(`tx`): [`Transaction`](../interfaces/Transaction.md)

#### Parameters

• **tx**: [`Transaction`](../../node/interfaces/Transaction.md)

#### Returns

[`Transaction`](../interfaces/Transaction.md)

#### Defined in

[src/codec/transaction-codec.ts:76](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/transaction-codec.ts#L76)

***

### toApiTransaction()

> `static` **toApiTransaction**(`transaction`): [`Transaction`](../../node/interfaces/Transaction.md)

#### Parameters

• **transaction**: [`Transaction`](../interfaces/Transaction.md)

#### Returns

[`Transaction`](../../node/interfaces/Transaction.md)

#### Defined in

[src/codec/transaction-codec.ts:51](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/codec/transaction-codec.ts#L51)
