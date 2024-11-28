[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / ScriptSimulator

# Class: ScriptSimulator

## Constructors

### new ScriptSimulator()

> **new ScriptSimulator**(): [`ScriptSimulator`](ScriptSimulator.md)

#### Returns

[`ScriptSimulator`](ScriptSimulator.md)

## Methods

### extractContractCalls()

> `static` **extractContractCalls**(`unsignedTx`): [`ContractCall`](../interfaces/ContractCall.md)[]

#### Parameters

• **unsignedTx**: `string`

#### Returns

[`ContractCall`](../interfaces/ContractCall.md)[]

#### Defined in

[src/contract/script-simulator.ts:48](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/script-simulator.ts#L48)

***

### extractContractCallsFromMainMethod()

> `static` **extractContractCallsFromMainMethod**(`mainMethod`): [`ContractCall`](../interfaces/ContractCall.md)[]

#### Parameters

• **mainMethod**: [`Method`](../namespaces/codec/interfaces/Method.md)

#### Returns

[`ContractCall`](../interfaces/ContractCall.md)[]

#### Defined in

[src/contract/script-simulator.ts:81](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/script-simulator.ts#L81)

***

### extractContractCallsFromScript()

> `static` **extractContractCallsFromScript**(`script`): [`ContractCall`](../interfaces/ContractCall.md)[]

#### Parameters

• **script**: [`Script`](../namespaces/codec/namespaces/script/interfaces/Script.md)

#### Returns

[`ContractCall`](../interfaces/ContractCall.md)[]

#### Defined in

[src/contract/script-simulator.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/script-simulator.ts#L71)

***

### extractContractCallsWithErrors()

> `static` **extractContractCallsWithErrors**(`unsignedTx`): [`ContractCall`](../interfaces/ContractCall.md)[]

#### Parameters

• **unsignedTx**: `string`

#### Returns

[`ContractCall`](../interfaces/ContractCall.md)[]

#### Defined in

[src/contract/script-simulator.ts:57](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/contract/script-simulator.ts#L57)
