[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / ContractFactory

# Class: `abstract` ContractFactory\<I, F\>

## Type Parameters

• **I** *extends* [`ContractInstance`](ContractInstance.md)

• **F** *extends* [`Fields`](../type-aliases/Fields.md) = [`Fields`](../type-aliases/Fields.md)

## Constructors

### new ContractFactory()

> **new ContractFactory**\<`I`, `F`\>(`contract`): [`ContractFactory`](ContractFactory.md)\<`I`, `F`\>

#### Parameters

• **contract**: [`Contract`](Contract.md)

#### Returns

[`ContractFactory`](ContractFactory.md)\<`I`, `F`\>

#### Defined in

[src/contract/contract.ts:1055](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1055)

## Properties

### contract

> `readonly` **contract**: [`Contract`](Contract.md)

#### Defined in

[src/contract/contract.ts:1053](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1053)

## Methods

### at()

> `abstract` **at**(`address`): `I`

#### Parameters

• **address**: `string`

#### Returns

`I`

#### Defined in

[src/contract/contract.ts:1059](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1059)

***

### deploy()

> **deploy**(`signer`, `deployParams`): `Promise`\<[`DeployContractResult`](../type-aliases/DeployContractResult.md)\<`I`\>\>

#### Parameters

• **signer**: [`SignerProvider`](SignerProvider.md)

• **deployParams**: [`DeployContractParams`](../interfaces/DeployContractParams.md)\<`F`\>

#### Returns

`Promise`\<[`DeployContractResult`](../type-aliases/DeployContractResult.md)\<`I`\>\>

#### Defined in

[src/contract/contract.ts:1061](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1061)

***

### deployTemplate()

> **deployTemplate**(`signer`): `Promise`\<[`DeployContractResult`](../type-aliases/DeployContractResult.md)\<`I`\>\>

#### Parameters

• **signer**: [`SignerProvider`](SignerProvider.md)

#### Returns

`Promise`\<[`DeployContractResult`](../type-aliases/DeployContractResult.md)\<`I`\>\>

#### Defined in

[src/contract/contract.ts:1073](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1073)

***

### stateForTest\_()

> `protected` **stateForTest\_**(`initFields`, `asset`?, `address`?, `maps`?): [`ContractState`](../interfaces/ContractState.md)\<`F`\> \| [`ContractStateWithMaps`](../interfaces/ContractStateWithMaps.md)\<`F`, `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>\>

#### Parameters

• **initFields**: `F`

• **asset?**: [`Asset`](../interfaces/Asset.md)

• **address?**: `string`

• **maps?**: `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>

#### Returns

[`ContractState`](../interfaces/ContractState.md)\<`F`\> \| [`ContractStateWithMaps`](../interfaces/ContractStateWithMaps.md)\<`F`, `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>\>

#### Defined in

[src/contract/contract.ts:1080](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/contract.ts#L1080)
