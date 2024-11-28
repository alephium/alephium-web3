[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [explorer](../README.md) / FullRequestParams

# Interface: FullRequestParams

## Extends

- `Omit`\<`RequestInit`, `"body"`\>

## Properties

### baseUrl?

> `optional` **baseUrl**: `string`

base url

#### Defined in

[src/api/api-explorer.ts:647](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L647)

***

### body?

> `optional` **body**: `unknown`

request body

#### Defined in

[src/api/api-explorer.ts:645](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L645)

***

### cancelToken?

> `optional` **cancelToken**: `CancelToken`

request cancellation token

#### Defined in

[src/api/api-explorer.ts:649](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L649)

***

### format?

> `optional` **format**: `"formData"` \| `"text"` \| `"blob"` \| `"json"` \| `"arrayBuffer"`

format of response (i.e. response.json() -> format: "json")

#### Defined in

[src/api/api-explorer.ts:643](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L643)

***

### path

> **path**: `string`

request path

#### Defined in

[src/api/api-explorer.ts:637](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L637)

***

### query?

> `optional` **query**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

query params

#### Defined in

[src/api/api-explorer.ts:641](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L641)

***

### secure?

> `optional` **secure**: `boolean`

set parameter to `true` for call `securityWorker` for this request

#### Defined in

[src/api/api-explorer.ts:635](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L635)

***

### type?

> `optional` **type**: [`ContentType`](../enumerations/ContentType.md)

content type of request body

#### Defined in

[src/api/api-explorer.ts:639](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L639)
