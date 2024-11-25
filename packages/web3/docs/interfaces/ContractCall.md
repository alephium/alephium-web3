[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / ContractCall

# Interface: ContractCall

Contract call extracted from a script

## Param

the address of the contract

## Param

the amount of ALPH approved to the contract
  - undefined if no ALPH is approved
  - 'unknown' if the amount cannot be determined
  - a number if the amount is known

## Param

the tokens approved to the contract
 - undefined if no tokens are approved
 - 'unknown' if the tokens cannot be determined
 - an array of tokens if the tokens are known

## Properties

### approvedAttoAlphAmount?

> `optional` **approvedAttoAlphAmount**: `bigint` \| `"unknown"`

#### Defined in

[src/contract/script-simulator.ts:42](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/script-simulator.ts#L42)

***

### approvedTokens?

> `optional` **approvedTokens**: `"unknown"` \| [`Token`](Token.md)[]

#### Defined in

[src/contract/script-simulator.ts:43](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/script-simulator.ts#L43)

***

### contractAddress

> **contractAddress**: `string`

#### Defined in

[src/contract/script-simulator.ts:41](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/script-simulator.ts#L41)
