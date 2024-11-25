[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / ExplorerProvider

# Class: ExplorerProvider

## Constructors

### new ExplorerProvider()

> **new ExplorerProvider**(`baseUrl`, `apiKey`?, `customFetch`?): [`ExplorerProvider`](ExplorerProvider.md)

#### Parameters

• **baseUrl**: `string`

• **apiKey?**: `string`

• **customFetch?**

#### Returns

[`ExplorerProvider`](ExplorerProvider.md)

#### Defined in

[src/api/explorer-provider.ts:46](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L46)

### new ExplorerProvider()

> **new ExplorerProvider**(`provider`): [`ExplorerProvider`](ExplorerProvider.md)

#### Parameters

• **provider**: [`ExplorerProvider`](ExplorerProvider.md)

#### Returns

[`ExplorerProvider`](ExplorerProvider.md)

#### Defined in

[src/api/explorer-provider.ts:47](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L47)

### new ExplorerProvider()

> **new ExplorerProvider**(`handler`): [`ExplorerProvider`](ExplorerProvider.md)

#### Parameters

• **handler**: [`ApiRequestHandler`](../type-aliases/ApiRequestHandler.md)

#### Returns

[`ExplorerProvider`](ExplorerProvider.md)

#### Defined in

[src/api/explorer-provider.ts:48](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L48)

## Properties

### addresses

> `readonly` **addresses**: `object`

#### getAddressesAddress()

> **getAddressesAddress**: (`address`, `params`) => `Promise`\<[`AddressInfo`](../namespaces/explorer/interfaces/AddressInfo.md)\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressInfo`](../namespaces/explorer/interfaces/AddressInfo.md)\>

##### Description

Get address information

##### Tags

Addresses

##### Name

GetAddressesAddress

##### Request

GET:/addresses/{address}

#### getAddressesAddressAmountHistory()

> **getAddressesAddressAmountHistory**: (`address`, `query`, `params`) => `Promise`\<[`AmountHistory`](../namespaces/explorer/interfaces/AmountHistory.md)\>

No description

##### Parameters

• **address**: `string`

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../namespaces/explorer/enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AmountHistory`](../namespaces/explorer/interfaces/AmountHistory.md)\>

##### Tags

Addresses

##### Name

GetAddressesAddressAmountHistory

##### Request

GET:/addresses/{address}/amount-history

#### ~~getAddressesAddressAmountHistoryDeprecated()~~

> **getAddressesAddressAmountHistoryDeprecated**: (`address`, `query`, `params`) => `Promise`\<`string`\>

No description

##### Parameters

• **address**: `string`

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../namespaces/explorer/enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`\>

##### Tags

Addresses

##### Name

GetAddressesAddressAmountHistoryDeprecated

##### Request

GET:/addresses/{address}/amount-history-DEPRECATED

##### Deprecated

#### getAddressesAddressBalance()

> **getAddressesAddressBalance**: (`address`, `params`) => `Promise`\<[`AddressBalance`](../namespaces/explorer/interfaces/AddressBalance.md)\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressBalance`](../namespaces/explorer/interfaces/AddressBalance.md)\>

##### Description

Get address balance

##### Tags

Addresses

##### Name

GetAddressesAddressBalance

##### Request

GET:/addresses/{address}/balance

#### getAddressesAddressExportTransactionsCsv()

> **getAddressesAddressExportTransactionsCsv**: (`address`, `query`, `params`) => `Promise`\<`string`\>

No description

##### Parameters

• **address**: `string`

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`\>

##### Tags

Addresses

##### Name

GetAddressesAddressExportTransactionsCsv

##### Request

GET:/addresses/{address}/export-transactions/csv

#### getAddressesAddressLatestTransaction()

> **getAddressesAddressLatestTransaction**: (`address`, `params`) => `Promise`\<[`TransactionInfo`](../namespaces/explorer/interfaces/TransactionInfo.md)\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TransactionInfo`](../namespaces/explorer/interfaces/TransactionInfo.md)\>

##### Description

Get latest transaction information of a given address

##### Tags

Addresses

##### Name

GetAddressesAddressLatestTransaction

##### Request

GET:/addresses/{address}/latest-transaction

#### getAddressesAddressMempoolTransactions()

> **getAddressesAddressMempoolTransactions**: (`address`, `params`) => `Promise`\<[`MempoolTransaction`](../namespaces/explorer/interfaces/MempoolTransaction.md)[]\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MempoolTransaction`](../namespaces/explorer/interfaces/MempoolTransaction.md)[]\>

##### Description

List mempool transactions of a given address

##### Tags

Addresses

##### Name

GetAddressesAddressMempoolTransactions

##### Request

GET:/addresses/{address}/mempool/transactions

#### getAddressesAddressPublicKey()

> **getAddressesAddressPublicKey**: (`address`, `params`) => `Promise`\<`string`\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`\>

##### Description

Get public key of p2pkh addresses, the address needs to have at least one input.

##### Tags

Addresses

##### Name

GetAddressesAddressPublicKey

##### Request

GET:/addresses/{address}/public-key

#### getAddressesAddressTimerangedTransactions()

> **getAddressesAddressTimerangedTransactions**: (`address`, `query`, `params`) => `Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Parameters

• **address**: `string`

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Description

List transactions of a given address within a time-range

##### Tags

Addresses

##### Name

GetAddressesAddressTimerangedTransactions

##### Request

GET:/addresses/{address}/timeranged-transactions

#### ~~getAddressesAddressTokens()~~

> **getAddressesAddressTokens**: (`address`, `query`?, `params`) => `Promise`\<`string`[]\>

##### Parameters

• **address**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`[]\>

##### Description

List address tokens

##### Tags

Addresses

##### Name

GetAddressesAddressTokens

##### Request

GET:/addresses/{address}/tokens

##### Deprecated

#### getAddressesAddressTokensBalance()

> **getAddressesAddressTokensBalance**: (`address`, `query`?, `params`) => `Promise`\<[`AddressTokenBalance`](../namespaces/explorer/interfaces/AddressTokenBalance.md)[]\>

##### Parameters

• **address**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressTokenBalance`](../namespaces/explorer/interfaces/AddressTokenBalance.md)[]\>

##### Description

Get address tokens with balance

##### Tags

Addresses

##### Name

GetAddressesAddressTokensBalance

##### Request

GET:/addresses/{address}/tokens-balance

#### getAddressesAddressTokensTokenIdBalance()

> **getAddressesAddressTokensTokenIdBalance**: (`address`, `tokenId`, `params`) => `Promise`\<[`AddressTokenBalance`](../namespaces/explorer/interfaces/AddressTokenBalance.md)\>

##### Parameters

• **address**: `string`

• **tokenId**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressTokenBalance`](../namespaces/explorer/interfaces/AddressTokenBalance.md)\>

##### Description

Get address balance of given token

##### Tags

Addresses

##### Name

GetAddressesAddressTokensTokenIdBalance

##### Request

GET:/addresses/{address}/tokens/{token_id}/balance

#### getAddressesAddressTokensTokenIdTransactions()

> **getAddressesAddressTokensTokenIdTransactions**: (`address`, `tokenId`, `query`?, `params`) => `Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Parameters

• **address**: `string`

• **tokenId**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Description

List address tokens

##### Tags

Addresses

##### Name

GetAddressesAddressTokensTokenIdTransactions

##### Request

GET:/addresses/{address}/tokens/{token_id}/transactions

#### getAddressesAddressTotalTransactions()

> **getAddressesAddressTotalTransactions**: (`address`, `params`) => `Promise`\<`number`\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`\>

##### Description

Get total transactions of a given address

##### Tags

Addresses

##### Name

GetAddressesAddressTotalTransactions

##### Request

GET:/addresses/{address}/total-transactions

#### getAddressesAddressTransactions()

> **getAddressesAddressTransactions**: (`address`, `query`?, `params`) => `Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Parameters

• **address**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Description

List transactions of a given address

##### Tags

Addresses

##### Name

GetAddressesAddressTransactions

##### Request

GET:/addresses/{address}/transactions

#### postAddressesTransactions()

> **postAddressesTransactions**: (`query`?, `data`?, `params`) => `Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Parameters

• **query?**

• **query.fromTs?**: `number`

inclusive

**Format**

int64

**Min**

0

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **query.toTs?**: `number`

exclusive

**Format**

int64

**Min**

0

• **data?**: `string`[]

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Description

List transactions for given addresses

##### Tags

Addresses

##### Name

PostAddressesTransactions

##### Request

POST:/addresses/transactions

#### postAddressesUsed()

> **postAddressesUsed**: (`data`?, `params`) => `Promise`\<`boolean`[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`boolean`[]\>

##### Description

Are the addresses used (at least 1 transaction)

##### Tags

Addresses, Addresses

##### Name

PostAddressesUsed

##### Request

POST:/addresses/used

#### Defined in

[src/api/explorer-provider.ts:36](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L36)

***

### blocks

> `readonly` **blocks**: `object`

#### getBlocks()

> **getBlocks**: (`query`?, `params`) => `Promise`\<[`ListBlocks`](../namespaces/explorer/interfaces/ListBlocks.md)\>

##### Parameters

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **query.reverse?**: `boolean`

Reverse pagination

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ListBlocks`](../namespaces/explorer/interfaces/ListBlocks.md)\>

##### Description

List latest blocks

##### Tags

Blocks

##### Name

GetBlocks

##### Request

GET:/blocks

#### getBlocksBlockHash()

> **getBlocksBlockHash**: (`blockHash`, `params`) => `Promise`\<[`BlockEntry`](../namespaces/explorer/interfaces/BlockEntry.md)\>

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockEntry`](../namespaces/explorer/interfaces/BlockEntry.md)\>

##### Description

Get a block with hash

##### Tags

Blocks

##### Name

GetBlocksBlockHash

##### Request

GET:/blocks/{block_hash}

#### getBlocksBlockHashTransactions()

> **getBlocksBlockHashTransactions**: (`blockHash`, `query`?, `params`) => `Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Parameters

• **blockHash**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Description

Get block's transactions

##### Tags

Blocks

##### Name

GetBlocksBlockHashTransactions

##### Request

GET:/blocks/{block_hash}/transactions

#### Defined in

[src/api/explorer-provider.ts:34](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L34)

***

### charts

> `readonly` **charts**: `object`

#### getChartsHashrates()

> **getChartsHashrates**: (`query`, `params`) => `Promise`\<[`Hashrate`](../namespaces/explorer/interfaces/Hashrate.md)[]\>

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../namespaces/explorer/enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Hashrate`](../namespaces/explorer/interfaces/Hashrate.md)[]\>

##### Description

`interval-type` query param: hourly, daily

##### Tags

Charts

##### Name

GetChartsHashrates

##### Summary

Get hashrate chart in H/s

##### Request

GET:/charts/hashrates

#### getChartsTransactionsCount()

> **getChartsTransactionsCount**: (`query`, `params`) => `Promise`\<[`TimedCount`](../namespaces/explorer/interfaces/TimedCount.md)[]\>

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../namespaces/explorer/enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TimedCount`](../namespaces/explorer/interfaces/TimedCount.md)[]\>

##### Description

`interval-type` query param: hourly, daily

##### Tags

Charts

##### Name

GetChartsTransactionsCount

##### Summary

Get transaction count history

##### Request

GET:/charts/transactions-count

#### getChartsTransactionsCountPerChain()

> **getChartsTransactionsCountPerChain**: (`query`, `params`) => `Promise`\<[`PerChainTimedCount`](../namespaces/explorer/interfaces/PerChainTimedCount.md)[]\>

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../namespaces/explorer/enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`PerChainTimedCount`](../namespaces/explorer/interfaces/PerChainTimedCount.md)[]\>

##### Description

`interval-type` query param: hourly, daily

##### Tags

Charts

##### Name

GetChartsTransactionsCountPerChain

##### Summary

Get transaction count history per chain

##### Request

GET:/charts/transactions-count-per-chain

#### Defined in

[src/api/explorer-provider.ts:40](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L40)

***

### contractEvents

> `readonly` **contractEvents**: `object`

#### getContractEventsContractAddressContractAddress()

> **getContractEventsContractAddressContractAddress**: (`contractAddress`, `query`?, `params`) => `Promise`\<[`Event`](../namespaces/explorer/interfaces/Event.md)[]\>

##### Parameters

• **contractAddress**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Event`](../namespaces/explorer/interfaces/Event.md)[]\>

##### Description

Get contract events by contract address

##### Tags

Contract events

##### Name

GetContractEventsContractAddressContractAddress

##### Request

GET:/contract-events/contract-address/{contract_address}

#### getContractEventsContractAddressContractAddressInputAddressInputAddress()

> **getContractEventsContractAddressContractAddressInputAddressInputAddress**: (`contractAddress`, `inputAddress`, `query`?, `params`) => `Promise`\<[`Event`](../namespaces/explorer/interfaces/Event.md)[]\>

##### Parameters

• **contractAddress**: `string`

• **inputAddress**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Event`](../namespaces/explorer/interfaces/Event.md)[]\>

##### Description

Get contract events by contract and input addresses

##### Tags

Contract events

##### Name

GetContractEventsContractAddressContractAddressInputAddressInputAddress

##### Request

GET:/contract-events/contract-address/{contract_address}/input-address/{input_address}

#### getContractEventsTransactionIdTransactionId()

> **getContractEventsTransactionIdTransactionId**: (`transactionId`, `params`) => `Promise`\<[`Event`](../namespaces/explorer/interfaces/Event.md)[]\>

##### Parameters

• **transactionId**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Event`](../namespaces/explorer/interfaces/Event.md)[]\>

##### Description

Get contract events by transaction id

##### Tags

Contract events

##### Name

GetContractEventsTransactionIdTransactionId

##### Request

GET:/contract-events/transaction-id/{transaction_id}

#### Defined in

[src/api/explorer-provider.ts:41](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L41)

***

### contracts

> `readonly` **contracts**: `object`

#### getContractsContractAddressCurrentLiveness()

> **getContractsContractAddressCurrentLiveness**: (`contractAddress`, `params`) => `Promise`\<[`ContractLiveness`](../namespaces/explorer/interfaces/ContractLiveness.md)\>

##### Parameters

• **contractAddress**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractLiveness`](../namespaces/explorer/interfaces/ContractLiveness.md)\>

##### Description

Get contract liveness

##### Tags

Contracts

##### Name

GetContractsContractAddressCurrentLiveness

##### Request

GET:/contracts/{contract_address}/current-liveness

#### getContractsContractAddressParent()

> **getContractsContractAddressParent**: (`contractAddress`, `params`) => `Promise`\<[`ContractParent`](../namespaces/explorer/interfaces/ContractParent.md)\>

##### Parameters

• **contractAddress**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractParent`](../namespaces/explorer/interfaces/ContractParent.md)\>

##### Description

Get contract parent address if exist

##### Tags

Contracts

##### Name

GetContractsContractAddressParent

##### Request

GET:/contracts/{contract_address}/parent

#### getContractsContractAddressSubContracts()

> **getContractsContractAddressSubContracts**: (`contractAddress`, `query`?, `params`) => `Promise`\<[`SubContracts`](../namespaces/explorer/interfaces/SubContracts.md)\>

##### Parameters

• **contractAddress**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SubContracts`](../namespaces/explorer/interfaces/SubContracts.md)\>

##### Description

Get sub contract addresses

##### Tags

Contracts

##### Name

GetContractsContractAddressSubContracts

##### Request

GET:/contracts/{contract_address}/sub-contracts

#### Defined in

[src/api/explorer-provider.ts:42](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L42)

***

### infos

> `readonly` **infos**: `object`

#### getInfos()

> **getInfos**: (`params`) => `Promise`\<[`ExplorerInfo`](../namespaces/explorer/interfaces/ExplorerInfo.md)\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ExplorerInfo`](../namespaces/explorer/interfaces/ExplorerInfo.md)\>

##### Description

Get explorer informations

##### Tags

Infos

##### Name

GetInfos

##### Request

GET:/infos

#### getInfosAverageBlockTimes()

> **getInfosAverageBlockTimes**: (`params`) => `Promise`\<[`PerChainDuration`](../namespaces/explorer/interfaces/PerChainDuration.md)[]\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`PerChainDuration`](../namespaces/explorer/interfaces/PerChainDuration.md)[]\>

##### Description

Get the average block time for each chain

##### Tags

Infos

##### Name

GetInfosAverageBlockTimes

##### Request

GET:/infos/average-block-times

#### getInfosHeights()

> **getInfosHeights**: (`params`) => `Promise`\<[`PerChainHeight`](../namespaces/explorer/interfaces/PerChainHeight.md)[]\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`PerChainHeight`](../namespaces/explorer/interfaces/PerChainHeight.md)[]\>

##### Description

List latest height for each chain

##### Tags

Infos

##### Name

GetInfosHeights

##### Request

GET:/infos/heights

#### getInfosSupply()

> **getInfosSupply**: (`query`?, `params`) => `Promise`\<[`TokenSupply`](../namespaces/explorer/interfaces/TokenSupply.md)[]\>

##### Parameters

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TokenSupply`](../namespaces/explorer/interfaces/TokenSupply.md)[]\>

##### Description

Get token supply list

##### Tags

Infos

##### Name

GetInfosSupply

##### Request

GET:/infos/supply

#### getInfosSupplyCirculatingAlph()

> **getInfosSupplyCirculatingAlph**: (`params`) => `Promise`\<`number`\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`\>

##### Description

Get the ALPH circulating supply

##### Tags

Infos

##### Name

GetInfosSupplyCirculatingAlph

##### Request

GET:/infos/supply/circulating-alph

#### getInfosSupplyLockedAlph()

> **getInfosSupplyLockedAlph**: (`params`) => `Promise`\<`number`\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`\>

##### Description

Get the ALPH locked supply

##### Tags

Infos

##### Name

GetInfosSupplyLockedAlph

##### Request

GET:/infos/supply/locked-alph

#### getInfosSupplyReservedAlph()

> **getInfosSupplyReservedAlph**: (`params`) => `Promise`\<`number`\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`\>

##### Description

Get the ALPH reserved supply

##### Tags

Infos

##### Name

GetInfosSupplyReservedAlph

##### Request

GET:/infos/supply/reserved-alph

#### getInfosSupplyTotalAlph()

> **getInfosSupplyTotalAlph**: (`params`) => `Promise`\<`number`\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`\>

##### Description

Get the ALPH total supply

##### Tags

Infos

##### Name

GetInfosSupplyTotalAlph

##### Request

GET:/infos/supply/total-alph

#### getInfosTotalTransactions()

> **getInfosTotalTransactions**: (`params`) => `Promise`\<`number`\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`\>

##### Description

Get the total number of transactions

##### Tags

Infos

##### Name

GetInfosTotalTransactions

##### Request

GET:/infos/total-transactions

#### Defined in

[src/api/explorer-provider.ts:37](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L37)

***

### market

> `readonly` **market**: `object`

#### getMarketPricesSymbolCharts()

> **getMarketPricesSymbolCharts**: (`symbol`, `query`, `params`) => `Promise`\<[`TimedPrices`](../namespaces/explorer/interfaces/TimedPrices.md)\>

No description

##### Parameters

• **symbol**: `string`

• **query**

• **query.currency**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TimedPrices`](../namespaces/explorer/interfaces/TimedPrices.md)\>

##### Tags

Market

##### Name

GetMarketPricesSymbolCharts

##### Request

GET:/market/prices/{symbol}/charts

#### postMarketPrices()

> **postMarketPrices**: (`query`, `data`?, `params`) => `Promise`\<`number`[]\>

No description

##### Parameters

• **query**

• **query.currency**: `string`

• **data?**: `string`[]

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`[]\>

##### Tags

Market

##### Name

PostMarketPrices

##### Request

POST:/market/prices

#### Defined in

[src/api/explorer-provider.ts:43](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L43)

***

### mempool

> `readonly` **mempool**: `object`

#### getMempoolTransactions()

> **getMempoolTransactions**: (`query`?, `params`) => `Promise`\<[`MempoolTransaction`](../namespaces/explorer/interfaces/MempoolTransaction.md)[]\>

##### Parameters

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MempoolTransaction`](../namespaces/explorer/interfaces/MempoolTransaction.md)[]\>

##### Description

list mempool transactions

##### Tags

Mempool

##### Name

GetMempoolTransactions

##### Request

GET:/mempool/transactions

#### Defined in

[src/api/explorer-provider.ts:38](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L38)

***

### tokens

> `readonly` **tokens**: `object`

#### getTokens()

> **getTokens**: (`query`?, `params`) => `Promise`\<[`TokenInfo`](../namespaces/explorer/interfaces/TokenInfo.md)[]\>

##### Parameters

• **query?**

• **query.interface-id?**: `string`

fungible, non-fungible, non-standard or any interface id in hex-string format, e.g: 0001

**Format**

string

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TokenInfo`](../namespaces/explorer/interfaces/TokenInfo.md)[]\>

##### Description

List token information

##### Tags

Tokens

##### Name

GetTokens

##### Request

GET:/tokens

#### getTokensHoldersAlph()

> **getTokensHoldersAlph**: (`query`?, `params`) => `Promise`\<[`HolderInfo`](../namespaces/explorer/interfaces/HolderInfo.md)[]\>

##### Parameters

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HolderInfo`](../namespaces/explorer/interfaces/HolderInfo.md)[]\>

##### Description

Get a sorted list of top addresses by ALPH balance. Updates once per day.

##### Tags

Tokens

##### Name

GetTokensHoldersAlph

##### Request

GET:/tokens/holders/alph

#### getTokensHoldersTokenTokenId()

> **getTokensHoldersTokenTokenId**: (`tokenId`, `query`?, `params`) => `Promise`\<[`HolderInfo`](../namespaces/explorer/interfaces/HolderInfo.md)[]\>

##### Parameters

• **tokenId**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HolderInfo`](../namespaces/explorer/interfaces/HolderInfo.md)[]\>

##### Description

Get a sorted list of top addresses by {token_id} balance. Updates once per day.

##### Tags

Tokens

##### Name

GetTokensHoldersTokenTokenId

##### Request

GET:/tokens/holders/token/{token_id}

#### getTokensTokenIdAddresses()

> **getTokensTokenIdAddresses**: (`tokenId`, `query`?, `params`) => `Promise`\<`string`[]\>

##### Parameters

• **tokenId**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`[]\>

##### Description

List token addresses

##### Tags

Tokens

##### Name

GetTokensTokenIdAddresses

##### Request

GET:/tokens/{token_id}/addresses

#### getTokensTokenIdTransactions()

> **getTokensTokenIdTransactions**: (`tokenId`, `query`?, `params`) => `Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Parameters

• **tokenId**: `string`

• **query?**

• **query.limit?**: `number`

Number of items per page

**Format**

int32

**Min**

0

**Max**

100

• **query.page?**: `number`

Page number

**Format**

int32

**Min**

1

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../namespaces/explorer/interfaces/Transaction.md)[]\>

##### Description

List token transactions

##### Tags

Tokens

##### Name

GetTokensTokenIdTransactions

##### Request

GET:/tokens/{token_id}/transactions

#### postTokens()

> **postTokens**: (`data`?, `params`) => `Promise`\<[`TokenInfo`](../namespaces/explorer/interfaces/TokenInfo.md)[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TokenInfo`](../namespaces/explorer/interfaces/TokenInfo.md)[]\>

##### Description

List given tokens information

##### Tags

Tokens

##### Name

PostTokens

##### Request

POST:/tokens

#### postTokensFungibleMetadata()

> **postTokensFungibleMetadata**: (`data`?, `params`) => `Promise`\<[`FungibleTokenMetadata`](../namespaces/explorer/interfaces/FungibleTokenMetadata.md)[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`FungibleTokenMetadata`](../namespaces/explorer/interfaces/FungibleTokenMetadata.md)[]\>

##### Description

Return metadata for the given fungible tokens, if metadata doesn't exist or token isn't a fungible, it won't be in the output list

##### Tags

Tokens

##### Name

PostTokensFungibleMetadata

##### Request

POST:/tokens/fungible-metadata

#### postTokensNftCollectionMetadata()

> **postTokensNftCollectionMetadata**: (`data`?, `params`) => `Promise`\<[`NFTCollectionMetadata`](../namespaces/explorer/interfaces/NFTCollectionMetadata.md)[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`NFTCollectionMetadata`](../namespaces/explorer/interfaces/NFTCollectionMetadata.md)[]\>

##### Description

Return metadata for the given nft collection addresses, if metadata doesn't exist or address isn't a nft collection, it won't be in the output list

##### Tags

Tokens

##### Name

PostTokensNftCollectionMetadata

##### Request

POST:/tokens/nft-collection-metadata

#### postTokensNftMetadata()

> **postTokensNftMetadata**: (`data`?, `params`) => `Promise`\<[`NFTMetadata`](../namespaces/explorer/interfaces/NFTMetadata.md)[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`NFTMetadata`](../namespaces/explorer/interfaces/NFTMetadata.md)[]\>

##### Description

Return metadata for the given nft tokens, if metadata doesn't exist or token isn't a nft, it won't be in the output list

##### Tags

Tokens

##### Name

PostTokensNftMetadata

##### Request

POST:/tokens/nft-metadata

#### Defined in

[src/api/explorer-provider.ts:39](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L39)

***

### transactions

> `readonly` **transactions**: `object`

#### getTransactionsTransactionHash()

> **getTransactionsTransactionHash**: (`transactionHash`, `params`) => `Promise`\<[`AcceptedTransaction`](../namespaces/explorer/interfaces/AcceptedTransaction.md) \| [`PendingTransaction`](../namespaces/explorer/interfaces/PendingTransaction.md)\>

##### Parameters

• **transactionHash**: `string`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AcceptedTransaction`](../namespaces/explorer/interfaces/AcceptedTransaction.md) \| [`PendingTransaction`](../namespaces/explorer/interfaces/PendingTransaction.md)\>

##### Description

Get a transaction with hash

##### Tags

Transactions

##### Name

GetTransactionsTransactionHash

##### Request

GET:/transactions/{transaction_hash}

#### Defined in

[src/api/explorer-provider.ts:35](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L35)

***

### utils

> `readonly` **utils**: `object`

#### putUtilsSanityCheck()

> **putUtilsSanityCheck**: (`params`) => `Promise`\<`void`\>

##### Parameters

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Description

Perform a sanity check

##### Tags

Utils

##### Name

PutUtilsSanityCheck

##### Request

PUT:/utils/sanity-check

#### putUtilsUpdateGlobalLoglevel()

> **putUtilsUpdateGlobalLoglevel**: (`data`, `params`) => `Promise`\<`void`\>

##### Parameters

• **data**: `"DEBUG"` \| `"TRACE"` \| `"INFO"` \| `"WARN"` \| `"ERROR"`

• **params**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Description

Update global log level, accepted: TRACE, DEBUG, INFO, WARN, ERROR

##### Tags

Utils

##### Name

PutUtilsUpdateGlobalLoglevel

##### Request

PUT:/utils/update-global-loglevel

#### putUtilsUpdateLogConfig()

> **putUtilsUpdateLogConfig**: (`data`?, `params`) => `Promise`\<`void`\>

##### Parameters

• **data?**: [`LogbackValue`](../namespaces/explorer/interfaces/LogbackValue.md)[]

• **params?**: [`RequestParams`](../namespaces/explorer/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Description

Update logback values

##### Tags

Utils

##### Name

PutUtilsUpdateLogConfig

##### Request

PUT:/utils/update-log-config

#### Defined in

[src/api/explorer-provider.ts:44](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L44)

## Methods

### request()

> **request**(`args`): `Promise`\<`any`\>

#### Parameters

• **args**: [`ApiRequestArguments`](../interfaces/ApiRequestArguments.md)

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/api/explorer-provider.ts:73](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L73)

***

### Proxy()

> `static` **Proxy**(`explorerProvider`): [`ExplorerProvider`](ExplorerProvider.md)

#### Parameters

• **explorerProvider**: [`ExplorerProvider`](ExplorerProvider.md)

#### Returns

[`ExplorerProvider`](ExplorerProvider.md)

#### Defined in

[src/api/explorer-provider.ts:78](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L78)

***

### Remote()

> `static` **Remote**(`handler`): [`ExplorerProvider`](ExplorerProvider.md)

#### Parameters

• **handler**: [`ApiRequestHandler`](../type-aliases/ApiRequestHandler.md)

#### Returns

[`ExplorerProvider`](ExplorerProvider.md)

#### Defined in

[src/api/explorer-provider.ts:82](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/explorer-provider.ts#L82)
