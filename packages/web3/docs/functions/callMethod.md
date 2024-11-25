[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / callMethod

# Function: callMethod()

> **callMethod**\<`I`, `F`, `A`, `R`\>(`contract`, `instance`, `methodName`, `params`, `getContractByCodeHash`): `Promise`\<[`CallContractResult`](../interfaces/CallContractResult.md)\<`R`\>\>

## Type Parameters

• **I** *extends* [`ContractInstance`](../classes/ContractInstance.md)\<`I`\>

• **F** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

• **A** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

• **R**

## Parameters

• **contract**: [`ContractFactory`](../classes/ContractFactory.md)\<`I`, `F`\>

• **instance**: [`ContractInstance`](../classes/ContractInstance.md)

• **methodName**: `string`

• **params**: [`Optional`](../namespaces/utils/type-aliases/Optional.md)\<[`CallContractParams`](../interfaces/CallContractParams.md)\<`A`\>, `"args"`\>

• **getContractByCodeHash**

## Returns

`Promise`\<[`CallContractResult`](../interfaces/CallContractResult.md)\<`R`\>\>

## Defined in

[src/contract/contract.ts:1825](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1825)
