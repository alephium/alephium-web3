[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / signExecuteMethod

# Function: signExecuteMethod()

> **signExecuteMethod**\<`I`, `F`, `A`, `R`\>(`contract`, `instance`, `methodName`, `params`): `Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

## Type Parameters

• **I** *extends* [`ContractInstance`](../classes/ContractInstance.md)\<`I`\>

• **F** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

• **A** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

• **R**

## Parameters

• **contract**: [`ContractFactory`](../classes/ContractFactory.md)\<`I`, `F`\>

• **instance**: [`ContractInstance`](../classes/ContractInstance.md)

• **methodName**: `string`

• **params**: [`Optional`](../namespaces/utils/type-aliases/Optional.md)\<[`SignExecuteContractMethodParams`](../interfaces/SignExecuteContractMethodParams.md)\<`A`\>, `"args"`\>

## Returns

`Promise`\<[`SignExecuteScriptTxResult`](../interfaces/SignExecuteScriptTxResult.md)\>

## Defined in

[src/contract/contract.ts:1846](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1846)
