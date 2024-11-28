[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [node](../README.md) / FullRequestParams

# Interface: FullRequestParams

## Extends

- `Omit`\<`RequestInit`, `"body"`\>

## Properties

### baseUrl?

> `optional` **baseUrl**: `string`

base url

#### Defined in

[src/api/api-alephium.ts:1456](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1456)

***

### body?

> `optional` **body**: `unknown`

request body

#### Defined in

[src/api/api-alephium.ts:1454](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1454)

***

### cancelToken?

> `optional` **cancelToken**: `CancelToken`

request cancellation token

#### Defined in

[src/api/api-alephium.ts:1458](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1458)

***

### format?

> `optional` **format**: `"formData"` \| `"text"` \| `"blob"` \| `"json"` \| `"arrayBuffer"`

format of response (i.e. response.json() -> format: "json")

#### Defined in

[src/api/api-alephium.ts:1452](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1452)

***

### path

> **path**: `string`

request path

#### Defined in

[src/api/api-alephium.ts:1446](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1446)

***

### query?

> `optional` **query**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

query params

#### Defined in

[src/api/api-alephium.ts:1450](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1450)

***

### secure?

> `optional` **secure**: `boolean`

set parameter to `true` for call `securityWorker` for this request

#### Defined in

[src/api/api-alephium.ts:1444](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1444)

***

### type?

> `optional` **type**: [`ContentType`](../enumerations/ContentType.md)

content type of request body

#### Defined in

[src/api/api-alephium.ts:1448](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1448)
