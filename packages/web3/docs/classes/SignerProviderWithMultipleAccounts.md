[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / SignerProviderWithMultipleAccounts

# Class: `abstract` SignerProviderWithMultipleAccounts

## Extends

- [`SignerProviderSimple`](SignerProviderSimple.md)

## Extended by

- [`SignerProviderWithCachedAccounts`](SignerProviderWithCachedAccounts.md)

## Constructors

### new SignerProviderWithMultipleAccounts()

> **new SignerProviderWithMultipleAccounts**(): [`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md)

#### Returns

[`SignerProviderWithMultipleAccounts`](SignerProviderWithMultipleAccounts.md)

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`constructor`](SignerProviderSimple.md#constructors)

## Accessors

### explorerProvider

#### Get Signature

> **get** `abstract` **explorerProvider**(): `undefined` \| [`ExplorerProvider`](ExplorerProvider.md)

##### Returns

`undefined` \| [`ExplorerProvider`](ExplorerProvider.md)

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`explorerProvider`](SignerProviderSimple.md#explorerprovider)

#### Defined in

[src/signer/signer.ts:51](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L51)

***

### nodeProvider

#### Get Signature

> **get** `abstract` **nodeProvider**(): [`NodeProvider`](NodeProvider.md)

##### Returns

[`NodeProvider`](NodeProvider.md)

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`nodeProvider`](SignerProviderSimple.md#nodeprovider)

#### Defined in

[src/signer/signer.ts:95](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L95)

## Methods

### buildChainedTx()

> **buildChainedTx**(`params`): `Promise`\<`Omit`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md), `"signature"`\>[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<`Omit`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md), `"signature"`\>[]\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`buildChainedTx`](SignerProviderSimple.md#buildchainedtx)

#### Defined in

[src/signer/signer.ts:179](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L179)

***

### buildDeployContractTx()

> **buildDeployContractTx**(`params`): `Promise`\<`Omit`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md), `"signature"`\>\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`buildDeployContractTx`](SignerProviderSimple.md#builddeploycontracttx)

#### Defined in

[src/signer/signer.ts:151](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L151)

***

### buildExecuteScriptTx()

> **buildExecuteScriptTx**(`params`): `Promise`\<`Omit`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md), `"signature"`\>\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`buildExecuteScriptTx`](SignerProviderSimple.md#buildexecutescripttx)

#### Defined in

[src/signer/signer.ts:166](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L166)

***

### buildTransferTx()

> **buildTransferTx**(`params`): `Promise`\<`Omit`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md), `"signature"`\>\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<`Omit`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md), `"signature"`\>\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`buildTransferTx`](SignerProviderSimple.md#buildtransfertx)

#### Defined in

[src/signer/signer.ts:138](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L138)

***

### getAccount()

> **getAccount**(`signerAddress`): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Parameters

• **signerAddress**: `string`

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Defined in

[src/signer/signer.ts:208](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L208)

***

### getAccounts()

> `abstract` **getAccounts**(): `Promise`\<[`Account`](../interfaces/Account.md)[]\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)[]\>

#### Defined in

[src/signer/signer.ts:206](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L206)

***

### getPublicKey()

> **getPublicKey**(`signerAddress`): `Promise`\<`string`\>

#### Parameters

• **signerAddress**: `string`

#### Returns

`Promise`\<`string`\>

#### Overrides

[`SignerProviderSimple`](SignerProviderSimple.md).[`getPublicKey`](SignerProviderSimple.md#getpublickey)

#### Defined in

[src/signer/signer.ts:218](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L218)

***

### getSelectedAccount()

> **getSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`getSelectedAccount`](SignerProviderSimple.md#getselectedaccount)

#### Defined in

[src/signer/signer.ts:54](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L54)

***

### setSelectedAccount()

> `abstract` **setSelectedAccount**(`address`): `Promise`\<`void`\>

#### Parameters

• **address**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/signer/signer.ts:204](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L204)

***

### signAndSubmitChainedTx()

> **signAndSubmitChainedTx**(`params`): `Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signAndSubmitChainedTx`](SignerProviderSimple.md#signandsubmitchainedtx)

#### Defined in

[src/signer/signer.ts:122](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L122)

***

### signAndSubmitDeployContractTx()

> **signAndSubmitDeployContractTx**(`params`): `Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signAndSubmitDeployContractTx`](SignerProviderSimple.md#signandsubmitdeploycontracttx)

#### Defined in

[src/signer/signer.ts:107](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L107)

***

### signAndSubmitExecuteScriptTx()

> **signAndSubmitExecuteScriptTx**(`params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signAndSubmitExecuteScriptTx`](SignerProviderSimple.md#signandsubmitexecutescripttx)

#### Defined in

[src/signer/signer.ts:112](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L112)

***

### signAndSubmitTransferTx()

> **signAndSubmitTransferTx**(`params`): `Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signAndSubmitTransferTx`](SignerProviderSimple.md#signandsubmittransfertx)

#### Defined in

[src/signer/signer.ts:102](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L102)

***

### signAndSubmitUnsignedTx()

> **signAndSubmitUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signAndSubmitUnsignedTx`](SignerProviderSimple.md#signandsubmitunsignedtx)

#### Defined in

[src/signer/signer.ts:117](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L117)

***

### signChainedTx()

> **signChainedTx**(`params`): `Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signChainedTx`](SignerProviderSimple.md#signchainedtx)

#### Defined in

[src/signer/signer.ts:173](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L173)

***

### signDeployContractTx()

> **signDeployContractTx**(`params`): `Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signDeployContractTx`](SignerProviderSimple.md#signdeploycontracttx)

#### Defined in

[src/signer/signer.ts:145](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L145)

***

### signExecuteScriptTx()

> **signExecuteScriptTx**(`params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signExecuteScriptTx`](SignerProviderSimple.md#signexecutescripttx)

#### Defined in

[src/signer/signer.ts:160](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L160)

***

### signMessage()

> **signMessage**(`params`): `Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Parameters

• **params**: [`SignMessageParams`](../interfaces/SignMessageParams.md)

#### Returns

`Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signMessage`](SignerProviderSimple.md#signmessage)

#### Defined in

[src/signer/signer.ts:194](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L194)

***

### signRaw()

> `abstract` **signRaw**(`signerAddress`, `hexString`): `Promise`\<`string`\>

#### Parameters

• **signerAddress**: `string`

• **hexString**: `string`

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signRaw`](SignerProviderSimple.md#signraw)

#### Defined in

[src/signer/signer.ts:200](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L200)

***

### signTransferTx()

> **signTransferTx**(`params`): `Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signTransferTx`](SignerProviderSimple.md#signtransfertx)

#### Defined in

[src/signer/signer.ts:132](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L132)

***

### signUnsignedTx()

> **signUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`signUnsignedTx`](SignerProviderSimple.md#signunsignedtx)

#### Defined in

[src/signer/signer.ts:188](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L188)

***

### submitTransaction()

> **submitTransaction**(`params`): `Promise`\<[`SubmissionResult`](../interfaces/SubmissionResult.md)\>

#### Parameters

• **params**: [`SubmitTransactionParams`](../interfaces/SubmitTransactionParams.md)

#### Returns

`Promise`\<[`SubmissionResult`](../interfaces/SubmissionResult.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`submitTransaction`](SignerProviderSimple.md#submittransaction)

#### Defined in

[src/signer/signer.ts:97](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L97)

***

### unsafeGetSelectedAccount()

> `abstract` `protected` **unsafeGetSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`unsafeGetSelectedAccount`](SignerProviderSimple.md#unsafegetselectedaccount)

#### Defined in

[src/signer/signer.ts:53](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L53)

***

### validateAccount()

> `static` **validateAccount**(`account`): `void`

#### Parameters

• **account**: [`Account`](../interfaces/Account.md)

#### Returns

`void`

#### Inherited from

[`SignerProviderSimple`](SignerProviderSimple.md).[`validateAccount`](SignerProviderSimple.md#validateaccount)

#### Defined in

[src/signer/signer.ts:60](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L60)
