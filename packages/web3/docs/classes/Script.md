[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / Script

# Class: Script

## Extends

- [`Artifact`](Artifact.md)

## Constructors

### new Script()

> **new Script**(`version`, `name`, `bytecodeTemplate`, `bytecodeDebugPatch`, `fieldsSig`, `functions`, `structs`): [`Script`](Script.md)

#### Parameters

• **version**: `string`

• **name**: `string`

• **bytecodeTemplate**: `string`

• **bytecodeDebugPatch**: `string`

• **fieldsSig**: [`FieldsSig`](../namespaces/node/interfaces/FieldsSig.md)

• **functions**: [`FunctionSig`](../type-aliases/FunctionSig.md)[]

• **structs**: [`Struct`](Struct.md)[]

#### Returns

[`Script`](Script.md)

#### Overrides

[`Artifact`](Artifact.md).[`constructor`](Artifact.md#constructors)

#### Defined in

[src/contract/contract.ts:690](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L690)

## Properties

### bytecodeDebugPatch

> `readonly` **bytecodeDebugPatch**: `string`

#### Defined in

[src/contract/contract.ts:686](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L686)

***

### bytecodeTemplate

> `readonly` **bytecodeTemplate**: `string`

#### Defined in

[src/contract/contract.ts:685](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L685)

***

### fieldsSig

> `readonly` **fieldsSig**: [`FieldsSig`](../namespaces/node/interfaces/FieldsSig.md)

#### Defined in

[src/contract/contract.ts:687](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L687)

***

### functions

> `readonly` **functions**: [`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Inherited from

[`Artifact`](Artifact.md).[`functions`](Artifact.md#functions)

#### Defined in

[src/contract/contract.ts:161](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L161)

***

### name

> `readonly` **name**: `string`

#### Inherited from

[`Artifact`](Artifact.md).[`name`](Artifact.md#name)

#### Defined in

[src/contract/contract.ts:160](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L160)

***

### structs

> `readonly` **structs**: [`Struct`](Struct.md)[]

#### Defined in

[src/contract/contract.ts:688](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L688)

***

### version

> `readonly` **version**: `string`

#### Inherited from

[`Artifact`](Artifact.md).[`version`](Artifact.md#version)

#### Defined in

[src/contract/contract.ts:159](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L159)

## Methods

### buildByteCodeToDeploy()

> **buildByteCodeToDeploy**(`initialFields`): `string`

#### Parameters

• **initialFields**: [`NamedVals`](../type-aliases/NamedVals.md)

#### Returns

`string`

#### Overrides

[`Artifact`](Artifact.md).[`buildByteCodeToDeploy`](Artifact.md#buildbytecodetodeploy)

#### Defined in

[src/contract/contract.ts:774](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L774)

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

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Defined in

[src/contract/contract.ts:746](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L746)

***

### txParamsForExecution()

> **txParamsForExecution**\<`P`\>(`signer`, `params`): `Promise`\<[`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)\>

#### Type Parameters

• **P** *extends* [`NamedVals`](../type-aliases/NamedVals.md)

#### Parameters

• **signer**: [`SignerProvider`](SignerProvider.md)

• **params**: [`ExecuteScriptParams`](../interfaces/ExecuteScriptParams.md)\<`P`\>

#### Returns

`Promise`\<[`SignExecuteScriptTxParams`](../interfaces/SignExecuteScriptTxParams.md)\>

#### Defined in

[src/contract/contract.ts:757](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L757)

***

### fromArtifactFile()

> `static` **fromArtifactFile**(`path`, `bytecodeDebugPatch`, `structs`): `Promise`\<[`Script`](Script.md)\>

#### Parameters

• **path**: `string`

• **bytecodeDebugPatch**: `string`

• **structs**: [`Struct`](Struct.md)[] = `[]`

#### Returns

`Promise`\<[`Script`](Script.md)\>

#### Defined in

[src/contract/contract.ts:740](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L740)

***

### fromCompileResult()

> `static` **fromCompileResult**(`result`, `structs`): [`Script`](Script.md)

#### Parameters

• **result**: [`CompileScriptResult`](../namespaces/node/interfaces/CompileScriptResult.md)

• **structs**: [`Struct`](Struct.md)[] = `[]`

#### Returns

[`Script`](Script.md)

#### Defined in

[src/contract/contract.ts:706](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L706)

***

### fromJson()

> `static` **fromJson**(`artifact`, `bytecodeDebugPatch`, `structs`): [`Script`](Script.md)

#### Parameters

• **artifact**: `any`

• **bytecodeDebugPatch**: `string` = `''`

• **structs**: [`Struct`](Struct.md)[] = `[]`

#### Returns

[`Script`](Script.md)

#### Defined in

[src/contract/contract.ts:719](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L719)
