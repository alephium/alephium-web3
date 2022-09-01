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
import { NodeProvider } from '../api'
import { node } from '../api'
import * as utils from '../utils'
import { Eq, assertType } from '../utils'
import blake from 'blakejs'
import { Token } from '../api/api-alephium'
import { getCurrentNodeProvider } from '../global'

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

export type SubmitTx = { submitTx?: boolean }
export type SignerAddress = { signerAddress: string }
type TxBuildParams<T> = Omit<T, 'fromPublicKey' | 'targetBlockHash'> & SignerAddress & SubmitTx

export type GetAccountsParams = undefined
export type GetAccountsResult = Account[]

export interface SignTransferTxParams {
  signerAddress: string
  destinations: node.Destination[]
  utxos?: node.OutputRef[]
  gasAmount?: number
  gasPrice?: string
  submitTx?: boolean
}
assertType<Eq<SignTransferTxParams, TxBuildParams<node.BuildTransaction>>>()
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
  initialAttoAlphAmount?: string
  initialTokenAmounts?: Token[]
  issueTokenAmount?: string
  gasAmount?: number
  gasPrice?: string
  submitTx?: boolean
}
assertType<Eq<SignDeployContractTxParams, TxBuildParams<node.BuildDeployContractTx>>>()
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
  tokens?: node.Token[]
  gasAmount?: number
  gasPrice?: string
  submitTx?: boolean
}
assertType<Eq<SignExecuteScriptTxParams, TxBuildParams<node.BuildExecuteScriptTx>>>()
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
  submitTx?: boolean
}
assertType<Eq<SignUnsignedTxParams, { unsignedTx: string } & SubmitTx & SignerAddress>>()
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

export interface SignerProvider {
  getAccounts(): Promise<Account[]>
  signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult>
  signDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult>
  signExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult>
  signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>
  signHexString(params: SignHexStringParams): Promise<SignHexStringResult>
  signMessage(params: SignMessageParams): Promise<SignMessageResult>
}

export abstract class SignerWithNodeProvider implements SignerProvider {
  readonly provider: NodeProvider
  alwaysSubmitTx: boolean

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

  constructor(alwaysSubmitTx: boolean) {
    this.provider = getCurrentNodeProvider()
    this.alwaysSubmitTx = alwaysSubmitTx
  }

  private async defaultSignerAddress(): Promise<string> {
    return (await this.getAccounts())[0].address
  }

  async submitTransaction(unsignedTx: string, txHash: string, signerAddress?: string): Promise<SubmissionResult> {
    const address = typeof signerAddress !== 'undefined' ? signerAddress : await this.defaultSignerAddress()
    const signature = await this.signRaw(address, txHash)
    const params: node.SubmitTransaction = { unsignedTx: unsignedTx, signature: signature }
    return this.provider.transactions.postTransactionsSubmit(params)
  }

  private shouldSubmitTx(params: SubmitTx): boolean {
    return this.alwaysSubmitTx || (params.submitTx ? params.submitTx : true)
  }

  private async usePublicKey<T extends SignerAddress>(
    params: T
  ): Promise<Omit<T, 'signerAddress'> & { fromPublicKey: string }> {
    const { signerAddress, ...restParams } = params
    const allAccounts = await this.getAccounts()
    const signerAccount = allAccounts.find((account) => account.address === signerAddress)
    if (typeof signerAccount === 'undefined') {
      throw new Error('Unknown signer address')
    } else {
      return { fromPublicKey: signerAccount.publicKey, ...restParams }
    }
  }

  async signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
    const response = await this.buildTransferTx(params)
    return this.handleSign({ signerAddress: params.signerAddress, ...response }, this.shouldSubmitTx(params))
  }

  async buildTransferTx(params: SignTransferTxParams): Promise<node.BuildTransactionResult> {
    return this.provider.transactions.postTransactionsBuild(await this.usePublicKey(params))
  }

  async signDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> {
    const response = await this.buildContractCreationTx(params)
    const result = await this.handleSign(
      { signerAddress: params.signerAddress, ...response },
      this.shouldSubmitTx(params)
    )
    const contractId = utils.binToHex(utils.contractIdFromAddress(response.contractAddress))
    return { ...result, contractId: contractId, contractAddress: response.contractAddress }
  }

  async buildContractCreationTx(params: SignDeployContractTxParams): Promise<node.BuildDeployContractTxResult> {
    return this.provider.contracts.postContractsUnsignedTxDeployContract(await this.usePublicKey(params))
  }

  async signExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> {
    const response = await this.buildScriptTx(params)
    return this.handleSign({ signerAddress: params.signerAddress, ...response }, this.shouldSubmitTx(params))
  }

  async buildScriptTx(params: SignExecuteScriptTxParams): Promise<node.BuildExecuteScriptTxResult> {
    return this.provider.contracts.postContractsUnsignedTxExecuteScript(await this.usePublicKey(params))
  }

  // in general, wallet should show the decoded information to user for confirmation
  // please overwrite this function for real wallet
  async signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    const data = { unsignedTx: params.unsignedTx }
    const decoded = await this.provider.transactions.postTransactionsDecodeUnsignedTx(data)
    return this.handleSign(
      {
        fromGroup: decoded.fromGroup,
        toGroup: decoded.toGroup,
        signerAddress: params.signerAddress,
        unsignedTx: params.unsignedTx,
        txId: decoded.unsignedTx.txId
      },
      params.submitTx ? params.submitTx : true // we don't consider `alwaysSubmitTx` as the tx might needs multiple signatures
    )
  }

  protected async handleSign(
    response: { fromGroup: number; toGroup: number; signerAddress: string; unsignedTx: string; txId: string },
    submitTx: boolean
  ): Promise<SignResult> {
    // sign the tx
    const signature = await this.signRaw(response.signerAddress, response.txId)
    // submit the tx if required
    if (submitTx) {
      await this.provider.transactions.postTransactionsSubmit({
        unsignedTx: response.unsignedTx,
        signature: signature
      })
    }
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
