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

const ec = new EC('secp256k1')

export interface SignResult {
  unsignedTx: string
  txId: string
  signature: string
}
export type SubmitTx = { submitTx?: boolean }
type Extended<Params> = Params & SubmitTx
export type SignTransferTxParams = Omit<Extended<api.BuildTransaction>, 'fromPublicKey'>
export type SignTransferTxResult = SignResult
export type SignContractCreationTxParams = Omit<Extended<api.BuildContractDeployScriptTx>, 'fromPublicKey'>
export type SignContractCreationTxResult = SignResult & { contractId: string; contractAddress: string }
export type SignScriptTxParams = Omit<Extended<api.BuildScriptTx>, 'fromPublicKey'>
export type SignScriptTxResult = SignResult
export type SignUnsignedTxParams = Extended<{ unsignedTx: string }>
export type SignUnsignedTxResult = SignResult
export type SignHexStringParams = { hexString: string }
export type SignHexStringResult = Pick<SignResult, 'signature'>
export type SignMessageParams = { message: string }
export type SignMessageResult = Pick<SignResult, 'signature'>

export abstract class Signer {
  readonly client: CliqueClient
  readonly address: string
  readonly publicKey: string
  readonly group: number
  alwaysSubmitTx: boolean

  constructor(client: CliqueClient, address: string, publicKey: string, alwaysSubmitTx = true) {
    this.client = client
    this.address = address
    this.publicKey = publicKey
    this.group = utils.groupOfAddress(address)
    this.alwaysSubmitTx = alwaysSubmitTx
  }

  async submitTransaction(unsignedTx: string, txHash: string): Promise<SubmissionResult> {
    const signature = await this.signRaw(txHash)
    const params: api.SubmitTransaction = { unsignedTx: unsignedTx, signature: signature }
    const response = await this.client.transactions.postTransactionsSubmit(params)
    return fromApiSubmissionResult(convertHttpResponse(response))
  }

  private shouldSubmitTx(params: SubmitTx): boolean {
    return this.alwaysSubmitTx || (params.submitTx ? params.submitTx : false)
  }

  async signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
    const response = convertHttpResponse(
      await this.client.transactions.postTransactionsBuild({ ...params, fromPublicKey: this.publicKey })
    )
    return this.handleSign(response, this.shouldSubmitTx(params))
  }

  async signContractCreationTx(params: SignContractCreationTxParams): Promise<SignContractCreationTxResult> {
    const response = convertHttpResponse(
      await this.client.contracts.postContractsUnsignedTxBuildContract({ ...params, fromPublicKey: this.publicKey })
    )
    const result = await this.handleSign(response, this.shouldSubmitTx(params))
    const decoded = convertHttpResponse(
      await this.client.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx: result.unsignedTx })
    )
    const contractId = utils.contractIdFromTx(result.txId, decoded.fixedOutputs.length)
    const contractAddress = utils.addressFromContractId(contractId)
    return { ...result, contractId: contractId, contractAddress: contractAddress }
  }

  async signScriptTx(params: SignScriptTxParams): Promise<SignScriptTxResult> {
    const response = convertHttpResponse(
      await this.client.contracts.postContractsUnsignedTxBuildScript({ ...params, fromPublicKey: this.publicKey })
    )
    return this.handleSign(response, this.shouldSubmitTx(params))
  }

  async handleSignUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    const data = { unsignedTx: params.unsignedTx }
    // in general, wallet should show the decoded information to user for confirmation
    const decoded = convertHttpResponse(await this.client.transactions.postTransactionsDecodeUnsignedTx(data))
    return this.handleSign({ unsignedTx: params.unsignedTx, txId: decoded.txId }, this.shouldSubmitTx(params))
  }

  private async handleSign(response: { unsignedTx: string; txId: string }, submitTx: boolean): Promise<SignResult> {
    // sign the tx
    const signature = await this.signRaw(response.txId)
    // submit the tx if required
    if (submitTx) {
      await this.client.transactions.postTransactionsSubmit({
        unsignedTx: response.unsignedTx,
        signature: signature
      })
    }
    // return the signature back to the provider
    return {
      unsignedTx: response.unsignedTx,
      txId: response.txId,
      signature: signature
    }
  }

  async signHexString(params: SignHexStringParams): Promise<SignHexStringResult> {
    const signature = await this.signRaw(params.hexString)
    return { signature: signature }
  }

  protected abstract signRaw(hexString: string): Promise<string>
  static verifyRaw(hexString: string, publicKey: string, signature: string): boolean {
    try {
      const key = ec.keyFromPublic(publicKey, 'hex')
      return key.verify(hexString, utils.signatureDecode(ec, signature))
    } catch (error) {
      return false
    }
  }

  private static extendMessage(message: string): string {
    return 'Alephium Signed Message: ' + message
  }

  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    const extendedMessage = Signer.extendMessage(params.message)
    const signature = await this.signRaw(utils.stringToHex(extendedMessage))
    return { signature: signature }
  }

  async verifySignedMessage(message: string, publicKey: string, signature: string): Promise<boolean> {
    const extendedMessage = Signer.extendMessage(message)
    return Signer.verifyRaw(utils.stringToHex(extendedMessage), publicKey, signature)
  }
}

export class NodeSigner extends Signer {
  readonly walletName: string

  private static async fetchPublicKey(client: CliqueClient, walletName: string, address: string): Promise<string> {
    const response = await client.wallets.getWalletsWalletNameAddressesAddress(walletName, address)
    return convertHttpResponse(response).publicKey
  }

  static async testSigner(client: CliqueClient): Promise<Signer> {
    const walletName = 'alephium-web3-test-only-wallet'
    const address = '12LgGdbjE6EtnTKw5gdBwV2RRXuXPtzYM7SDZ45YJTRht'
    return NodeSigner.init(client, walletName, address)
  }

  static async init(client: CliqueClient, walletName: string, address: string): Promise<NodeSigner> {
    const publicKey = await NodeSigner.fetchPublicKey(client, walletName, address)
    return new NodeSigner(client, walletName, address, publicKey)
  }

  constructor(client: CliqueClient, walletName: string, address: string, publicKey: string) {
    super(client, address, publicKey)
    this.walletName = walletName
  }

  protected async signRaw(hexString: string): Promise<string> {
    const response = await this.client.wallets.postWalletsWalletNameSign(this.walletName, { data: hexString })
    return convertHttpResponse(response).signature
  }
}

export class PrivateKeySigner extends Signer {
  readonly privateKey: string

  static createRandom(client: CliqueClient): PrivateKeySigner {
    const keyPair = ec.genKeyPair()
    return new PrivateKeySigner(client, keyPair.getPrivate().toString('hex'))
  }

  constructor(client: CliqueClient, privateKey: string) {
    const publicKey = utils.publicKeyFromPrivateKey(privateKey)
    const address = utils.addressFromPublicKey(publicKey)
    super(client, address, publicKey)
    this.privateKey = privateKey
  }

  protected async signRaw(hexString: string): Promise<string> {
    const key = ec.keyFromPrivate(this.privateKey)
    const signature = key.sign(hexString)
    return utils.signatureEncode(signature)
  }
}

export interface SubmissionResult {
  txId: string
  fromGroup: number
  toGroup: number
}

function fromApiSubmissionResult(result: api.TxResult): SubmissionResult {
  return result
}
