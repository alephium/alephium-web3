[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / Artifact

# Class: `abstract` Artifact

## Extended by

- [`Contract`](Contract.md)
- [`Script`](Script.md)

## Constructors

### new Artifact()

> **new Artifact**(`version`, `name`, `functions`): [`Artifact`](Artifact.md)

#### Parameters

• **version**: `string`

• **name**: `string`

• **functions**: [`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Returns

[`Artifact`](Artifact.md)

#### Defined in

[src/contract/contract.ts:163](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L163)

## Properties

### functions

> `readonly` **functions**: [`FunctionSig`](../type-aliases/FunctionSig.md)[]

#### Defined in

[src/contract/contract.ts:161](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L161)

***

### name

> `readonly` **name**: `string`

#### Defined in

[src/contract/contract.ts:160](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L160)

***

### version

> `readonly` **version**: `string`

#### Defined in

[src/contract/contract.ts:159](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L159)

## Methods

### buildByteCodeToDeploy()

> `abstract` **buildByteCodeToDeploy**(`initialFields`, `isDevnet`, `exposePrivateFunctions`): `string`

#### Parameters

• **initialFields**: [`NamedVals`](../type-aliases/NamedVals.md)

• **isDevnet**: `boolean`

• **exposePrivateFunctions**: `boolean`

#### Returns

`string`

#### Defined in

[src/contract/contract.ts:169](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L169)

***

### isDevnet()

> **isDevnet**(`signer`): `Promise`\<`boolean`\>

#### Parameters

• **signer**: [`SignerProvider`](SignerProvider.md)

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/contract/contract.ts:171](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/contract.ts#L171)
