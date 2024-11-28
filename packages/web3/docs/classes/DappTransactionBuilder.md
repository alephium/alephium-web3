[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / DappTransactionBuilder

# Class: DappTransactionBuilder

## Constructors

### new DappTransactionBuilder()

> **new DappTransactionBuilder**(`callerAddress`): [`DappTransactionBuilder`](DappTransactionBuilder.md)

#### Parameters

• **callerAddress**: `string`

#### Returns

[`DappTransactionBuilder`](DappTransactionBuilder.md)

#### Defined in

[src/contract/dapp-tx-builder.ts:49](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/dapp-tx-builder.ts#L49)

## Properties

### callerAddress

> `readonly` **callerAddress**: `string`

#### Defined in

[src/contract/dapp-tx-builder.ts:49](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/dapp-tx-builder.ts#L49)

## Methods

### callContract()

> **callContract**(`params`): [`DappTransactionBuilder`](DappTransactionBuilder.md)

#### Parameters

• **params**

• **params.args**: [`Val`](../type-aliases/Val.md)[]

• **params.attoAlphAmount?**: `bigint`

• **params.contractAddress**: `string`

• **params.methodIndex**: `number`

• **params.retLength?**: `number`

• **params.tokens?**: `object`[]

#### Returns

[`DappTransactionBuilder`](DappTransactionBuilder.md)

#### Defined in

[src/contract/dapp-tx-builder.ts:62](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/dapp-tx-builder.ts#L62)

***

### getResult()

> **getResult**(): [`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Returns

[`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)

#### Defined in

[src/contract/dapp-tx-builder.ts:90](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/dapp-tx-builder.ts#L90)
