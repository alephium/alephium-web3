[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / Contract

# Class: Contract

## Extends

- [`Artifact`](Artifact.md)

## Constructors

### new Contract()

> **new Contract**(`version`, `name`, `bytecode`, `bytecodeDebugPatch`, `codeHash`, `codeHashDebug`, `fieldsSig`, `eventsSig`, `functions`, `constants`, `enums`, `structs`, `mapsSig`?, `stdInterfaceId`?): [`Contract`](Contract.md)

#### Parameters

• **version**: `string`

• **name**: `string`

• **bytecode**: `string`

• **bytecodeDebugPatch**: `string`

• **codeHash**: `string`

• **codeHashDebug**: `string`

• **fieldsSig**: [`FieldsSig`](../namespaces/node/interfaces/FieldsSig.md)

• **eventsSig**: [`EventSig`](../namespaces/node/interfaces/EventSig.md)[]

• **functions**: [`FunctionSig`](../type-aliases/FunctionSig.md)[]

• **constants**: [`Constant`](../namespaces/node/interfaces/Constant.md)[]

• **enums**: [`Enum`](../namespaces/node/interfaces/Enum.md)[]

• **structs**: [`Struct`](Struct.md)[]

• **mapsSig?**: [`MapsSig`](../namespaces/node/interfaces/MapsSig.md)

• **stdInterfaceId?**: `string`

#### Returns

[`Contract`](Contract.md)

#### Overrides

[`Artifact`](Artifact.md).[`constructor`](Artifact.md#constructors)

#### Defined in

[src/contract/contract.ts:209](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L209)

## Properties

### bytecode

> `readonly` **bytecode**: `string`

#### Defined in

[src/contract/contract.ts:191](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L191)

***

### bytecodeDebug

> `readonly` **bytecodeDebug**: `string`

#### Defined in

[src/contract/contract.ts:202](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L202)

***

### bytecodeDebugPatch

> `readonly` **bytecodeDebugPatch**: `string`

#### Defined in

[src/contract/contract.ts:192](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L192)

***

### codeHash

> `readonly` **codeHash**: `string`

#### Defined in

[src/contract/contract.ts:193](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L193)

***

### codeHashDebug

> `readonly` **codeHashDebug**: `string`

#### Defined in

[src/contract/contract.ts:203](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L203)

***

### constants

> `readonly` **constants**: [`Constant`](../namespaces/node/interfaces/Constant.md)[]

#### Defined in

[src/contract/contract.ts:196](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L196)

***

### decodedContract

> `readonly` **decodedContract**: [`Contract`](../namespaces/codec/namespaces/contract/interfaces/Contract.md)

#### Defined in

[src/contract/contract.ts:204](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L204)

***

### enums

> `readonly` **enums**: [`Enum`](../namespaces/node/interfaces/Enum.md)[]

#### Defined in

[src/contract/contract.ts:197](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L197)

***

### eventsSig

> `readonly` **eventsSig**: [`EventSig`](../namespaces/node/interfaces/EventSig.md)[]

#### Defined in

[src/contract/contract.ts:195](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L195)

***

### fieldsSig

> `readonly` **fieldsSig**: [`FieldsSig`](../namespaces/node/interfaces/FieldsSig.md)

#### Defined in

[src/contract/contract.ts:194](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L194)

***

### functions

> `readonly` **functions**: [`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Inherited from

[`Artifact`](Artifact.md).[`functions`](Artifact.md#functions)

#### Defined in

[src/contract/contract.ts:161](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L161)

***

### mapsSig?

> `readonly` `optional` **mapsSig**: [`MapsSig`](../namespaces/node/interfaces/MapsSig.md)

#### Defined in

[src/contract/contract.ts:199](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L199)

***

### name

> `readonly` **name**: `string`

#### Inherited from

[`Artifact`](Artifact.md).[`name`](Artifact.md#name)

#### Defined in

[src/contract/contract.ts:160](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L160)

***

### stdInterfaceId?

> `readonly` `optional` **stdInterfaceId**: `string`

#### Defined in

[src/contract/contract.ts:200](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L200)

***

### structs

> `readonly` **structs**: [`Struct`](Struct.md)[]

#### Defined in

[src/contract/contract.ts:198](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L198)

***

### version

> `readonly` **version**: `string`

#### Inherited from

[`Artifact`](Artifact.md).[`version`](Artifact.md#version)

#### Defined in

[src/contract/contract.ts:159](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L159)

***

### ContractCreatedEvent

> `static` **ContractCreatedEvent**: [`EventSig`](../namespaces/node/interfaces/EventSig.md)

#### Defined in

[src/contract/contract.ts:498](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L498)

***

### ContractCreatedEventIndex

> `static` **ContractCreatedEventIndex**: `number` = `-1`

#### Defined in

[src/contract/contract.ts:497](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L497)

***

### ContractDestroyedEvent

> `static` **ContractDestroyedEvent**: [`EventSig`](../namespaces/node/interfaces/EventSig.md)

#### Defined in

[src/contract/contract.ts:505](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L505)

***

### ContractDestroyedEventIndex

> `static` **ContractDestroyedEventIndex**: `number` = `-2`

#### Defined in

[src/contract/contract.ts:504](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L504)

***

### DebugEventIndex

> `static` **DebugEventIndex**: `number` = `-3`

#### Defined in

[src/contract/contract.ts:510](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L510)

## Methods

### buildByteCodeToDeploy()

> **buildByteCodeToDeploy**(`initialFields`, `isDevnet`, `exposePrivateFunctions`): `string`

#### Parameters

• **initialFields**: [`NamedVals`](../type-aliases/NamedVals.md)

• **isDevnet**: `boolean`

• **exposePrivateFunctions**: `boolean` = `false`

#### Returns

`string`

#### Overrides

[`Artifact`](Artifact.md).[`buildByteCodeToDeploy`](Artifact.md#buildbytecodetodeploy)

#### Defined in

[src/contract/contract.ts:596](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L596)

***

### fromApiCallContractResult()

> **fromApiCallContractResult**(`result`, `txId`, `methodIndex`, `getContractByCodeHash`): [`CallContractResult`](../interfaces/CallContractResult.md)\<`unknown`\>

#### Parameters

• **result**: [`CallContractResult`](../namespaces/node/type-aliases/CallContractResult.md)

• **txId**: `string`

• **methodIndex**: `number`

• **getContractByCodeHash**

#### Returns

[`CallContractResult`](../interfaces/CallContractResult.md)\<`unknown`\>

#### Defined in

[src/contract/contract.ts:649](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L649)

***

### fromApiContractState()

> **fromApiContractState**(`state`): [`ContractState`](../interfaces/ContractState.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>

#### Parameters

• **state**: [`ContractState`](../namespaces/node/interfaces/ContractState.md)

#### Returns

[`ContractState`](../interfaces/ContractState.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>

#### Defined in

[src/contract/contract.ts:476](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L476)

***

### fromApiTestContractResult()

> **fromApiTestContractResult**(`methodName`, `result`, `txId`, `getContractByCodeHash`): [`TestContractResult`](../interfaces/TestContractResult.md)\<`unknown`, `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>\>

#### Parameters

• **methodName**: `string`

• **result**: [`TestContractResult`](../namespaces/node/interfaces/TestContractResult.md)

• **txId**: `string`

• **getContractByCodeHash**

#### Returns

[`TestContractResult`](../interfaces/TestContractResult.md)\<`unknown`, `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>\>

#### Defined in

[src/contract/contract.ts:544](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L544)

***

### getByteCodeForTesting()

> **getByteCodeForTesting**(): `string`

#### Returns

`string`

#### Defined in

[src/contract/contract.ts:245](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L245)

***

### getDecodedMethod()

> **getDecodedMethod**(`methodIndex`): [`Method`](../namespaces/codec/interfaces/Method.md)

#### Parameters

• **methodIndex**: `number`

#### Returns

[`Method`](../namespaces/codec/interfaces/Method.md)

#### Defined in

[src/contract/contract.ts:270](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L270)

***

### getInitialFieldsWithDefaultValues()

> **getInitialFieldsWithDefaultValues**(): [`NamedVals`](../type-aliases/NamedVals.md)

#### Returns

[`NamedVals`](../type-aliases/NamedVals.md)

#### Defined in

[src/contract/contract.ts:376](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L376)

***

### getMethodIndex()

> **getMethodIndex**(`funcName`): `number`

#### Parameters

• **funcName**: `string`

#### Returns

`number`

#### Defined in

[src/contract/contract.ts:437](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L437)

***

### hasCodeHash()

> **hasCodeHash**(`hash`): `boolean`

#### Parameters

• **hash**: `string`

#### Returns

`boolean`

#### Defined in

[src/contract/contract.ts:266](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L266)

***

### isDevnet()

> **isDevnet**(`signer`): `Promise`\<`boolean`\>

#### Parameters

• **signer**: [`SignerProvider`](SignerProvider.md)

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`Artifact`](Artifact.md).[`isDevnet`](Artifact.md#isdevnet)

#### Defined in

[src/contract/contract.ts:171](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L171)

***

### isMethodUsePreapprovedAssets()

> **isMethodUsePreapprovedAssets**(`methodIndex`): `boolean`

#### Parameters

• **methodIndex**: `number`

#### Returns

`boolean`

#### Defined in

[src/contract/contract.ts:286](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L286)

***

### printDebugMessages()

> **printDebugMessages**(`funcName`, `messages`): `void`

#### Parameters

• **funcName**: `string`

• **messages**: [`DebugMessage`](../namespaces/node/interfaces/DebugMessage.md)[]

#### Returns

`void`

#### Defined in

[src/contract/contract.ts:409](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L409)

***

### publicFunctions()

> **publicFunctions**(): [`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Returns

[`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Defined in

[src/contract/contract.ts:274](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L274)

***

### toApiArgs()

> **toApiArgs**(`funcName`, `args`?): [`Val`](../namespaces/node/type-aliases/Val.md)[]

#### Parameters

• **funcName**: `string`

• **args?**: [`NamedVals`](../type-aliases/NamedVals.md)

#### Returns

[`Val`](../namespaces/node/type-aliases/Val.md)[]

#### Defined in

[src/contract/contract.ts:424](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L424)

***

### toApiCallContract()

> **toApiCallContract**\<`T`\>(`params`, `groupIndex`, `contractAddress`, `methodIndex`): [`CallContract`](../namespaces/node/interfaces/CallContract.md)

#### Type Parameters

• **T** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

#### Parameters

• **params**: [`CallContractParams`](../interfaces/CallContractParams.md)\<`T`\>

• **groupIndex**: `number`

• **contractAddress**: `string`

• **methodIndex**: `number`

#### Returns

[`CallContract`](../namespaces/node/interfaces/CallContract.md)

#### Defined in

[src/contract/contract.ts:631](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L631)

***

### toApiContractStates()

> **toApiContractStates**(`states`?): `undefined` \| [`ContractState`](../namespaces/node/interfaces/ContractState.md)[]

#### Parameters

• **states?**: [`ContractState`](../interfaces/ContractState.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>[]

#### Returns

`undefined` \| [`ContractState`](../namespaces/node/interfaces/ContractState.md)[]

#### Defined in

[src/contract/contract.ts:441](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L441)

***

### toApiFields()

> **toApiFields**(`fields`?): [`Val`](../namespaces/node/type-aliases/Val.md)[]

#### Parameters

• **fields?**: [`NamedVals`](../type-aliases/NamedVals.md)

#### Returns

[`Val`](../namespaces/node/type-aliases/Val.md)[]

#### Defined in

[src/contract/contract.ts:416](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L416)

***

### toApiTestContractParams()

> **toApiTestContractParams**(`funcName`, `params`): [`TestContract`](../namespaces/node/interfaces/TestContract.md)

#### Parameters

• **funcName**: `string`

• **params**: [`TestContractParams`](../interfaces/TestContractParams.md)\<[`NamedVals`](../type-aliases/NamedVals.md), [`NamedVals`](../type-aliases/NamedVals.md), `Record`\<`string`, `Map`\<[`Val`](../type-aliases/Val.md), [`Val`](../type-aliases/Val.md)\>\>\>

#### Returns

[`TestContract`](../namespaces/node/interfaces/TestContract.md)

#### Defined in

[src/contract/contract.ts:445](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L445)

***

### toState()

> **toState**\<`T`\>(`fields`, `asset`, `address`?): [`ContractState`](../interfaces/ContractState.md)\<`T`\>

#### Type Parameters

• **T** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

#### Parameters

• **fields**: `T`

• **asset**: [`Asset`](../interfaces/Asset.md)

• **address?**: `string`

#### Returns

[`ContractState`](../interfaces/ContractState.md)\<`T`\>

#### Defined in

[src/contract/contract.ts:388](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L388)

***

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Defined in

[src/contract/contract.ts:355](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L355)

***

### txParamsForDeployment()

> **txParamsForDeployment**\<`P`\>(`signer`, `params`): `Promise`\<[`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)\>

#### Type Parameters

• **P** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

#### Parameters

• **signer**: [`SignerProvider`](SignerProvider.md)

• **params**: [`DeployContractParams`](../interfaces/DeployContractParams.md)\<`P`\>

#### Returns

`Promise`\<[`SignDeployContractTxParams`](../interfaces/SignDeployContractTxParams.md)\>

#### Defined in

[src/contract/contract.ts:570](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L570)

***

### usingAssetsInContractFunctions()

> **usingAssetsInContractFunctions**(): [`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Returns

[`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Defined in

[src/contract/contract.ts:282](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L282)

***

### usingPreapprovedAssetsFunctions()

> **usingPreapprovedAssetsFunctions**(): [`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Returns

[`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Defined in

[src/contract/contract.ts:278](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L278)

***

### fromApiContractState()

> `static` **fromApiContractState**(`state`, `getContractByCodeHash`): [`ContractState`](../interfaces/ContractState.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>

#### Parameters

• **state**: [`ContractState`](../namespaces/node/interfaces/ContractState.md)

• **getContractByCodeHash**

#### Returns

[`ContractState`](../interfaces/ContractState.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>

#### Defined in

[src/contract/contract.ts:489](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L489)

***

### fromApiEvent()

> `static` **fromApiEvent**(`event`, `codeHash`, `txId`, `getContractByCodeHash`): [`ContractEvent`](../interfaces/ContractEvent.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>

#### Parameters

• **event**: [`ContractEventByTxId`](../namespaces/node/interfaces/ContractEventByTxId.md)

• **codeHash**: `undefined` \| `string`

• **txId**: `string`

• **getContractByCodeHash**

#### Returns

[`ContractEvent`](../interfaces/ContractEvent.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>

#### Defined in

[src/contract/contract.ts:512](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L512)

***

### fromApiEvents()

> `static` **fromApiEvents**(`events`, `addressToCodeHash`, `txId`, `getContractByCodeHash`): [`ContractEvent`](../interfaces/ContractEvent.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>[]

#### Parameters

• **events**: [`ContractEventByTxId`](../namespaces/node/interfaces/ContractEventByTxId.md)[]

• **addressToCodeHash**: `Map`\<`string`, `string`\>

• **txId**: `string`

• **getContractByCodeHash**

#### Returns

[`ContractEvent`](../interfaces/ContractEvent.md)\<[`NamedVals`](../type-aliases/NamedVals.md)\>[]

#### Defined in

[src/contract/contract.ts:614](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L614)

***

### fromArtifactFile()

> `static` **fromArtifactFile**(`path`, `bytecodeDebugPatch`, `codeHashDebug`, `structs`): `Promise`\<[`Contract`](Contract.md)\>

#### Parameters

• **path**: `string`

• **bytecodeDebugPatch**: `string`

• **codeHashDebug**: `string`

• **structs**: [`Struct`](Struct.md)[] = `[]`

#### Returns

`Promise`\<[`Contract`](Contract.md)\>

#### Defined in

[src/contract/contract.ts:344](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L344)

***

### fromCompileResult()

> `static` **fromCompileResult**(`result`, `structs`): [`Contract`](Contract.md)

#### Parameters

• **result**: [`CompileContractResult`](../namespaces/node/interfaces/CompileContractResult.md)

• **structs**: [`Struct`](Struct.md)[] = `[]`

#### Returns

[`Contract`](Contract.md)

#### Defined in

[src/contract/contract.ts:324](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L324)

***

### fromJson()

> `static` **fromJson**(`artifact`, `bytecodeDebugPatch`, `codeHashDebug`, `structs`): [`Contract`](Contract.md)

#### Parameters

• **artifact**: `any`

• **bytecodeDebugPatch**: `string` = `''`

• **codeHashDebug**: `string` = `''`

• **structs**: [`Struct`](Struct.md)[] = `[]`

#### Returns

[`Contract`](Contract.md)

#### Defined in

[src/contract/contract.ts:291](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L291)

***

### randomAddress()

> `static` **randomAddress**(): `string`

#### Returns

`string`

#### Defined in

[src/contract/contract.ts:402](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L402)
