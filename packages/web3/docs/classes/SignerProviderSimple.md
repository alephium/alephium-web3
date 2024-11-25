[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / SignerProviderSimple

# Class: `abstract` SignerProviderSimple

## Extends

- [`SignerProvider`](SignerProvider.md)

## Extended by

- [`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md)

## Constructors

### new SignerProviderSimple()

> **new SignerProviderSimple**(): [`SignerProviderSimple`](SignerProviderSimple.md)

#### Returns

[`SignerProviderSimple`](SignerProviderSimple.md)

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`constructor`](SignerProvider.md#constructors)

## Accessors

### explorerProvider

#### Get Signature

> **get** `abstract` **explorerProvider**(): `undefined` \| [`ExplorerProvider`](ExplorerProvider.md)

##### Returns

`undefined` \| [`ExplorerProvider`](ExplorerProvider.md)

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`explorerProvider`](SignerProvider.md#explorerprovider)

#### Defined in

[src/signer/signer.ts:51](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L51)

***

### nodeProvider

#### Get Signature

> **get** `abstract` **nodeProvider**(): [`NodeProvider`](NodeProvider.md)

##### Returns

[`NodeProvider`](NodeProvider.md)

#### Overrides

[`SignerProvider`](SignerProvider.md).[`nodeProvider`](SignerProvider.md#nodeprovider)

#### Defined in

[src/signer/signer.ts:95](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L95)

## Methods

### buildChainedTx()

> **buildChainedTx**(`params`): `Promise`\<`Omit`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md), `"signature"`\>[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<`Omit`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md), `"signature"`\>[]\>

#### Defined in

[src/signer/signer.ts:179](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L179)

***

### buildDeployContractTx()

> **buildDeployContractTx**(`params`): `Promise`\<`Omit`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md), `"signature"`\>\>

#### Defined in

[src/signer/signer.ts:151](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L151)

***

### buildExecuteScriptTx()

> **buildExecuteScriptTx**(`params`): `Promise`\<`Omit`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md), `"signature"`\>\>

#### Defined in

[src/signer/signer.ts:166](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L166)

***

### buildTransferTx()

> **buildTransferTx**(`params`): `Promise`\<`Omit`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md), `"signature"`\>\>

#### Defined in

[src/signer/signer.ts:138](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L138)

***

### getPublicKey()

> `abstract` `protected` **getPublicKey**(`address`): `Promise`\<`string`\>

#### Parameters

• **address**: `string`

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/signer/signer.ts:130](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L130)

***

### getSelectedAccount()

> **getSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`getSelectedAccount`](SignerProvider.md#getselectedaccount)

#### Defined in

[src/signer/signer.ts:54](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L54)

***

### signAndSubmitChainedTx()

> **signAndSubmitChainedTx**(`params`): `Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Overrides

[`SignerProvider`](SignerProvider.md).[`signAndSubmitChainedTx`](SignerProvider.md#signandsubmitchainedtx)

#### Defined in

[src/signer/signer.ts:122](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L122)

***

### signAndSubmitDeployContractTx()

> **signAndSubmitDeployContractTx**(`params`): `Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Overrides

[`SignerProvider`](SignerProvider.md).[`signAndSubmitDeployContractTx`](SignerProvider.md#signandsubmitdeploycontracttx)

#### Defined in

[src/signer/signer.ts:107](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L107)

***

### signAndSubmitExecuteScriptTx()

> **signAndSubmitExecuteScriptTx**(`params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Overrides

[`SignerProvider`](SignerProvider.md).[`signAndSubmitExecuteScriptTx`](SignerProvider.md#signandsubmitexecutescripttx)

#### Defined in

[src/signer/signer.ts:112](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L112)

***

### signAndSubmitTransferTx()

> **signAndSubmitTransferTx**(`params`): `Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Overrides

[`SignerProvider`](SignerProvider.md).[`signAndSubmitTransferTx`](SignerProvider.md#signandsubmittransfertx)

#### Defined in

[src/signer/signer.ts:102](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L102)

***

### signAndSubmitUnsignedTx()

> **signAndSubmitUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Overrides

[`SignerProvider`](SignerProvider.md).[`signAndSubmitUnsignedTx`](SignerProvider.md#signandsubmitunsignedtx)

#### Defined in

[src/signer/signer.ts:117](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L117)

***

### signChainedTx()

> **signChainedTx**(`params`): `Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Defined in

[src/signer/signer.ts:173](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L173)

***

### signDeployContractTx()

> **signDeployContractTx**(`params`): `Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Defined in

[src/signer/signer.ts:145](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L145)

***

### signExecuteScriptTx()

> **signExecuteScriptTx**(`params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Defined in

[src/signer/signer.ts:160](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L160)

***

### signMessage()

> **signMessage**(`params`): `Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Parameters

• **params**: [`SignMessageParams`](../interfaces/SignMessageParams.md)

#### Returns

`Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Overrides

[`SignerProvider`](SignerProvider.md).[`signMessage`](SignerProvider.md#signmessage)

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

#### Defined in

[src/signer/signer.ts:200](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L200)

***

### signTransferTx()

> **signTransferTx**(`params`): `Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Defined in

[src/signer/signer.ts:132](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L132)

***

### signUnsignedTx()

> **signUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Overrides

[`SignerProvider`](SignerProvider.md).[`signUnsignedTx`](SignerProvider.md#signunsignedtx)

#### Defined in

[src/signer/signer.ts:188](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L188)

***

### submitTransaction()

> **submitTransaction**(`params`): `Promise`\<[`SubmissionResult`](../interfaces/SubmissionResult.md)\>

#### Parameters

• **params**: [`SubmitTransactionParams`](../interfaces/SubmitTransactionParams.md)

#### Returns

`Promise`\<[`SubmissionResult`](../interfaces/SubmissionResult.md)\>

#### Defined in

[src/signer/signer.ts:97](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L97)

***

### unsafeGetSelectedAccount()

> `abstract` `protected` **unsafeGetSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`unsafeGetSelectedAccount`](SignerProvider.md#unsafegetselectedaccount)

#### Defined in

[src/signer/signer.ts:53](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L53)

***

### validateAccount()

> `static` **validateAccount**(`account`): `void`

#### Parameters

• **account**: [`Account`](../interfaces/Account.md)

#### Returns

`void`

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`validateAccount`](SignerProvider.md#validateaccount)

#### Defined in

[src/signer/signer.ts:60](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/signer/signer.ts#L60)
