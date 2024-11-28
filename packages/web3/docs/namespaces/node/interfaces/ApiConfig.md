[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [node](../README.md) / ApiConfig

# Interface: ApiConfig\<SecurityDataType\>

## Type Parameters

• **SecurityDataType** = `unknown`

## Properties

### baseApiParams?

> `optional` **baseApiParams**: `Omit`\<[`RequestParams`](../type-aliases/RequestParams.md), `"signal"` \| `"baseUrl"` \| `"cancelToken"`\>

#### Defined in

[src/api/api-alephium.ts:1465](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1465)

***

### baseUrl?

> `optional` **baseUrl**: `string`

#### Defined in

[src/api/api-alephium.ts:1464](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1464)

***

### customFetch()?

> `optional` **customFetch**: (`input`, `init`?) => `Promise`\<`Response`\>

#### Parameters

• **input**: `RequestInfo` \| `URL`

• **init?**: `RequestInit`

#### Returns

`Promise`\<`Response`\>

#### Defined in

[src/api/api-alephium.ts:1467](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1467)

***

### securityWorker()?

> `optional` **securityWorker**: (`securityData`) => `void` \| [`RequestParams`](../type-aliases/RequestParams.md) \| `Promise`\<`void` \| [`RequestParams`](../type-aliases/RequestParams.md)\>

#### Parameters

• **securityData**: `null` \| `SecurityDataType`

#### Returns

`void` \| [`RequestParams`](../type-aliases/RequestParams.md) \| `Promise`\<`void` \| [`RequestParams`](../type-aliases/RequestParams.md)\>

#### Defined in

[src/api/api-alephium.ts:1466](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1466)
