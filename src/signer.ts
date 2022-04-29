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
import blake from 'blakejs'

const ec = new EC('secp256k1')

export interface SignResult {
  unsignedTx: string
  txId: string
  signature: string
}
export interface Account {
  address: string
  pubkey: string
  group: number
}
export type SubmitTx = { submitTx?: boolean }
export type SignerAddress = { signerAddress: string }
type TxBuildParams<T> = Omit<T, 'fromPublicKey'> & SignerAddress & SubmitTx
export type GetAccountsParams = undefined
export type GetAccountsResult = Account[]
export type SignTransferTxParams = TxBuildParams<api.BuildTransaction>
export type SignTransferTxResult = SignResult
export type SignContractCreationTxParams = TxBuildParams<api.BuildContractDeployScriptTx>
export type SignContractCreationTxResult = SignResult & { contractId: string; contractAddress: string }
export type SignScriptTxParams = TxBuildParams<api.BuildScriptTx>
export type SignScriptTxResult = SignResult
export type SignUnsignedTxParams = { unsignedTx: string } & SubmitTx & SignerAddress
export type SignUnsignedTxResult = SignResult
export type SignHexStringParams = { hexString: string } & SignerAddress
export type SignHexStringResult = Pick<SignResult, 'signature'>
export type SignMessageParams = { message: string } & SignerAddress
export type SignMessageResult = Pick<SignResult, 'signature'>

export interface SignerProvider {
  getAccounts(): Promise<Account[]>
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
    if (typeof params.signerAddress !== 'undefined' && params.signerAddress !== this['address']) {
      throw new Error('Unmatched address')
    }
    return originalFn.call(this, params)
  }
}

export abstract class Signer implements SignerProvider {
  readonly client: CliqueClient
  alwaysSubmitTx: boolean

  constructor(client: CliqueClient, alwaysSubmitTx: boolean) {
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

  abstract getAccounts(): Promise<GetAccountsResult>

  private async usePublicKey<T extends SignerAddress>(
    params: T
  ): Promise<Omit<T, 'signerAddress'> & { fromPublicKey: string }> {
    const { signerAddress, ...restParams } = params
    const allAccounts = await this.getAccounts()
    const signerAccount = allAccounts.find((account) => account.address === signerAddress)
    if (typeof signerAccount === 'undefined') {
      throw new Error('Unknown signer address')
    } else {
      return { fromPublicKey: signerAccount.pubkey, ...restParams }
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
    console.log(`======== address: ${response.contractAddress}`)
    console.log(`======= id: ${utils.binToHex(utils.contractIdFromAddress(response.contractAddress))}`)
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

  protected abstract signRaw(signerAddress: string, hexString: string): Promise<string>

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
}

export abstract class SingleAddressSigner extends Signer {
  address: string
  publicKey: string
  group: number

  constructor(client: CliqueClient, address: string, publicKey: string, alwaysSubmitTx: boolean) {
    super(client, alwaysSubmitTx)
    this.address = address
    this.publicKey = publicKey
    this.group = utils.groupOfAddress(address)
  }

  async getAccounts(): Promise<GetAccountsResult> {
    return [{ address: this.address, pubkey: this.publicKey, group: this.group }]
  }

  override async submitTransaction(unsignedTx: string, txHash: string): Promise<SubmissionResult> {
    return super.submitTransaction(unsignedTx, txHash, this.address)
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

  protected async signRaw(signerAddress: string, hexString: string): Promise<string> {
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

  protected async signRaw(signerAddress: string, hexString: string): Promise<string> {
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
  const messageHash = blake.blake2b(extendedMessage, undefined, 32)
  return verifyHexString(utils.binToHex(messageHash), publicKey, signature)
}
