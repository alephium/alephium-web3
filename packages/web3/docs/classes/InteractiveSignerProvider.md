[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / InteractiveSignerProvider

# Class: `abstract` InteractiveSignerProvider\<EnableOptions\>

## Extends

- [`SignerProvider`](SignerProvider.md)

## Type Parameters

• **EnableOptions** *extends* [`EnableOptionsBase`](../interfaces/EnableOptionsBase.md) = [`EnableOptionsBase`](../interfaces/EnableOptionsBase.md)

## Constructors

### new InteractiveSignerProvider()

> **new InteractiveSignerProvider**\<`EnableOptions`\>(): [`InteractiveSignerProvider`](InteractiveSignerProvider.md)\<`EnableOptions`\>

#### Returns

[`InteractiveSignerProvider`](InteractiveSignerProvider.md)\<`EnableOptions`\>

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

[src/signer/signer.ts:51](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L51)

***

### nodeProvider

#### Get Signature

> **get** `abstract` **nodeProvider**(): `undefined` \| [`NodeProvider`](NodeProvider.md)

##### Returns

`undefined` \| [`NodeProvider`](NodeProvider.md)

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`nodeProvider`](SignerProvider.md#nodeprovider)

#### Defined in

[src/signer/signer.ts:50](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L50)

## Methods

### disconnect()

> `abstract` **disconnect**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/signer/signer.ts:91](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L91)

***

### enable()

> **enable**(`opt`?): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Parameters

• **opt?**: `EnableOptions`

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Defined in

[src/signer/signer.ts:85](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L85)

***

### getSelectedAccount()

> **getSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`getSelectedAccount`](SignerProvider.md#getselectedaccount)

#### Defined in

[src/signer/signer.ts:54](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L54)

***

### signAndSubmitChainedTx()

> `abstract` **signAndSubmitChainedTx**(`params`): `Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`signAndSubmitChainedTx`](SignerProvider.md#signandsubmitchainedtx)

#### Defined in

[src/signer/signer.ts:72](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L72)

***

### signAndSubmitDeployContractTx()

> `abstract` **signAndSubmitDeployContractTx**(`params`): `Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`signAndSubmitDeployContractTx`](SignerProvider.md#signandsubmitdeploycontracttx)

#### Defined in

[src/signer/signer.ts:69](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L69)

***

### signAndSubmitExecuteScriptTx()

> `abstract` **signAndSubmitExecuteScriptTx**(`params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`signAndSubmitExecuteScriptTx`](SignerProvider.md#signandsubmitexecutescripttx)

#### Defined in

[src/signer/signer.ts:70](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L70)

***

### signAndSubmitTransferTx()

> `abstract` **signAndSubmitTransferTx**(`params`): `Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`signAndSubmitTransferTx`](SignerProvider.md#signandsubmittransfertx)

#### Defined in

[src/signer/signer.ts:68](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L68)

***

### signAndSubmitUnsignedTx()

> `abstract` **signAndSubmitUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`signAndSubmitUnsignedTx`](SignerProvider.md#signandsubmitunsignedtx)

#### Defined in

[src/signer/signer.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L71)

***

### signMessage()

> `abstract` **signMessage**(`params`): `Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Parameters

• **params**: [`SignMessageParams`](../interfaces/SignMessageParams.md)

#### Returns

`Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`signMessage`](SignerProvider.md#signmessage)

#### Defined in

[src/signer/signer.ts:77](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L77)

***

### signUnsignedTx()

> `abstract` **signUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`signUnsignedTx`](SignerProvider.md#signunsignedtx)

#### Defined in

[src/signer/signer.ts:74](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L74)

***

### unsafeEnable()

> `abstract` `protected` **unsafeEnable**(`opt`?): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Parameters

• **opt?**: `EnableOptions`

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Defined in

[src/signer/signer.ts:84](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L84)

***

### unsafeGetSelectedAccount()

> `abstract` `protected` **unsafeGetSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Inherited from

[`SignerProvider`](SignerProvider.md).[`unsafeGetSelectedAccount`](SignerProvider.md#unsafegetselectedaccount)

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

[`SignerProvider`](SignerProvider.md).[`validateAccount`](SignerProvider.md#validateaccount)

#### Defined in

[src/signer/signer.ts:60](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L60)
