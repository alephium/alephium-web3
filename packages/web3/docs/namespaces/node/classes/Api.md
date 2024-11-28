[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [node](../README.md) / Api

# Class: Api\<SecurityDataType\>

## Title

Alephium API

## Version

3.9.0

## Base Url

../

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

[src/api/api-alephium.ts:1498](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1498)

## Properties

### addresses

> **addresses**: `object`

#### getAddressesAddressBalance()

> **getAddressesAddressBalance**: (`address`, `query`?, `params`) => `Promise`\<[`Balance`](../interfaces/Balance.md)\>

No description

##### Parameters

• **address**: `string`

• **query?**

• **query.mempool?**: `boolean`

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Balance`](../interfaces/Balance.md)\>

##### Tags

Addresses

##### Name

GetAddressesAddressBalance

##### Summary

Get the balance of an address

##### Request

GET:/addresses/{address}/balance

#### getAddressesAddressGroup()

> **getAddressesAddressGroup**: (`address`, `params`) => `Promise`\<[`Group`](../interfaces/Group.md)\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Group`](../interfaces/Group.md)\>

##### Tags

Addresses

##### Name

GetAddressesAddressGroup

##### Summary

Get the group of an address

##### Request

GET:/addresses/{address}/group

#### getAddressesAddressUtxos()

> **getAddressesAddressUtxos**: (`address`, `params`) => `Promise`\<[`UTXOs`](../interfaces/UTXOs.md)\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`UTXOs`](../interfaces/UTXOs.md)\>

##### Tags

Addresses

##### Name

GetAddressesAddressUtxos

##### Summary

Get the UTXOs of an address

##### Request

GET:/addresses/{address}/utxos

#### Defined in

[src/api/api-alephium.ts:2519](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L2519)

***

### baseUrl

> **baseUrl**: `string` = `'../'`

#### Inherited from

[`HttpClient`](HttpClient.md).[`baseUrl`](HttpClient.md#baseurl)

#### Defined in

[src/api/api-alephium.ts:1485](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1485)

***

### blockflow

> **blockflow**: `object`

#### getBlockflowBlocks()

> **getBlockflowBlocks**: (`query`, `params`) => `Promise`\<[`BlocksPerTimeStampRange`](../interfaces/BlocksPerTimeStampRange.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlocksPerTimeStampRange`](../interfaces/BlocksPerTimeStampRange.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowBlocks

##### Summary

List blocks on the given time interval

##### Request

GET:/blockflow/blocks

#### getBlockflowBlocksBlockHash()

> **getBlockflowBlocksBlockHash**: (`blockHash`, `params`) => `Promise`\<[`BlockEntry`](../interfaces/BlockEntry.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockEntry`](../interfaces/BlockEntry.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowBlocksBlockHash

##### Summary

Get a block with hash

##### Request

GET:/blockflow/blocks/{block_hash}

#### getBlockflowBlocksWithEvents()

> **getBlockflowBlocksWithEvents**: (`query`, `params`) => `Promise`\<[`BlocksAndEventsPerTimeStampRange`](../interfaces/BlocksAndEventsPerTimeStampRange.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlocksAndEventsPerTimeStampRange`](../interfaces/BlocksAndEventsPerTimeStampRange.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowBlocksWithEvents

##### Summary

List blocks with events on the given time interval

##### Request

GET:/blockflow/blocks-with-events

#### getBlockflowBlocksWithEventsBlockHash()

> **getBlockflowBlocksWithEventsBlockHash**: (`blockHash`, `params`) => `Promise`\<[`BlockAndEvents`](../interfaces/BlockAndEvents.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockAndEvents`](../interfaces/BlockAndEvents.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowBlocksWithEventsBlockHash

##### Summary

Get a block and events with hash

##### Request

GET:/blockflow/blocks-with-events/{block_hash}

#### getBlockflowChainInfo()

> **getBlockflowChainInfo**: (`query`, `params`) => `Promise`\<[`ChainInfo`](../interfaces/ChainInfo.md)\>

No description

##### Parameters

• **query**

• **query.fromGroup**: `number`

**Format**

int32

• **query.toGroup**: `number`

**Format**

int32

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ChainInfo`](../interfaces/ChainInfo.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowChainInfo

##### Summary

Get infos about the chain from the given groups

##### Request

GET:/blockflow/chain-info

#### getBlockflowHashes()

> **getBlockflowHashes**: (`query`, `params`) => `Promise`\<[`HashesAtHeight`](../interfaces/HashesAtHeight.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HashesAtHeight`](../interfaces/HashesAtHeight.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowHashes

##### Summary

Get all block's hashes at given height for given groups

##### Request

GET:/blockflow/hashes

#### getBlockflowHeadersBlockHash()

> **getBlockflowHeadersBlockHash**: (`blockHash`, `params`) => `Promise`\<[`BlockHeaderEntry`](../interfaces/BlockHeaderEntry.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockHeaderEntry`](../interfaces/BlockHeaderEntry.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getBlockflowMainChainBlockByGhostUncleGhostUncleHash**: (`ghostUncleHash`, `params`) => `Promise`\<[`BlockEntry`](../interfaces/BlockEntry.md)\>

No description

##### Parameters

• **ghostUncleHash**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BlockEntry`](../interfaces/BlockEntry.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowMainChainBlockByGhostUncleGhostUncleHash

##### Summary

Get a mainchain block by ghost uncle hash

##### Request

GET:/blockflow/main-chain-block-by-ghost-uncle/{ghost_uncle_hash}

#### getBlockflowRawBlocksBlockHash()

> **getBlockflowRawBlocksBlockHash**: (`blockHash`, `params`) => `Promise`\<[`RawBlock`](../interfaces/RawBlock.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RawBlock`](../interfaces/RawBlock.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowRawBlocksBlockHash

##### Summary

Get raw block in hex format

##### Request

GET:/blockflow/raw-blocks/{block_hash}

#### getBlockflowRichBlocks()

> **getBlockflowRichBlocks**: (`query`, `params`) => `Promise`\<[`RichBlocksAndEventsPerTimeStampRange`](../interfaces/RichBlocksAndEventsPerTimeStampRange.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RichBlocksAndEventsPerTimeStampRange`](../interfaces/RichBlocksAndEventsPerTimeStampRange.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowRichBlocks

##### Summary

Given a time interval, list blocks containing events and transactions with enriched input information when node indexes are enabled.

##### Request

GET:/blockflow/rich-blocks

#### getBlockflowRichBlocksBlockHash()

> **getBlockflowRichBlocksBlockHash**: (`blockHash`, `params`) => `Promise`\<[`RichBlockAndEvents`](../interfaces/RichBlockAndEvents.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RichBlockAndEvents`](../interfaces/RichBlockAndEvents.md)\>

##### Tags

Blockflow

##### Name

GetBlockflowRichBlocksBlockHash

##### Summary

Get a block containing events and transactions with enriched input information when node indexes are enabled.

##### Request

GET:/blockflow/rich-blocks/{block_hash}

#### Defined in

[src/api/api-alephium.ts:2243](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L2243)

***

### contracts

> **contracts**: `object`

#### getContractsAddressParent()

> **getContractsAddressParent**: (`address`, `params`) => `Promise`\<`string`\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getContractsAddressState**: (`address`, `params`) => `Promise`\<[`ContractState`](../interfaces/ContractState.md)\>

No description

##### Parameters

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractState`](../interfaces/ContractState.md)\>

##### Tags

Contracts

##### Name

GetContractsAddressState

##### Summary

Get contract state

##### Request

GET:/contracts/{address}/state

#### getContractsAddressSubContracts()

> **getContractsAddressSubContracts**: (`address`, `query`, `params`) => `Promise`\<[`SubContracts`](../interfaces/SubContracts.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SubContracts`](../interfaces/SubContracts.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **postContractsCallContract**: (`data`, `params`) => `Promise`\<[`CallContractFailed`](../interfaces/CallContractFailed.md) \| [`CallContractSucceeded`](../interfaces/CallContractSucceeded.md)\>

No description

##### Parameters

• **data**: [`CallContract`](../interfaces/CallContract.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CallContractFailed`](../interfaces/CallContractFailed.md) \| [`CallContractSucceeded`](../interfaces/CallContractSucceeded.md)\>

##### Tags

Contracts

##### Name

PostContractsCallContract

##### Summary

Call contract

##### Request

POST:/contracts/call-contract

#### postContractsCallTxScript()

> **postContractsCallTxScript**: (`data`, `params`) => `Promise`\<[`CallTxScriptResult`](../interfaces/CallTxScriptResult.md)\>

No description

##### Parameters

• **data**: [`CallTxScript`](../interfaces/CallTxScript.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CallTxScriptResult`](../interfaces/CallTxScriptResult.md)\>

##### Tags

Contracts

##### Name

PostContractsCallTxScript

##### Summary

Call TxScript

##### Request

POST:/contracts/call-tx-script

#### postContractsCompileContract()

> **postContractsCompileContract**: (`data`, `params`) => `Promise`\<[`CompileContractResult`](../interfaces/CompileContractResult.md)\>

No description

##### Parameters

• **data**: [`Contract`](../interfaces/Contract.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CompileContractResult`](../interfaces/CompileContractResult.md)\>

##### Tags

Contracts

##### Name

PostContractsCompileContract

##### Summary

Compile a smart contract

##### Request

POST:/contracts/compile-contract

#### postContractsCompileProject()

> **postContractsCompileProject**: (`data`, `params`) => `Promise`\<[`CompileProjectResult`](../interfaces/CompileProjectResult.md)\>

No description

##### Parameters

• **data**: [`Project`](../interfaces/Project.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CompileProjectResult`](../interfaces/CompileProjectResult.md)\>

##### Tags

Contracts

##### Name

PostContractsCompileProject

##### Summary

Compile a project

##### Request

POST:/contracts/compile-project

#### postContractsCompileScript()

> **postContractsCompileScript**: (`data`, `params`) => `Promise`\<[`CompileScriptResult`](../interfaces/CompileScriptResult.md)\>

No description

##### Parameters

• **data**: [`Script`](../interfaces/Script.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CompileScriptResult`](../interfaces/CompileScriptResult.md)\>

##### Tags

Contracts

##### Name

PostContractsCompileScript

##### Summary

Compile a script

##### Request

POST:/contracts/compile-script

#### postContractsMulticallContract()

> **postContractsMulticallContract**: (`data`, `params`) => `Promise`\<[`MultipleCallContractResult`](../interfaces/MultipleCallContractResult.md)\>

No description

##### Parameters

• **data**: [`MultipleCallContract`](../interfaces/MultipleCallContract.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MultipleCallContractResult`](../interfaces/MultipleCallContractResult.md)\>

##### Tags

Contracts

##### Name

PostContractsMulticallContract

##### Summary

Multiple call contract

##### Request

POST:/contracts/multicall-contract

#### postContractsTestContract()

> **postContractsTestContract**: (`data`, `params`) => `Promise`\<[`TestContractResult`](../interfaces/TestContractResult.md)\>

No description

##### Parameters

• **data**: [`TestContract`](../interfaces/TestContract.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TestContractResult`](../interfaces/TestContractResult.md)\>

##### Tags

Contracts

##### Name

PostContractsTestContract

##### Summary

Test contract

##### Request

POST:/contracts/test-contract

#### postContractsUnsignedTxDeployContract()

> **postContractsUnsignedTxDeployContract**: (`data`, `params`) => `Promise`\<[`BuildDeployContractTxResult`](../interfaces/BuildDeployContractTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildDeployContractTx`](../interfaces/BuildDeployContractTx.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildDeployContractTxResult`](../interfaces/BuildDeployContractTxResult.md)\>

##### Tags

Contracts

##### Name

PostContractsUnsignedTxDeployContract

##### Summary

Build an unsigned contract

##### Request

POST:/contracts/unsigned-tx/deploy-contract

#### postContractsUnsignedTxExecuteScript()

> **postContractsUnsignedTxExecuteScript**: (`data`, `params`) => `Promise`\<[`BuildExecuteScriptTxResult`](../interfaces/BuildExecuteScriptTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildExecuteScriptTx`](../interfaces/BuildExecuteScriptTx.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildExecuteScriptTxResult`](../interfaces/BuildExecuteScriptTxResult.md)\>

##### Tags

Contracts

##### Name

PostContractsUnsignedTxExecuteScript

##### Summary

Build an unsigned script

##### Request

POST:/contracts/unsigned-tx/execute-script

#### Defined in

[src/api/api-alephium.ts:2922](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L2922)

***

### events

> **events**: `object`

#### getEventsBlockHashBlockhash()

> **getEventsBlockHashBlockhash**: (`blockHash`, `query`?, `params`) => `Promise`\<[`ContractEventsByBlockHash`](../interfaces/ContractEventsByBlockHash.md)\>

No description

##### Parameters

• **blockHash**: `string`

• **query?**

• **query.group?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractEventsByBlockHash`](../interfaces/ContractEventsByBlockHash.md)\>

##### Tags

Events

##### Name

GetEventsBlockHashBlockhash

##### Summary

Get contract events for a block

##### Request

GET:/events/block-hash/{blockHash}

#### getEventsContractContractaddress()

> **getEventsContractContractaddress**: (`contractAddress`, `query`, `params`) => `Promise`\<[`ContractEvents`](../interfaces/ContractEvents.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractEvents`](../interfaces/ContractEvents.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getEventsTxIdTxid**: (`txId`, `query`?, `params`) => `Promise`\<[`ContractEventsByTxId`](../interfaces/ContractEventsByTxId.md)\>

No description

##### Parameters

• **txId**: `string`

• **query?**

• **query.group?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ContractEventsByTxId`](../interfaces/ContractEventsByTxId.md)\>

##### Tags

Events

##### Name

GetEventsTxIdTxid

##### Summary

Get contract events for a transaction

##### Request

GET:/events/tx-id/{txId}

#### Defined in

[src/api/api-alephium.ts:3346](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L3346)

***

### infos

> **infos**: `object`

#### getInfosChainParams()

> **getInfosChainParams**: (`params`) => `Promise`\<[`ChainParams`](../interfaces/ChainParams.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`ChainParams`](../interfaces/ChainParams.md)\>

##### Tags

Infos

##### Name

GetInfosChainParams

##### Summary

Get key params about your blockchain

##### Request

GET:/infos/chain-params

#### getInfosCurrentDifficulty()

> **getInfosCurrentDifficulty**: (`params`) => `Promise`\<[`CurrentDifficulty`](../interfaces/CurrentDifficulty.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`CurrentDifficulty`](../interfaces/CurrentDifficulty.md)\>

##### Tags

Infos

##### Name

GetInfosCurrentDifficulty

##### Summary

Get the average difficulty of the latest blocks from all shards

##### Request

GET:/infos/current-difficulty

#### getInfosCurrentHashrate()

> **getInfosCurrentHashrate**: (`query`?, `params`) => `Promise`\<[`HashRateResponse`](../interfaces/HashRateResponse.md)\>

No description

##### Parameters

• **query?**

• **query.timespan?**: `number`

**Format**

int64

**Min**

1

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HashRateResponse`](../interfaces/HashRateResponse.md)\>

##### Tags

Infos

##### Name

GetInfosCurrentHashrate

##### Summary

Get average hashrate from `now - timespan(millis)` to `now`

##### Request

GET:/infos/current-hashrate

#### getInfosDiscoveredNeighbors()

> **getInfosDiscoveredNeighbors**: (`params`) => `Promise`\<[`BrokerInfo`](../interfaces/BrokerInfo.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BrokerInfo`](../interfaces/BrokerInfo.md)[]\>

##### Tags

Infos

##### Name

GetInfosDiscoveredNeighbors

##### Summary

Get discovered neighbors

##### Request

GET:/infos/discovered-neighbors

#### getInfosHistoryHashrate()

> **getInfosHistoryHashrate**: (`query`, `params`) => `Promise`\<[`HashRateResponse`](../interfaces/HashRateResponse.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`HashRateResponse`](../interfaces/HashRateResponse.md)\>

##### Tags

Infos

##### Name

GetInfosHistoryHashrate

##### Summary

Get history average hashrate on the given time interval

##### Request

GET:/infos/history-hashrate

#### getInfosInterCliquePeerInfo()

> **getInfosInterCliquePeerInfo**: (`params`) => `Promise`\<[`InterCliquePeerInfo`](../interfaces/InterCliquePeerInfo.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`InterCliquePeerInfo`](../interfaces/InterCliquePeerInfo.md)[]\>

##### Tags

Infos

##### Name

GetInfosInterCliquePeerInfo

##### Summary

Get infos about the inter cliques

##### Request

GET:/infos/inter-clique-peer-info

#### getInfosMisbehaviors()

> **getInfosMisbehaviors**: (`params`) => `Promise`\<[`PeerMisbehavior`](../interfaces/PeerMisbehavior.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`PeerMisbehavior`](../interfaces/PeerMisbehavior.md)[]\>

##### Tags

Infos

##### Name

GetInfosMisbehaviors

##### Summary

Get the misbehaviors of peers

##### Request

GET:/infos/misbehaviors

#### getInfosNode()

> **getInfosNode**: (`params`) => `Promise`\<[`NodeInfo`](../interfaces/NodeInfo.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`NodeInfo`](../interfaces/NodeInfo.md)\>

##### Tags

Infos

##### Name

GetInfosNode

##### Summary

Get info about that node

##### Request

GET:/infos/node

#### getInfosSelfClique()

> **getInfosSelfClique**: (`params`) => `Promise`\<[`SelfClique`](../interfaces/SelfClique.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SelfClique`](../interfaces/SelfClique.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getInfosVersion**: (`params`) => `Promise`\<[`NodeVersion`](../interfaces/NodeVersion.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`NodeVersion`](../interfaces/NodeVersion.md)\>

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

• **data**: [`DiscoveryAction`](../type-aliases/DiscoveryAction.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **data**: [`MisbehaviorAction`](../type-aliases/MisbehaviorAction.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

#### Defined in

[src/api/api-alephium.ts:2004](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L2004)

***

### mempool

> **mempool**: `object`

#### deleteMempoolTransactions()

> **deleteMempoolTransactions**: (`params`) => `Promise`\<`void`\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getMempoolTransactions**: (`params`) => `Promise`\<[`MempoolTransactions`](../interfaces/MempoolTransactions.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MempoolTransactions`](../interfaces/MempoolTransactions.md)[]\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

#### Defined in

[src/api/api-alephium.ts:2850](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L2850)

***

### miners

> **miners**: `object`

#### getMinersAddresses()

> **getMinersAddresses**: (`params`) => `Promise`\<[`MinerAddresses`](../interfaces/MinerAddresses.md)\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MinerAddresses`](../interfaces/MinerAddresses.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **data**: [`MinerAddresses`](../interfaces/MinerAddresses.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

#### Defined in

[src/api/api-alephium.ts:3265](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L3265)

***

### multisig

> **multisig**: `object`

#### postMultisigAddress()

> **postMultisigAddress**: (`data`, `params`) => `Promise`\<[`BuildMultisigAddressResult`](../interfaces/BuildMultisigAddressResult.md)\>

No description

##### Parameters

• **data**: [`BuildMultisigAddress`](../interfaces/BuildMultisigAddress.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildMultisigAddressResult`](../interfaces/BuildMultisigAddressResult.md)\>

##### Tags

Multi-signature

##### Name

PostMultisigAddress

##### Summary

Create the multisig address and unlock script

##### Request

POST:/multisig/address

#### postMultisigBuild()

> **postMultisigBuild**: (`data`, `params`) => `Promise`\<[`BuildTransferTxResult`](../interfaces/BuildTransferTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildMultisig`](../interfaces/BuildMultisig.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildTransferTxResult`](../interfaces/BuildTransferTxResult.md)\>

##### Tags

Multi-signature

##### Name

PostMultisigBuild

##### Summary

Build a multisig unsigned transaction

##### Request

POST:/multisig/build

#### postMultisigSubmit()

> **postMultisigSubmit**: (`data`, `params`) => `Promise`\<[`SubmitTxResult`](../interfaces/SubmitTxResult.md)\>

No description

##### Parameters

• **data**: [`SubmitMultisig`](../interfaces/SubmitMultisig.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SubmitTxResult`](../interfaces/SubmitTxResult.md)\>

##### Tags

Multi-signature

##### Name

PostMultisigSubmit

##### Summary

Submit a multi-signed transaction

##### Request

POST:/multisig/submit

#### postMultisigSweep()

> **postMultisigSweep**: (`data`, `params`) => `Promise`\<[`BuildSweepAddressTransactionsResult`](../interfaces/BuildSweepAddressTransactionsResult.md)\>

No description

##### Parameters

• **data**: [`BuildSweepMultisig`](../interfaces/BuildSweepMultisig.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildSweepAddressTransactionsResult`](../interfaces/BuildSweepAddressTransactionsResult.md)\>

##### Tags

Multi-signature

##### Name

PostMultisigSweep

##### Summary

Sweep all unlocked ALPH and token balances of a multisig address to another address

##### Request

POST:/multisig/sweep

#### Defined in

[src/api/api-alephium.ts:3183](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L3183)

***

### transactions

> **transactions**: `object`

#### getTransactionsDetailsTxid()

> **getTransactionsDetailsTxid**: (`txId`, `query`?, `params`) => `Promise`\<[`Transaction`](../interfaces/Transaction.md)\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Transaction`](../interfaces/Transaction.md)\>

##### Tags

Transactions

##### Name

GetTransactionsDetailsTxid

##### Summary

Get transaction details

##### Request

GET:/transactions/details/{txId}

#### getTransactionsRawTxid()

> **getTransactionsRawTxid**: (`txId`, `query`?, `params`) => `Promise`\<[`RawTransaction`](../interfaces/RawTransaction.md)\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RawTransaction`](../interfaces/RawTransaction.md)\>

##### Tags

Transactions

##### Name

GetTransactionsRawTxid

##### Summary

Get raw transaction in hex format

##### Request

GET:/transactions/raw/{txId}

#### getTransactionsRichDetailsTxid()

> **getTransactionsRichDetailsTxid**: (`txId`, `query`?, `params`) => `Promise`\<[`RichTransaction`](../interfaces/RichTransaction.md)\>

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

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RichTransaction`](../interfaces/RichTransaction.md)\>

##### Tags

Transactions

##### Name

GetTransactionsRichDetailsTxid

##### Summary

Get transaction with enriched input information when node indexes are enabled.

##### Request

GET:/transactions/rich-details/{txId}

#### getTransactionsStatus()

> **getTransactionsStatus**: (`query`, `params`) => `Promise`\<[`Confirmed`](../interfaces/Confirmed.md) \| [`MemPooled`](../interfaces/MemPooled.md) \| [`TxNotFound`](../interfaces/TxNotFound.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Confirmed`](../interfaces/Confirmed.md) \| [`MemPooled`](../interfaces/MemPooled.md) \| [`TxNotFound`](../interfaces/TxNotFound.md)\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **postTransactionsBuild**: (`data`, `params`) => `Promise`\<[`BuildTransferTxResult`](../interfaces/BuildTransferTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildTransferTx`](../interfaces/BuildTransferTx.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildTransferTxResult`](../interfaces/BuildTransferTxResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsBuild

##### Summary

Build an unsigned transfer transaction to a number of recipients

##### Request

POST:/transactions/build

#### postTransactionsBuildChained()

> **postTransactionsBuildChained**: (`data`, `params`) => `Promise`\<[`BuildChainedTxResult`](../type-aliases/BuildChainedTxResult.md)[]\>

No description

##### Parameters

• **data**: [`BuildChainedTx`](../type-aliases/BuildChainedTx.md)[]

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildChainedTxResult`](../type-aliases/BuildChainedTxResult.md)[]\>

##### Tags

Transactions

##### Name

PostTransactionsBuildChained

##### Summary

Build a chain of transactions

##### Request

POST:/transactions/build-chained

#### postTransactionsBuildMultiAddresses()

> **postTransactionsBuildMultiAddresses**: (`data`, `params`) => `Promise`\<[`BuildTransferTxResult`](../interfaces/BuildTransferTxResult.md)\>

No description

##### Parameters

• **data**: [`BuildMultiAddressesTransaction`](../interfaces/BuildMultiAddressesTransaction.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildTransferTxResult`](../interfaces/BuildTransferTxResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsBuildMultiAddresses

##### Summary

Build an unsigned transaction with multiple addresses to a number of recipients

##### Request

POST:/transactions/build-multi-addresses

#### postTransactionsBuildTransferFromOneToManyGroups()

> **postTransactionsBuildTransferFromOneToManyGroups**: (`data`, `params`) => `Promise`\<[`BuildTransferTxResult`](../interfaces/BuildTransferTxResult.md)[]\>

No description

##### Parameters

• **data**: [`BuildTransferTx`](../interfaces/BuildTransferTx.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildTransferTxResult`](../interfaces/BuildTransferTxResult.md)[]\>

##### Tags

Transactions

##### Name

PostTransactionsBuildTransferFromOneToManyGroups

##### Summary

Build unsigned transfer transactions from an address of one group to addresses of many groups. Each target group requires a dedicated transaction or more in case large number of outputs needed to be split.

##### Request

POST:/transactions/build-transfer-from-one-to-many-groups

#### postTransactionsDecodeUnsignedTx()

> **postTransactionsDecodeUnsignedTx**: (`data`, `params`) => `Promise`\<[`DecodeUnsignedTxResult`](../interfaces/DecodeUnsignedTxResult.md)\>

No description

##### Parameters

• **data**: [`DecodeUnsignedTx`](../interfaces/DecodeUnsignedTx.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`DecodeUnsignedTxResult`](../interfaces/DecodeUnsignedTxResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsDecodeUnsignedTx

##### Summary

Decode an unsigned transaction

##### Request

POST:/transactions/decode-unsigned-tx

#### postTransactionsSubmit()

> **postTransactionsSubmit**: (`data`, `params`) => `Promise`\<[`SubmitTxResult`](../interfaces/SubmitTxResult.md)\>

No description

##### Parameters

• **data**: [`SubmitTransaction`](../interfaces/SubmitTransaction.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SubmitTxResult`](../interfaces/SubmitTxResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsSubmit

##### Summary

Submit a signed transaction

##### Request

POST:/transactions/submit

#### postTransactionsSweepAddressBuild()

> **postTransactionsSweepAddressBuild**: (`data`, `params`) => `Promise`\<[`BuildSweepAddressTransactionsResult`](../interfaces/BuildSweepAddressTransactionsResult.md)\>

No description

##### Parameters

• **data**: [`BuildSweepAddressTransactions`](../interfaces/BuildSweepAddressTransactions.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`BuildSweepAddressTransactionsResult`](../interfaces/BuildSweepAddressTransactionsResult.md)\>

##### Tags

Transactions

##### Name

PostTransactionsSweepAddressBuild

##### Summary

Build unsigned transactions to send all unlocked ALPH and token balances of one address to another address

##### Request

POST:/transactions/sweep-address/build

#### Defined in

[src/api/api-alephium.ts:2575](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L2575)

***

### utils

> **utils**: `object`

#### postUtilsTargetToHashrate()

> **postUtilsTargetToHashrate**: (`data`, `params`) => `Promise`\<[`Result`](../interfaces/Result.md)\>

No description

##### Parameters

• **data**: [`TargetToHashrate`](../interfaces/TargetToHashrate.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Result`](../interfaces/Result.md)\>

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

• **data**: [`VerifySignature`](../interfaces/VerifySignature.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

#### Defined in

[src/api/api-alephium.ts:3445](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L3445)

***

### wallets

> **wallets**: `object`

#### deleteWalletsWalletName()

> **deleteWalletsWalletName**: (`walletName`, `query`, `params`) => `Promise`\<`void`\>

No description

##### Parameters

• **walletName**: `string`

• **query**

• **query.password**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **getWallets**: (`params`) => `Promise`\<[`WalletStatus`](../interfaces/WalletStatus.md)[]\>

No description

##### Parameters

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`WalletStatus`](../interfaces/WalletStatus.md)[]\>

##### Tags

Wallets

##### Name

GetWallets

##### Summary

List available wallets

##### Request

GET:/wallets

#### getWalletsWalletName()

> **getWalletsWalletName**: (`walletName`, `params`) => `Promise`\<[`WalletStatus`](../interfaces/WalletStatus.md)\>

No description

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`WalletStatus`](../interfaces/WalletStatus.md)\>

##### Tags

Wallets

##### Name

GetWalletsWalletName

##### Summary

Get wallet's status

##### Request

GET:/wallets/{wallet_name}

#### getWalletsWalletNameAddresses()

> **getWalletsWalletNameAddresses**: (`walletName`, `params`) => `Promise`\<[`Addresses`](../interfaces/Addresses.md)\>

No description

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Addresses`](../interfaces/Addresses.md)\>

##### Tags

Wallets

##### Name

GetWalletsWalletNameAddresses

##### Summary

List all your wallet's addresses

##### Request

GET:/wallets/{wallet_name}/addresses

#### getWalletsWalletNameAddressesAddress()

> **getWalletsWalletNameAddressesAddress**: (`walletName`, `address`, `params`) => `Promise`\<[`AddressInfo`](../interfaces/AddressInfo.md)\>

No description

##### Parameters

• **walletName**: `string`

• **address**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressInfo`](../interfaces/AddressInfo.md)\>

##### Tags

Wallets

##### Name

GetWalletsWalletNameAddressesAddress

##### Summary

Get address' info

##### Request

GET:/wallets/{wallet_name}/addresses/{address}

#### getWalletsWalletNameBalances()

> **getWalletsWalletNameBalances**: (`walletName`, `params`) => `Promise`\<[`Balances`](../interfaces/Balances.md)\>

No description

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`Balances`](../interfaces/Balances.md)\>

##### Tags

Wallets

##### Name

GetWalletsWalletNameBalances

##### Summary

Get your total balance

##### Request

GET:/wallets/{wallet_name}/balances

#### getWalletsWalletNameMinerAddresses()

> **getWalletsWalletNameMinerAddresses**: (`walletName`, `params`) => `Promise`\<[`MinerAddressesInfo`](../interfaces/MinerAddressesInfo.md)[]\>

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`MinerAddressesInfo`](../interfaces/MinerAddressesInfo.md)[]\>

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

> **postWallets**: (`data`, `params`) => `Promise`\<[`WalletCreationResult`](../interfaces/WalletCreationResult.md)\>

##### Parameters

• **data**: [`WalletCreation`](../interfaces/WalletCreation.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`WalletCreationResult`](../interfaces/WalletCreationResult.md)\>

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

• **data**: [`ChangeActiveAddress`](../interfaces/ChangeActiveAddress.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **postWalletsWalletNameDeriveNextAddress**: (`walletName`, `query`?, `params`) => `Promise`\<[`AddressInfo`](../interfaces/AddressInfo.md)\>

##### Parameters

• **walletName**: `string`

• **query?**

• **query.group?**: `number`

**Format**

int32

• **params?**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressInfo`](../interfaces/AddressInfo.md)\>

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

> **postWalletsWalletNameDeriveNextMinerAddresses**: (`walletName`, `params`) => `Promise`\<[`AddressInfo`](../interfaces/AddressInfo.md)[]\>

##### Parameters

• **walletName**: `string`

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`AddressInfo`](../interfaces/AddressInfo.md)[]\>

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

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **postWalletsWalletNameRevealMnemonic**: (`walletName`, `data`, `params`) => `Promise`\<[`RevealMnemonicResult`](../interfaces/RevealMnemonicResult.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`RevealMnemonic`](../interfaces/RevealMnemonic.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`RevealMnemonicResult`](../interfaces/RevealMnemonicResult.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameRevealMnemonic

##### Summary

Reveal your mnemonic. !!! use it with caution !!!

##### Request

POST:/wallets/{wallet_name}/reveal-mnemonic

#### postWalletsWalletNameSign()

> **postWalletsWalletNameSign**: (`walletName`, `data`, `params`) => `Promise`\<[`SignResult`](../interfaces/SignResult.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`Sign`](../interfaces/Sign.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`SignResult`](../interfaces/SignResult.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameSign

##### Summary

Sign the given data and return back the signature

##### Request

POST:/wallets/{wallet_name}/sign

#### postWalletsWalletNameSweepActiveAddress()

> **postWalletsWalletNameSweepActiveAddress**: (`walletName`, `data`, `params`) => `Promise`\<[`TransferResults`](../interfaces/TransferResults.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`Sweep`](../interfaces/Sweep.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TransferResults`](../interfaces/TransferResults.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameSweepActiveAddress

##### Summary

Transfer all unlocked ALPH from the active address to another address

##### Request

POST:/wallets/{wallet_name}/sweep-active-address

#### postWalletsWalletNameSweepAllAddresses()

> **postWalletsWalletNameSweepAllAddresses**: (`walletName`, `data`, `params`) => `Promise`\<[`TransferResults`](../interfaces/TransferResults.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`Sweep`](../interfaces/Sweep.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TransferResults`](../interfaces/TransferResults.md)\>

##### Tags

Wallets

##### Name

PostWalletsWalletNameSweepAllAddresses

##### Summary

Transfer unlocked ALPH from all addresses (including all mining addresses if applicable) to another address

##### Request

POST:/wallets/{wallet_name}/sweep-all-addresses

#### postWalletsWalletNameTransfer()

> **postWalletsWalletNameTransfer**: (`walletName`, `data`, `params`) => `Promise`\<[`TransferResult`](../interfaces/TransferResult.md)\>

No description

##### Parameters

• **walletName**: `string`

• **data**: [`Transfer`](../interfaces/Transfer.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`TransferResult`](../interfaces/TransferResult.md)\>

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

• **data**: [`WalletUnlock`](../interfaces/WalletUnlock.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

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

> **putWallets**: (`data`, `params`) => `Promise`\<[`WalletRestoreResult`](../interfaces/WalletRestoreResult.md)\>

No description

##### Parameters

• **data**: [`WalletRestore`](../interfaces/WalletRestore.md)

• **params**: [`RequestParams`](../type-aliases/RequestParams.md) = `{}`

##### Returns

`Promise`\<[`WalletRestoreResult`](../interfaces/WalletRestoreResult.md)\>

##### Tags

Wallets

##### Name

PutWallets

##### Summary

Restore a wallet from your mnemonic

##### Request

PUT:/wallets

#### Defined in

[src/api/api-alephium.ts:1654](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1654)

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

[src/api/api-alephium.ts:1580](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1580)

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

[src/api/api-alephium.ts:1515](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1515)

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

[src/api/api-alephium.ts:1511](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1511)

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

[src/api/api-alephium.ts:1528](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1528)

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

[src/api/api-alephium.ts:1566](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1566)

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

[src/api/api-alephium.ts:1506](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1506)

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

[src/api/api-alephium.ts:1553](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1553)

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

[src/api/api-alephium.ts:1589](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1589)

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

[src/api/api-alephium.ts:1502](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1502)

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

[src/api/api-alephium.ts:1520](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/api/api-alephium.ts#L1520)
