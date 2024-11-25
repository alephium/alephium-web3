[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / SignerProviderWithCachedAccounts

# Class: `abstract` SignerProviderWithCachedAccounts\<T\>

## Extends

- [`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md)

## Type Parameters

• **T** *extends* [`Account`](../interfaces/Account.md)

## Constructors

### new SignerProviderWithCachedAccounts()

> **new SignerProviderWithCachedAccounts**\<`T`\>(): [`SignerProviderWithCachedAccounts`](SignerProviderWithCachedAccounts.md)\<`T`\>

#### Returns

[`SignerProviderWithCachedAccounts`](SignerProviderWithCachedAccounts.md)\<`T`\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`constructor`](SignerProviderWithMultipleAccounts.md#constructors)

## Properties

### \_accounts

> `protected` `readonly` **\_accounts**: `Map`\<`string`, `T`\>

#### Defined in

[src/signer/signer.ts:226](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L226)

## Accessors

### explorerProvider

#### Get Signature

> **get** `abstract` **explorerProvider**(): `undefined` \| [`ExplorerProvider`](ExplorerProvider.md)

##### Returns

`undefined` \| [`ExplorerProvider`](ExplorerProvider.md)

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`explorerProvider`](SignerProviderWithMultipleAccounts.md#explorerprovider)

#### Defined in

[src/signer/signer.ts:51](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L51)

***

### nodeProvider

#### Get Signature

> **get** `abstract` **nodeProvider**(): [`NodeProvider`](NodeProvider.md)

##### Returns

[`NodeProvider`](NodeProvider.md)

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`nodeProvider`](SignerProviderWithMultipleAccounts.md#nodeprovider)

#### Defined in

[src/signer/signer.ts:95](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L95)

## Methods

### buildChainedTx()

> **buildChainedTx**(`params`): `Promise`\<`Omit`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md), `"signature"`\>[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<`Omit`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md), `"signature"`\>[]\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`buildChainedTx`](SignerProviderWithMultipleAccounts.md#buildchainedtx)

#### Defined in

[src/signer/signer.ts:179](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L179)

***

### buildDeployContractTx()

> **buildDeployContractTx**(`params`): `Promise`\<`Omit`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md), `"signature"`\>\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`buildDeployContractTx`](SignerProviderWithMultipleAccounts.md#builddeploycontracttx)

#### Defined in

[src/signer/signer.ts:151](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L151)

***

### buildExecuteScriptTx()

> **buildExecuteScriptTx**(`params`): `Promise`\<`Omit`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md), `"signature"`\>\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`buildExecuteScriptTx`](SignerProviderWithMultipleAccounts.md#buildexecutescripttx)

#### Defined in

[src/signer/signer.ts:166](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L166)

***

### buildTransferTx()

> **buildTransferTx**(`params`): `Promise`\<`Omit`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md), `"signature"`\>\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`buildTransferTx`](SignerProviderWithMultipleAccounts.md#buildtransfertx)

#### Defined in

[src/signer/signer.ts:138](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L138)

***

### getAccount()

> **getAccount**(`address`): `Promise`\<`T`\>

#### Parameters

• **address**: `string`

#### Returns

`Promise`\<`T`\>

#### Overrides

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`getAccount`](SignerProviderWithMultipleAccounts.md#getaccount)

#### Defined in

[src/signer/signer.ts:250](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L250)

***

### getAccounts()

> **getAccounts**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Overrides

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`getAccounts`](SignerProviderWithMultipleAccounts.md#getaccounts)

#### Defined in

[src/signer/signer.ts:246](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L246)

***

### getPublicKey()

> **getPublicKey**(`signerAddress`): `Promise`\<`string`\>

#### Parameters

• **signerAddress**: `string`

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`getPublicKey`](SignerProviderWithMultipleAccounts.md#getpublickey)

#### Defined in

[src/signer/signer.ts:218](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L218)

***

### getSelectedAccount()

> **getSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`getSelectedAccount`](SignerProviderWithMultipleAccounts.md#getselectedaccount)

#### Defined in

[src/signer/signer.ts:54](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L54)

***

### setSelectedAccount()

> **setSelectedAccount**(`address`): `Promise`\<`void`\>

#### Parameters

• **address**: `string`

#### Returns

`Promise`\<`void`\>

#### Overrides

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`setSelectedAccount`](SignerProviderWithMultipleAccounts.md#setselectedaccount)

#### Defined in

[src/signer/signer.ts:236](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L236)

***

### signAndSubmitChainedTx()

> **signAndSubmitChainedTx**(`params`): `Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signAndSubmitChainedTx`](SignerProviderWithMultipleAccounts.md#signandsubmitchainedtx)

#### Defined in

[src/signer/signer.ts:122](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L122)

***

### signAndSubmitDeployContractTx()

> **signAndSubmitDeployContractTx**(`params`): `Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signAndSubmitDeployContractTx`](SignerProviderWithMultipleAccounts.md#signandsubmitdeploycontracttx)

#### Defined in

[src/signer/signer.ts:107](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L107)

***

### signAndSubmitExecuteScriptTx()

> **signAndSubmitExecuteScriptTx**(`params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signAndSubmitExecuteScriptTx`](SignerProviderWithMultipleAccounts.md#signandsubmitexecutescripttx)

#### Defined in

[src/signer/signer.ts:112](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L112)

***

### signAndSubmitTransferTx()

> **signAndSubmitTransferTx**(`params`): `Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signAndSubmitTransferTx`](SignerProviderWithMultipleAccounts.md#signandsubmittransfertx)

#### Defined in

[src/signer/signer.ts:102](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L102)

***

### signAndSubmitUnsignedTx()

> **signAndSubmitUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signAndSubmitUnsignedTx`](SignerProviderWithMultipleAccounts.md#signandsubmitunsignedtx)

#### Defined in

[src/signer/signer.ts:117](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L117)

***

### signChainedTx()

> **signChainedTx**(`params`): `Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signChainedTx`](SignerProviderWithMultipleAccounts.md#signchainedtx)

#### Defined in

[src/signer/signer.ts:173](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L173)

***

### signDeployContractTx()

> **signDeployContractTx**(`params`): `Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signDeployContractTx`](SignerProviderWithMultipleAccounts.md#signdeploycontracttx)

#### Defined in

[src/signer/signer.ts:145](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L145)

***

### signExecuteScriptTx()

> **signExecuteScriptTx**(`params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signExecuteScriptTx`](SignerProviderWithMultipleAccounts.md#signexecutescripttx)

#### Defined in

[src/signer/signer.ts:160](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L160)

***

### signMessage()

> **signMessage**(`params`): `Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Parameters

• **params**: [`SignMessageParams`](../interfaces/SignMessageParams.md)

#### Returns

`Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signMessage`](SignerProviderWithMultipleAccounts.md#signmessage)

#### Defined in

[src/signer/signer.ts:194](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L194)

***

### signRaw()

> `abstract` **signRaw**(`signerAddress`, `hexString`): `Promise`\<`string`\>

#### Parameters

• **signerAddress**: `string`

• **hexString**: `string`

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signRaw`](SignerProviderWithMultipleAccounts.md#signraw)

#### Defined in

[src/signer/signer.ts:200](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L200)

***

### signTransferTx()

> **signTransferTx**(`params`): `Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signTransferTx`](SignerProviderWithMultipleAccounts.md#signtransfertx)

#### Defined in

[src/signer/signer.ts:132](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L132)

***

### signUnsignedTx()

> **signUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`signUnsignedTx`](SignerProviderWithMultipleAccounts.md#signunsignedtx)

#### Defined in

[src/signer/signer.ts:188](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L188)

***

### submitTransaction()

> **submitTransaction**(`params`): `Promise`\<[`SubmissionResult`](../interfaces/SubmissionResult.md)\>

#### Parameters

• **params**: [`SubmitTransactionParams`](../interfaces/SubmitTransactionParams.md)

#### Returns

`Promise`\<[`SubmissionResult`](../interfaces/SubmissionResult.md)\>

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`submitTransaction`](SignerProviderWithMultipleAccounts.md#submittransaction)

#### Defined in

[src/signer/signer.ts:97](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L97)

***

### unsafeGetSelectedAccount()

> `protected` **unsafeGetSelectedAccount**(): `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>

#### Overrides

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`unsafeGetSelectedAccount`](SignerProviderWithMultipleAccounts.md#unsafegetselectedaccount)

#### Defined in

[src/signer/signer.ts:228](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L228)

***

### validateAccount()

> `static` **validateAccount**(`account`): `void`

#### Parameters

• **account**: [`Account`](../interfaces/Account.md)

#### Returns

`void`

#### Inherited from

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md).[`validateAccount`](SignerProviderWithMultipleAccounts.md#validateaccount)

#### Defined in

[src/signer/signer.ts:60](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L60)
