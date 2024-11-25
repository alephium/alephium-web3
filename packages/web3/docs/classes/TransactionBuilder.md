[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / TransactionBuilder

# Class: `abstract` TransactionBuilder

## Constructors

### new TransactionBuilder()

> **new TransactionBuilder**(): [`TransactionBuilder`](TransactionBuilder.md)

#### Returns

[`TransactionBuilder`](TransactionBuilder.md)

## Accessors

### nodeProvider

#### Get Signature

> **get** `abstract` **nodeProvider**(): [`NodeProvider`](NodeProvider.md)

##### Returns

[`NodeProvider`](NodeProvider.md)

#### Defined in

[src/signer/tx-builder.ts:45](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/tx-builder.ts#L45)

## Methods

### buildChainedTx()

> **buildChainedTx**(`params`, `publicKeys`): `Promise`\<`Omit`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md), `"signature"`\>[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

• **publicKeys**: `string`[]

#### Returns

`Promise`\<`Omit`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md), `"signature"`\>[]\>

#### Defined in

[src/signer/tx-builder.ts:93](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/tx-builder.ts#L93)

***

### buildDeployContractTx()

> **buildDeployContractTx**(`params`, `publicKey`): `Promise`\<`Omit`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

• **publicKey**: `string`

#### Returns

`Promise`\<`Omit`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md), `"signature"`\>\>

#### Defined in

[src/signer/tx-builder.ts:75](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/tx-builder.ts#L75)

***

### buildExecuteScriptTx()

> **buildExecuteScriptTx**(`params`, `publicKey`): `Promise`\<`Omit`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

• **publicKey**: `string`

#### Returns

`Promise`\<`Omit`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md), `"signature"`\>\>

#### Defined in

[src/signer/tx-builder.ts:84](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/tx-builder.ts#L84)

***

### buildTransferTx()

> **buildTransferTx**(`params`, `publicKey`): `Promise`\<`Omit`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

• **publicKey**: `string`

#### Returns

`Promise`\<`Omit`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md), `"signature"`\>\>

#### Defined in

[src/signer/tx-builder.ts:66](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/tx-builder.ts#L66)

***

### buildUnsignedTx()

> `static` **buildUnsignedTx**(`params`): `Omit`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md), `"signature"`\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Omit`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md), `"signature"`\>

#### Defined in

[src/signer/tx-builder.ts:157](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/tx-builder.ts#L157)

***

### from()

#### from(nodeProvider)

> `static` **from**(`nodeProvider`): [`TransactionBuilder`](TransactionBuilder.md)

##### Parameters

• **nodeProvider**: [`NodeProvider`](NodeProvider.md)

##### Returns

[`TransactionBuilder`](TransactionBuilder.md)

##### Defined in

[src/signer/tx-builder.ts:47](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/tx-builder.ts#L47)

#### from(baseUrl, apiKey, customFetch)

> `static` **from**(`baseUrl`, `apiKey`?, `customFetch`?): [`TransactionBuilder`](TransactionBuilder.md)

##### Parameters

• **baseUrl**: `string`

• **apiKey?**: `string`

• **customFetch?**

##### Returns

[`TransactionBuilder`](TransactionBuilder.md)

##### Defined in

[src/signer/tx-builder.ts:48](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/tx-builder.ts#L48)
