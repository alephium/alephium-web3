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
import { CliqueClient } from './clique'
import * as api from '../api/api-alephium'
import { convertHttpResponse } from './utils'
import * as utils from './utils'
import { Eq, assertType } from './utils'
import blake from 'blakejs'
import { IAccount } from './wallet/IAccount'
import { ISigningWallet } from './wallet/ISigningWallet'

const ec = new EC('secp256k1')

export interface SignResult {
  unsignedTx: string
  txId: string
  signature: string
}

export type SubmitTx = { submitTx?: boolean }
export type SignerAddress = { signerAddress: string }
type TxBuildParams<T> = Omit<T, 'fromPublicKey'> & SignerAddress & SubmitTx

export type GetAccountsParams = undefined
export type GetAccountsResult = IAccount[]

export interface SignTransferTxParams {
  signerAddress: string
  destinations: api.Destination[]
  utxos?: api.OutputRef[]
  gasAmount?: number
  gasPrice?: string
  utxosLimit?: number
  submitTx?: boolean
}
assertType<Eq<SignTransferTxParams, TxBuildParams<api.BuildTransaction>>>()
export interface SignTransferTxResult {
  unsignedTx: string
  txId: string
  signature: string
}
assertType<Eq<SignTransferTxResult, SignResult>>()

export interface SignContractCreationTxParams {
  signerAddress: string
  bytecode: string
  initialFields: api.Val[]
  alphAmount?: string
  issueTokenAmount?: string
  gasAmount?: number
  gasPrice?: string
  utxosLimit?: number
  submitTx?: boolean
}
assertType<Eq<SignContractCreationTxParams, TxBuildParams<api.BuildContractDeployScriptTx>>>()
export interface SignContractCreationTxResult {
  unsignedTx: string
  txId: string
  signature: string
  contractId: string
  contractAddress: string
}
assertType<Eq<SignContractCreationTxResult, SignResult & { contractId: string; contractAddress: string }>>()

export interface SignScriptTxParams {
  signerAddress: string
  bytecode: string
  alphAmount?: string
  tokens?: api.Token[]
  gasAmount?: number
  gasPrice?: string
  utxosLimit?: number
  submitTx?: boolean
}
assertType<Eq<SignScriptTxParams, TxBuildParams<api.BuildScriptTx>>>()
export interface SignScriptTxResult {
  unsignedTx: string
  txId: string
  signature: string
}
assertType<Eq<SignScriptTxResult, SignResult>>()

export interface SignUnsignedTxParams {
  signerAddress: string
  unsignedTx: string
  submitTx?: boolean
}
assertType<Eq<SignUnsignedTxParams, { unsignedTx: string } & SubmitTx & SignerAddress>>()
export interface SignUnsignedTxResult {
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
  getAccounts(): Promise<IAccount[]>
  signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult>
  signContractCreationTx(params: SignContractCreationTxParams): Promise<SignContractCreationTxResult>
  signScriptTx(params: SignScriptTxParams): Promise<SignScriptTxResult>
  signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>
  signHexString(params: SignHexStringParams): Promise<SignHexStringResult>
  signMessage(params: SignMessageParams): Promise<SignMessageResult>
}

function checkParams(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalFn = descriptor.value
  descriptor.value = function (params: any) {
    return originalFn.call(this, params)
  }
}

export class Signer implements SignerProvider {
  readonly client: CliqueClient
  alwaysSubmitTx: boolean

  constructor(
    private signingWallet: ISigningWallet,
    private getPassword: () => Promise<string>,
    client: CliqueClient,
    alwaysSubmitTx: boolean
  ) {
    this.client = client
    this.alwaysSubmitTx = alwaysSubmitTx
  }

  async submitTransaction(unsignedTx: string, txHash: string, signerAddress: string): Promise<SubmissionResult> {
    const signature = await this.signRaw(signerAddress, txHash)
    const params: api.SubmitTransaction = { unsignedTx: unsignedTx, signature: signature }
    const response = await this.client.transactions.postTransactionsSubmit(params)
    return convertHttpResponse(response)
  }

  private shouldSubmitTx(params: SubmitTx): boolean {
    return this.alwaysSubmitTx || (params.submitTx ? params.submitTx : true)
  }

  async getAccounts(): Promise<GetAccountsResult> {
    return this.signingWallet.accounts
  }

  private async usePublicKey<T extends SignerAddress>(
    params: T
  ): Promise<Omit<T, 'signerAddress'> & { fromPublicKey: string }> {
    const { signerAddress, ...restParams } = params
    const allAccounts = await this.getAccounts()
    const signerAccount = allAccounts.find((account) => account.p2pkhAddress === signerAddress)
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

  @checkParams
  async buildTransferTx(params: SignTransferTxParams): Promise<api.BuildTransactionResult> {
    return convertHttpResponse(await this.client.transactions.postTransactionsBuild(await this.usePublicKey(params)))
  }

  async signContractCreationTx(params: SignContractCreationTxParams): Promise<SignContractCreationTxResult> {
    const response = await this.buildContractCreationTx(params)
    const result = await this.handleSign(
      { signerAddress: params.signerAddress, ...response },
      this.shouldSubmitTx(params)
    )
    const contractId = utils.binToHex(utils.contractIdFromAddress(response.contractAddress))
    return { ...result, contractId: contractId, contractAddress: response.contractAddress }
  }

  @checkParams
  async buildContractCreationTx(params: SignContractCreationTxParams): Promise<api.BuildContractDeployScriptTxResult> {
    return convertHttpResponse(
      await this.client.contracts.postContractsUnsignedTxBuildContract(await this.usePublicKey(params))
    )
  }

  async signScriptTx(params: SignScriptTxParams): Promise<SignScriptTxResult> {
    const response = await this.buildScriptTx(params)
    return this.handleSign({ signerAddress: params.signerAddress, ...response }, this.shouldSubmitTx(params))
  }

  @checkParams
  async buildScriptTx(params: SignScriptTxParams): Promise<api.BuildScriptTxResult> {
    return convertHttpResponse(
      await this.client.contracts.postContractsUnsignedTxBuildScript(await this.usePublicKey(params))
    )
  }

  // in general, wallet should show the decoded information to user for confirmation
  // please overwrite this function for real wallet
  @checkParams
  async signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    const data = { unsignedTx: params.unsignedTx }
    const decoded = convertHttpResponse(await this.client.transactions.postTransactionsDecodeUnsignedTx(data))
    return this.handleSign(
      { signerAddress: params.signerAddress, unsignedTx: params.unsignedTx, txId: decoded.txId },
      params.submitTx ? params.submitTx : true // we don't consider `alwaysSubmitTx` as the tx might needs multiple signatures
    )
  }

  protected async handleSign(
    response: { signerAddress: string; unsignedTx: string; txId: string },
    submitTx: boolean
  ): Promise<SignResult> {
    // sign the tx
    const signature = await this.signRaw(response.signerAddress, response.txId)
    // submit the tx if required
    if (submitTx) {
      convertHttpResponse(
        await this.client.transactions.postTransactionsSubmit({
          unsignedTx: response.unsignedTx,
          signature: signature
        })
      )
    }
    // return the signature back to the provider
    return {
      unsignedTx: response.unsignedTx,
      txId: response.txId,
      signature: signature
    }
  }

  @checkParams
  async signHexString(params: SignHexStringParams): Promise<SignHexStringResult> {
    const signature = await this.signRaw(params.signerAddress, params.hexString)
    return { signature: signature }
  }

  @checkParams
  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    const extendedMessage = extendMessage(params.message)
    const messageHash = blake.blake2b(extendedMessage, undefined, 32)
    const signature = await this.signRaw(params.signerAddress, utils.binToHex(messageHash))
    return { signature: signature }
  }

  async signRaw(signerAddress: string, hexString: string): Promise<string> {
    const password = await this.getPassword()
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (password === undefined) throw new Error('Password is necessary to sign with this signer')
    return this.signingWallet.sign(password, hexString, signerAddress)
  }
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
