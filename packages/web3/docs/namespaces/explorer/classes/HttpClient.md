[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [explorer](../README.md) / HttpClient

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

[src/api/api-explorer.ts:689](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L689)

## Properties

### baseUrl

> **baseUrl**: `string` = `''`

#### Defined in

[src/api/api-explorer.ts:676](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L676)

## Methods

### abortRequest()

> **abortRequest**(`cancelToken`): `void`

#### Parameters

• **cancelToken**: `CancelToken`

#### Returns

`void`

#### Defined in

[src/api/api-explorer.ts:771](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L771)

***

### addArrayQueryParam()

> `protected` **addArrayQueryParam**(`query`, `key`): `any`

#### Parameters

• **query**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

• **key**: `string`

#### Returns

`any`

#### Defined in

[src/api/api-explorer.ts:706](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L706)

***

### addQueryParam()

> `protected` **addQueryParam**(`query`, `key`): `string`

#### Parameters

• **query**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

• **key**: `string`

#### Returns

`string`

#### Defined in

[src/api/api-explorer.ts:702](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L702)

***

### addQueryParams()

> `protected` **addQueryParams**(`rawQuery`?): `string`

#### Parameters

• **rawQuery?**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

#### Returns

`string`

#### Defined in

[src/api/api-explorer.ts:719](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L719)

***

### createAbortSignal()

> `protected` **createAbortSignal**(`cancelToken`): `undefined` \| `AbortSignal`

#### Parameters

• **cancelToken**: `CancelToken`

#### Returns

`undefined` \| `AbortSignal`

#### Defined in

[src/api/api-explorer.ts:757](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L757)

***

### encodeQueryParam()

> `protected` **encodeQueryParam**(`key`, `value`): `string`

#### Parameters

• **key**: `string`

• **value**: `any`

#### Returns

`string`

#### Defined in

[src/api/api-explorer.ts:697](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L697)

***

### mergeRequestParams()

> `protected` **mergeRequestParams**(`params1`, `params2`?): [`RequestParams`](../type-aliases/RequestParams.md)

#### Parameters

• **params1**: [`RequestParams`](../type-aliases/RequestParams.md)

• **params2?**: [`RequestParams`](../type-aliases/RequestParams.md)

#### Returns

[`RequestParams`](../type-aliases/RequestParams.md)

#### Defined in

[src/api/api-explorer.ts:744](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L744)

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

[src/api/api-explorer.ts:780](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L780)

***

### setSecurityData()

> **setSecurityData**(`data`): `void`

#### Parameters

• **data**: `null` \| `SecurityDataType`

#### Returns

`void`

#### Defined in

[src/api/api-explorer.ts:693](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L693)

***

### toQueryString()

> `protected` **toQueryString**(`rawQuery`?): `string`

#### Parameters

• **rawQuery?**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

#### Returns

`string`

#### Defined in

[src/api/api-explorer.ts:711](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/api-explorer.ts#L711)
