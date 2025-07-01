/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { Number256, Token } from '../api'
import { node } from '../api'
import { SimulationResult } from '../api/api-alephium'
import { Eq, assertType, NetworkId } from '../utils'

export type Address = string

export type OutputRef = node.OutputRef

export interface Destination {
  address: string
  attoAlphAmount: Number256
  tokens?: Token[]
  lockTime?: number
  message?: string
}
assertType<Eq<keyof Destination, keyof node.Destination>>

export const groupedKeyTypes = ['default', 'bip340-schnorr'] as const
export const grouplessKeyTypes = ['gl-secp256k1', 'gl-secp256r1', 'gl-ed25519', 'gl-webauthn'] as const
export const keyTypes = [...groupedKeyTypes, ...grouplessKeyTypes] as const

export type GroupedKeyType = (typeof groupedKeyTypes)[number]
export type GrouplessKeyType = (typeof grouplessKeyTypes)[number]

export type KeyType = GroupedKeyType | GrouplessKeyType

export interface GroupedAccount {
  keyType: GroupedKeyType
  address: string
  group: number
  publicKey: string
}

export interface GrouplessAccount {
  keyType: GrouplessKeyType
  address: string
  publicKey: string
}

export type Account = GroupedAccount | GrouplessAccount

export function isGroupedKeyType(keyType: KeyType): keyType is GroupedKeyType {
  return keyType === 'default' || keyType === 'bip340-schnorr'
}

export function isGrouplessKeyType(keyType: KeyType): keyType is GrouplessKeyType {
  return keyType !== 'default' && keyType !== 'bip340-schnorr'
}

export function isGroupedAccount(account: Account): account is GroupedAccount {
  return isGroupedKeyType(account.keyType)
}

export function isGrouplessAccount(account: Account): account is GrouplessAccount {
  return isGrouplessKeyType(account.keyType)
}

export type SignerAddress = { signerAddress: string; signerKeyType?: KeyType }
type TxBuildParams<T> = Omit<T, 'fromPublicKey' | 'fromPublicKeyType' | 'targetBlockHash'> & SignerAddress
type SignResult<T> = Omit<T, 'gasPrice' | 'type'> & { signature: string; gasPrice: Number256 }

export interface SignTransferTxParams {
  signerAddress: string
  signerKeyType?: KeyType
  destinations: Destination[]
  utxos?: OutputRef[]
  gasAmount?: number
  gasPrice?: Number256
  group?: number
}
assertType<Eq<keyof SignTransferTxParams, keyof TxBuildParams<node.BuildTransferTx>>>()
export interface SignTransferTxResult {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
  signature: string
  gasAmount: number
  gasPrice: Number256
}
assertType<Eq<SignTransferTxResult, SignResult<node.BuildSimpleTransferTxResult>>>()

export interface SignDeployContractTxParams {
  signerAddress: string
  signerKeyType?: KeyType
  bytecode: string
  initialAttoAlphAmount?: Number256
  initialTokenAmounts?: Token[]
  issueTokenAmount?: Number256
  issueTokenTo?: string
  gasAmount?: number
  gasPrice?: Number256
  group?: number
}
assertType<Eq<keyof SignDeployContractTxParams, keyof TxBuildParams<node.BuildDeployContractTx>>>()
export interface SignDeployContractTxResult {
  groupIndex: number
  unsignedTx: string
  txId: string
  signature: string
  contractId: string
  contractAddress: string
  gasAmount: number
  gasPrice: Number256
}
assertType<
  Eq<
    Omit<SignDeployContractTxResult, 'groupIndex'>,
    Omit<SignResult<node.BuildSimpleDeployContractTxResult> & { contractId: string }, 'fromGroup' | 'toGroup'>
  >
>()

export interface SignExecuteScriptTxParams {
  signerAddress: string
  signerKeyType?: KeyType
  bytecode: string
  attoAlphAmount?: Number256
  tokens?: Token[]
  gasAmount?: number
  gasPrice?: Number256
  gasEstimationMultiplier?: number
  group?: number
  dustAmount?: Number256
}
assertType<Eq<keyof SignExecuteScriptTxParams, keyof TxBuildParams<node.BuildExecuteScriptTx>>>()
export interface SignExecuteScriptTxResult {
  groupIndex: number
  unsignedTx: string
  txId: string
  signature: string
  gasAmount: number
  gasPrice: Number256
  simulationResult: SimulationResult
}
assertType<
  Eq<
    Omit<SignExecuteScriptTxResult, 'groupIndex'>,
    Omit<SignResult<node.BuildSimpleExecuteScriptTxResult>, 'fromGroup' | 'toGroup'>
  >
>()

export type GrouplessBuildTxResult<
  T extends SignExecuteScriptTxResult | SignDeployContractTxResult | SignTransferTxResult
> = {
  fundingTxs?: Omit<SignTransferTxResult, 'signature'>[]
} & Omit<T, 'signature'>

export type BuildTxResult<T extends SignExecuteScriptTxResult | SignDeployContractTxResult | SignTransferTxResult> =
  | GrouplessBuildTxResult<T>
  | Omit<T, 'signature'>

export type GrouplessSignTxResult<
  T extends SignExecuteScriptTxResult | SignDeployContractTxResult | SignTransferTxResult
> = {
  fundingTxs?: SignTransferTxResult[]
} & T

export type SignTxResult<T extends SignExecuteScriptTxResult | SignDeployContractTxResult | SignTransferTxResult> =
  | T
  | GrouplessSignTxResult<T>

export interface SignUnsignedTxParams {
  signerAddress: string
  signerKeyType?: KeyType
  unsignedTx: string
}
assertType<Eq<SignUnsignedTxParams, { unsignedTx: string } & SignerAddress>>()
export interface SignUnsignedTxResult {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
  signature: string
  gasAmount: number
  gasPrice: Number256
}
assertType<Eq<SignUnsignedTxResult, SignTransferTxResult>>

export type SignTransferChainedTxParams = SignTransferTxParams & { type: 'Transfer' }
export type SignDeployContractChainedTxParams = SignDeployContractTxParams & {
  type: 'DeployContract'
}
export type SignExecuteScriptChainedTxParams = SignExecuteScriptTxParams & { type: 'ExecuteScript' }
export type SignChainedTxParams =
  | SignTransferChainedTxParams
  | SignDeployContractChainedTxParams
  | SignExecuteScriptChainedTxParams

export type SignTransferChainedTxResult = SignTransferTxResult & { type: 'Transfer' }
export type SignDeployContractChainedTxResult = SignDeployContractTxResult & {
  type: 'DeployContract'
}
export type SignExecuteScriptChainedTxResult = SignExecuteScriptTxResult & { type: 'ExecuteScript' }
export type SignChainedTxResult =
  | SignTransferChainedTxResult
  | SignDeployContractChainedTxResult
  | SignExecuteScriptChainedTxResult

export type MessageHasher =
  | 'alephium' // Message is prefixed with 'Alephium signed message: ' before hashed with blake2b
  | 'sha256'
  | 'blake2b'
  | 'identity' // No hash is used, the message to be 32 bytes

export interface SignMessageParams {
  signerAddress: string
  signerKeyType?: KeyType
  message: string
  messageHasher: MessageHasher
}
assertType<Eq<SignMessageParams, { message: string; messageHasher: MessageHasher } & SignerAddress>>()
export interface SignMessageResult {
  signature: string
}

export interface SubmitTransactionParams {
  unsignedTx: string
  signature: string
}
export interface SubmissionResult {
  txId: string
  fromGroup: number
  toGroup: number
}

export interface EnableOptionsBase {
  // addressGroup - specify whether to use addresses from a specific group. Default: any group
  addressGroup?: number
  // keyType - specify which type of signing algorithm to use. Default: Secp256K1
  keyType?: KeyType
  // networkId - specify which network to connect. Default: the current network
  networkId?: NetworkId

  onDisconnected: () => Promise<void> | void
}

export interface SweepTxParams extends Omit<node.BuildSweepAddressTransactions, 'fromPublicKey' | 'fromPublicKeyType'> {
  signerAddress: string
  signerKeyType?: KeyType
}
