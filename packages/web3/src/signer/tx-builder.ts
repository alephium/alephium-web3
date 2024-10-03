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
  BuildChainedTxParams,
  BuildChainedTxResult,
  KeyType,
  SignDeployContractChainedTxResult,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignerAddress,
  SignExecuteScriptChainedTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferChainedTxResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from './types'
import { unsignedTxCodec } from '../codec'
import { groupIndexOfTransaction } from '../transaction'
import { blakeHash } from '../codec/hash'
import {
  BuildDeployContractTxResult,
  BuildTransaction,
} from '../api/api-alephium'

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
    return { ...response, gasPrice: fromApiNumber256(response.gasPrice) }
  }

  async buildDeployContractTx(
    params: SignDeployContractTxParams,
    publicKey: string
  ): Promise<Omit<SignDeployContractTxResult, 'signature'>> {
    const data = this.buildDeployContractTxParams(params, publicKey)
    const response = await this.nodeProvider.contracts.postContractsUnsignedTxDeployContract(data)
    const contractId = binToHex(contractIdFromAddress(response.contractAddress))
    return { ...response, groupIndex: response.fromGroup, contractId, gasPrice: fromApiNumber256(response.gasPrice) }
  }

  async buildExecuteScriptTx(
    params: SignExecuteScriptTxParams,
    publicKey: string
  ): Promise<Omit<SignExecuteScriptTxResult, 'signature'>> {
    const data = this.buildExecuteScriptTxParams(params, publicKey)
    const response = await this.nodeProvider.contracts.postContractsUnsignedTxExecuteScript(data)
    return { ...response, groupIndex: response.fromGroup, gasPrice: fromApiNumber256(response.gasPrice) }
  }

  async buildChainedTx(params: BuildChainedTxParams[]): Promise<BuildChainedTxResult[]> {
    const data: BuildTransaction[] = params.map((param) => {
      switch (param.type) {
        case 'Transfer': {
          const value = this.buildTransferTxParams(param, param.publicKey)
          return { type: param.type, value }
        }
        case 'DeployContract': {
          const value = this.buildDeployContractTxParams(param, param.publicKey)
          return { type: param.type, value }
        }
        case 'ExecuteScript': {
          const value = this.buildExecuteScriptTxParams(param, param.publicKey)
          return { type: param.type, value }
        }
        default:
          throw new Error(`Unsupported transaction type: ${(param as any).type}`)
      }
    })

    const buildChainedTxsResponse = await this.nodeProvider.transactions.postTransactionsBuildChained(data)

    const results = buildChainedTxsResponse.map((buildResult) => {
      switch (buildResult.type) {
        case 'Transfer': {
          const buildTransferTxResult = buildResult.value
          return {
            ...buildTransferTxResult,
            gasPrice: fromApiNumber256(buildTransferTxResult.gasPrice),
            type: buildResult.type
          } as SignTransferChainedTxResult
        }
        case 'DeployContract': {
          const buildDeployContractTxResult = buildResult.value as BuildDeployContractTxResult
          const contractId = binToHex(contractIdFromAddress(buildDeployContractTxResult.contractAddress))
          return {
            ...buildDeployContractTxResult,
            groupIndex: buildDeployContractTxResult.fromGroup,
            contractId,
            gasPrice: fromApiNumber256(buildDeployContractTxResult.gasPrice),
            type: buildResult.type
          } as SignDeployContractChainedTxResult
        }
        case 'ExecuteScript': {
          const buildExecuteScriptTxResult = buildResult.value
          return {
            ...buildExecuteScriptTxResult,
            groupIndex: buildExecuteScriptTxResult.fromGroup,
            gasPrice: fromApiNumber256(buildExecuteScriptTxResult.gasPrice),
            type: buildResult.type
          } as SignExecuteScriptChainedTxResult
        }
        default:
          throw new Error(`Unexpected transaction type: ${buildResult.type} for ${buildResult.value.txId}`)
      }
    })

    return results
  }

  buildUnsignedTx(params: SignUnsignedTxParams): Omit<SignUnsignedTxResult, 'signature'> {
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

  private buildDeployContractTxParams(params: SignDeployContractTxParams, publicKey: string): node.BuildDeployContractTx {
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
}
