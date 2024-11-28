[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / SignerProvider

# Class: `abstract` SignerProvider

## Extended by

- [`InteractiveSignerProvider`](InteractiveSignerProvider.md)
- [`SignerProviderSimple`](SignerProviderSimple.md)

## Constructors

### new SignerProvider()

> **new SignerProvider**(): [`SignerProvider`](SignerProvider.md)

#### Returns

[`SignerProvider`](SignerProvider.md)

## Accessors

### explorerProvider

#### Get Signature

> **get** `abstract` **explorerProvider**(): `undefined` \| [`ExplorerProvider`](ExplorerProvider.md)

##### Returns

`undefined` \| [`ExplorerProvider`](ExplorerProvider.md)

#### Defined in

[src/signer/signer.ts:51](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L51)

***

### nodeProvider

#### Get Signature

> **get** `abstract` **nodeProvider**(): `undefined` \| [`NodeProvider`](NodeProvider.md)

##### Returns

`undefined` \| [`NodeProvider`](NodeProvider.md)

#### Defined in

[src/signer/signer.ts:50](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L50)

## Methods

### getSelectedAccount()

> **getSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Defined in

[src/signer/signer.ts:54](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L54)

***

### signAndSubmitChainedTx()

> `abstract` **signAndSubmitChainedTx**(`params`): `Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Parameters

• **params**: [`SignChainedTxParams`](../type-aliases/SignChainedTxParams.md)[]

#### Returns

`Promise`\<[`SignChainedTxResult`](../type-aliases/SignChainedTxResult.md)[]\>

#### Defined in

[src/signer/signer.ts:72](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L72)

***

### signAndSubmitDeployContractTx()

> `abstract` **signAndSubmitDeployContractTx**(`params`): `Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Parameters

• **params**: [`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)

#### Returns

`Promise`\<[`SignDeployContractTxResult`](../interfaces/SignDeployContractTxResult.md)\>

#### Defined in

[src/signer/signer.ts:69](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L69)

***

### signAndSubmitExecuteScriptTx()

> `abstract` **signAndSubmitExecuteScriptTx**(`params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Parameters

• **params**: [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

#### Defined in

[src/signer/signer.ts:70](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L70)

***

### signAndSubmitTransferTx()

> `abstract` **signAndSubmitTransferTx**(`params`): `Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Parameters

• **params**: [`SignTransferTxParams`](../interfaces/SignTransferTxParams.md)

#### Returns

`Promise`\<[`SignTransferTxResult`](../interfaces/SignTransferTxResult.md)\>

#### Defined in

[src/signer/signer.ts:68](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L68)

***

### signAndSubmitUnsignedTx()

> `abstract` **signAndSubmitUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Defined in

[src/signer/signer.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L71)

***

### signMessage()

> `abstract` **signMessage**(`params`): `Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Parameters

• **params**: [`SignMessageParams`](../interfaces/SignMessageParams.md)

#### Returns

`Promise`\<[`SignMessageResult`](../interfaces/SignMessageResult.md)\>

#### Defined in

[src/signer/signer.ts:77](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L77)

***

### signUnsignedTx()

> `abstract` **signUnsignedTx**(`params`): `Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Parameters

• **params**: [`SignUnsignedTxParams`](../interfaces/SignUnsignedTxParams.md)

#### Returns

`Promise`\<[`SignUnsignedTxResult`](../interfaces/SignUnsignedTxResult.md)\>

#### Defined in

[src/signer/signer.ts:74](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L74)

***

### unsafeGetSelectedAccount()

> `abstract` `protected` **unsafeGetSelectedAccount**(): `Promise`\<[`Account`](../interfaces/Account.md)\>

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

#### Defined in

[src/signer/signer.ts:53](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L53)

***

### validateAccount()

> `static` **validateAccount**(`account`): `void`

#### Parameters

• **account**: [`Account`](../interfaces/Account.md)

#### Returns

`void`

#### Defined in

[src/signer/signer.ts:60](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/signer/signer.ts#L60)
