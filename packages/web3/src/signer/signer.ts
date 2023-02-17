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
import { ExplorerProvider, fromApiNumber256, fromApiTokens, NodeProvider, toApiNumber256, toApiTokens } from '../api'
import { node } from '../api'
import * as utils from '../utils'
import blake from 'blakejs'
import {
  Account,
  Address,
  EnableOptionsBase,
  Destination,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignerAddress,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
  SubmissionResult,
  SubmitTransactionParams,
  ExtSignTransferTxParams,
  ExtSignDeployContractTxParams,
  ExtSignExecuteScriptTxParams,
  ExtSignUnsignedTxParams,
  ExtSignMessageParams,
  KeyType
} from './types'
import { TransactionBuilder } from './tx-builder'
import * as secp from 'tiny-secp256k1'

const ec = new EC('secp256k1')

export interface SignerProvider {
  get nodeProvider(): NodeProvider | undefined
  get explorerProvider(): ExplorerProvider | undefined

  getSelectedAddress(): Promise<Address>

  signAndSubmitTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult>
  signAndSubmitDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult>
  signAndSubmitExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult>
  signAndSubmitUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>

  signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>
  // The message will be prefixed with 'Alephium Signed Message: ' before signing
  // so that the resulted signature cannot be reused for building transactions.
  signMessage(params: SignMessageParams): Promise<SignMessageResult>
}

// Abstraction for interactive signer (e.g. WalletConnect instance, Extension wallet object)
export interface InteractiveSignerProvider<EnableOptions extends EnableOptionsBase = EnableOptionsBase>
  extends SignerProvider {
  enable(opt?: EnableOptions): Promise<Address>
  disconnect(): Promise<void>

  // Methods inherited from SignerProvider, but require networkId in the params
  signAndSubmitTransferTx(params: ExtSignTransferTxParams): Promise<SignTransferTxResult>
  signAndSubmitDeployContractTx(params: ExtSignDeployContractTxParams): Promise<SignDeployContractTxResult>
  signAndSubmitExecuteScriptTx(params: ExtSignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult>
  signAndSubmitUnsignedTx(params: ExtSignUnsignedTxParams): Promise<SignUnsignedTxResult>
  signUnsignedTx(params: ExtSignUnsignedTxParams): Promise<SignUnsignedTxResult>
  signMessage(params: ExtSignMessageParams): Promise<SignMessageResult>
}

export abstract class SignerProviderSimple extends TransactionBuilder implements SignerProvider {
  abstract get explorerProvider(): ExplorerProvider | undefined

  abstract getSelectedAccount(): Promise<Account>

  async getSelectedAddress(): Promise<Address> {
    const account = await this.getSelectedAccount()
    return account.address
  }

  async submitTransaction(params: SubmitTransactionParams): Promise<SubmissionResult> {
    const data: node.SubmitTransaction = { unsignedTx: params.unsignedTx, signature: params.signature }
    return this.nodeProvider.transactions.postTransactionsSubmit(data)
  }

  async signAndSubmitTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
    const signResult = await this.signTransferTx(params)
    await this.submitTransaction(signResult)
    return signResult
  }
  async signAndSubmitDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> {
    const signResult = await this.signDeployContractTx(params)
    await this.submitTransaction(signResult)
    return signResult
  }
  async signAndSubmitExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> {
    const signResult = await this.signExecuteScriptTx(params)
    await this.submitTransaction(signResult)
    return signResult
  }
  async signAndSubmitUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    const signResult = await this.signUnsignedTx(params)
    await this.submitTransaction(signResult)
    return signResult
  }

  protected abstract getPublicKey(address: string): Promise<string>

  private async usePublicKey<T extends SignerAddress>(
    params: T
  ): Promise<Omit<T, 'signerAddress'> & { fromPublicKey: string }> {
    const { signerAddress, ...restParams } = params
    const publicKey = await this.getPublicKey(signerAddress)
    return { fromPublicKey: publicKey, ...restParams }
  }

  async signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
    const response = await this.buildTransferTx(params)
    const signature = await this.signRaw(params.signerAddress, response.txId)
    return { signature, ...response }
  }

  override async buildTransferTx(params: SignTransferTxParams): Promise<Omit<SignTransferTxResult, 'signature'>> {
    return super.buildTransferTx(params, await this.getPublicKey(params.signerAddress))
  }

  async signDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> {
    const response = await this.buildDeployContractTx(params)
    const signature = await this.signRaw(params.signerAddress, response.txId)
    return { signature, ...response }
  }

  override async buildDeployContractTx(
    params: SignDeployContractTxParams
  ): Promise<Omit<SignDeployContractTxResult, 'signature'>> {
    return super.buildDeployContractTx(params, await this.getPublicKey(params.signerAddress))
  }

  async signExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> {
    const response = await this.buildExecuteScriptTx(params)
    const signature = await this.signRaw(params.signerAddress, response.txId)
    return { signature, ...response }
  }

  override async buildExecuteScriptTx(
    params: SignExecuteScriptTxParams
  ): Promise<Omit<SignExecuteScriptTxResult, 'signature'>> {
    return super.buildExecuteScriptTx(params, await this.getPublicKey(params.signerAddress))
  }

  // in general, wallet should show the decoded information to user for confirmation
  // please overwrite this function for real wallet
  async signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    const response = await this.buildUnsignedTx(params)
    const signature = await this.signRaw(params.signerAddress, response.txId)
    return { signature, ...response }
  }

  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    const extendedMessage = extendMessage(params.message)
    const messageHash = blake.blake2b(extendedMessage, undefined, 32)
    const signature = await this.signRaw(params.signerAddress, utils.binToHex(messageHash))
    return { signature: signature }
  }

  abstract signRaw(signerAddress: string, hexString: string): Promise<string>
}

export abstract class SignerProviderWithMultipleAccounts extends SignerProviderSimple {
  abstract setSelectedAddress(address: string): Promise<void>

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

  async getPublicKey(signerAddress: string): Promise<string> {
    const account = await this.getAccount(signerAddress)
    return account.publicKey
  }
}

export abstract class SignerProviderWithCachedAccounts<T extends Account> extends SignerProviderWithMultipleAccounts {
  private _selectedAccount: T | undefined = undefined
  protected readonly _accounts = new Map<Address, T>()

  getSelectedAccount(): Promise<T> {
    if (this._selectedAccount === undefined) {
      throw Error('No account is selected yet')
    } else {
      return Promise.resolve(this._selectedAccount)
    }
  }

  setSelectedAddress(address: string): Promise<void> {
    const accountOpt = this._accounts.get(address)
    if (accountOpt === undefined) {
      throw Error('The address is not in the accounts')
    } else {
      this._selectedAccount = accountOpt
      return Promise.resolve()
    }
  }

  getAccounts(): Promise<T[]> {
    return Promise.resolve(Array.from(this._accounts.values()))
  }

  override async getAccount(address: string): Promise<T> {
    const account = this._accounts.get(address)
    if (account === undefined) {
      throw Error('The address is not in the accounts')
    }

    return Promise.resolve(account)
  }
}

export function verifyHexString(hexString: string, publicKey: string, signature: string, _keyType?: KeyType): boolean {
  const keyType = _keyType ?? 'secp256k1'
  try {
    if (keyType === 'secp256k1') {
      const key = ec.keyFromPublic(publicKey, 'hex')
      return key.verify(hexString, utils.signatureDecode(ec, signature))
    } else {
      return secp.verifySchnorr(
        utils.hexToBinUnsafe(hexString),
        utils.hexToBinUnsafe(publicKey),
        utils.hexToBinUnsafe(signature)
      )
    }
  } catch (error) {
    return false
  }
}

function extendMessage(message: string): string {
  return 'Alephium Signed Message: ' + message
}

export function verifySignedMessage(message: string, publicKey: string, signature: string, keyType?: KeyType): boolean {
  const extendedMessage = extendMessage(message)
  const messageHash = blake.blake2b(extendedMessage, undefined, 32)
  return verifyHexString(utils.binToHex(messageHash), publicKey, signature, keyType)
}

export function toApiDestination(data: Destination): node.Destination {
  return { ...data, attoAlphAmount: toApiNumber256(data.attoAlphAmount), tokens: toApiTokens(data.tokens) }
}

export function toApiDestinations(data: Destination[]): node.Destination[] {
  return data.map(toApiDestination)
}

export function fromApiDestination(data: node.Destination): Destination {
  return { ...data, attoAlphAmount: fromApiNumber256(data.attoAlphAmount), tokens: fromApiTokens(data.tokens) }
}
