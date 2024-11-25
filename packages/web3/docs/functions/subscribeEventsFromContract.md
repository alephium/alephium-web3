[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / subscribeEventsFromContract

# Function: subscribeEventsFromContract()

> **subscribeEventsFromContract**\<`T`, `M`\>(`options`, `address`, `eventIndex`, `decodeFunc`, `fromCount`?): [`EventSubscription`](../classes/EventSubscription.md)

## Type Parameters

• **T** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

• **M** *extends* [`ContractEvent`](../interfaces/ContractEvent.md)\<`T`, `M`\>

## Parameters

• **options**: [`EventSubscribeOptions`](../interfaces/EventSubscribeOptions.md)\<`M`\>

• **address**: `string`

• **eventIndex**: `number`

• **decodeFunc**

• **fromCount?**: `number`

## Returns

[`EventSubscription`](../classes/EventSubscription.md)

## Defined in

[src/contract/contract.ts:1256](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L1256)
