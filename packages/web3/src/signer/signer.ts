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

import { ec as EC } from 'elliptic'
import {
  fromApiNumber256,
  fromApiTokens,
  NodeProvider,
  Number256,
  toApiNumber256,
  toApiNumber256Optional,
  toApiTokens,
  Token
} from '../api'
import { node } from '../api'
import * as utils from '../utils'
import { Eq, assertType } from '../utils'
import blake from 'blakejs'
import { web3 } from '..'

export type OutputRef = node.OutputRef

const ec = new EC('secp256k1')

export interface SignResult {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
  signature: string
}

export interface Account {
  address: string
  group: number
  publicKey: string
}

export type SignerAddress = { signerAddress: string }
type TxBuildParams<T> = Omit<T, 'fromPublicKey' | 'targetBlockHash'> & SignerAddress

export type GetAccountsParams = undefined
export type GetAccountsResult = Account[]

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
}
assertType<Eq<SignTransferTxResult, SignResult>>()

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
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
  signature: string
  contractId: string
  contractAddress: string
}
assertType<Eq<SignDeployContractTxResult, SignResult & { contractId: string; contractAddress: string }>>()

export interface SignExecuteScriptTxParams {
  signerAddress: string
  bytecode: string
  attoAlphAmount?: string
  tokens?: Token[]
  gasAmount?: number
  gasPrice?: string
}
assertType<Eq<keyof SignExecuteScriptTxParams, keyof TxBuildParams<node.BuildExecuteScriptTx>>>()
export interface SignExecuteScriptTxResult {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
  signature: string
}
assertType<Eq<SignExecuteScriptTxResult, SignResult>>()

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
}
assertType<Eq<SignUnsignedTxResult, SignResult>>()

export interface SignHexStringParams {
  signerAddress: string
  hexString: string
}
assertType<Eq<SignHexStringParams, { hexString: string } & SignerAddress>>()
export interface SignHexStringResult {
  signature: string
}
assertType<Eq<SignHexStringResult, Pick<SignResult, 'signature'>>>()

export interface SignMessageParams {
  signerAddress: string
  message: string
}
assertType<Eq<SignMessageParams, { message: string } & SignerAddress>>()
export interface SignMessageResult {
  signature: string
}
assertType<Eq<SignMessageResult, Pick<SignResult, 'signature'>>>()

export interface SignerProviderWithoutNodeProvider {
  getSelectedAccount(): Promise<Account>
  signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult>
  signDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult>
  signExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult>
  signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>
  signHexString(params: SignHexStringParams): Promise<SignHexStringResult>
  signMessage(params: SignMessageParams): Promise<SignMessageResult>
}

export abstract class SignerProvider implements SignerProviderWithoutNodeProvider {
  abstract get nodeProvider(): NodeProvider
  abstract getSelectedAccount(): Promise<Account>

  async submitTransaction(unsignedTx: string, signature: string): Promise<SubmissionResult> {
    const params: node.SubmitTransaction = { unsignedTx: unsignedTx, signature: signature }
    return this.nodeProvider.transactions.postTransactionsSubmit(params)
  }

  async signAndSubmitTransferTx(params: SignTransferTxParams): Promise<SubmissionResult> {
    const signResult = await this.signTransferTx(params)
    return this.submitTransaction(signResult.unsignedTx, signResult.signature)
  }
  async signAndSubmitDeployContractTx(params: SignDeployContractTxParams): Promise<SubmissionResult> {
    const signResult = await this.signDeployContractTx(params)
    return this.submitTransaction(signResult.unsignedTx, signResult.signature)
  }
  async signAndSubmitExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SubmissionResult> {
    const signResult = await this.signExecuteScriptTx(params)
    return this.submitTransaction(signResult.unsignedTx, signResult.signature)
  }
  async signAndSubmitUnsignedTx(params: SignUnsignedTxParams): Promise<SubmissionResult> {
    const signResult = await this.signUnsignedTx(params)
    return this.submitTransaction(signResult.unsignedTx, signResult.signature)
  }

  private async usePublicKey<T extends SignerAddress>(
    params: T
  ): Promise<Omit<T, 'signerAddress'> & { fromPublicKey: string }> {
    const { signerAddress, ...restParams } = params
    const selectedAccount = await this.getSelectedAccount()
    if (signerAddress !== selectedAccount.address) {
      throw new Error('The signer address is not the selected address')
    } else {
      return { fromPublicKey: selectedAccount.publicKey, ...restParams }
    }
  }

  async signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
    const response = await this.buildTransferTx(params)
    return this.handleSign({ signerAddress: params.signerAddress, ...response })
  }

  async buildTransferTx(params: SignTransferTxParams): Promise<node.BuildTransactionResult> {
    const data: node.BuildTransaction = {
      ...(await this.usePublicKey(params)),
      destinations: toApiDestinations(params.destinations),
      gasPrice: toApiNumber256Optional(params.gasPrice)
    }
    return web3.getCurrentNodeProvider().transactions.postTransactionsBuild(data)
  }

  async signDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> {
    const response = await this.buildContractCreationTx(params)
    const result = await this.handleSign({ signerAddress: params.signerAddress, ...response })
    const contractId = utils.binToHex(utils.contractIdFromAddress(response.contractAddress))
    return { ...result, contractId: contractId, contractAddress: response.contractAddress }
  }

  async buildContractCreationTx(params: SignDeployContractTxParams): Promise<node.BuildDeployContractTxResult> {
    const data: node.BuildDeployContractTx = {
      ...(await this.usePublicKey(params)),
      initialAttoAlphAmount: toApiNumber256Optional(params.initialAttoAlphAmount),
      initialTokenAmounts: toApiTokens(params.initialTokenAmounts),
      issueTokenAmount: toApiNumber256Optional(params.issueTokenAmount),
      gasPrice: toApiNumber256Optional(params.gasPrice)
    }
    return web3.getCurrentNodeProvider().contracts.postContractsUnsignedTxDeployContract(data)
  }

  async signExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> {
    const response = await this.buildScriptTx(params)
    return this.handleSign({ signerAddress: params.signerAddress, ...response })
  }

  async buildScriptTx(params: SignExecuteScriptTxParams): Promise<node.BuildExecuteScriptTxResult> {
    const data: node.BuildExecuteScriptTx = {
      ...(await this.usePublicKey(params)),
      tokens: toApiTokens(params.tokens)
    }
    return web3.getCurrentNodeProvider().contracts.postContractsUnsignedTxExecuteScript(data)
  }

  // in general, wallet should show the decoded information to user for confirmation
  // please overwrite this function for real wallet
  async signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    const data = { unsignedTx: params.unsignedTx }
    const decoded = await web3.getCurrentNodeProvider().transactions.postTransactionsDecodeUnsignedTx(data)
    return this.handleSign({
      fromGroup: decoded.fromGroup,
      toGroup: decoded.toGroup,
      signerAddress: params.signerAddress,
      unsignedTx: params.unsignedTx,
      txId: decoded.unsignedTx.txId
    })
  }

  protected async handleSign(response: {
    fromGroup: number
    toGroup: number
    signerAddress: string
    unsignedTx: string
    txId: string
  }): Promise<SignResult> {
    // sign the tx
    const signature = await this.signRaw(response.signerAddress, response.txId)
    // return the signature back to the provider
    return {
      fromGroup: response.fromGroup,
      toGroup: response.toGroup,
      unsignedTx: response.unsignedTx,
      txId: response.txId,
      signature: signature
    }
  }

  async signHexString(params: SignHexStringParams): Promise<SignHexStringResult> {
    const signature = await this.signRaw(params.signerAddress, params.hexString)
    return { signature: signature }
  }

  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    const extendedMessage = extendMessage(params.message)
    const messageHash = blake.blake2b(extendedMessage, undefined, 32)
    const signature = await this.signRaw(params.signerAddress, utils.binToHex(messageHash))
    return { signature: signature }
  }

  abstract signRaw(signerAddress: string, hexString: string): Promise<string>
}

export abstract class SignerProviderWithMultipleAccounts extends SignerProvider {
  abstract getAccounts(): Promise<Account[]>

  async getAccount(signerAddress: string): Promise<Account> {
    const accounts = await this.getAccounts()
    const account = accounts.find((a) => a.address === signerAddress)
    if (typeof account === 'undefined') {
      throw new Error('Unmatched signerAddress')
    } else {
      return account
    }
  }

  abstract setSelectedAccount(address: string): Promise<void>
}

export interface SubmissionResult {
  txId: string
  fromGroup: number
  toGroup: number
}

export function verifyHexString(hexString: string, publicKey: string, signature: string): boolean {
  try {
    const key = ec.keyFromPublic(publicKey, 'hex')
    return key.verify(hexString, utils.signatureDecode(ec, signature))
  } catch (error) {
    return false
  }
}

function extendMessage(message: string): string {
  return 'Alephium Signed Message: ' + message
}

export function verifySignedMessage(message: string, publicKey: string, signature: string): boolean {
  const extendedMessage = extendMessage(message)
  const messageHash = blake.blake2b(extendedMessage, undefined, 32)
  return verifyHexString(utils.binToHex(messageHash), publicKey, signature)
}

export interface Destination {
  address: string
  attoAlphAmount: Number256
  tokens?: Token[]
  lockTime?: number
  message?: string
}
assertType<Eq<keyof Destination, keyof node.Destination>>

export function toApiDestination(data: Destination): node.Destination {
  return { ...data, attoAlphAmount: toApiNumber256(data.attoAlphAmount), tokens: toApiTokens(data.tokens) }
}

export function toApiDestinations(data: Destination[]): node.Destination[] {
  return data.map(toApiDestination)
}

export function fromApiDestination(data: node.Destination): Destination {
  return { ...data, attoAlphAmount: fromApiNumber256(data.attoAlphAmount), tokens: fromApiTokens(data.tokens) }
}
