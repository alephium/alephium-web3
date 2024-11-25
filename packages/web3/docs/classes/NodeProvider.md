[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / NodeProvider

# Class: NodeProvider

## Implements

- `NodeProviderApis`

## Constructors

### new NodeProvider()

> **new NodeProvider**(`baseUrl`, `apiKey`?, `customFetch`?): [`NodeProvider`](NodeProvider.md)

#### Parameters

• **baseUrl**: `string`

• **apiKey?**: `string`

• **customFetch?**

#### Returns

[`NodeProvider`](NodeProvider.md)

#### Defined in

[src/api/node-provider.ts:73](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L73)

### new NodeProvider()

> **new NodeProvider**(`provider`): [`NodeProvider`](NodeProvider.md)

#### Parameters

• **provider**: [`NodeProvider`](NodeProvider.md)

#### Returns

[`NodeProvider`](NodeProvider.md)

#### Defined in

[src/api/node-provider.ts:74](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L74)

### new NodeProvider()

> **new NodeProvider**(`handler`): [`NodeProvider`](NodeProvider.md)

#### Parameters

• **handler**: [`ApiRequestHandler`](../type-aliases/ApiRequestHandler.md)

#### Returns

[`NodeProvider`](NodeProvider.md)

#### Defined in

[src/api/node-provider.ts:75](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L75)

## Properties

### addresses

> `readonly` **addresses**: `object`

#### getAddressesAddressBalance()

> **getAddressesAddressBalance**: (`address`, `query`?, `params`) => `Promise`\<[`Balance`](../namespaces/node/interfaces/Balance.md)\>

No description

##### Parameters

• **address**: `string`

• **query?**

• **query.mempool?**: `boolean`

• **params?**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Balance`](../namespaces/node/interfaces/Balance.md)\>

##### Tags

Addresses

##### Name

GetAddressesAddressBalance

##### Summary

Get the balance of an address

##### Request

GET:/addresses/{address}/balance

#### getAddressesAddressGroup()

> **getAddressesAddressGroup**: (`address`, `params`) => `Promise`\<[`Group`](../namespaces/node/interfaces/Group.md)\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Group`](../namespaces/node/interfaces/Group.md)\>

##### Tags

Addresses

##### Name

GetAddressesAddressGroup

##### Summary

Get the group of an address

##### Request

GET:/addresses/{address}/group

#### getAddressesAddressUtxos()

> **getAddressesAddressUtxos**: (`address`, `params`) => `Promise`\<[`UTXOs`](../namespaces/node/interfaces/UTXOs.md)\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`UTXOs`](../namespaces/node/interfaces/UTXOs.md)\>

##### Tags

Addresses

##### Name

GetAddressesAddressUtxos

##### Summary

Get the UTXOs of an address

##### Request

GET:/addresses/{address}/utxos

#### Implementation of

`NodeProviderApis.addresses`

#### Defined in

[src/api/node-provider.ts:64](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L64)

***

### blockflow

> `readonly` **blockflow**: `object`

#### getBlockflowBlocks()

> **getBlockflowBlocks**: (`query`, `params`) => `Promise`\<[`BlocksPerTimeStampRange`](../namespaces/node/interfaces/BlocksPerTimeStampRange.md)\>

No description

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.toTs?**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlocksPerTimeStampRange`](../namespaces/node/interfaces/BlocksPerTimeStampRange.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowBlocks

##### Summary

List blocks on the given time interval

##### Request

GET:/blockflow/blocks

#### getBlockflowBlocksBlockHash()

> **getBlockflowBlocksBlockHash**: (`blockHash`, `params`) => `Promise`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowBlocksBlockHash

##### Summary

Get a block with hash

##### Request

GET:/blockflow/blocks/{block_hash}

#### getBlockflowBlocksWithEvents()

> **getBlockflowBlocksWithEvents**: (`query`, `params`) => `Promise`\<[`BlocksAndEventsPerTimeStampRange`](../namespaces/node/interfaces/BlocksAndEventsPerTimeStampRange.md)\>

No description

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.toTs?**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlocksAndEventsPerTimeStampRange`](../namespaces/node/interfaces/BlocksAndEventsPerTimeStampRange.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowBlocksWithEvents

##### Summary

List blocks with events on the given time interval

##### Request

GET:/blockflow/blocks-with-events

#### getBlockflowBlocksWithEventsBlockHash()

> **getBlockflowBlocksWithEventsBlockHash**: (`blockHash`, `params`) => `Promise`\<[`BlockAndEvents`](../namespaces/node/interfaces/BlockAndEvents.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockAndEvents`](../namespaces/node/interfaces/BlockAndEvents.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowBlocksWithEventsBlockHash

##### Summary

Get a block and events with hash

##### Request

GET:/blockflow/blocks-with-events/{block_hash}

#### getBlockflowChainInfo()

> **getBlockflowChainInfo**: (`query`, `params`) => `Promise`\<[`ChainInfo`](../namespaces/node/interfaces/ChainInfo.md)\>

No description

##### Parameters

• **query**

• **query.fromGroup**: `number`

**Format**

int32

• **query.toGroup**: `number`

**Format**

int32

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ChainInfo`](../namespaces/node/interfaces/ChainInfo.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowChainInfo

##### Summary

Get infos about the chain from the given groups

##### Request

GET:/blockflow/chain-info

#### getBlockflowHashes()

> **getBlockflowHashes**: (`query`, `params`) => `Promise`\<[`HashesAtHeight`](../namespaces/node/interfaces/HashesAtHeight.md)\>

No description

##### Parameters

• **query**

• **query.fromGroup**: `number`

**Format**

int32

• **query.height**: `number`

**Format**

int32

• **query.toGroup**: `number`

**Format**

int32

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HashesAtHeight`](../namespaces/node/interfaces/HashesAtHeight.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowHashes

##### Summary

Get all block's hashes at given height for given groups

##### Request

GET:/blockflow/hashes

#### getBlockflowHeadersBlockHash()

> **getBlockflowHeadersBlockHash**: (`blockHash`, `params`) => `Promise`\<[`BlockHeaderEntry`](../namespaces/node/interfaces/BlockHeaderEntry.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockHeaderEntry`](../namespaces/node/interfaces/BlockHeaderEntry.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowHeadersBlockHash

##### Summary

Get block header

##### Request

GET:/blockflow/headers/{block_hash}

#### getBlockflowIsBlockInMainChain()

> **getBlockflowIsBlockInMainChain**: (`query`, `params`) => `Promise`\<`boolean`\>

No description

##### Parameters

• **query**

• **query.blockHash**: `string`

**Format**

block-hash

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`boolean`\>

##### Tags

Blockflow

##### Name

GetBlockflowIsBlockInMainChain

##### Summary

Check if the block is in main chain

##### Request

GET:/blockflow/is-block-in-main-chain

#### getBlockflowMainChainBlockByGhostUncleGhostUncleHash()

> **getBlockflowMainChainBlockByGhostUncleGhostUncleHash**: (`ghostUncleHash`, `params`) => `Promise`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)\>

No description

##### Parameters

• **ghostUncleHash**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowMainChainBlockByGhostUncleGhostUncleHash

##### Summary

Get a mainchain block by ghost uncle hash

##### Request

GET:/blockflow/main-chain-block-by-ghost-uncle/{ghost_uncle_hash}

#### getBlockflowRawBlocksBlockHash()

> **getBlockflowRawBlocksBlockHash**: (`blockHash`, `params`) => `Promise`\<[`RawBlock`](../namespaces/node/interfaces/RawBlock.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RawBlock`](../namespaces/node/interfaces/RawBlock.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowRawBlocksBlockHash

##### Summary

Get raw block in hex format

##### Request

GET:/blockflow/raw-blocks/{block_hash}

#### getBlockflowRichBlocks()

> **getBlockflowRichBlocks**: (`query`, `params`) => `Promise`\<[`RichBlocksAndEventsPerTimeStampRange`](../namespaces/node/interfaces/RichBlocksAndEventsPerTimeStampRange.md)\>

No description

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.toTs?**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RichBlocksAndEventsPerTimeStampRange`](../namespaces/node/interfaces/RichBlocksAndEventsPerTimeStampRange.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowRichBlocks

##### Summary

Given a time interval, list blocks containing events and transactions with enriched input information when node indexes are enabled.

##### Request

GET:/blockflow/rich-blocks

#### getBlockflowRichBlocksBlockHash()

> **getBlockflowRichBlocksBlockHash**: (`blockHash`, `params`) => `Promise`\<[`RichBlockAndEvents`](../namespaces/node/interfaces/RichBlockAndEvents.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RichBlockAndEvents`](../namespaces/node/interfaces/RichBlockAndEvents.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowRichBlocksBlockHash

##### Summary

Get a block containing events and transactions with enriched input information when node indexes are enabled.

##### Request

GET:/blockflow/rich-blocks/{block_hash}

#### Implementation of

`NodeProviderApis.blockflow`

#### Defined in

[src/api/node-provider.ts:63](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L63)

***

### contracts

> `readonly` **contracts**: `object`

#### getContractsAddressParent()

> **getContractsAddressParent**: (`address`, `params`) => `Promise`\<`string`\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`\>

##### Tags

Contracts

##### Name

GetContractsAddressParent

##### Summary

Get parent contract address

##### Request

GET:/contracts/{address}/parent

#### getContractsAddressState()

> **getContractsAddressState**: (`address`, `params`) => `Promise`\<[`ContractState`](../namespaces/node/interfaces/ContractState.md)\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractState`](../namespaces/node/interfaces/ContractState.md)\>

##### Tags

Contracts

##### Name

GetContractsAddressState

##### Summary

Get contract state

##### Request

GET:/contracts/{address}/state

#### getContractsAddressSubContracts()

> **getContractsAddressSubContracts**: (`address`, `query`, `params`) => `Promise`\<[`SubContracts`](../namespaces/node/interfaces/SubContracts.md)\>

No description

##### Parameters

• **address**: `string`

• **query**

• **query.limit?**: `number`

**Format**

int32

• **query.start**: `number`

**Format**

int32

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SubContracts`](../namespaces/node/interfaces/SubContracts.md)\>

##### Tags

Contracts

##### Name

GetContractsAddressSubContracts

##### Summary

Get sub-contract addresses

##### Request

GET:/contracts/{address}/sub-contracts

#### getContractsAddressSubContractsCurrentCount()

> **getContractsAddressSubContractsCurrentCount**: (`address`, `params`) => `Promise`\<`number`\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`\>

##### Tags

Contracts

##### Name

GetContractsAddressSubContractsCurrentCount

##### Summary

Get current value of the sub-contracts counter for a contract

##### Request

GET:/contracts/{address}/sub-contracts/current-count

#### postContractsCallContract()

> **postContractsCallContract**: (`data`, `params`) => `Promise`\<[`CallContractFailed`](../namespaces/node/interfaces/CallContractFailed.md) \| [`CallContractSucceeded`](../namespaces/node/interfaces/CallContractSucceeded.md)\>

No description

##### Parameters

• **data**: [`CallContract`](../namespaces/node/interfaces/CallContract.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CallContractFailed`](../namespaces/node/interfaces/CallContractFailed.md) \| [`CallContractSucceeded`](../namespaces/node/interfaces/CallContractSucceeded.md)\>

##### Tags

Contracts

##### Name

PostContractsCallContract

##### Summary

Call contract

##### Request

POST:/contracts/call-contract

#### postContractsCallTxScript()

> **postContractsCallTxScript**: (`data`, `params`) => `Promise`\<[`CallTxScriptResult`](../namespaces/node/interfaces/CallTxScriptResult.md)\>

No description

##### Parameters

• **data**: [`CallTxScript`](../namespaces/node/interfaces/CallTxScript.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CallTxScriptResult`](../namespaces/node/interfaces/CallTxScriptResult.md)\>

##### Tags

Contracts

##### Name

PostContractsCallTxScript

##### Summary

Call TxScript

##### Request

POST:/contracts/call-tx-script

#### postContractsCompileContract()

> **postContractsCompileContract**: (`data`, `params`) => `Promise`\<[`CompileContractResult`](../namespaces/node/interfaces/CompileContractResult.md)\>

No description

##### Parameters

• **data**: [`Contract`](../namespaces/node/interfaces/Contract.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CompileContractResult`](../namespaces/node/interfaces/CompileContractResult.md)\>

##### Tags

Contracts

##### Name

PostContractsCompileContract

##### Summary

Compile a smart contract

##### Request

POST:/contracts/compile-contract

#### postContractsCompileProject()

> **postContractsCompileProject**: (`data`, `params`) => `Promise`\<[`CompileProjectResult`](../namespaces/node/interfaces/CompileProjectResult.md)\>

No description

##### Parameters

• **data**: [`Project`](../namespaces/node/interfaces/Project.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CompileProjectResult`](../namespaces/node/interfaces/CompileProjectResult.md)\>

##### Tags

Contracts

##### Name

PostContractsCompileProject

##### Summary

Compile a project

##### Request

POST:/contracts/compile-project

#### postContractsCompileScript()

> **postContractsCompileScript**: (`data`, `params`) => `Promise`\<[`CompileScriptResult`](../namespaces/node/interfaces/CompileScriptResult.md)\>

No description

##### Parameters

• **data**: [`Script`](../namespaces/node/interfaces/Script.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CompileScriptResult`](../namespaces/node/interfaces/CompileScriptResult.md)\>

##### Tags

Contracts

##### Name

PostContractsCompileScript

##### Summary

Compile a script

##### Request

POST:/contracts/compile-script

#### postContractsMulticallContract()

> **postContractsMulticallContract**: (`data`, `params`) => `Promise`\<[`MultipleCallContractResult`](../namespaces/node/interfaces/MultipleCallContractResult.md)\>

No description

##### Parameters

• **data**: [`MultipleCallContract`](../namespaces/node/interfaces/MultipleCallContract.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MultipleCallContractResult`](../namespaces/node/interfaces/MultipleCallContractResult.md)\>

##### Tags

Contracts

##### Name

PostContractsMulticallContract

##### Summary

Multiple call contract

##### Request

POST:/contracts/multicall-contract

#### postContractsTestContract()

> **postContractsTestContract**: (`data`, `params`) => `Promise`\<[`TestContractResult`](../namespaces/node/interfaces/TestContractResult.md)\>

No description

##### Parameters

• **data**: [`TestContract`](../namespaces/node/interfaces/TestContract.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TestContractResult`](../namespaces/node/interfaces/TestContractResult.md)\>

##### Tags

Contracts

##### Name

PostContractsTestContract

##### Summary

Test contract

##### Request

POST:/contracts/test-contract

#### postContractsUnsignedTxDeployContract()

> **postContractsUnsignedTxDeployContract**: (`data`, `params`) => `Promise`\<[`BuildDeployContractTxResult`](../namespaces/node/interfaces/BuildDeployContractTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildDeployContractTx`](../namespaces/node/interfaces/BuildDeployContractTx.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildDeployContractTxResult`](../namespaces/node/interfaces/BuildDeployContractTxResult.md)\>

##### Tags

Contracts

##### Name

PostContractsUnsignedTxDeployContract

##### Summary

Build an unsigned contract

##### Request

POST:/contracts/unsigned-tx/deploy-contract

#### postContractsUnsignedTxExecuteScript()

> **postContractsUnsignedTxExecuteScript**: (`data`, `params`) => `Promise`\<[`BuildExecuteScriptTxResult`](../namespaces/node/interfaces/BuildExecuteScriptTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildExecuteScriptTx`](../namespaces/node/interfaces/BuildExecuteScriptTx.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildExecuteScriptTxResult`](../namespaces/node/interfaces/BuildExecuteScriptTxResult.md)\>

##### Tags

Contracts

##### Name

PostContractsUnsignedTxExecuteScript

##### Summary

Build an unsigned script

##### Request

POST:/contracts/unsigned-tx/execute-script

#### Implementation of

`NodeProviderApis.contracts`

#### Defined in

[src/api/node-provider.ts:67](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L67)

***

### events

> `readonly` **events**: `object`

#### getEventsBlockHashBlockhash()

> **getEventsBlockHashBlockhash**: (`blockHash`, `query`?, `params`) => `Promise`\<[`ContractEventsByBlockHash`](../namespaces/node/interfaces/ContractEventsByBlockHash.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **query?**

• **query.group?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractEventsByBlockHash`](../namespaces/node/interfaces/ContractEventsByBlockHash.md)\>

##### Tags

Events

##### Name

GetEventsBlockHashBlockhash

##### Summary

Get contract events for a block

##### Request

GET:/events/block-hash/{blockHash}

#### getEventsContractContractaddress()

> **getEventsContractContractaddress**: (`contractAddress`, `query`, `params`) => `Promise`\<[`ContractEvents`](../namespaces/node/interfaces/ContractEvents.md)\>

No description

##### Parameters

• **contractAddress**: `string`

• **query**

• **query.group?**: `number`

**Format**

int32

• **query.limit?**: `number`

**Format**

int32

• **query.start**: `number`

**Format**

int32

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractEvents`](../namespaces/node/interfaces/ContractEvents.md)\>

##### Tags

Events

##### Name

GetEventsContractContractaddress

##### Summary

Get events for a contract within a counter range

##### Request

GET:/events/contract/{contractAddress}

#### getEventsContractContractaddressCurrentCount()

> **getEventsContractContractaddressCurrentCount**: (`contractAddress`, `params`) => `Promise`\<`number`\>

No description

##### Parameters

• **contractAddress**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`number`\>

##### Tags

Events

##### Name

GetEventsContractContractaddressCurrentCount

##### Summary

Get current value of the events counter for a contract

##### Request

GET:/events/contract/{contractAddress}/current-count

#### getEventsTxIdTxid()

> **getEventsTxIdTxid**: (`txId`, `query`?, `params`) => `Promise`\<[`ContractEventsByTxId`](../namespaces/node/interfaces/ContractEventsByTxId.md)\>

No description

##### Parameters

• **txId**: `string`

• **query?**

• **query.group?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractEventsByTxId`](../namespaces/node/interfaces/ContractEventsByTxId.md)\>

##### Tags

Events

##### Name

GetEventsTxIdTxid

##### Summary

Get contract events for a transaction

##### Request

GET:/events/tx-id/{txId}

#### Implementation of

`NodeProviderApis.events`

#### Defined in

[src/api/node-provider.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L71)

***

### infos

> `readonly` **infos**: `object`

#### getInfosChainParams()

> **getInfosChainParams**: (`params`) => `Promise`\<[`ChainParams`](../namespaces/node/interfaces/ChainParams.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ChainParams`](../namespaces/node/interfaces/ChainParams.md)\>

##### Tags

Infos

##### Name

GetInfosChainParams

##### Summary

Get key params about your blockchain

##### Request

GET:/infos/chain-params

#### getInfosCurrentDifficulty()

> **getInfosCurrentDifficulty**: (`params`) => `Promise`\<[`CurrentDifficulty`](../namespaces/node/interfaces/CurrentDifficulty.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CurrentDifficulty`](../namespaces/node/interfaces/CurrentDifficulty.md)\>

##### Tags

Infos

##### Name

GetInfosCurrentDifficulty

##### Summary

Get the average difficulty of the latest blocks from all shards

##### Request

GET:/infos/current-difficulty

#### getInfosCurrentHashrate()

> **getInfosCurrentHashrate**: (`query`?, `params`) => `Promise`\<[`HashRateResponse`](../namespaces/node/interfaces/HashRateResponse.md)\>

No description

##### Parameters

• **query?**

• **query.timespan?**: `number`

**Format**

int64

**Min**

1

• **params?**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HashRateResponse`](../namespaces/node/interfaces/HashRateResponse.md)\>

##### Tags

Infos

##### Name

GetInfosCurrentHashrate

##### Summary

Get average hashrate from `now - timespan(millis)` to `now`

##### Request

GET:/infos/current-hashrate

#### getInfosDiscoveredNeighbors()

> **getInfosDiscoveredNeighbors**: (`params`) => `Promise`\<[`BrokerInfo`](../namespaces/node/interfaces/BrokerInfo.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BrokerInfo`](../namespaces/node/interfaces/BrokerInfo.md)[]\>

##### Tags

Infos

##### Name

GetInfosDiscoveredNeighbors

##### Summary

Get discovered neighbors

##### Request

GET:/infos/discovered-neighbors

#### getInfosHistoryHashrate()

> **getInfosHistoryHashrate**: (`query`, `params`) => `Promise`\<[`HashRateResponse`](../namespaces/node/interfaces/HashRateResponse.md)\>

No description

##### Parameters

• **query**

• **query.fromTs**: `number`

**Format**

int64

**Min**

0

• **query.toTs?**: `number`

**Format**

int64

**Min**

0

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HashRateResponse`](../namespaces/node/interfaces/HashRateResponse.md)\>

##### Tags

Infos

##### Name

GetInfosHistoryHashrate

##### Summary

Get history average hashrate on the given time interval

##### Request

GET:/infos/history-hashrate

#### getInfosInterCliquePeerInfo()

> **getInfosInterCliquePeerInfo**: (`params`) => `Promise`\<[`InterCliquePeerInfo`](../namespaces/node/interfaces/InterCliquePeerInfo.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`InterCliquePeerInfo`](../namespaces/node/interfaces/InterCliquePeerInfo.md)[]\>

##### Tags

Infos

##### Name

GetInfosInterCliquePeerInfo

##### Summary

Get infos about the inter cliques

##### Request

GET:/infos/inter-clique-peer-info

#### getInfosMisbehaviors()

> **getInfosMisbehaviors**: (`params`) => `Promise`\<[`PeerMisbehavior`](../namespaces/node/interfaces/PeerMisbehavior.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`PeerMisbehavior`](../namespaces/node/interfaces/PeerMisbehavior.md)[]\>

##### Tags

Infos

##### Name

GetInfosMisbehaviors

##### Summary

Get the misbehaviors of peers

##### Request

GET:/infos/misbehaviors

#### getInfosNode()

> **getInfosNode**: (`params`) => `Promise`\<[`NodeInfo`](../namespaces/node/interfaces/NodeInfo.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`NodeInfo`](../namespaces/node/interfaces/NodeInfo.md)\>

##### Tags

Infos

##### Name

GetInfosNode

##### Summary

Get info about that node

##### Request

GET:/infos/node

#### getInfosSelfClique()

> **getInfosSelfClique**: (`params`) => `Promise`\<[`SelfClique`](../namespaces/node/interfaces/SelfClique.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SelfClique`](../namespaces/node/interfaces/SelfClique.md)\>

##### Tags

Infos

##### Name

GetInfosSelfClique

##### Summary

Get info about your own clique

##### Request

GET:/infos/self-clique

#### getInfosUnreachable()

> **getInfosUnreachable**: (`params`) => `Promise`\<`string`[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`[]\>

##### Tags

Infos

##### Name

GetInfosUnreachable

##### Summary

Get the unreachable brokers

##### Request

GET:/infos/unreachable

#### getInfosVersion()

> **getInfosVersion**: (`params`) => `Promise`\<[`NodeVersion`](../namespaces/node/interfaces/NodeVersion.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`NodeVersion`](../namespaces/node/interfaces/NodeVersion.md)\>

##### Tags

Infos

##### Name

GetInfosVersion

##### Summary

Get version about that node

##### Request

GET:/infos/version

#### postInfosDiscovery()

> **postInfosDiscovery**: (`data`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **data**: [`DiscoveryAction`](../namespaces/node/type-aliases/DiscoveryAction.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Infos

##### Name

PostInfosDiscovery

##### Summary

Set brokers to be unreachable/reachable

##### Request

POST:/infos/discovery

#### postInfosMisbehaviors()

> **postInfosMisbehaviors**: (`data`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **data**: [`MisbehaviorAction`](../namespaces/node/type-aliases/MisbehaviorAction.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Infos

##### Name

PostInfosMisbehaviors

##### Summary

Ban/Unban given peers

##### Request

POST:/infos/misbehaviors

#### Implementation of

`NodeProviderApis.infos`

#### Defined in

[src/api/node-provider.ts:62](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L62)

***

### mempool

> `readonly` **mempool**: `object`

#### deleteMempoolTransactions()

> **deleteMempoolTransactions**: (`params`) => `Promise`\<`void`\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Mempool

##### Name

DeleteMempoolTransactions

##### Summary

Remove all transactions from mempool

##### Request

DELETE:/mempool/transactions

#### getMempoolTransactions()

> **getMempoolTransactions**: (`params`) => `Promise`\<[`MempoolTransactions`](../namespaces/node/interfaces/MempoolTransactions.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MempoolTransactions`](../namespaces/node/interfaces/MempoolTransactions.md)[]\>

##### Tags

Mempool

##### Name

GetMempoolTransactions

##### Summary

List mempool transactions

##### Request

GET:/mempool/transactions

#### putMempoolTransactionsRebroadcast()

> **putMempoolTransactionsRebroadcast**: (`query`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **query**

• **query.txId**: `string`

**Format**

32-byte-hash

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Mempool

##### Name

PutMempoolTransactionsRebroadcast

##### Summary

Rebroadcase a mempool transaction to the network

##### Request

PUT:/mempool/transactions/rebroadcast

#### putMempoolTransactionsValidate()

> **putMempoolTransactionsValidate**: (`params`) => `Promise`\<`void`\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Mempool

##### Name

PutMempoolTransactionsValidate

##### Summary

Validate all mempool transactions and remove invalid ones

##### Request

PUT:/mempool/transactions/validate

#### Implementation of

`NodeProviderApis.mempool`

#### Defined in

[src/api/node-provider.ts:66](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L66)

***

### miners

> `readonly` **miners**: `object`

#### getMinersAddresses()

> **getMinersAddresses**: (`params`) => `Promise`\<[`MinerAddresses`](../namespaces/node/interfaces/MinerAddresses.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MinerAddresses`](../namespaces/node/interfaces/MinerAddresses.md)\>

##### Tags

Miners

##### Name

GetMinersAddresses

##### Summary

List miner's addresses

##### Request

GET:/miners/addresses

#### postMinersCpuMining()

> **postMinersCpuMining**: (`query`, `params`) => `Promise`\<`boolean`\>

No description

##### Parameters

• **query**

• **query.action**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`boolean`\>

##### Tags

Miners

##### Name

PostMinersCpuMining

##### Summary

Execute an action on CPU miner. !!! for test only !!!

##### Request

POST:/miners/cpu-mining

#### postMinersCpuMiningMineOneBlock()

> **postMinersCpuMiningMineOneBlock**: (`query`, `params`) => `Promise`\<`boolean`\>

No description

##### Parameters

• **query**

• **query.fromGroup**: `number`

**Format**

int32

• **query.toGroup**: `number`

**Format**

int32

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`boolean`\>

##### Tags

Miners

##### Name

PostMinersCpuMiningMineOneBlock

##### Summary

Mine a block on CPU miner. !!! for test only !!!

##### Request

POST:/miners/cpu-mining/mine-one-block

#### putMinersAddresses()

> **putMinersAddresses**: (`data`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **data**: [`MinerAddresses`](../namespaces/node/interfaces/MinerAddresses.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Miners

##### Name

PutMinersAddresses

##### Summary

Update miner's addresses, but better to use user.conf instead

##### Request

PUT:/miners/addresses

#### Implementation of

`NodeProviderApis.miners`

#### Defined in

[src/api/node-provider.ts:70](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L70)

***

### multisig

> `readonly` **multisig**: `object`

#### postMultisigAddress()

> **postMultisigAddress**: (`data`, `params`) => `Promise`\<[`BuildMultisigAddressResult`](../namespaces/node/interfaces/BuildMultisigAddressResult.md)\>

No description

##### Parameters

• **data**: [`BuildMultisigAddress`](../namespaces/node/interfaces/BuildMultisigAddress.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildMultisigAddressResult`](../namespaces/node/interfaces/BuildMultisigAddressResult.md)\>

##### Tags

Multi-signature

##### Name

PostMultisigAddress

##### Summary

Create the multisig address and unlock script

##### Request

POST:/multisig/address

#### postMultisigBuild()

> **postMultisigBuild**: (`data`, `params`) => `Promise`\<[`BuildTransferTxResult`](../namespaces/node/interfaces/BuildTransferTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildMultisig`](../namespaces/node/interfaces/BuildMultisig.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildTransferTxResult`](../namespaces/node/interfaces/BuildTransferTxResult.md)\>

##### Tags

Multi-signature

##### Name

PostMultisigBuild

##### Summary

Build a multisig unsigned transaction

##### Request

POST:/multisig/build

#### postMultisigSubmit()

> **postMultisigSubmit**: (`data`, `params`) => `Promise`\<[`SubmitTxResult`](../namespaces/node/interfaces/SubmitTxResult.md)\>

No description

##### Parameters

• **data**: [`SubmitMultisig`](../namespaces/node/interfaces/SubmitMultisig.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SubmitTxResult`](../namespaces/node/interfaces/SubmitTxResult.md)\>

##### Tags

Multi-signature

##### Name

PostMultisigSubmit

##### Summary

Submit a multi-signed transaction

##### Request

POST:/multisig/submit

#### postMultisigSweep()

> **postMultisigSweep**: (`data`, `params`) => `Promise`\<[`BuildSweepAddressTransactionsResult`](../namespaces/node/interfaces/BuildSweepAddressTransactionsResult.md)\>

No description

##### Parameters

• **data**: [`BuildSweepMultisig`](../namespaces/node/interfaces/BuildSweepMultisig.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildSweepAddressTransactionsResult`](../namespaces/node/interfaces/BuildSweepAddressTransactionsResult.md)\>

##### Tags

Multi-signature

##### Name

PostMultisigSweep

##### Summary

Sweep all unlocked ALPH and token balances of a multisig address to another address

##### Request

POST:/multisig/sweep

#### Implementation of

`NodeProviderApis.multisig`

#### Defined in

[src/api/node-provider.ts:68](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L68)

***

### transactions

> `readonly` **transactions**: `object`

#### getTransactionsDetailsTxid()

> **getTransactionsDetailsTxid**: (`txId`, `query`?, `params`) => `Promise`\<[`Transaction`](../namespaces/node/interfaces/Transaction.md)\>

No description

##### Parameters

• **txId**: `string`

• **query?**

• **query.fromGroup?**: `number`

**Format**

int32

• **query.toGroup?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../namespaces/node/interfaces/Transaction.md)\>

##### Tags

Transactions

##### Name

GetTransactionsDetailsTxid

##### Summary

Get transaction details

##### Request

GET:/transactions/details/{txId}

#### getTransactionsRawTxid()

> **getTransactionsRawTxid**: (`txId`, `query`?, `params`) => `Promise`\<[`RawTransaction`](../namespaces/node/interfaces/RawTransaction.md)\>

No description

##### Parameters

• **txId**: `string`

• **query?**

• **query.fromGroup?**: `number`

**Format**

int32

• **query.toGroup?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RawTransaction`](../namespaces/node/interfaces/RawTransaction.md)\>

##### Tags

Transactions

##### Name

GetTransactionsRawTxid

##### Summary

Get raw transaction in hex format

##### Request

GET:/transactions/raw/{txId}

#### getTransactionsRichDetailsTxid()

> **getTransactionsRichDetailsTxid**: (`txId`, `query`?, `params`) => `Promise`\<[`RichTransaction`](../namespaces/node/interfaces/RichTransaction.md)\>

No description

##### Parameters

• **txId**: `string`

• **query?**

• **query.fromGroup?**: `number`

**Format**

int32

• **query.toGroup?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RichTransaction`](../namespaces/node/interfaces/RichTransaction.md)\>

##### Tags

Transactions

##### Name

GetTransactionsRichDetailsTxid

##### Summary

Get transaction with enriched input information when node indexes are enabled.

##### Request

GET:/transactions/rich-details/{txId}

#### getTransactionsStatus()

> **getTransactionsStatus**: (`query`, `params`) => `Promise`\<[`Confirmed`](../namespaces/node/interfaces/Confirmed.md) \| [`MemPooled`](../namespaces/node/interfaces/MemPooled.md) \| [`TxNotFound`](../namespaces/node/interfaces/TxNotFound.md)\>

No description

##### Parameters

• **query**

• **query.fromGroup?**: `number`

**Format**

int32

• **query.toGroup?**: `number`

**Format**

int32

• **query.txId**: `string`

**Format**

32-byte-hash

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Confirmed`](../namespaces/node/interfaces/Confirmed.md) \| [`MemPooled`](../namespaces/node/interfaces/MemPooled.md) \| [`TxNotFound`](../namespaces/node/interfaces/TxNotFound.md)\>

##### Tags

Transactions

##### Name

GetTransactionsStatus

##### Summary

Get tx status

##### Request

GET:/transactions/status

#### getTransactionsTxIdFromOutputref()

> **getTransactionsTxIdFromOutputref**: (`query`, `params`) => `Promise`\<`string`\>

No description

##### Parameters

• **query**

• **query.hint**: `number`

**Format**

int32

• **query.key**: `string`

**Format**

32-byte-hash

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`string`\>

##### Tags

Transactions

##### Name

GetTransactionsTxIdFromOutputref

##### Summary

Get transaction id from transaction output ref

##### Request

GET:/transactions/tx-id-from-outputref

#### postTransactionsBuild()

> **postTransactionsBuild**: (`data`, `params`) => `Promise`\<[`BuildTransferTxResult`](../namespaces/node/interfaces/BuildTransferTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildTransferTx`](../namespaces/node/interfaces/BuildTransferTx.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildTransferTxResult`](../namespaces/node/interfaces/BuildTransferTxResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsBuild

##### Summary

Build an unsigned transfer transaction to a number of recipients

##### Request

POST:/transactions/build

#### postTransactionsBuildChained()

> **postTransactionsBuildChained**: (`data`, `params`) => `Promise`\<[`BuildChainedTxResult`](../namespaces/node/type-aliases/BuildChainedTxResult.md)[]\>

No description

##### Parameters

• **data**: [`BuildChainedTx`](../namespaces/node/type-aliases/BuildChainedTx.md)[]

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildChainedTxResult`](../namespaces/node/type-aliases/BuildChainedTxResult.md)[]\>

##### Tags

Transactions

##### Name

PostTransactionsBuildChained

##### Summary

Build a chain of transactions

##### Request

POST:/transactions/build-chained

#### postTransactionsBuildMultiAddresses()

> **postTransactionsBuildMultiAddresses**: (`data`, `params`) => `Promise`\<[`BuildTransferTxResult`](../namespaces/node/interfaces/BuildTransferTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildMultiAddressesTransaction`](../namespaces/node/interfaces/BuildMultiAddressesTransaction.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildTransferTxResult`](../namespaces/node/interfaces/BuildTransferTxResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsBuildMultiAddresses

##### Summary

Build an unsigned transaction with multiple addresses to a number of recipients

##### Request

POST:/transactions/build-multi-addresses

#### postTransactionsBuildTransferFromOneToManyGroups()

> **postTransactionsBuildTransferFromOneToManyGroups**: (`data`, `params`) => `Promise`\<[`BuildTransferTxResult`](../namespaces/node/interfaces/BuildTransferTxResult.md)[]\>

No description

##### Parameters

• **data**: [`BuildTransferTx`](../namespaces/node/interfaces/BuildTransferTx.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildTransferTxResult`](../namespaces/node/interfaces/BuildTransferTxResult.md)[]\>

##### Tags

Transactions

##### Name

PostTransactionsBuildTransferFromOneToManyGroups

##### Summary

Build unsigned transfer transactions from an address of one group to addresses of many groups. Each target group requires a dedicated transaction or more in case large number of outputs needed to be split.

##### Request

POST:/transactions/build-transfer-from-one-to-many-groups

#### postTransactionsDecodeUnsignedTx()

> **postTransactionsDecodeUnsignedTx**: (`data`, `params`) => `Promise`\<[`DecodeUnsignedTxResult`](../namespaces/node/interfaces/DecodeUnsignedTxResult.md)\>

No description

##### Parameters

• **data**: [`DecodeUnsignedTx`](../namespaces/node/interfaces/DecodeUnsignedTx.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`DecodeUnsignedTxResult`](../namespaces/node/interfaces/DecodeUnsignedTxResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsDecodeUnsignedTx

##### Summary

Decode an unsigned transaction

##### Request

POST:/transactions/decode-unsigned-tx

#### postTransactionsSubmit()

> **postTransactionsSubmit**: (`data`, `params`) => `Promise`\<[`SubmitTxResult`](../namespaces/node/interfaces/SubmitTxResult.md)\>

No description

##### Parameters

• **data**: [`SubmitTransaction`](../namespaces/node/interfaces/SubmitTransaction.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SubmitTxResult`](../namespaces/node/interfaces/SubmitTxResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsSubmit

##### Summary

Submit a signed transaction

##### Request

POST:/transactions/submit

#### postTransactionsSweepAddressBuild()

> **postTransactionsSweepAddressBuild**: (`data`, `params`) => `Promise`\<[`BuildSweepAddressTransactionsResult`](../namespaces/node/interfaces/BuildSweepAddressTransactionsResult.md)\>

No description

##### Parameters

• **data**: [`BuildSweepAddressTransactions`](../namespaces/node/interfaces/BuildSweepAddressTransactions.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildSweepAddressTransactionsResult`](../namespaces/node/interfaces/BuildSweepAddressTransactionsResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsSweepAddressBuild

##### Summary

Build unsigned transactions to send all unlocked ALPH and token balances of one address to another address

##### Request

POST:/transactions/sweep-address/build

#### Implementation of

`NodeProviderApis.transactions`

#### Defined in

[src/api/node-provider.ts:65](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L65)

***

### utils

> `readonly` **utils**: `object`

#### postUtilsTargetToHashrate()

> **postUtilsTargetToHashrate**: (`data`, `params`) => `Promise`\<[`Result`](../namespaces/node/interfaces/Result.md)\>

No description

##### Parameters

• **data**: [`TargetToHashrate`](../namespaces/node/interfaces/TargetToHashrate.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Result`](../namespaces/node/interfaces/Result.md)\>

##### Tags

Utils

##### Name

PostUtilsTargetToHashrate

##### Summary

Convert a target to hashrate

##### Request

POST:/utils/target-to-hashrate

#### postUtilsVerifySignature()

> **postUtilsVerifySignature**: (`data`, `params`) => `Promise`\<`boolean`\>

No description

##### Parameters

• **data**: [`VerifySignature`](../namespaces/node/interfaces/VerifySignature.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`boolean`\>

##### Tags

Utils

##### Name

PostUtilsVerifySignature

##### Summary

Verify the SecP256K1 signature of some data

##### Request

POST:/utils/verify-signature

#### putUtilsCheckHashIndexing()

> **putUtilsCheckHashIndexing**: (`params`) => `Promise`\<`void`\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Utils

##### Name

PutUtilsCheckHashIndexing

##### Summary

Check and repair the indexing of block hashes

##### Request

PUT:/utils/check-hash-indexing

#### Implementation of

`NodeProviderApis.utils`

#### Defined in

[src/api/node-provider.ts:69](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L69)

***

### wallets

> `readonly` **wallets**: `object`

#### deleteWalletsWalletName()

> **deleteWalletsWalletName**: (`walletName`, `query`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **walletName**: `string`

• **query**

• **query.password**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Wallets

##### Name

DeleteWalletsWalletName

##### Summary

Delete your wallet file (can be recovered with your mnemonic)

##### Request

DELETE:/wallets/{wallet_name}

#### getWallets()

> **getWallets**: (`params`) => `Promise`\<[`WalletStatus`](../namespaces/node/interfaces/WalletStatus.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`WalletStatus`](../namespaces/node/interfaces/WalletStatus.md)[]\>

##### Tags

Wallets

##### Name

GetWallets

##### Summary

List available wallets

##### Request

GET:/wallets

#### getWalletsWalletName()

> **getWalletsWalletName**: (`walletName`, `params`) => `Promise`\<[`WalletStatus`](../namespaces/node/interfaces/WalletStatus.md)\>

No description

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`WalletStatus`](../namespaces/node/interfaces/WalletStatus.md)\>

##### Tags

Wallets

##### Name

GetWalletsWalletName

##### Summary

Get wallet's status

##### Request

GET:/wallets/{wallet_name}

#### getWalletsWalletNameAddresses()

> **getWalletsWalletNameAddresses**: (`walletName`, `params`) => `Promise`\<[`Addresses`](../namespaces/node/interfaces/Addresses.md)\>

No description

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Addresses`](../namespaces/node/interfaces/Addresses.md)\>

##### Tags

Wallets

##### Name

GetWalletsWalletNameAddresses

##### Summary

List all your wallet's addresses

##### Request

GET:/wallets/{wallet_name}/addresses

#### getWalletsWalletNameAddressesAddress()

> **getWalletsWalletNameAddressesAddress**: (`walletName`, `address`, `params`) => `Promise`\<[`AddressInfo`](../namespaces/node/interfaces/AddressInfo.md)\>

No description

##### Parameters

• **walletName**: `string`

• **address**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressInfo`](../namespaces/node/interfaces/AddressInfo.md)\>

##### Tags

Wallets

##### Name

GetWalletsWalletNameAddressesAddress

##### Summary

Get address' info

##### Request

GET:/wallets/{wallet_name}/addresses/{address}

#### getWalletsWalletNameBalances()

> **getWalletsWalletNameBalances**: (`walletName`, `params`) => `Promise`\<[`Balances`](../namespaces/node/interfaces/Balances.md)\>

No description

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Balances`](../namespaces/node/interfaces/Balances.md)\>

##### Tags

Wallets

##### Name

GetWalletsWalletNameBalances

##### Summary

Get your total balance

##### Request

GET:/wallets/{wallet_name}/balances

#### getWalletsWalletNameMinerAddresses()

> **getWalletsWalletNameMinerAddresses**: (`walletName`, `params`) => `Promise`\<[`MinerAddressesInfo`](../namespaces/node/interfaces/MinerAddressesInfo.md)[]\>

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MinerAddressesInfo`](../namespaces/node/interfaces/MinerAddressesInfo.md)[]\>

##### Description

This endpoint can only be called if the wallet was created with the `isMiner = true` flag

##### Tags

Miners

##### Name

GetWalletsWalletNameMinerAddresses

##### Summary

List all miner addresses per group

##### Request

GET:/wallets/{wallet_name}/miner-addresses

#### postWallets()

> **postWallets**: (`data`, `params`) => `Promise`\<[`WalletCreationResult`](../namespaces/node/interfaces/WalletCreationResult.md)\>

##### Parameters

• **data**: [`WalletCreation`](../namespaces/node/interfaces/WalletCreation.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`WalletCreationResult`](../namespaces/node/interfaces/WalletCreationResult.md)\>

##### Description

A new wallet will be created and respond with a mnemonic. Make sure to keep that mnemonic safely as it will allows you to recover your wallet. Default mnemonic size is 24, (options: 12, 15, 18, 21, 24).

##### Tags

Wallets

##### Name

PostWallets

##### Summary

Create a new wallet

##### Request

POST:/wallets

#### postWalletsWalletNameChangeActiveAddress()

> **postWalletsWalletNameChangeActiveAddress**: (`walletName`, `data`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`ChangeActiveAddress`](../namespaces/node/interfaces/ChangeActiveAddress.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameChangeActiveAddress

##### Summary

Choose the active address

##### Request

POST:/wallets/{wallet_name}/change-active-address

#### postWalletsWalletNameDeriveNextAddress()

> **postWalletsWalletNameDeriveNextAddress**: (`walletName`, `query`?, `params`) => `Promise`\<[`AddressInfo`](../namespaces/node/interfaces/AddressInfo.md)\>

##### Parameters

• **walletName**: `string`

• **query?**

• **query.group?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressInfo`](../namespaces/node/interfaces/AddressInfo.md)\>

##### Description

Cannot be called from a miner wallet

##### Tags

Wallets

##### Name

PostWalletsWalletNameDeriveNextAddress

##### Summary

Derive your next address

##### Request

POST:/wallets/{wallet_name}/derive-next-address

#### postWalletsWalletNameDeriveNextMinerAddresses()

> **postWalletsWalletNameDeriveNextMinerAddresses**: (`walletName`, `params`) => `Promise`\<[`AddressInfo`](../namespaces/node/interfaces/AddressInfo.md)[]\>

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressInfo`](../namespaces/node/interfaces/AddressInfo.md)[]\>

##### Description

Your wallet need to have been created with the miner flag set to true

##### Tags

Miners

##### Name

PostWalletsWalletNameDeriveNextMinerAddresses

##### Summary

Derive your next miner addresses for each group

##### Request

POST:/wallets/{wallet_name}/derive-next-miner-addresses

#### postWalletsWalletNameLock()

> **postWalletsWalletNameLock**: (`walletName`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameLock

##### Summary

Lock your wallet

##### Request

POST:/wallets/{wallet_name}/lock

#### postWalletsWalletNameRevealMnemonic()

> **postWalletsWalletNameRevealMnemonic**: (`walletName`, `data`, `params`) => `Promise`\<[`RevealMnemonicResult`](../namespaces/node/interfaces/RevealMnemonicResult.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`RevealMnemonic`](../namespaces/node/interfaces/RevealMnemonic.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RevealMnemonicResult`](../namespaces/node/interfaces/RevealMnemonicResult.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameRevealMnemonic

##### Summary

Reveal your mnemonic. !!! use it with caution !!!

##### Request

POST:/wallets/{wallet_name}/reveal-mnemonic

#### postWalletsWalletNameSign()

> **postWalletsWalletNameSign**: (`walletName`, `data`, `params`) => `Promise`\<[`SignResult`](../namespaces/node/interfaces/SignResult.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`Sign`](../namespaces/node/interfaces/Sign.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SignResult`](../namespaces/node/interfaces/SignResult.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameSign

##### Summary

Sign the given data and return back the signature

##### Request

POST:/wallets/{wallet_name}/sign

#### postWalletsWalletNameSweepActiveAddress()

> **postWalletsWalletNameSweepActiveAddress**: (`walletName`, `data`, `params`) => `Promise`\<[`TransferResults`](../namespaces/node/interfaces/TransferResults.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`Sweep`](../namespaces/node/interfaces/Sweep.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TransferResults`](../namespaces/node/interfaces/TransferResults.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameSweepActiveAddress

##### Summary

Transfer all unlocked ALPH from the active address to another address

##### Request

POST:/wallets/{wallet_name}/sweep-active-address

#### postWalletsWalletNameSweepAllAddresses()

> **postWalletsWalletNameSweepAllAddresses**: (`walletName`, `data`, `params`) => `Promise`\<[`TransferResults`](../namespaces/node/interfaces/TransferResults.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`Sweep`](../namespaces/node/interfaces/Sweep.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TransferResults`](../namespaces/node/interfaces/TransferResults.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameSweepAllAddresses

##### Summary

Transfer unlocked ALPH from all addresses (including all mining addresses if applicable) to another address

##### Request

POST:/wallets/{wallet_name}/sweep-all-addresses

#### postWalletsWalletNameTransfer()

> **postWalletsWalletNameTransfer**: (`walletName`, `data`, `params`) => `Promise`\<[`TransferResult`](../namespaces/node/interfaces/TransferResult.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`Transfer`](../namespaces/node/interfaces/Transfer.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TransferResult`](../namespaces/node/interfaces/TransferResult.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameTransfer

##### Summary

Transfer ALPH from the active address

##### Request

POST:/wallets/{wallet_name}/transfer

#### postWalletsWalletNameUnlock()

> **postWalletsWalletNameUnlock**: (`walletName`, `data`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`WalletUnlock`](../namespaces/node/interfaces/WalletUnlock.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<`void`\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameUnlock

##### Summary

Unlock your wallet

##### Request

POST:/wallets/{wallet_name}/unlock

#### putWallets()

> **putWallets**: (`data`, `params`) => `Promise`\<[`WalletRestoreResult`](../namespaces/node/interfaces/WalletRestoreResult.md)\>

No description

##### Parameters

• **data**: [`WalletRestore`](../namespaces/node/interfaces/WalletRestore.md)

• **params**: [`RequestParams`](../namespaces/node/type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`WalletRestoreResult`](../namespaces/node/interfaces/WalletRestoreResult.md)\>

##### Tags

Wallets

##### Name

PutWallets

##### Summary

Restore a wallet from your mnemonic

##### Request

PUT:/wallets

#### Implementation of

`NodeProviderApis.wallets`

#### Defined in

[src/api/node-provider.ts:61](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L61)

## Methods

### fetchFungibleTokenMetaData()

> **fetchFungibleTokenMetaData**(`tokenId`): `Promise`\<[`FungibleTokenMetaData`](../interfaces/FungibleTokenMetaData.md)\>

#### Parameters

• **tokenId**: `string`

#### Returns

`Promise`\<[`FungibleTokenMetaData`](../interfaces/FungibleTokenMetaData.md)\>

#### Defined in

[src/api/node-provider.ts:115](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L115)

***

### fetchNFTCollectionMetaData()

> **fetchNFTCollectionMetaData**(`collectionId`): `Promise`\<[`NFTCollectionMetaData`](../interfaces/NFTCollectionMetaData.md)\>

#### Parameters

• **collectionId**: `string`

#### Returns

`Promise`\<[`NFTCollectionMetaData`](../interfaces/NFTCollectionMetaData.md)\>

#### Defined in

[src/api/node-provider.ts:179](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L179)

***

### fetchNFTMetaData()

> **fetchNFTMetaData**(`tokenId`): `Promise`\<[`NFTMetaData`](../interfaces/NFTMetaData.md)\>

#### Parameters

• **tokenId**: `string`

#### Returns

`Promise`\<[`NFTMetaData`](../interfaces/NFTMetaData.md)\>

#### Defined in

[src/api/node-provider.ts:132](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L132)

***

### fetchNFTRoyaltyAmount()

> **fetchNFTRoyaltyAmount**(`collectionId`, `tokenId`, `salePrice`): `Promise`\<`bigint`\>

#### Parameters

• **collectionId**: `string`

• **tokenId**: `string`

• **salePrice**: `bigint`

#### Returns

`Promise`\<`bigint`\>

#### Defined in

[src/api/node-provider.ts:192](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L192)

***

### guessFollowsNFTCollectionStd()

> **guessFollowsNFTCollectionStd**(`contractId`): `Promise`\<`boolean`\>

#### Parameters

• **contractId**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/api/node-provider.ts:227](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L227)

***

### guessFollowsNFTCollectionWithRoyaltyStd()

> **guessFollowsNFTCollectionWithRoyaltyStd**(`contractId`): `Promise`\<`boolean`\>

#### Parameters

• **contractId**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/api/node-provider.ts:232](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L232)

***

### guessStdInterfaceId()

> **guessStdInterfaceId**(`tokenId`): `Promise`\<`undefined` \| `string`\>

#### Parameters

• **tokenId**: `string`

#### Returns

`Promise`\<`undefined` \| `string`\>

#### Defined in

[src/api/node-provider.ts:215](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L215)

***

### guessStdTokenType()

> **guessStdTokenType**(`tokenId`): `Promise`\<`undefined` \| `"fungible"` \| `"non-fungible"`\>

#### Parameters

• **tokenId**: `string`

#### Returns

`Promise`\<`undefined` \| `"fungible"` \| `"non-fungible"`\>

#### Defined in

[src/api/node-provider.ts:237](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L237)

***

### request()

> **request**(`args`): `Promise`\<`any`\>

#### Parameters

• **args**: [`ApiRequestArguments`](../interfaces/ApiRequestArguments.md)

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/api/node-provider.ts:101](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L101)

***

### Proxy()

> `static` **Proxy**(`nodeProvider`): [`NodeProvider`](NodeProvider.md)

#### Parameters

• **nodeProvider**: [`NodeProvider`](NodeProvider.md)

#### Returns

[`NodeProvider`](NodeProvider.md)

#### Defined in

[src/api/node-provider.ts:106](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L106)

***

### Remote()

> `static` **Remote**(`handler`): [`NodeProvider`](NodeProvider.md)

#### Parameters

• **handler**: [`ApiRequestHandler`](../type-aliases/ApiRequestHandler.md)

#### Returns

[`NodeProvider`](NodeProvider.md)

#### Defined in

[src/api/node-provider.ts:110](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/api/node-provider.ts#L110)
