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

import { binToHex, hexToBinUnsafe } from '../utils'
import { fromApiNumber256, node, NodeProvider, toApiNumber256Optional, toApiTokens } from '../api'
import { addressFromPublicKey, contractIdFromAddress } from '../address'
import { toApiDestinations } from './signer'
import {
  SignChainedTxParams,
  SignChainedTxResult,
  KeyType,
  SignDeployContractChainedTxResult,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignerAddress,
  SignExecuteScriptChainedTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
  SignGrouplessTransferTxParams,
  SignGrouplessDeployContractTxParams,
  SignTransferChainedTxResult,
  SignGrouplessExecuteScriptTxParams
} from './types'
import { unsignedTxCodec } from '../codec'
import { groupIndexOfTransaction } from '../transaction'
import { blakeHash } from '../codec/hash'
import { BuildDeployContractTxResult, BuildChainedTx, BuildExecuteScriptTxResult } from '../api/api-alephium'

export abstract class TransactionBuilder {
  abstract get nodeProvider(): NodeProvider

  static from(nodeProvider: NodeProvider): TransactionBuilder
  static from(baseUrl: string, apiKey?: string, customFetch?: typeof fetch): TransactionBuilder
  static from(param0: string | NodeProvider, param1?: string, customFetch?: typeof fetch): TransactionBuilder {
    const nodeProvider =
      typeof param0 === 'string' ? new NodeProvider(param0, param1, customFetch) : (param0 as NodeProvider)
    return new (class extends TransactionBuilder {
      get nodeProvider(): NodeProvider {
        return nodeProvider
      }
    })()
  }

  private static validatePublicKey(params: SignerAddress, publicKey: string, keyType?: KeyType) {
    const address = addressFromPublicKey(publicKey, keyType)
    if (address !== params.signerAddress) {
      throw new Error('Unmatched public key')
    }
  }

  async buildTransferTx(
    params: SignTransferTxParams,
    publicKey: string
  ): Promise<Omit<SignTransferTxResult, 'signature'>> {
    const data = this.buildTransferTxParams(params, publicKey)
    const response = await this.nodeProvider.transactions.postTransactionsBuild(data)
    return this.convertTransferTxResult(response)
  }

  async buildDeployContractTx(
    params: SignDeployContractTxParams,
    publicKey: string
  ): Promise<Omit<SignDeployContractTxResult, 'signature'>> {
    const data = this.buildDeployContractTxParams(params, publicKey)
    const response = await this.nodeProvider.contracts.postContractsUnsignedTxDeployContract(data)
    return this.convertDeployContractTxResult(response)
  }

  async buildExecuteScriptTx(
    params: SignExecuteScriptTxParams,
    publicKey: string
  ): Promise<Omit<SignExecuteScriptTxResult, 'signature'>> {
    const data = this.buildExecuteScriptTxParams(params, publicKey)
    const response = await this.nodeProvider.contracts.postContractsUnsignedTxExecuteScript(data)
    return this.convertExecuteScriptTxResult(response)
  }

  async buildChainedTx(
    params: SignChainedTxParams[],
    publicKeys: string[]
  ): Promise<Omit<SignChainedTxResult, 'signature'>[]> {
    if (params.length !== publicKeys.length) {
      throw new Error(
        'The number of build chained transaction parameters must match the number of public keys provided'
      )
    }

    const data: BuildChainedTx[] = params.map((param, index) => {
      const paramType = param.type
      switch (paramType) {
        case 'Transfer': {
          const value = this.buildTransferTxParams(param, publicKeys[index])
          return { type: paramType, value }
        }
        case 'DeployContract': {
          const value = this.buildDeployContractTxParams(param, publicKeys[index])
          return { type: paramType, value }
        }
        case 'ExecuteScript': {
          const value = this.buildExecuteScriptTxParams(param, publicKeys[index])
          return { type: paramType, value }
        }
        default:
          throw new Error(`Unsupported transaction type: ${paramType}`)
      }
    })

    const buildChainedTxsResponse = await this.nodeProvider.transactions.postTransactionsBuildChained(data)

    const results = buildChainedTxsResponse.map((buildResult) => {
      const buildResultType = buildResult.type
      switch (buildResultType) {
        case 'Transfer': {
          const buildTransferTxResult = buildResult.value
          return {
            ...this.convertTransferTxResult(buildTransferTxResult),
            type: buildResultType
          }
        }
        case 'DeployContract': {
          const buildDeployContractTxResult = buildResult.value as BuildDeployContractTxResult
          return {
            ...this.convertDeployContractTxResult(buildDeployContractTxResult),
            type: buildResultType
          } as SignDeployContractChainedTxResult
        }
        case 'ExecuteScript': {
          const buildExecuteScriptTxResult = buildResult.value as BuildExecuteScriptTxResult
          return {
            ...this.convertExecuteScriptTxResult(buildExecuteScriptTxResult),
            type: buildResultType
          } as SignExecuteScriptChainedTxResult
        }
        default:
          throw new Error(`Unexpected transaction type: ${buildResultType} for ${buildResult.value.txId}`)
      }
    })

    return results
  }

  async buildGrouplessTransferTx(
    params: SignGrouplessTransferTxParams
  ): Promise<Omit<SignChainedTxResult, 'signature'>[]> {
    const data = this.buildGrouplessTransferTxParams(params)
    const response = await this.nodeProvider.groupless.postGrouplessTransfer(data)
    return response.map((result) => {
      return {
        ...this.convertTransferTxResult(result),
        type: 'Transfer' as const
      }
    })
  }

  async buildGrouplessDeployContractTx(
    params: SignGrouplessDeployContractTxParams
  ): Promise<Omit<SignChainedTxResult, 'signature'>[]> {
    const data = this.buildGrouplessDeployContractTxParams(params)
    const response = await this.nodeProvider.groupless.postGrouplessDeployContract(data)
    const transferTxs = response.transferTxs.map((result) => ({
      ...this.convertTransferTxResult(result),
      type: 'Transfer' as const
    }))
    const deployContractTx = {
      ...this.convertDeployContractTxResult(response.deployContractTx),
      type: 'DeployContract' as const
    }
    return [...transferTxs, deployContractTx]
  }

  async buildGrouplessExecuteScriptTx(
    params: SignGrouplessExecuteScriptTxParams
  ): Promise<Omit<SignChainedTxResult, 'signature'>[]> {
    const data = this.buildGrouplessExecuteScriptTxParams(params)
    const response = await this.nodeProvider.groupless.postGrouplessExecuteScript(data)
    const transferTxs = response.transferTxs.map((result) => ({
      ...this.convertTransferTxResult(result),
      type: 'Transfer' as const
    }))
    const executeScriptTx = {
      ...this.convertExecuteScriptTxResult(response.executeScriptTx),
      type: 'ExecuteScript' as const
    }
    return [...transferTxs, executeScriptTx]
  }

  static buildUnsignedTx(params: SignUnsignedTxParams): Omit<SignUnsignedTxResult, 'signature'> {
    const unsignedTxBin = hexToBinUnsafe(params.unsignedTx)
    const decoded = unsignedTxCodec.decode(unsignedTxBin)
    const txId = binToHex(blakeHash(unsignedTxBin))
    const [fromGroup, toGroup] = groupIndexOfTransaction(decoded)
    return {
      fromGroup: fromGroup,
      toGroup: toGroup,
      unsignedTx: params.unsignedTx,
      txId: txId,
      gasAmount: decoded.gasAmount,
      gasPrice: decoded.gasPrice
    }
  }

  private buildTransferTxParams(params: SignTransferTxParams, publicKey: string): node.BuildTransferTx {
    TransactionBuilder.validatePublicKey(params, publicKey, params.signerKeyType)

    const { destinations, gasPrice, ...rest } = params
    return {
      fromPublicKey: publicKey,
      fromPublicKeyType: params.signerKeyType,
      destinations: toApiDestinations(destinations),
      gasPrice: toApiNumber256Optional(gasPrice),
      ...rest
    }
  }

  private buildGrouplessTransferTxParams(params: SignGrouplessTransferTxParams): node.BuildGrouplessTransferTx {
    return {
      fromAddress: params.fromAddress,
      destinations: toApiDestinations(params.destinations),
      gasPrice: toApiNumber256Optional(params.gasPrice),
      targetBlockHash: params.targetBlockHash
    }
  }

  private buildGrouplessDeployContractTxParams(params: SignGrouplessDeployContractTxParams): node.BuildGrouplessDeployContractTx {
    return {
      fromAddress: params.fromAddress,
      bytecode: params.bytecode,
      initialAttoAlphAmount: toApiNumber256Optional(params.initialAttoAlphAmount),
      initialTokenAmounts: toApiTokens(params.initialTokenAmounts),
      issueTokenAmount: toApiNumber256Optional(params.issueTokenAmount),
      issueTokenTo: params.issueTokenTo,
      gasPrice: toApiNumber256Optional(params.gasPrice),
      targetBlockHash: params.targetBlockHash
    }
  }


  private buildGrouplessExecuteScriptTxParams(params: SignGrouplessExecuteScriptTxParams): node.BuildGrouplessExecuteScriptTx {
    return {
      fromAddress: params.fromAddress,
      bytecode: params.bytecode,
      attoAlphAmount: toApiNumber256Optional(params.attoAlphAmount),
      tokens: toApiTokens(params.tokens),
      gasPrice: toApiNumber256Optional(params.gasPrice),
      targetBlockHash: params.targetBlockHash,
      gasEstimationMultiplier: params.gasEstimationMultiplier
    }
  }

  private buildDeployContractTxParams(
    params: SignDeployContractTxParams,
    publicKey: string
  ): node.BuildDeployContractTx {
    TransactionBuilder.validatePublicKey(params, publicKey, params.signerKeyType)

    const { initialAttoAlphAmount, initialTokenAmounts, issueTokenAmount, gasPrice, ...rest } = params
    return {
      fromPublicKey: publicKey,
      fromPublicKeyType: params.signerKeyType,
      initialAttoAlphAmount: toApiNumber256Optional(initialAttoAlphAmount),
      initialTokenAmounts: toApiTokens(initialTokenAmounts),
      issueTokenAmount: toApiNumber256Optional(issueTokenAmount),
      gasPrice: toApiNumber256Optional(gasPrice),
      ...rest
    }
  }

  private buildExecuteScriptTxParams(params: SignExecuteScriptTxParams, publicKey: string): node.BuildExecuteScriptTx {
    TransactionBuilder.validatePublicKey(params, publicKey, params.signerKeyType)

    const { attoAlphAmount, tokens, gasPrice, ...rest } = params
    return {
      fromPublicKey: publicKey,
      fromPublicKeyType: params.signerKeyType,
      attoAlphAmount: toApiNumber256Optional(attoAlphAmount),
      tokens: toApiTokens(tokens),
      gasPrice: toApiNumber256Optional(gasPrice),
      ...rest
    }
  }

  private convertTransferTxResult(result: node.BuildTransferTxResult): Omit<SignTransferTxResult, 'signature'> {
    return {
      ...result,
      gasPrice: fromApiNumber256(result.gasPrice)
    }
  }

  private convertDeployContractTxResult(
    result: node.BuildDeployContractTxResult
  ): Omit<SignDeployContractTxResult, 'signature'> {
    const contractId = binToHex(contractIdFromAddress(result.contractAddress))
    return {
      ...result,
      groupIndex: result.fromGroup,
      contractId,
      gasPrice: fromApiNumber256(result.gasPrice)
    }
  }

  private convertExecuteScriptTxResult(
    result: node.BuildExecuteScriptTxResult
  ): Omit<SignExecuteScriptTxResult, 'signature'> {
    return {
      ...result,
      groupIndex: result.fromGroup,
      gasPrice: fromApiNumber256(result.gasPrice)
    }
  }
}
