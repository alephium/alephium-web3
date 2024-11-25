[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / ExecutableScript

# Class: ExecutableScript\<P, R\>

## Type Parameters

• **P** *extends* [`Fields`](../type-aliases/Fields.md) = [`Fields`](../type-aliases/Fields.md)

• **R** *extends* [`Val`](../type-aliases/Val.md) \| `null` = `null`

## Constructors

### new ExecutableScript()

> **new ExecutableScript**\<`P`, `R`\>(`script`, `getContractByCodeHash`): [`ExecutableScript`](ExecutableScript.md)\<`P`, `R`\>

#### Parameters

• **script**: [`Script`](Script.md)

• **getContractByCodeHash**

#### Returns

[`ExecutableScript`](ExecutableScript.md)\<`P`, `R`\>

#### Defined in

[src/contract/contract.ts:1104](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1104)

## Properties

### getContractByCodeHash()

> `readonly` **getContractByCodeHash**: (`codeHash`) => [`Contract`](Contract.md)

#### Parameters

• **codeHash**: `string`

#### Returns

[`Contract`](Contract.md)

#### Defined in

[src/contract/contract.ts:1102](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1102)

***

### script

> `readonly` **script**: [`Script`](Script.md)

#### Defined in

[src/contract/contract.ts:1101](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1101)

## Methods

### call()

> **call**(`params`): `Promise`\<[`CallScriptResult`](../type-aliases/CallScriptResult.md)\<`R`\>\>

#### Parameters

• **params**: [`CallScriptParams`](../interfaces/CallScriptParams.md)\<`P`\>

#### Returns

`Promise`\<[`CallScriptResult`](../type-aliases/CallScriptResult.md)\<`R`\>\>

#### Defined in

[src/contract/contract.ts:1114](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1114)

***

### execute()

> **execute**(`signer`, `params`): `Promise`\<[`ExecuteScriptResult`](../interfaces/ExecuteScriptResult.md)\>

#### Parameters

• **signer**: [`SignerProvider`](SignerProvider.md)

• **params**: [`ExecuteScriptParams`](../interfaces/ExecuteScriptParams.md)\<`P`\>

#### Returns

`Promise`\<[`ExecuteScriptResult`](../interfaces/ExecuteScriptResult.md)\>

#### Defined in

[src/contract/contract.ts:1109](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1109)
