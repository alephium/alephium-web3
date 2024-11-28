[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [explorer](../README.md) / Api

# Class: Api\<SecurityDataType\>

## Title

Alephium Explorer API

## Version

1.0

## Extends

- [`HttpClient`](HttpClient.md)\<`SecurityDataType`\>

## Type Parameters

• **SecurityDataType** *extends* `unknown`

## Constructors

### new Api()

> **new Api**\<`SecurityDataType`\>(`apiConfig`): [`Api`](Api.md)\<`SecurityDataType`\>

#### Parameters

• **apiConfig**: [`ApiConfig`](../interfaces/ApiConfig.md)\<`SecurityDataType`\> = `{}`

#### Returns

[`Api`](Api.md)\<`SecurityDataType`\>

#### Inherited from

[`HttpClient`](HttpClient.md).[`constructor`](HttpClient.md#constructors)

#### Defined in

[src/api/api-explorer.ts:689](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L689)

## Properties

### addresses

> **addresses**: `object`

#### getAddressesAddress()

> **getAddressesAddress**: (`address`, `params`) => `Promise`\<[`AddressInfo`](../interfaces/AddressInfo.md)\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressInfo`](../interfaces/AddressInfo.md)\>

##### Description

Get address information

##### Tags

Addresses

##### Name

GetAddressesAddress

##### Request

GET:/addresses/{address}

#### getAddressesAddressAmountHistory()

> **getAddressesAddressAmountHistory**: (`address`, `query`, `params`) => `Promise`\<[`AmountHistory`](../interfaces/AmountHistory.md)\>

No description

##### Parameters

• **address**: `string`

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AmountHistory`](../interfaces/AmountHistory.md)\>

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

• **query.interval-type**: [`IntervalType`](../enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getAddressesAddressBalance**: (`address`, `params`) => `Promise`\<[`AddressBalance`](../interfaces/AddressBalance.md)\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressBalance`](../interfaces/AddressBalance.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`\>

##### Tags

Addresses

##### Name

GetAddressesAddressExportTransactionsCsv

##### Request

GET:/addresses/{address}/export-transactions/csv

#### getAddressesAddressLatestTransaction()

> **getAddressesAddressLatestTransaction**: (`address`, `params`) => `Promise`\<[`TransactionInfo`](../interfaces/TransactionInfo.md)\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TransactionInfo`](../interfaces/TransactionInfo.md)\>

##### Description

Get latest transaction information of a given address

##### Tags

Addresses

##### Name

GetAddressesAddressLatestTransaction

##### Request

GET:/addresses/{address}/latest-transaction

#### getAddressesAddressMempoolTransactions()

> **getAddressesAddressMempoolTransactions**: (`address`, `params`) => `Promise`\<[`MempoolTransaction`](../interfaces/MempoolTransaction.md)[]\>

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MempoolTransaction`](../interfaces/MempoolTransaction.md)[]\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getAddressesAddressTimerangedTransactions**: (`address`, `query`, `params`) => `Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getAddressesAddressTokensBalance**: (`address`, `query`?, `params`) => `Promise`\<[`AddressTokenBalance`](../interfaces/AddressTokenBalance.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressTokenBalance`](../interfaces/AddressTokenBalance.md)[]\>

##### Description

Get address tokens with balance

##### Tags

Addresses

##### Name

GetAddressesAddressTokensBalance

##### Request

GET:/addresses/{address}/tokens-balance

#### getAddressesAddressTokensTokenIdBalance()

> **getAddressesAddressTokensTokenIdBalance**: (`address`, `tokenId`, `params`) => `Promise`\<[`AddressTokenBalance`](../interfaces/AddressTokenBalance.md)\>

##### Parameters

• **address**: `string`

• **tokenId**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressTokenBalance`](../interfaces/AddressTokenBalance.md)\>

##### Description

Get address balance of given token

##### Tags

Addresses

##### Name

GetAddressesAddressTokensTokenIdBalance

##### Request

GET:/addresses/{address}/tokens/{token_id}/balance

#### getAddressesAddressTokensTokenIdTransactions()

> **getAddressesAddressTokensTokenIdTransactions**: (`address`, `tokenId`, `query`?, `params`) => `Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getAddressesAddressTransactions**: (`address`, `query`?, `params`) => `Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

##### Description

List transactions of a given address

##### Tags

Addresses

##### Name

GetAddressesAddressTransactions

##### Request

GET:/addresses/{address}/transactions

#### postAddressesTransactions()

> **postAddressesTransactions**: (`query`?, `data`?, `params`) => `Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

[src/api/api-explorer.ts:945](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L945)

***

### baseUrl

> **baseUrl**: `string` = `''`

#### Inherited from

[`HttpClient`](HttpClient.md).[`baseUrl`](HttpClient.md#baseurl)

#### Defined in

[src/api/api-explorer.ts:676](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L676)

***

### blocks

> **blocks**: `object`

#### getBlocks()

> **getBlocks**: (`query`?, `params`) => `Promise`\<[`ListBlocks`](../interfaces/ListBlocks.md)\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ListBlocks`](../interfaces/ListBlocks.md)\>

##### Description

List latest blocks

##### Tags

Blocks

##### Name

GetBlocks

##### Request

GET:/blocks

#### getBlocksBlockHash()

> **getBlocksBlockHash**: (`blockHash`, `params`) => `Promise`\<[`BlockEntry`](../interfaces/BlockEntry.md)\>

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockEntry`](../interfaces/BlockEntry.md)\>

##### Description

Get a block with hash

##### Tags

Blocks

##### Name

GetBlocksBlockHash

##### Request

GET:/blocks/{block_hash}

#### getBlocksBlockHashTransactions()

> **getBlocksBlockHashTransactions**: (`blockHash`, `query`?, `params`) => `Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

##### Description

Get block's transactions

##### Tags

Blocks

##### Name

GetBlocksBlockHashTransactions

##### Request

GET:/blocks/{block_hash}/transactions

#### Defined in

[src/api/api-explorer.ts:844](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L844)

***

### charts

> **charts**: `object`

#### getChartsHashrates()

> **getChartsHashrates**: (`query`, `params`) => `Promise`\<[`Hashrate`](../interfaces/Hashrate.md)[]\>

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Hashrate`](../interfaces/Hashrate.md)[]\>

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

> **getChartsTransactionsCount**: (`query`, `params`) => `Promise`\<[`TimedCount`](../interfaces/TimedCount.md)[]\>

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TimedCount`](../interfaces/TimedCount.md)[]\>

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

> **getChartsTransactionsCountPerChain**: (`query`, `params`) => `Promise`\<[`PerChainTimedCount`](../interfaces/PerChainTimedCount.md)[]\>

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.interval-type**: [`IntervalType`](../enumerations/IntervalType.md)

• **query.toTs**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`PerChainTimedCount`](../interfaces/PerChainTimedCount.md)[]\>

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

[src/api/api-explorer.ts:1844](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L1844)

***

### contractEvents

> **contractEvents**: `object`

#### getContractEventsContractAddressContractAddress()

> **getContractEventsContractAddressContractAddress**: (`contractAddress`, `query`?, `params`) => `Promise`\<[`Event`](../interfaces/Event.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Event`](../interfaces/Event.md)[]\>

##### Description

Get contract events by contract address

##### Tags

Contract events

##### Name

GetContractEventsContractAddressContractAddress

##### Request

GET:/contract-events/contract-address/{contract_address}

#### getContractEventsContractAddressContractAddressInputAddressInputAddress()

> **getContractEventsContractAddressContractAddressInputAddressInputAddress**: (`contractAddress`, `inputAddress`, `query`?, `params`) => `Promise`\<[`Event`](../interfaces/Event.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Event`](../interfaces/Event.md)[]\>

##### Description

Get contract events by contract and input addresses

##### Tags

Contract events

##### Name

GetContractEventsContractAddressContractAddressInputAddressInputAddress

##### Request

GET:/contract-events/contract-address/{contract_address}/input-address/{input_address}

#### getContractEventsTransactionIdTransactionId()

> **getContractEventsTransactionIdTransactionId**: (`transactionId`, `params`) => `Promise`\<[`Event`](../interfaces/Event.md)[]\>

##### Parameters

• **transactionId**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Event`](../interfaces/Event.md)[]\>

##### Description

Get contract events by transaction id

##### Tags

Contract events

##### Name

GetContractEventsTransactionIdTransactionId

##### Request

GET:/contract-events/transaction-id/{transaction_id}

#### Defined in

[src/api/api-explorer.ts:1944](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L1944)

***

### contracts

> **contracts**: `object`

#### getContractsContractAddressCurrentLiveness()

> **getContractsContractAddressCurrentLiveness**: (`contractAddress`, `params`) => `Promise`\<[`ContractLiveness`](../interfaces/ContractLiveness.md)\>

##### Parameters

• **contractAddress**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractLiveness`](../interfaces/ContractLiveness.md)\>

##### Description

Get contract liveness

##### Tags

Contracts

##### Name

GetContractsContractAddressCurrentLiveness

##### Request

GET:/contracts/{contract_address}/current-liveness

#### getContractsContractAddressParent()

> **getContractsContractAddressParent**: (`contractAddress`, `params`) => `Promise`\<[`ContractParent`](../interfaces/ContractParent.md)\>

##### Parameters

• **contractAddress**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractParent`](../interfaces/ContractParent.md)\>

##### Description

Get contract parent address if exist

##### Tags

Contracts

##### Name

GetContractsContractAddressParent

##### Request

GET:/contracts/{contract_address}/parent

#### getContractsContractAddressSubContracts()

> **getContractsContractAddressSubContracts**: (`contractAddress`, `query`?, `params`) => `Promise`\<[`SubContracts`](../interfaces/SubContracts.md)\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SubContracts`](../interfaces/SubContracts.md)\>

##### Description

Get sub contract addresses

##### Tags

Contracts

##### Name

GetContractsContractAddressSubContracts

##### Request

GET:/contracts/{contract_address}/sub-contracts

#### Defined in

[src/api/api-explorer.ts:2029](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L2029)

***

### infos

> **infos**: `object`

#### getInfos()

> **getInfos**: (`params`) => `Promise`\<[`ExplorerInfo`](../interfaces/ExplorerInfo.md)\>

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ExplorerInfo`](../interfaces/ExplorerInfo.md)\>

##### Description

Get explorer informations

##### Tags

Infos

##### Name

GetInfos

##### Request

GET:/infos

#### getInfosAverageBlockTimes()

> **getInfosAverageBlockTimes**: (`params`) => `Promise`\<[`PerChainDuration`](../interfaces/PerChainDuration.md)[]\>

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`PerChainDuration`](../interfaces/PerChainDuration.md)[]\>

##### Description

Get the average block time for each chain

##### Tags

Infos

##### Name

GetInfosAverageBlockTimes

##### Request

GET:/infos/average-block-times

#### getInfosHeights()

> **getInfosHeights**: (`params`) => `Promise`\<[`PerChainHeight`](../interfaces/PerChainHeight.md)[]\>

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`PerChainHeight`](../interfaces/PerChainHeight.md)[]\>

##### Description

List latest height for each chain

##### Tags

Infos

##### Name

GetInfosHeights

##### Request

GET:/infos/heights

#### getInfosSupply()

> **getInfosSupply**: (`query`?, `params`) => `Promise`\<[`TokenSupply`](../interfaces/TokenSupply.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TokenSupply`](../interfaces/TokenSupply.md)[]\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

[src/api/api-explorer.ts:1403](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L1403)

***

### market

> **market**: `object`

#### getMarketPricesSymbolCharts()

> **getMarketPricesSymbolCharts**: (`symbol`, `query`, `params`) => `Promise`\<[`TimedPrices`](../interfaces/TimedPrices.md)\>

No description

##### Parameters

• **symbol**: `string`

• **query**

• **query.currency**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TimedPrices`](../interfaces/TimedPrices.md)\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`[]\>

##### Tags

Market

##### Name

PostMarketPrices

##### Request

POST:/market/prices

#### Defined in

[src/api/api-explorer.ts:2094](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L2094)

***

### mempool

> **mempool**: `object`

#### getMempoolTransactions()

> **getMempoolTransactions**: (`query`?, `params`) => `Promise`\<[`MempoolTransaction`](../interfaces/MempoolTransaction.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MempoolTransaction`](../interfaces/MempoolTransaction.md)[]\>

##### Description

list mempool transactions

##### Tags

Mempool

##### Name

GetMempoolTransactions

##### Request

GET:/mempool/transactions

#### Defined in

[src/api/api-explorer.ts:1559](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L1559)

***

### tokens

> **tokens**: `object`

#### getTokens()

> **getTokens**: (`query`?, `params`) => `Promise`\<[`TokenInfo`](../interfaces/TokenInfo.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TokenInfo`](../interfaces/TokenInfo.md)[]\>

##### Description

List token information

##### Tags

Tokens

##### Name

GetTokens

##### Request

GET:/tokens

#### getTokensHoldersAlph()

> **getTokensHoldersAlph**: (`query`?, `params`) => `Promise`\<[`HolderInfo`](../interfaces/HolderInfo.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HolderInfo`](../interfaces/HolderInfo.md)[]\>

##### Description

Get a sorted list of top addresses by ALPH balance. Updates once per day.

##### Tags

Tokens

##### Name

GetTokensHoldersAlph

##### Request

GET:/tokens/holders/alph

#### getTokensHoldersTokenTokenId()

> **getTokensHoldersTokenTokenId**: (`tokenId`, `query`?, `params`) => `Promise`\<[`HolderInfo`](../interfaces/HolderInfo.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HolderInfo`](../interfaces/HolderInfo.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getTokensTokenIdTransactions**: (`tokenId`, `query`?, `params`) => `Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../interfaces/Transaction.md)[]\>

##### Description

List token transactions

##### Tags

Tokens

##### Name

GetTokensTokenIdTransactions

##### Request

GET:/tokens/{token_id}/transactions

#### postTokens()

> **postTokens**: (`data`?, `params`) => `Promise`\<[`TokenInfo`](../interfaces/TokenInfo.md)[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TokenInfo`](../interfaces/TokenInfo.md)[]\>

##### Description

List given tokens information

##### Tags

Tokens

##### Name

PostTokens

##### Request

POST:/tokens

#### postTokensFungibleMetadata()

> **postTokensFungibleMetadata**: (`data`?, `params`) => `Promise`\<[`FungibleTokenMetadata`](../interfaces/FungibleTokenMetadata.md)[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`FungibleTokenMetadata`](../interfaces/FungibleTokenMetadata.md)[]\>

##### Description

Return metadata for the given fungible tokens, if metadata doesn't exist or token isn't a fungible, it won't be in the output list

##### Tags

Tokens

##### Name

PostTokensFungibleMetadata

##### Request

POST:/tokens/fungible-metadata

#### postTokensNftCollectionMetadata()

> **postTokensNftCollectionMetadata**: (`data`?, `params`) => `Promise`\<[`NFTCollectionMetadata`](../interfaces/NFTCollectionMetadata.md)[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`NFTCollectionMetadata`](../interfaces/NFTCollectionMetadata.md)[]\>

##### Description

Return metadata for the given nft collection addresses, if metadata doesn't exist or address isn't a nft collection, it won't be in the output list

##### Tags

Tokens

##### Name

PostTokensNftCollectionMetadata

##### Request

POST:/tokens/nft-collection-metadata

#### postTokensNftMetadata()

> **postTokensNftMetadata**: (`data`?, `params`) => `Promise`\<[`NFTMetadata`](../interfaces/NFTMetadata.md)[]\>

##### Parameters

• **data?**: `string`[]

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`NFTMetadata`](../interfaces/NFTMetadata.md)[]\>

##### Description

Return metadata for the given nft tokens, if metadata doesn't exist or token isn't a nft, it won't be in the output list

##### Tags

Tokens

##### Name

PostTokensNftMetadata

##### Request

POST:/tokens/nft-metadata

#### Defined in

[src/api/api-explorer.ts:1596](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L1596)

***

### transactions

> **transactions**: `object`

#### getTransactionsTransactionHash()

> **getTransactionsTransactionHash**: (`transactionHash`, `params`) => `Promise`\<[`AcceptedTransaction`](../interfaces/AcceptedTransaction.md) \| [`PendingTransaction`](../interfaces/PendingTransaction.md)\>

##### Parameters

• **transactionHash**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AcceptedTransaction`](../interfaces/AcceptedTransaction.md) \| [`PendingTransaction`](../interfaces/PendingTransaction.md)\>

##### Description

Get a transaction with hash

##### Tags

Transactions

##### Name

GetTransactionsTransactionHash

##### Request

GET:/transactions/{transaction_hash}

#### Defined in

[src/api/api-explorer.ts:929](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L929)

***

### utils

> **utils**: `object`

#### putUtilsSanityCheck()

> **putUtilsSanityCheck**: (`params`) => `Promise`\<`void`\>

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **data?**: [`LogbackValue`](../interfaces/LogbackValue.md)[]

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

[src/api/api-explorer.ts:2141](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L2141)

## Methods

### abortRequest()

> **abortRequest**(`cancelToken`): `void`

#### Parameters

• **cancelToken**: `CancelToken`

#### Returns

`void`

#### Inherited from

[`HttpClient`](HttpClient.md).[`abortRequest`](HttpClient.md#abortrequest)

#### Defined in

[src/api/api-explorer.ts:771](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L771)

***

### addArrayQueryParam()

> `protected` **addArrayQueryParam**(`query`, `key`): `any`

#### Parameters

• **query**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

• **key**: `string`

#### Returns

`any`

#### Inherited from

[`HttpClient`](HttpClient.md).[`addArrayQueryParam`](HttpClient.md#addarrayqueryparam)

#### Defined in

[src/api/api-explorer.ts:706](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L706)

***

### addQueryParam()

> `protected` **addQueryParam**(`query`, `key`): `string`

#### Parameters

• **query**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

• **key**: `string`

#### Returns

`string`

#### Inherited from

[`HttpClient`](HttpClient.md).[`addQueryParam`](HttpClient.md#addqueryparam)

#### Defined in

[src/api/api-explorer.ts:702](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L702)

***

### addQueryParams()

> `protected` **addQueryParams**(`rawQuery`?): `string`

#### Parameters

• **rawQuery?**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

#### Returns

`string`

#### Inherited from

[`HttpClient`](HttpClient.md).[`addQueryParams`](HttpClient.md#addqueryparams)

#### Defined in

[src/api/api-explorer.ts:719](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L719)

***

### createAbortSignal()

> `protected` **createAbortSignal**(`cancelToken`): `undefined` \| `AbortSignal`

#### Parameters

• **cancelToken**: `CancelToken`

#### Returns

`undefined` \| `AbortSignal`

#### Inherited from

[`HttpClient`](HttpClient.md).[`createAbortSignal`](HttpClient.md#createabortsignal)

#### Defined in

[src/api/api-explorer.ts:757](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L757)

***

### encodeQueryParam()

> `protected` **encodeQueryParam**(`key`, `value`): `string`

#### Parameters

• **key**: `string`

• **value**: `any`

#### Returns

`string`

#### Inherited from

[`HttpClient`](HttpClient.md).[`encodeQueryParam`](HttpClient.md#encodequeryparam)

#### Defined in

[src/api/api-explorer.ts:697](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L697)

***

### mergeRequestParams()

> `protected` **mergeRequestParams**(`params1`, `params2`?): [`RequestParams`](../type-aliases/RequestParams.md)

#### Parameters

• **params1**: [`RequestParams`](../type-aliases/RequestParams.md)

• **params2?**: [`RequestParams`](../type-aliases/RequestParams.md)

#### Returns

[`RequestParams`](../type-aliases/RequestParams.md)

#### Inherited from

[`HttpClient`](HttpClient.md).[`mergeRequestParams`](HttpClient.md#mergerequestparams)

#### Defined in

[src/api/api-explorer.ts:744](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L744)

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

#### Inherited from

[`HttpClient`](HttpClient.md).[`request`](HttpClient.md#request)

#### Defined in

[src/api/api-explorer.ts:780](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L780)

***

### setSecurityData()

> **setSecurityData**(`data`): `void`

#### Parameters

• **data**: `null` \| `SecurityDataType`

#### Returns

`void`

#### Inherited from

[`HttpClient`](HttpClient.md).[`setSecurityData`](HttpClient.md#setsecuritydata)

#### Defined in

[src/api/api-explorer.ts:693](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L693)

***

### toQueryString()

> `protected` **toQueryString**(`rawQuery`?): `string`

#### Parameters

• **rawQuery?**: [`QueryParamsType`](../type-aliases/QueryParamsType.md)

#### Returns

`string`

#### Inherited from

[`HttpClient`](HttpClient.md).[`toQueryString`](HttpClient.md#toquerystring)

#### Defined in

[src/api/api-explorer.ts:711](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-explorer.ts#L711)
