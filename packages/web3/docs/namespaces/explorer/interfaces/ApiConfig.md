[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [explorer](../README.md) / ApiConfig

# Interface: ApiConfig\<SecurityDataType\>

## Type Parameters

• **SecurityDataType** = `unknown`

## Properties

### baseApiParams?

> `optional` **baseApiParams**: `Omit`\<[`RequestParams`](../type-aliases/RequestParams.md), `"signal"` \| `"baseUrl"` \| `"cancelToken"`\>

#### Defined in

[src/api/api-explorer.ts:656](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L656)

***

### baseUrl?

> `optional` **baseUrl**: `string`

#### Defined in

[src/api/api-explorer.ts:655](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L655)

***

### customFetch()?

> `optional` **customFetch**: (`input`, `init`?) => `Promise`\<`Response`\>

#### Parameters

• **input**: `RequestInfo` \| `URL`

• **init?**: `RequestInit`

#### Returns

`Promise`\<`Response`\>

#### Defined in

[src/api/api-explorer.ts:658](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L658)

***

### securityWorker()?

> `optional` **securityWorker**: (`securityData`) => `void` \| [`RequestParams`](../type-aliases/RequestParams.md) \| `Promise`\<`void` \| [`RequestParams`](../type-aliases/RequestParams.md)\>

#### Parameters

• **securityData**: `null` \| `SecurityDataType`

#### Returns

`void` \| [`RequestParams`](../type-aliases/RequestParams.md) \| `Promise`\<`void` \| [`RequestParams`](../type-aliases/RequestParams.md)\>

#### Defined in

[src/api/api-explorer.ts:657](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L657)
