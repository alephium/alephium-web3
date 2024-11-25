[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / multicallMethods

# Function: multicallMethods()

> **multicallMethods**\<`I`, `F`\>(`contract`, `instance`, `_callss`, `getContractByCodeHash`): `Promise`\<`Record`\<`string`, [`CallContractResult`](../interfaces/CallContractResult.md)\<`any`\>\>[] \| `Record`\<`string`, [`CallContractResult`](../interfaces/CallContractResult.md)\<`any`\>\>\>

## Type Parameters

• **I** *extends* [`ContractInstance`](../classes/ContractInstance.md)\<`I`\>

• **F** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

## Parameters

• **contract**: [`ContractFactory`](../classes/ContractFactory.md)\<`I`, `F`\>

• **instance**: [`ContractInstance`](../classes/ContractInstance.md)

• **\_callss**: `Calls` \| `Calls`[]

• **getContractByCodeHash**

## Returns

`Promise`\<`Record`\<`string`, [`CallContractResult`](../interfaces/CallContractResult.md)\<`any`\>\>[] \| `Record`\<`string`, [`CallContractResult`](../interfaces/CallContractResult.md)\<`any`\>\>\>

## Defined in

[src/contract/contract.ts:2094](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L2094)
