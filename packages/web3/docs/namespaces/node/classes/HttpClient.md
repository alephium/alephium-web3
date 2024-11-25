[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [node](../README.md) / HttpClient

# Class: HttpClient\<SecurityDataType\>

## Extended by

- [`Api`](Api.md)

## Type Parameters

• **SecurityDataType** = `unknown`

## Constructors

### new HttpClient()

> **new HttpClient**\<`SecurityDataType`\>(`apiConfig`): [`HttpClient`](HttpClient.md)\<`SecurityDataType`\>

#### Parameters

• **apiConfig**: [`ApiConfig`](../interfaces/ApiConfig.md)\<`SecurityDataType`\> = `{}`

#### Returns

[`HttpClient`](HttpClient.md)\<`SecurityDataType`\>

#### Defined in

[src/api/api-alephium.ts:1498](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1498)

## Properties

### baseUrl

> **baseUrl**: `string` = `'../'`

#### Defined in

[src/api/api-alephium.ts:1485](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1485)

## Methods

### abortRequest()

> **abortRequest**(`cancelToken`): `void`

#### Parameters

• **cancelToken**: `CancelToken`

#### Returns

`void`

#### Defined in

[src/api/api-alephium.ts:1580](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1580)

***

### addArrayQueryParam()

> `protected` **addArrayQueryParam**(`query`, `key`): `any`

#### Parameters

• **query**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

• **key**: `string`

#### Returns

`any`

#### Defined in

[src/api/api-alephium.ts:1515](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1515)

***

### addQueryParam()

> `protected` **addQueryParam**(`query`, `key`): `string`

#### Parameters

• **query**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

• **key**: `string`

#### Returns

`string`

#### Defined in

[src/api/api-alephium.ts:1511](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1511)

***

### addQueryParams()

> `protected` **addQueryParams**(`rawQuery`?): `string`

#### Parameters

• **rawQuery?**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

#### Returns

`string`

#### Defined in

[src/api/api-alephium.ts:1528](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1528)

***

### createAbortSignal()

> `protected` **createAbortSignal**(`cancelToken`): `undefined` \| `AbortSignal`

#### Parameters

• **cancelToken**: `CancelToken`

#### Returns

`undefined` \| `AbortSignal`

#### Defined in

[src/api/api-alephium.ts:1566](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1566)

***

### encodeQueryParam()

> `protected` **encodeQueryParam**(`key`, `value`): `string`

#### Parameters

• **key**: `string`

• **value**: `any`

#### Returns

`string`

#### Defined in

[src/api/api-alephium.ts:1506](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1506)

***

### mergeRequestParams()

> `protected` **mergeRequestParams**(`params1`, `params2`?): [`RequestParams`](../type-aliases/RequestParams.md)

#### Parameters

• **params1**: [`RequestParams`](../type-aliases/RequestParams.md)

• **params2?**: [`RequestParams`](../type-aliases/RequestParams.md)

#### Returns

[`RequestParams`](../type-aliases/RequestParams.md)

#### Defined in

[src/api/api-alephium.ts:1553](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1553)

***

### request()

> **request**\<`T`, `E`\>(`__namedParameters`): `Promise`\<[`HttpResponse`](../interfaces/HttpResponse.md)\<`T`, `E`\>\>

#### Type Parameters

• **T** = `any`

• **E** = `any`

#### Parameters

• **\_\_namedParameters**: [`FullRequestParams`](../interfaces/FullRequestParams.md)

#### Returns

`Promise`\<[`HttpResponse`](../interfaces/HttpResponse.md)\<`T`, `E`\>\>

#### Defined in

[src/api/api-alephium.ts:1589](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1589)

***

### setSecurityData()

> **setSecurityData**(`data`): `void`

#### Parameters

• **data**: `null` \| `SecurityDataType`

#### Returns

`void`

#### Defined in

[src/api/api-alephium.ts:1502](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1502)

***

### toQueryString()

> `protected` **toQueryString**(`rawQuery`?): `string`

#### Parameters

• **rawQuery?**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

#### Returns

`string`

#### Defined in

[src/api/api-alephium.ts:1520](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-alephium.ts#L1520)
