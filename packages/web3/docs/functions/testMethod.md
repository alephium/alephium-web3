[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / testMethod

# Function: testMethod()

> **testMethod**\<`I`, `F`, `A`, `R`, `M`\>(`factory`, `methodName`, `params`, `getContractByCodeHash`): `Promise`\<[`TestContractResult`](../interfaces/TestContractResult.md)\<`R`, `M`\>\>

## Type Parameters

• **I** *extends* [`ContractInstance`](../classes/ContractInstance.md)\<`I`\>

• **F** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

• **A** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

• **R**

• **M** *extends* `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\> = `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>

## Parameters

• **factory**: [`ContractFactory`](../classes/ContractFactory.md)\<`I`, `F`\>

• **methodName**: `string`

• **params**: [`Optional`](../namespaces/utils/type-aliases/Optional.md)\<[`TestContractParams`](../interfaces/TestContractParams.md)\<`F`, `A`, `M`\>, `"initialFields"` \| `"testArgs"`\>

• **getContractByCodeHash**

## Returns

`Promise`\<[`TestContractResult`](../interfaces/TestContractResult.md)\<`R`, `M`\>\>

## Defined in

[src/contract/contract.ts:1461](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1461)
