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
export type SignTransferTxParams = Extended<api.BuildTransaction>
export type SignTransferTxResult = SignResult
export type SignContractCreationTxParams = Extended<api.BuildContractDeployScriptTx>
export type SignContractCreationTxResult = SignResult & { contractId: string; contractAddress: string }
export type SignScriptTxParams = Extended<api.BuildScriptTx>
export type SignScriptTxResult = SignResult
export type SignUnsignedTxParams = Extended<{ unsignedTx: string }>
export type SignUnsignedTxResult = SignResult
export type SignHexStringParams = { hexString: string }
export type SignHexStringResult = Pick<SignResult, 'signature'>
export type SignMessageParams = { message: string }
export type SignMessageResult = Pick<SignResult, 'signature'>

export interface SignerProvider {
  signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult>
  signContractCreationTx(params: SignContractCreationTxParams): Promise<SignContractCreationTxResult>
  signScriptTx(params: SignScriptTxParams): Promise<SignScriptTxResult>
  signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>
  signHexString(params: SignHexStringParams): Promise<SignHexStringResult>
  signMessage(params: SignMessageParams): Promise<SignMessageResult>
}

export abstract class SingleAddressSigner implements SignerProvider {
  readonly client: CliqueClient
  readonly address: string
  readonly publicKey: string
  readonly group: number
  alwaysSubmitTx: boolean

  constructor(client: CliqueClient, address: string, publicKey: string, alwaysSubmitTx: boolean) {
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
    return convertHttpResponse(response)
  }

  private checkFromPublicKey(params: { fromPublicKey: string }): void {
    if (params.fromPublicKey !== this.publicKey) {
      throw new Error('Unmatched public key')
    }
  }

  private shouldSubmitTx(params: SubmitTx): boolean {
    return this.alwaysSubmitTx || (params.submitTx ? params.submitTx : false)
  }

  async signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
    this.checkFromPublicKey(params)

    const response = convertHttpResponse(
      await this.client.transactions.postTransactionsBuild({ ...params, fromPublicKey: this.publicKey })
    )
    return this.handleSign(response, this.shouldSubmitTx(params))
  }

  async signContractCreationTx(params: SignContractCreationTxParams): Promise<SignContractCreationTxResult> {
    this.checkFromPublicKey(params)

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
    this.checkFromPublicKey(params)

    const response = convertHttpResponse(
      await this.client.contracts.postContractsUnsignedTxBuildScript({ ...params, fromPublicKey: this.publicKey })
    )
    return this.handleSign(response, this.shouldSubmitTx(params))
  }

  async signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
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

  protected abstract signRaw(hexString: string): Promise<string>

  async signHexString(params: SignHexStringParams): Promise<SignHexStringResult> {
    const signature = await this.signRaw(params.hexString)
    return { signature: signature }
  }

  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    const extendedMessage = extendMessage(params.message)
    const signature = await this.signRaw(utils.stringToHex(extendedMessage))
    return { signature: signature }
  }
}

export class NodeSigner extends SingleAddressSigner {
  readonly walletName: string

  private static async fetchPublicKey(client: CliqueClient, walletName: string, address: string): Promise<string> {
    const response = await client.wallets.getWalletsWalletNameAddressesAddress(walletName, address)
    return convertHttpResponse(response).publicKey
  }

  static async testSigner(client: CliqueClient): Promise<NodeSigner> {
    const walletName = 'alephium-web3-test-only-wallet'
    const address = '12LgGdbjE6EtnTKw5gdBwV2RRXuXPtzYM7SDZ45YJTRht'
    return NodeSigner.init(client, walletName, address)
  }

  static async init(
    client: CliqueClient,
    walletName: string,
    address: string,
    alwaysSubmitTx = true
  ): Promise<NodeSigner> {
    const publicKey = await NodeSigner.fetchPublicKey(client, walletName, address)
    return new NodeSigner(client, walletName, address, publicKey, alwaysSubmitTx)
  }

  constructor(client: CliqueClient, walletName: string, address: string, publicKey: string, alwaysSubmitTx: boolean) {
    super(client, address, publicKey, alwaysSubmitTx)
    this.walletName = walletName
  }

  protected async signRaw(hexString: string): Promise<string> {
    const response = await this.client.wallets.postWalletsWalletNameSign(this.walletName, { data: hexString })
    return convertHttpResponse(response).signature
  }
}

export class PrivateKeySigner extends SingleAddressSigner {
  readonly privateKey: string

  static createRandom(client: CliqueClient, alwaysSubmitTx = true): PrivateKeySigner {
    const keyPair = ec.genKeyPair()
    return new PrivateKeySigner(client, keyPair.getPrivate().toString('hex'), alwaysSubmitTx)
  }

  constructor(client: CliqueClient, privateKey: string, alwaysSubmitTx = true) {
    const publicKey = utils.publicKeyFromPrivateKey(privateKey)
    const address = utils.addressFromPublicKey(publicKey)
    super(client, address, publicKey, alwaysSubmitTx)
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
  return verifyHexString(utils.stringToHex(extendedMessage), publicKey, signature)
}
