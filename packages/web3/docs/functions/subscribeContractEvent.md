[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / subscribeContractEvent

# Function: subscribeContractEvent()

> **subscribeContractEvent**\<`F`, `M`\>(`contract`, `instance`, `options`, `eventName`, `fromCount`?): [`EventSubscription`](../classes/EventSubscription.md)

## Type Parameters

• **F** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

• **M** *extends* [`ContractEvent`](../interfaces/ContractEvent.md)\<`F`, `M`\>

## Parameters

• **contract**: [`Contract`](../classes/Contract.md)

• **instance**: [`ContractInstance`](../classes/ContractInstance.md)

• **options**: [`EventSubscribeOptions`](../interfaces/EventSubscribeOptions.md)\<`M`\>

• **eventName**: `string`

• **fromCount?**: `number`

## Returns

[`EventSubscription`](../classes/EventSubscription.md)

## Defined in

[src/contract/contract.ts:1784](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1784)
