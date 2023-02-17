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
import { Eq, assertType } from '../utils'

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

export type KeyType = 'secp256k1' | 'bip340-schnorr'

export interface Account {
  keyType: KeyType
  address: string
  group: number
  publicKey: string
}

export type SignerAddress = { signerAddress: string }
type TxBuildParams<T> = Omit<T, 'fromPublicKey' | 'targetBlockHash'> & SignerAddress
type SignResult<T> = Omit<T, 'gasPrice'> & { signature: string; gasPrice: Number256 }

export interface SignTransferTxParams {
  signerAddress: string
  destinations: Destination[]
  utxos?: OutputRef[]
  gasAmount?: number
  gasPrice?: Number256
}
assertType<Eq<keyof SignTransferTxParams, keyof TxBuildParams<node.BuildTransaction>>>()
export interface SignTransferTxResult {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
  signature: string
  gasAmount: number
  gasPrice: Number256
}
assertType<Eq<SignTransferTxResult, SignResult<node.BuildTransactionResult>>>()

export interface SignDeployContractTxParams {
  signerAddress: string
  bytecode: string
  initialAttoAlphAmount?: Number256
  initialTokenAmounts?: Token[]
  issueTokenAmount?: Number256
  gasAmount?: number
  gasPrice?: Number256
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
    Omit<SignResult<node.BuildDeployContractTxResult> & { contractId: string }, 'fromGroup' | 'toGroup'>
  >
>()

export interface SignExecuteScriptTxParams {
  signerAddress: string
  bytecode: string
  attoAlphAmount?: Number256
  tokens?: Token[]
  gasAmount?: number
  gasPrice?: Number256
}
assertType<Eq<keyof SignExecuteScriptTxParams, keyof TxBuildParams<node.BuildExecuteScriptTx>>>()
export interface SignExecuteScriptTxResult {
  groupIndex: number
  unsignedTx: string
  txId: string
  signature: string
  gasAmount: number
  gasPrice: Number256
}
assertType<
  Eq<
    Omit<SignExecuteScriptTxResult, 'groupIndex'>,
    Omit<SignResult<node.BuildExecuteScriptTxResult>, 'fromGroup' | 'toGroup'>
  >
>()

export interface SignUnsignedTxParams {
  signerAddress: string
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

export interface SignMessageParams {
  signerAddress: string
  message: string
}
assertType<Eq<SignMessageParams, { message: string } & SignerAddress>>()
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
  // chainGroup - specify whether to use addresses from a specific group
  chainGroup?: number
  networkId: string
  onDisconnected: () => Promise<void>
}

// Transaction Params for InteractiveSignerProvider
export type ExtSignTransferTxParams = SignTransferTxParams & { networkId: string }
export type ExtSignDeployContractTxParams = SignDeployContractTxParams & { networkId: string }
export type ExtSignExecuteScriptTxParams = SignExecuteScriptTxParams & { networkId: string }
export type ExtSignUnsignedTxParams = SignUnsignedTxParams & { networkId: string }
export type ExtSignMessageParams = SignMessageParams & { networkId: string }
