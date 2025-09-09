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
import { addressFromPublicKey, contractIdFromAddress, groupOfAddress, isGrouplessAddress } from '../address'
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
  BuildTxResult,
  isGroupedKeyType
} from './types'
import { unsignedTxCodec } from '../codec'
import { groupIndexOfTransaction } from '../transaction'
import { blakeHash } from '../codec/hash'
import {
  BuildDeployContractTxResult,
  BuildChainedTx,
  BuildExecuteScriptTxResult,
  BuildTransferTxResult
} from '../api/api-alephium'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'
import { scriptCodec } from '../codec/script-codec'
import { LockupScript } from '../codec/lockup-script-codec'

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

  async buildTransferTx(params: SignTransferTxParams, publicKey: string): Promise<BuildTxResult<SignTransferTxResult>> {
    const data = this.buildTransferTxParams(params, publicKey)
    const response = await this.nodeProvider.transactions.postTransactionsBuild(data)
    return this.convertTransferTxResult(response)
  }

  async buildDeployContractTx(
    params: SignDeployContractTxParams,
    publicKey: string
  ): Promise<BuildTxResult<SignDeployContractTxResult>> {
    const data = this.buildDeployContractTxParams(params, publicKey)
    const response = await this.nodeProvider.contracts.postContractsUnsignedTxDeployContract(data)
    return this.convertDeployContractTxResult(response)
  }

  async buildExecuteScriptTx(
    params: SignExecuteScriptTxParams,
    publicKey: string
  ): Promise<BuildTxResult<SignExecuteScriptTxResult>> {
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
          const buildTransferTxResult = buildResult.value as BuildTransferTxResult
          return {
            ...(this.convertTransferTxResult(buildTransferTxResult) as Omit<SignTransferTxResult, 'signature'>),
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

  private static checkAndGetParams(params: SignExecuteScriptTxParams): SignExecuteScriptTxParams {
    if (isGroupedKeyType(params.signerKeyType ?? 'default')) {
      return params
    }

    if (!isGrouplessAddress(params.signerAddress)) {
      throw new Error('Invalid signer key type for groupless address')
    }

    const group = params.group ?? getGroupFromTxScript(params.bytecode)
    const defaultGroup = groupOfAddress(params.signerAddress)
    if (group === undefined || group === defaultGroup) {
      return { ...params, group: defaultGroup }
    }

    const newBytecode = updateBytecodeWithGroup(params.bytecode, group)
    const newParams = { ...params, bytecode: newBytecode }
    return { ...newParams, group }
  }

  private buildExecuteScriptTxParams(params: SignExecuteScriptTxParams, publicKey: string): node.BuildExecuteScriptTx {
    TransactionBuilder.validatePublicKey(params, publicKey, params.signerKeyType)

    const newParams = TransactionBuilder.checkAndGetParams(params)
    const { signerKeyType, attoAlphAmount, tokens, gasPrice, dustAmount, ...rest } = newParams
    return {
      fromPublicKey: publicKey,
      fromPublicKeyType: signerKeyType,
      attoAlphAmount: toApiNumber256Optional(attoAlphAmount),
      tokens: toApiTokens(tokens),
      gasPrice: toApiNumber256Optional(gasPrice),
      dustAmount: toApiNumber256Optional(dustAmount),
      ...rest
    }
  }

  private convertTransferTxResult(result: node.BuildTransferTxResult): BuildTxResult<SignTransferTxResult> {
    // BuildGrouplessTransferTxResult
    if ('fundingTxs' in result) {
      return {
        unsignedTx: result.unsignedTx,
        gasAmount: result.gasAmount,
        gasPrice: fromApiNumber256(result.gasPrice),
        txId: result.txId,
        fromGroup: result.fromGroup,
        toGroup: result.toGroup,
        fundingTxs: result.fundingTxs?.map((r) => ({
          ...r,
          gasPrice: fromApiNumber256(r.gasPrice)
        }))
      }
    }

    return {
      ...result,
      gasPrice: fromApiNumber256(result.gasPrice)
    }
  }

  private convertDeployContractTxResult(
    result: node.BuildDeployContractTxResult
  ): BuildTxResult<SignDeployContractTxResult> {
    if ('fundingTxs' in result) {
      const contractId = binToHex(contractIdFromAddress(result.contractAddress))
      return {
        groupIndex: result.fromGroup,
        unsignedTx: result.unsignedTx,
        gasAmount: result.gasAmount,
        gasPrice: fromApiNumber256(result.gasPrice),
        txId: result.txId,
        contractAddress: result.contractAddress,
        contractId,
        fundingTxs: result.fundingTxs?.map((r) => ({
          ...r,
          gasPrice: fromApiNumber256(r.gasPrice)
        }))
      }
    }

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
  ): BuildTxResult<SignExecuteScriptTxResult> {
    if ('fundingTxs' in result) {
      return {
        groupIndex: result.fromGroup,
        unsignedTx: result.unsignedTx,
        txId: result.txId,
        gasAmount: result.gasAmount,
        simulationResult: result.simulationResult,
        gasPrice: fromApiNumber256(result.gasPrice),
        fundingTxs: result.fundingTxs?.map((r) => ({
          ...r,
          gasPrice: fromApiNumber256(r.gasPrice)
        }))
      }
    }

    return {
      ...result,
      groupIndex: result.fromGroup,
      gasPrice: fromApiNumber256(result.gasPrice)
    }
  }
}

export function getGroupFromTxScript(bytecode: string): number | undefined {
  const script = scriptCodec.decode(hexToBinUnsafe(bytecode))
  const instrs = script.methods.flatMap((method) => method.instrs)
  for (let index = 0; index < instrs.length - 1; index += 1) {
    const instr = instrs[`${index}`]
    const nextInstr = instrs[index + 1]
    if (
      instr.name === 'BytesConst' &&
      instr.value.length === 32 &&
      (nextInstr.name === 'CallExternal' || nextInstr.name === 'CallExternalBySelector')
    ) {
      const groupIndex = instr.value[instr.value.length - 1]
      if (groupIndex >= 0 && groupIndex < TOTAL_NUMBER_OF_GROUPS) {
        return groupIndex
      }
    }
  }
  for (const instr of instrs) {
    if (instr.name === 'BytesConst' && instr.value.length === 32) {
      const groupIndex = instr.value[instr.value.length - 1]
      if (groupIndex >= 0 && groupIndex < TOTAL_NUMBER_OF_GROUPS) {
        return groupIndex
      }
    }
  }
  return undefined
}

export function updateBytecodeWithGroup(bytecode: string, group: number): string {
  const script = scriptCodec.decode(hexToBinUnsafe(bytecode))
  const newMethods = script.methods.map((method) => {
    const newInstrs = method.instrs.map((instr) => {
      if (instr.name === 'AddressConst' && instr.value.kind === 'P2PK') {
        const newLockupScript: LockupScript = { ...instr.value, value: { ...instr.value.value, group } }
        return { ...instr, value: newLockupScript }
      }
      return instr
    })
    return { ...method, instrs: newInstrs }
  })
  const bytes = scriptCodec.encode({ methods: newMethods })
  return binToHex(bytes)
}
