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

import { createHash } from 'crypto'
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
  KeyType,
  MessageHasher,
  SignChainedTxParams,
  SignChainedTxResult
} from './types'
import { TransactionBuilder } from './tx-builder'
import { addressFromPublicKey, groupOfAddress } from '../address'

export abstract class SignerProvider {
  abstract get nodeProvider(): NodeProvider | undefined
  abstract get explorerProvider(): ExplorerProvider | undefined

  protected abstract unsafeGetSelectedAccount(): Promise<Account>
  async getSelectedAccount(): Promise<Account> {
    const account = await this.unsafeGetSelectedAccount()
    SignerProvider.validateAccount(account)
    return account
  }

  static validateAccount(account: Account): void {
    const derivedAddress = addressFromPublicKey(account.publicKey, account.keyType)
    const derivedGroup = groupOfAddress(derivedAddress)
    if (derivedAddress !== account.address || derivedGroup !== account.group) {
      throw Error(`Invalid accounot data: ${JSON.stringify(account)}`)
    }
  }

  abstract signAndSubmitTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult>
  abstract signAndSubmitDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult>
  abstract signAndSubmitExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult>
  abstract signAndSubmitUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>
  abstract signAndSubmitChainedTx(params: SignChainedTxParams[]): Promise<SignChainedTxResult[]>

  abstract signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>
  // The message will be prefixed with 'Alephium Signed Message: ' before signing
  // so that the resulted signature cannot be reused for building transactions.
  abstract signMessage(params: SignMessageParams): Promise<SignMessageResult>
}

// Abstraction for interactive signer (e.g. WalletConnect instance, Extension wallet object)
export abstract class InteractiveSignerProvider<
  EnableOptions extends EnableOptionsBase = EnableOptionsBase
> extends SignerProvider {
  protected abstract unsafeEnable(opt?: EnableOptions): Promise<Account>
  async enable(opt?: EnableOptions): Promise<Account> {
    const account = await this.unsafeEnable(opt)
    SignerProvider.validateAccount(account)
    return account
  }

  abstract disconnect(): Promise<void>
}

export abstract class SignerProviderSimple extends SignerProvider {
  abstract override get nodeProvider(): NodeProvider

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
  override async signAndSubmitChainedTx(params: SignChainedTxParams[]): Promise<SignChainedTxResult[]> {
    const signResults = await this.signChainedTx(params)
    for (const r of signResults) {
      await this.submitTransaction(r)
    }
    return signResults
  }

  protected abstract getPublicKey(address: string): Promise<string>

  async signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
    const response = await this.buildTransferTx(params)
    const signature = await this.signRaw(params.signerAddress, response.txId)
    return { signature, ...response }
  }

  async buildTransferTx(params: SignTransferTxParams): Promise<Omit<SignTransferTxResult, 'signature'>> {
    return TransactionBuilder.from(this.nodeProvider).buildTransferTx(
      params,
      await this.getPublicKey(params.signerAddress)
    )
  }

  async signDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> {
    const response = await this.buildDeployContractTx(params)
    const signature = await this.signRaw(params.signerAddress, response.txId)
    return { signature, ...response }
  }

  async buildDeployContractTx(
    params: SignDeployContractTxParams
  ): Promise<Omit<SignDeployContractTxResult, 'signature'>> {
    return TransactionBuilder.from(this.nodeProvider).buildDeployContractTx(
      params,
      await this.getPublicKey(params.signerAddress)
    )
  }

  async signExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> {
    const response = await this.buildExecuteScriptTx(params)
    const signature = await this.signRaw(params.signerAddress, response.txId)
    return { signature, ...response }
  }

  async buildExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<Omit<SignExecuteScriptTxResult, 'signature'>> {
    return TransactionBuilder.from(this.nodeProvider).buildExecuteScriptTx(
      params,
      await this.getPublicKey(params.signerAddress)
    )
  }

  async signChainedTx(params: SignChainedTxParams[]): Promise<SignChainedTxResult[]> {
    const response = await this.buildChainedTx(params)
    const signatures = await Promise.all(response.map((r, i) => this.signRaw(params[`${i}`].signerAddress, r.txId)))
    return response.map((r, i) => ({ ...r, signature: signatures[`${i}`] } as SignChainedTxResult))
  }

  async buildChainedTx(params: SignChainedTxParams[]): Promise<Omit<SignChainedTxResult, 'signature'>[]> {
    return TransactionBuilder.from(this.nodeProvider).buildChainedTx(
      params,
      await Promise.all(params.map((p) => this.getPublicKey(p.signerAddress)))
    )
  }

  // in general, wallet should show the decoded information to user for confirmation
  // please overwrite this function for real wallet
  async signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
    const response = TransactionBuilder.buildUnsignedTx(params)
    const signature = await this.signRaw(params.signerAddress, response.txId)
    return { signature, ...response }
  }

  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    const messageHash = hashMessage(params.message, params.messageHasher)
    const signature = await this.signRaw(params.signerAddress, messageHash)
    return { signature: signature }
  }

  abstract signRaw(signerAddress: string, hexString: string): Promise<string>
}

export abstract class SignerProviderWithMultipleAccounts extends SignerProviderSimple {
  abstract setSelectedAccount(address: string): Promise<void>

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

  protected unsafeGetSelectedAccount(): Promise<T> {
    if (this._selectedAccount === undefined) {
      throw Error('No account is selected yet')
    } else {
      return Promise.resolve(this._selectedAccount)
    }
  }

  setSelectedAccount(address: string): Promise<void> {
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

export function extendMessage(message: string): string {
  return 'Alephium Signed Message: ' + message
}

export function hashMessage(message: string, hasher: MessageHasher): string {
  switch (hasher) {
    case 'alephium':
      return utils.binToHex(blake.blake2b(extendMessage(message), undefined, 32))
    case 'sha256':
      const sha256 = createHash('sha256')
      sha256.update(new TextEncoder().encode(message))
      return utils.binToHex(sha256.digest())
    case 'blake2b':
      return utils.binToHex(blake.blake2b(message, undefined, 32))
    case 'identity':
      return message
    default:
      throw Error(`Invalid message hasher: ${hasher}`)
  }
}

export function verifySignedMessage(
  message: string,
  messageHasher: MessageHasher,
  publicKey: string,
  signature: string,
  keyType?: KeyType
): boolean {
  const messageHash = hashMessage(message, messageHasher)
  return utils.verifySignature(messageHash, publicKey, signature, keyType)
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
