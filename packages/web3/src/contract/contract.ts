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

import { promises as fsPromises } from 'fs'
import {
  fromApiNumber256,
  toApiNumber256,
  NamedVals,
  node,
  NodeProvider,
  Number256,
  toApiToken,
  toApiVal,
  Token,
  Val,
  fromApiTokens,
  getDefaultPrimitiveValue,
  PrimitiveTypes,
  decodeArrayType,
  fromApiPrimitiveVal,
  tryGetCallResult
} from '../api'
import {
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignerProvider,
  Address,
  SignExecuteScriptTxResult
} from '../signer'
import * as ralph from './ralph'
import {
  bs58,
  binToHex,
  Subscription,
  assertType,
  Eq,
  Optional,
  WebCrypto,
  hexToBinUnsafe,
  isDevnet,
  HexString,
  isHexString,
  hexToString
} from '../utils'
import { contractIdFromAddress, groupOfAddress, addressFromContractId, subContractId } from '../address'
import { getCurrentNodeProvider } from '../global'
import { EventSubscribeOptions, EventSubscription, subscribeToEvents } from './events'
import { MINIMAL_CONTRACT_DEPOSIT, ONE_ALPH, TOTAL_NUMBER_OF_GROUPS } from '../constants'
import * as blake from 'blakejs'
import { isContractDebugMessageEnabled } from '../debug'
import {
  contract,
  Method,
  LoadLocal,
  LoadImmFieldByIndex,
  LoadMutFieldByIndex,
  CallerContractId,
  LoadImmField,
  ByteVecEq,
  Assert,
  StoreMutFieldByIndex,
  DestroySelf,
  Pop,
  StoreLocal,
  instrCodec,
  U256Const,
  Instr,
  ApproveToken,
  ApproveAlph,
  CallExternal,
  Dup,
  CallerAddress,
  i32Codec,
  BytesConst
} from '../codec'
import { TraceableError } from '../error'

const crypto = new WebCrypto()

export type FieldsSig = node.FieldsSig
export type MapsSig = node.MapsSig
export type EventSig = node.EventSig
export type FunctionSig = Omit<node.FunctionSig, 'isPublic' | 'usePreapprovedAssets' | 'useAssetsInContract'>
export type Fields = NamedVals
export type Arguments = NamedVals
export type Constant = node.Constant
export type Enum = node.Enum

export const StdIdFieldName = '__stdInterfaceId'

export type CompilerOptions = node.CompilerOptions & {
  errorOnWarnings: boolean
}

export const DEFAULT_NODE_COMPILER_OPTIONS: node.CompilerOptions = {
  ignoreUnusedConstantsWarnings: false,
  ignoreUnusedVariablesWarnings: false,
  ignoreUnusedFieldsWarnings: false,
  ignoreUnusedPrivateFunctionsWarnings: false,
  ignoreUpdateFieldsCheckWarnings: false,
  ignoreCheckExternalCallerWarnings: false,
  ignoreUnusedFunctionReturnWarnings: false,
  skipAbstractContractCheck: false
}

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = { errorOnWarnings: true, ...DEFAULT_NODE_COMPILER_OPTIONS }

export class Struct {
  name: string
  fieldNames: string[]
  fieldTypes: string[]
  isMutable: boolean[]

  constructor(name: string, fieldNames: string[], fieldTypes: string[], isMutable: boolean[]) {
    this.name = name
    this.fieldNames = fieldNames
    this.fieldTypes = fieldTypes
    this.isMutable = isMutable
  }

  static fromJson(json: any): Struct {
    if (json.name === null || json.fieldNames === null || json.fieldTypes === null || json.isMutable === null) {
      throw Error('The JSON for struct is incomplete')
    }
    return new Struct(json.name, json.fieldNames, json.fieldTypes, json.isMutable)
  }

  static fromStructSig(sig: node.StructSig): Struct {
    return new Struct(sig.name, sig.fieldNames, sig.fieldTypes, sig.isMutable)
  }

  toJson(): any {
    return {
      name: this.name,
      fieldNames: this.fieldNames,
      fieldTypes: this.fieldTypes,
      isMutable: this.isMutable
    }
  }
}

export abstract class Artifact {
  readonly version: string
  readonly name: string
  readonly functions: FunctionSig[]

  constructor(version: string, name: string, functions: FunctionSig[]) {
    this.version = version
    this.name = name
    this.functions = functions
  }

  abstract buildByteCodeToDeploy(initialFields: Fields, isDevnet: boolean, exposePrivateFunctions: boolean): string

  async isDevnet(signer: SignerProvider): Promise<boolean> {
    if (!signer.nodeProvider) {
      return false
    }
    const chainParams = await signer.nodeProvider.infos.getInfosChainParams()
    return isDevnet(chainParams.networkId)
  }
}

function fromFunctionSig(sig: node.FunctionSig): FunctionSig {
  return {
    name: sig.name,
    paramNames: sig.paramNames,
    paramTypes: sig.paramTypes,
    paramIsMutable: sig.paramIsMutable,
    returnTypes: sig.returnTypes
  }
}

export class Contract extends Artifact {
  readonly bytecode: string
  readonly bytecodeDebugPatch: string
  readonly codeHash: string
  readonly fieldsSig: FieldsSig
  readonly eventsSig: EventSig[]
  readonly constants: Constant[]
  readonly enums: Enum[]
  readonly structs: Struct[]
  readonly mapsSig?: MapsSig
  readonly stdInterfaceId?: HexString

  readonly bytecodeDebug: string
  readonly codeHashDebug: string
  readonly decodedContract: contract.Contract

  private bytecodeForTesting: string | undefined
  private decodedTestingContract: contract.Contract | undefined
  private codeHashForTesting: string | undefined

  constructor(
    version: string,
    name: string,
    bytecode: string,
    bytecodeDebugPatch: string,
    codeHash: string,
    codeHashDebug: string,
    fieldsSig: FieldsSig,
    eventsSig: EventSig[],
    functions: FunctionSig[],
    constants: Constant[],
    enums: Enum[],
    structs: Struct[],
    mapsSig?: MapsSig,
    stdInterfaceId?: HexString
  ) {
    super(version, name, functions)
    this.bytecode = bytecode
    this.bytecodeDebugPatch = bytecodeDebugPatch
    this.codeHash = codeHash
    this.fieldsSig = fieldsSig
    this.eventsSig = eventsSig
    this.constants = constants
    this.enums = enums
    this.structs = structs
    this.mapsSig = mapsSig
    this.stdInterfaceId = stdInterfaceId

    this.bytecodeDebug = ralph.buildDebugBytecode(this.bytecode, this.bytecodeDebugPatch)
    this.codeHashDebug = codeHashDebug

    this.decodedContract = contract.contractCodec.decodeContract(hexToBinUnsafe(this.bytecode))
    this.bytecodeForTesting = undefined
    this.decodedTestingContract = undefined
    this.codeHashForTesting = undefined
  }

  isInlineFunc(index: number): boolean {
    if (index >= this.functions.length) {
      throw new Error(`Invalid function index ${index}, function size: ${this.functions.length}`)
    }
    const inlineFuncFromIndex = this.decodedContract.methods.length
    return index >= inlineFuncFromIndex
  }

  getByteCodeForTesting(): string {
    if (this.bytecodeForTesting !== undefined) return this.bytecodeForTesting

    const hasInlineFunction = this.functions.length > this.decodedContract.methods.length
    if (!hasInlineFunction && this.publicFunctions().length == this.functions.length) {
      this.bytecodeForTesting = this.bytecodeDebug
      this.codeHashForTesting = this.codeHashDebug
      return this.bytecodeForTesting
    }

    const decodedDebugContract = contract.contractCodec.decodeContract(hexToBinUnsafe(this.bytecodeDebug))
    const methods = decodedDebugContract.methods.map((method) => ({ ...method, isPublic: true }))
    const bytecodeForTesting = contract.contractCodec.encodeContract({
      fieldLength: decodedDebugContract.fieldLength,
      methods: methods
    })
    const codeHashForTesting = blake.blake2b(bytecodeForTesting, undefined, 32)
    this.bytecodeForTesting = binToHex(bytecodeForTesting)
    this.codeHashForTesting = binToHex(codeHashForTesting)
    return this.bytecodeForTesting
  }

  getDecodedTestingContract() {
    if (this.decodedTestingContract !== undefined) return this.decodedTestingContract
    const bytecodeForTesting = hexToBinUnsafe(this.getByteCodeForTesting())
    this.decodedTestingContract = contract.contractCodec.decodeContract(bytecodeForTesting)
    return this.decodedTestingContract
  }

  hasCodeHash(hash: string): boolean {
    return this.codeHash === hash || this.codeHashDebug === hash || this.codeHashForTesting === hash
  }

  getDecodedMethod(methodIndex: number): Method {
    return this.decodedContract.methods[`${methodIndex}`]
  }

  publicFunctions(): FunctionSig[] {
    return this.functions.filter((_, index) => this.getDecodedMethod(index).isPublic)
  }

  usingPreapprovedAssetsFunctions(): FunctionSig[] {
    return this.functions.filter((_, index) => this.getDecodedMethod(index).usePreapprovedAssets)
  }

  usingAssetsInContractFunctions(): FunctionSig[] {
    return this.functions.filter((_, index) => this.getDecodedMethod(index).useContractAssets)
  }

  isMethodUsePreapprovedAssets(isDevnet: boolean, methodIndex: number): boolean {
    if (!isDevnet || !this.isInlineFunc(methodIndex)) return this.getDecodedMethod(methodIndex).usePreapprovedAssets
    const contract = this.getDecodedTestingContract()
    return contract.methods[`${methodIndex}`].usePreapprovedAssets
  }

  // TODO: safely parse json
  static fromJson(artifact: any, bytecodeDebugPatch = '', codeHashDebug = '', structs: Struct[] = []): Contract {
    if (
      artifact.version == null ||
      artifact.name == null ||
      artifact.bytecode == null ||
      artifact.codeHash == null ||
      artifact.fieldsSig == null ||
      artifact.eventsSig == null ||
      artifact.constants == null ||
      artifact.enums == null ||
      artifact.functions == null
    ) {
      throw Error('The artifact JSON for contract is incomplete')
    }
    const contract = new Contract(
      artifact.version,
      artifact.name,
      artifact.bytecode,
      bytecodeDebugPatch,
      artifact.codeHash,
      codeHashDebug ? codeHashDebug : artifact.codeHash,
      artifact.fieldsSig,
      artifact.eventsSig,
      artifact.functions,
      artifact.constants,
      artifact.enums,
      structs,
      artifact.mapsSig === null ? undefined : artifact.mapsSig,
      artifact.stdInterfaceId === null ? undefined : artifact.stdInterfaceId
    )
    return contract
  }

  static fromCompileResult(result: node.CompileContractResult, structs: Struct[] = []): Contract {
    return new Contract(
      result.version,
      result.name,
      result.bytecode,
      result.bytecodeDebugPatch,
      result.codeHash,
      result.codeHashDebug,
      result.fields,
      result.events,
      result.functions.map(fromFunctionSig),
      result.constants,
      result.enums,
      structs,
      result.maps,
      result.stdInterfaceId
    )
  }

  // support both 'code.ral' and 'code.ral.json'
  static async fromArtifactFile(
    path: string,
    bytecodeDebugPatch: string,
    codeHashDebug: string,
    structs: Struct[] = []
  ): Promise<Contract> {
    const content = await fsPromises.readFile(path)
    const artifact = JSON.parse(content.toString())
    return Contract.fromJson(artifact, bytecodeDebugPatch, codeHashDebug, structs)
  }

  override toString(): string {
    const object: any = {
      version: this.version,
      name: this.name,
      bytecode: this.bytecode,
      codeHash: this.codeHash,
      fieldsSig: this.fieldsSig,
      eventsSig: this.eventsSig,
      functions: this.functions,
      constants: this.constants,
      enums: this.enums
    }
    if (this.mapsSig !== undefined) {
      object.mapsSig = this.mapsSig
    }
    if (this.stdInterfaceId !== undefined) {
      object.stdInterfaceId = this.stdInterfaceId
    }
    return JSON.stringify(object, null, 2)
  }

  getInitialFieldsWithDefaultValues(): Fields {
    const fields =
      this.stdInterfaceId === undefined
        ? this.fieldsSig
        : {
            names: this.fieldsSig.names.slice(0, -1),
            types: this.fieldsSig.types.slice(0, -1),
            isMutable: this.fieldsSig.isMutable.slice(0, -1)
          }
    return getDefaultValue(fields, this.structs)
  }

  toState<T extends Fields>(fields: T, asset: Asset, address?: string): ContractState<T> {
    const addressDef = typeof address !== 'undefined' ? address : Contract.randomAddress()
    return {
      address: addressDef,
      contractId: binToHex(contractIdFromAddress(addressDef)),
      bytecode: this.bytecode,
      codeHash: this.codeHash,
      fields: fields,
      fieldsSig: this.fieldsSig,
      asset: asset
    }
  }

  // no need to be cryptographically strong random
  static randomAddress(): string {
    const bytes = new Uint8Array(33)
    crypto.getRandomValues(bytes)
    bytes[0] = 3
    return bs58.encode(bytes)
  }

  printDebugMessages(funcName: string, messages: DebugMessage[]) {
    if (isContractDebugMessageEnabled() && messages.length != 0) {
      console.log(`Testing ${this.name}.${funcName}:`)
      messages.forEach((m) => printDebugMessage(m))
    }
  }

  toApiFields(fields?: Fields): node.Val[] {
    if (typeof fields === 'undefined') {
      return []
    } else {
      return toApiFields(fields, this.fieldsSig, this.structs)
    }
  }

  toApiArgs(funcName: string, args?: Arguments): node.Val[] {
    if (args) {
      const func = this.functions.find((func) => func.name == funcName)
      if (func == null) {
        throw new Error(`Invalid function name: ${funcName}`)
      }

      return toApiArgs(args, func, this.structs)
    } else {
      return []
    }
  }

  getMethodIndex(funcName: string): number {
    return this.functions.findIndex((func) => func.name === funcName)
  }

  toApiContractStates(states?: ContractState[]): node.ContractState[] | undefined {
    return typeof states != 'undefined' ? states.map((state) => toApiContractState(state, this.structs)) : undefined
  }

  toApiTestContractParams(funcName: string, params: TestContractParams): node.TestContract {
    const allFields =
      params.initialFields === undefined
        ? []
        : ralph.flattenFields(
            params.initialFields,
            this.fieldsSig.names,
            this.fieldsSig.types,
            this.fieldsSig.isMutable,
            this.structs
          )
    const immFields = allFields.filter((f) => !f.isMutable).map((f) => toApiVal(f.value, f.type))
    const mutFields = allFields.filter((f) => f.isMutable).map((f) => toApiVal(f.value, f.type))
    const methodIndex = this.getMethodIndex(funcName)
    return {
      group: params.group,
      blockHash: params.blockHash,
      blockTimeStamp: params.blockTimeStamp,
      txId: params.txId,
      address: params.address,
      callerAddress: params.callerAddress,
      bytecode: this.isInlineFunc(methodIndex) ? this.getByteCodeForTesting() : this.bytecodeDebug,
      initialImmFields: immFields,
      initialMutFields: mutFields,
      initialAsset: typeof params.initialAsset !== 'undefined' ? toApiAsset(params.initialAsset) : undefined,
      methodIndex,
      args: this.toApiArgs(funcName, params.testArgs),
      existingContracts: this.toApiContractStates(params.existingContracts),
      inputAssets: toApiInputAssets(params.inputAssets)
    }
  }

  fromApiContractState(state: node.ContractState): ContractState<Fields> {
    return {
      address: state.address,
      contractId: binToHex(contractIdFromAddress(state.address)),
      bytecode: state.bytecode,
      initialStateHash: state.initialStateHash,
      codeHash: state.codeHash,
      fields: fromApiFields(state.immFields, state.mutFields, this.fieldsSig, this.structs),
      fieldsSig: this.fieldsSig,
      asset: fromApiAsset(state.asset)
    }
  }

  static fromApiContractState(
    state: node.ContractState,
    getContractByCodeHash: (codeHash: string) => Contract
  ): ContractState {
    const contract = getContractByCodeHash(state.codeHash)
    return contract.fromApiContractState(state)
  }

  static ContractCreatedEventIndex = -1
  static ContractCreatedEvent: EventSig = {
    name: 'ContractCreated',
    fieldNames: ['address', 'parentAddress', 'stdInterfaceId'],
    fieldTypes: ['Address', 'Address', 'ByteVec']
  }

  static ContractDestroyedEventIndex = -2
  static ContractDestroyedEvent: EventSig = {
    name: 'ContractDestroyed',
    fieldNames: ['address'],
    fieldTypes: ['Address']
  }
  static DebugEventIndex = -3

  static fromApiEvent(
    event: node.ContractEventByTxId,
    codeHash: string | undefined,
    txId: string,
    getContractByCodeHash: (codeHash: string) => Contract
  ): ContractEvent {
    let fields: Fields
    let name: string

    if (event.eventIndex == Contract.ContractCreatedEventIndex) {
      fields = toContractCreatedEventFields(fromApiEventFields(event.fields, Contract.ContractCreatedEvent, true))
      name = Contract.ContractCreatedEvent.name
    } else if (event.eventIndex == Contract.ContractDestroyedEventIndex) {
      fields = fromApiEventFields(event.fields, Contract.ContractDestroyedEvent, true)
      name = Contract.ContractDestroyedEvent.name
    } else {
      const contract = getContractByCodeHash(codeHash!)
      const eventSig = contract.eventsSig[event.eventIndex]
      fields = fromApiEventFields(event.fields, eventSig)
      name = eventSig.name
    }

    return {
      txId: txId,
      blockHash: event.blockHash,
      contractAddress: event.contractAddress,
      name: name,
      eventIndex: event.eventIndex,
      fields: fields
    }
  }

  fromApiTestContractResult(
    methodName: string,
    result: node.TestContractResult,
    txId: string,
    getContractByCodeHash: (codeHash: string) => Contract
  ): TestContractResult<unknown> {
    const methodIndex = this.functions.findIndex((sig) => sig.name === methodName)
    const returnTypes = this.functions[`${methodIndex}`].returnTypes
    const rawReturn = fromApiArray(result.returns, returnTypes, this.structs)
    const returns = rawReturn.length === 0 ? null : rawReturn.length === 1 ? rawReturn[0] : rawReturn

    const addressToCodeHash = new Map<string, string>()
    addressToCodeHash.set(result.address, result.codeHash)
    result.contracts.forEach((contract) => addressToCodeHash.set(contract.address, contract.codeHash))
    return {
      contractId: binToHex(contractIdFromAddress(result.address)),
      contractAddress: result.address,
      returns: returns,
      gasUsed: result.gasUsed,
      contracts: result.contracts.map((contract) => Contract.fromApiContractState(contract, getContractByCodeHash)),
      txOutputs: result.txOutputs.map(fromApiOutput),
      events: Contract.fromApiEvents(result.events, addressToCodeHash, txId, getContractByCodeHash),
      debugMessages: result.debugMessages
    }
  }

  async txParamsForDeployment<P extends Fields>(
    signer: SignerProvider,
    params: DeployContractParams<P>
  ): Promise<SignDeployContractTxParams> {
    const isDevnet = await this.isDevnet(signer)
    const initialFields: Fields = params.initialFields ?? {}
    const bytecode = this.buildByteCodeToDeploy(
      addStdIdToFields(this, initialFields),
      isDevnet,
      params.exposePrivateFunctions ?? false
    )
    const selectedAccount = await signer.getSelectedAccount()
    const signerParams: SignDeployContractTxParams = {
      signerAddress: selectedAccount.address,
      signerKeyType: selectedAccount.keyType,
      bytecode: bytecode,
      initialAttoAlphAmount: params?.initialAttoAlphAmount,
      issueTokenAmount: params?.issueTokenAmount,
      issueTokenTo: params?.issueTokenTo,
      initialTokenAmounts: params?.initialTokenAmounts,
      gasAmount: params?.gasAmount,
      gasPrice: params?.gasPrice
    }
    return signerParams
  }

  buildByteCodeToDeploy(initialFields: Fields, isDevnet: boolean, exposePrivateFunctions = false): string {
    if (exposePrivateFunctions && !isDevnet) {
      throw new Error('Cannot expose private functions in non-devnet environment')
    }

    try {
      const bytecode =
        exposePrivateFunctions && isDevnet
          ? this.getByteCodeForTesting()
          : isDevnet
          ? this.bytecodeDebug
          : this.bytecode
      return ralph.buildContractByteCode(bytecode, initialFields, this.fieldsSig, this.structs)
    } catch (error) {
      throw new TraceableError(`Failed to build bytecode for contract ${this.name}`, error)
    }
  }

  static fromApiEvents(
    events: node.ContractEventByTxId[],
    addressToCodeHash: Map<string, string>,
    txId: string,
    getContractByCodeHash: (codeHash: string) => Contract
  ): ContractEvent[] {
    return events.map((event) => {
      const contractAddress = event.contractAddress
      const codeHash = addressToCodeHash.get(contractAddress)
      if (typeof codeHash !== 'undefined' || event.eventIndex < 0) {
        return Contract.fromApiEvent(event, codeHash, txId, getContractByCodeHash)
      } else {
        throw Error(`Cannot find codeHash for the contract address: ${contractAddress}`)
      }
    })
  }

  toApiCallContract<T extends Arguments>(
    params: CallContractParams<T>,
    groupIndex: number,
    contractAddress: string,
    methodIndex: number
  ): node.CallContract {
    const functionSig = this.functions[`${methodIndex}`]
    const args = toApiArgs(params.args ?? {}, functionSig, this.structs)
    return {
      ...params,
      group: groupIndex,
      address: contractAddress,
      methodIndex: methodIndex,
      args: args,
      inputAssets: toApiInputAssets(params.inputAssets)
    }
  }

  fromApiCallContractResult(
    result: node.CallContractResult,
    txId: string,
    methodIndex: number,
    getContractByCodeHash: (codeHash: string) => Contract
  ): CallContractResult<unknown> {
    const returnTypes = this.functions[`${methodIndex}`].returnTypes
    const callResult = tryGetCallResult(result)
    return fromCallResult(callResult, txId, returnTypes, this.structs, getContractByCodeHash)
  }
}

function fromCallResult(
  callResult: node.CallContractSucceeded | node.CallTxScriptResult,
  txId: string,
  returnTypes: string[],
  structs: Struct[],
  getContractByCodeHash: (codeHash: string) => Contract
): CallContractResult<unknown> {
  const rawReturn = fromApiArray(callResult.returns, returnTypes, structs)
  const returns = rawReturn.length === 0 ? null : rawReturn.length === 1 ? rawReturn[0] : rawReturn

  const addressToCodeHash = new Map<string, string>()
  callResult.contracts.forEach((contract) => addressToCodeHash.set(contract.address, contract.codeHash))
  return {
    returns: returns,
    gasUsed: callResult.gasUsed,
    contracts: callResult.contracts.map((state) => Contract.fromApiContractState(state, getContractByCodeHash)),
    txInputs: callResult.txInputs,
    txOutputs: callResult.txOutputs.map((output) => fromApiOutput(output)),
    events: Contract.fromApiEvents(callResult.events, addressToCodeHash, txId, getContractByCodeHash),
    debugMessages: callResult.debugMessages
  }
}

export class Script extends Artifact {
  readonly bytecodeTemplate: string
  readonly bytecodeDebugPatch: string
  readonly fieldsSig: FieldsSig
  readonly structs: Struct[]

  constructor(
    version: string,
    name: string,
    bytecodeTemplate: string,
    bytecodeDebugPatch: string,
    fieldsSig: FieldsSig,
    functions: FunctionSig[],
    structs: Struct[]
  ) {
    super(version, name, functions)
    this.bytecodeTemplate = bytecodeTemplate
    this.bytecodeDebugPatch = bytecodeDebugPatch
    this.fieldsSig = fieldsSig
    this.structs = structs
  }

  static fromCompileResult(result: node.CompileScriptResult, structs: Struct[] = []): Script {
    return new Script(
      result.version,
      result.name,
      result.bytecodeTemplate,
      result.bytecodeDebugPatch,
      result.fields,
      result.functions.map(fromFunctionSig),
      structs
    )
  }

  // TODO: safely parse json
  static fromJson(artifact: any, bytecodeDebugPatch = '', structs: Struct[] = []): Script {
    if (
      artifact.version == null ||
      artifact.name == null ||
      artifact.bytecodeTemplate == null ||
      artifact.fieldsSig == null ||
      artifact.functions == null
    ) {
      throw Error('The artifact JSON for script is incomplete')
    }
    return new Script(
      artifact.version,
      artifact.name,
      artifact.bytecodeTemplate,
      bytecodeDebugPatch,
      artifact.fieldsSig,
      artifact.functions,
      structs
    )
  }

  static async fromArtifactFile(path: string, bytecodeDebugPatch: string, structs: Struct[] = []): Promise<Script> {
    const content = await fsPromises.readFile(path)
    const artifact = JSON.parse(content.toString())
    return this.fromJson(artifact, bytecodeDebugPatch, structs)
  }

  override toString(): string {
    const object = {
      version: this.version,
      name: this.name,
      bytecodeTemplate: this.bytecodeTemplate,
      fieldsSig: this.fieldsSig,
      functions: this.functions
    }
    return JSON.stringify(object, null, 2)
  }

  async txParamsForExecution<P extends Fields>(
    signer: SignerProvider,
    params: ExecuteScriptParams<P>
  ): Promise<SignExecuteScriptTxParams> {
    const selectedAccount = await signer.getSelectedAccount()
    const signerParams: SignExecuteScriptTxParams = {
      signerAddress: selectedAccount.address,
      signerKeyType: selectedAccount.keyType,
      bytecode: this.buildByteCodeToDeploy(params.initialFields ?? {}),
      attoAlphAmount: params.attoAlphAmount,
      tokens: params.tokens,
      gasAmount: params.gasAmount,
      gasPrice: params.gasPrice
    }
    return signerParams
  }

  buildByteCodeToDeploy(initialFields: Fields): string {
    try {
      return ralph.buildScriptByteCode(this.bytecodeTemplate, initialFields, this.fieldsSig, this.structs)
    } catch (error) {
      throw new TraceableError(`Failed to build bytecode for script ${this.name}`, error)
    }
  }
}

export function fromApiFields(
  immFields: node.Val[],
  mutFields: node.Val[],
  fieldsSig: FieldsSig,
  structs: Struct[]
): NamedVals {
  let [immIndex, mutIndex] = [0, 0]
  const func = (type: string, isMutable: boolean): Val => {
    const nodeVal = isMutable ? mutFields[mutIndex++] : immFields[immIndex++]
    return fromApiPrimitiveVal(nodeVal, type)
  }

  return fieldsSig.names.reduce((acc, name, index) => {
    const fieldType = fieldsSig.types[`${index}`]
    const isMutable = fieldsSig.isMutable[`${index}`]
    acc[`${name}`] = buildVal(isMutable, fieldType, structs, func)
    return acc
  }, {})
}

function buildVal(
  isMutable: boolean,
  type: string,
  structs: Struct[],
  func: (primitiveType: string, isMutable: boolean) => Val
): Val {
  if (type.startsWith('[')) {
    const [baseType, size] = decodeArrayType(type)
    return Array.from(Array(size).keys()).map(() => buildVal(isMutable, baseType, structs, func))
  }
  const struct = structs.find((s) => s.name === type)
  if (struct !== undefined) {
    return struct.fieldNames.reduce((acc, name, index) => {
      const fieldType = struct.fieldTypes[`${index}`]
      const isFieldMutable = isMutable && struct.isMutable[`${index}`]
      acc[`${name}`] = buildVal(isFieldMutable, fieldType, structs, func)
      return acc
    }, {})
  }
  const primitiveType = PrimitiveTypes.includes(type) ? type : 'ByteVec' // contract type
  return func(primitiveType, isMutable)
}

export function getDefaultValue(fieldsSig: FieldsSig, structs: Struct[]): Fields {
  return fieldsSig.names.reduce((acc, name, index) => {
    const type = fieldsSig.types[`${index}`]
    acc[`${name}`] = buildVal(false, type, structs, getDefaultPrimitiveValue)
    return acc
  }, {})
}

function fromApiVal(iter: IterableIterator<node.Val>, type: string, structs: Struct[], systemEvent = false): Val {
  const func = (primitiveType: string): Val => {
    const currentValue = iter.next()
    if (currentValue.done) throw Error('Not enough vals')
    return fromApiPrimitiveVal(currentValue.value, primitiveType, systemEvent)
  }
  return buildVal(false, type, structs, func)
}

export function fromApiArray(values: node.Val[], types: string[], structs: Struct[]): Val[] {
  const iter = values.values()
  return types.map((type) => fromApiVal(iter, type, structs))
}

export function fromApiEventFields(vals: node.Val[], eventSig: node.EventSig, systemEvent = false): Fields {
  const iter = vals.values()
  return eventSig.fieldNames.reduce((acc, name, index) => {
    const type = eventSig.fieldTypes[`${index}`]
    // currently event does not support struct type
    acc[`${name}`] = fromApiVal(iter, type, [], systemEvent)
    return acc
  }, {})
}

export interface Asset {
  alphAmount: Number256
  tokens?: Token[]
}

function toApiAsset(asset: Asset): node.AssetState {
  return {
    attoAlphAmount: toApiNumber256(asset.alphAmount),
    tokens: typeof asset.tokens !== 'undefined' ? asset.tokens.map(toApiToken) : []
  }
}

function fromApiAsset(asset: node.AssetState): Asset {
  return {
    alphAmount: fromApiNumber256(asset.attoAlphAmount),
    tokens: fromApiTokens(asset.tokens)
  }
}

export interface InputAsset {
  address: string
  asset: Asset
}

export interface ContractState<T extends Fields = Fields> {
  address: string
  contractId: string
  bytecode: string
  initialStateHash?: string
  codeHash: string
  fields: T
  fieldsSig: FieldsSig
  asset: Asset
}

export interface ContractStateWithMaps<
  T extends Fields = Fields,
  M extends Record<string, Map<Val, Val>> = Record<string, Map<Val, Val>>
> extends ContractState<T> {
  maps?: M
}

function toApiContractState(state: ContractState, structs: Struct[]): node.ContractState {
  const stateFields = state.fields ?? {}
  const fieldsSig = state.fieldsSig
  const allFields = ralph.flattenFields(stateFields, fieldsSig.names, fieldsSig.types, fieldsSig.isMutable, structs)
  const immFields = allFields.filter((f) => !f.isMutable).map((f) => toApiVal(f.value, f.type))
  const mutFields = allFields.filter((f) => f.isMutable).map((f) => toApiVal(f.value, f.type))
  return {
    address: state.address,
    bytecode: state.bytecode,
    codeHash: state.codeHash,
    initialStateHash: state.initialStateHash,
    immFields,
    mutFields,
    asset: toApiAsset(state.asset)
  }
}

function toApiFields(fields: Fields, fieldsSig: FieldsSig, structs: Struct[]): node.Val[] {
  return ralph
    .flattenFields(fields, fieldsSig.names, fieldsSig.types, fieldsSig.isMutable, structs)
    .map((f) => toApiVal(f.value, f.type))
}

function toApiArgs(args: Arguments, funcSig: FunctionSig, structs: Struct[]): node.Val[] {
  return ralph
    .flattenFields(args, funcSig.paramNames, funcSig.paramTypes, funcSig.paramIsMutable, structs)
    .map((f) => toApiVal(f.value, f.type))
}

function toApiInputAsset(inputAsset: InputAsset): node.TestInputAsset {
  return { address: inputAsset.address, asset: toApiAsset(inputAsset.asset) }
}

function toApiInputAssets(inputAssets?: InputAsset[]): node.TestInputAsset[] | undefined {
  return typeof inputAssets !== 'undefined' ? inputAssets.map(toApiInputAsset) : undefined
}

export type TestContractParamsWithoutMaps<F extends Fields = Fields, A extends Arguments = Arguments> = Omit<
  TestContractParams<F, A>,
  'initialMaps'
>

export interface TestContractParams<
  F extends Fields = Fields,
  A extends Arguments = Arguments,
  M extends Record<string, Map<Val, Val>> = Record<string, Map<Val, Val>>
> {
  group?: number // default 0
  address?: string
  callerAddress?: string
  blockHash?: string
  blockTimeStamp?: number
  txId?: string
  initialFields: F
  initialMaps?: M
  initialAsset?: Asset // default 1 ALPH
  testArgs: A
  existingContracts?: ContractStateWithMaps[] // default no existing contracts
  inputAssets?: InputAsset[] // default no input asserts
}

export interface ContractEvent<T extends Fields = Fields> {
  txId: string
  blockHash: string
  contractAddress: string
  eventIndex: number
  name: string
  fields: T
}

export type DebugMessage = node.DebugMessage

export type TestContractResultWithoutMaps<R> = Omit<TestContractResult<R>, 'maps'>

export interface TestContractResult<R, M extends Record<string, Map<Val, Val>> = Record<string, Map<Val, Val>>> {
  contractId: string
  contractAddress: string
  returns: R
  gasUsed: number
  maps?: M
  contracts: ContractStateWithMaps[]
  txOutputs: Output[]
  events: ContractEvent[]
  debugMessages: DebugMessage[]
}
export declare type Output = AssetOutput | ContractOutput
export interface AssetOutput extends Asset {
  type: string
  address: string
  lockTime: number
  message: string
}
export interface ContractOutput {
  type: string
  address: string
  alphAmount: Number256
  tokens?: Token[]
}

function fromApiOutput(output: node.Output): Output {
  if (output.type === 'AssetOutput') {
    const asset = output as node.AssetOutput
    return {
      type: 'AssetOutput',
      address: asset.address,
      alphAmount: fromApiNumber256(asset.attoAlphAmount),
      tokens: fromApiTokens(asset.tokens),
      lockTime: asset.lockTime,
      message: asset.message
    }
  } else if (output.type === 'ContractOutput') {
    const asset = output as node.ContractOutput
    return {
      type: 'ContractOutput',
      address: asset.address,
      alphAmount: fromApiNumber256(asset.attoAlphAmount),
      tokens: fromApiTokens(asset.tokens)
    }
  } else {
    throw new Error(`Unknown output type: ${output}`)
  }
}

export function randomTxId(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return binToHex(bytes)
}

export interface DeployContractParams<P extends Fields = Fields> {
  initialFields: P
  initialAttoAlphAmount?: Number256
  initialTokenAmounts?: Token[]
  issueTokenAmount?: Number256
  issueTokenTo?: string
  gasAmount?: number
  gasPrice?: Number256
  exposePrivateFunctions?: boolean
}
assertType<
  Eq<
    Omit<DeployContractParams<undefined>, 'initialFields' | 'exposePrivateFunctions'>,
    Omit<SignDeployContractTxParams, 'signerAddress' | 'signerKeyType' | 'bytecode'>
  >
>
export type DeployContractResult<T extends ContractInstance> = Omit<
  SignDeployContractTxResult,
  'contractId' | 'contractAddress' | 'groupIndex'
> & {
  contractInstance: T
}

export abstract class ContractFactory<I extends ContractInstance, F extends Fields = Fields> {
  readonly contract: Contract

  constructor(contract: Contract) {
    this.contract = contract
  }

  abstract at(address: string): I

  async deploy(signer: SignerProvider, deployParams: DeployContractParams<F>): Promise<DeployContractResult<I>> {
    const signerParams = await this.contract.txParamsForDeployment(signer, {
      ...deployParams,
      initialFields: addStdIdToFields(this.contract, deployParams.initialFields)
    })
    const result = await signer.signAndSubmitDeployContractTx(signerParams)
    return {
      ...result,
      contractInstance: this.at(result.contractAddress)
    }
  }

  async deployTemplate(signer: SignerProvider): Promise<DeployContractResult<I>> {
    return this.deploy(signer, {
      initialFields: this.contract.getInitialFieldsWithDefaultValues() as F
    })
  }

  // This is used for testing contract functions
  protected stateForTest_(
    initFields: F,
    asset?: Asset,
    address?: string,
    maps?: Record<string, Map<Val, Val>>
  ): ContractState<F> | ContractStateWithMaps<F> {
    const newAsset = {
      alphAmount: asset?.alphAmount ?? MINIMAL_CONTRACT_DEPOSIT,
      tokens: asset?.tokens
    }
    const state = this.contract.toState(addStdIdToFields(this.contract, initFields), newAsset, address)
    return {
      ...state,
      bytecode: this.contract.bytecodeDebug,
      codeHash: this.contract.codeHash,
      maps: maps
    }
  }
}

export class ExecutableScript<P extends Fields = Fields, R extends Val | null = null> {
  readonly script: Script
  readonly getContractByCodeHash: (codeHash: string) => Contract

  constructor(script: Script, getContractByCodeHash: (codeHash: string) => Contract) {
    this.script = script
    this.getContractByCodeHash = getContractByCodeHash
  }

  async execute(signer: SignerProvider, params: ExecuteScriptParams<P>): Promise<ExecuteScriptResult> {
    const signerParams = await this.script.txParamsForExecution(signer, params)
    return await signer.signAndSubmitExecuteScriptTx(signerParams)
  }

  async call(params: CallScriptParams<P>): Promise<CallScriptResult<R>> {
    const mainFunc = this.script.functions.find((f) => f.name === 'main')
    if (mainFunc === undefined) {
      throw new Error(`There is no main function in script ${this.script.name}`)
    }
    const bytecode = this.script.buildByteCodeToDeploy(params.initialFields)
    const txId = params.txId ?? randomTxId()
    const provider = getCurrentNodeProvider()
    const callResult = await provider.contracts.postContractsCallTxScript({
      ...params,
      group: params.groupIndex ?? 0,
      bytecode: bytecode,
      inputAssets: toApiInputAssets(params.inputAssets)
    })
    const returnTypes = mainFunc.returnTypes
    const result = fromCallResult(callResult, txId, returnTypes, this.script.structs, this.getContractByCodeHash)
    return result as CallScriptResult<R>
  }
}

export interface ExecuteScriptParams<P extends Fields = Fields> {
  initialFields: P
  attoAlphAmount?: Number256
  tokens?: Token[]
  gasAmount?: number
  gasPrice?: Number256
}

export interface ExecuteScriptResult {
  groupIndex: number
  unsignedTx: string
  txId: string
  signature: string
  gasAmount: number
  gasPrice: Number256
}

export interface CallScriptParams<P extends Fields = Fields> {
  initialFields: P
  groupIndex?: number
  callerAddress?: string
  worldStateBlockHash?: string
  txId?: string
  interestedContracts?: string[]
  inputAssets?: InputAsset[]
}

export type CallScriptResult<R> = CallContractResult<R>

export interface CallContractParams<T extends Arguments = Arguments> {
  args: T
  worldStateBlockHash?: string
  txId?: string
  interestedContracts?: string[]
  inputAssets?: InputAsset[]
}

export interface CallContractResult<R> {
  returns: R
  gasUsed: number
  contracts: ContractState[]
  txInputs: string[]
  txOutputs: Output[]
  events: ContractEvent[]
  debugMessages: DebugMessage[]
}

export interface SignExecuteContractMethodParams<T extends Arguments = Arguments> {
  args: T
  signer: SignerProvider
  attoAlphAmount?: Number256
  tokens?: Token[]
  gasAmount?: number
  gasPrice?: Number256
}

function specialContractAddress(eventIndex: number, groupIndex: number): string {
  const bytes = new Uint8Array(32).fill(0)
  bytes[30] = eventIndex
  bytes[31] = groupIndex
  return addressFromContractId(binToHex(bytes))
}

export const CreateContractEventAddresses = Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys()).map((groupIndex) =>
  specialContractAddress(Contract.ContractCreatedEventIndex, groupIndex)
)
export const DestroyContractEventAddresses = Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys()).map((groupIndex) =>
  specialContractAddress(Contract.ContractDestroyedEventIndex, groupIndex)
)

export type ContractCreatedEventFields = {
  address: Address
  parentAddress?: Address
  stdInterfaceIdGuessed?: HexString
}
export type ContractDestroyedEventFields = {
  address: Address
}
export type ContractCreatedEvent = ContractEvent<ContractCreatedEventFields>
export type ContractDestroyedEvent = ContractEvent<ContractDestroyedEventFields>

function decodeSystemEvent(event: node.ContractEvent, eventSig: EventSig, eventIndex: number): Fields {
  if (event.eventIndex !== eventIndex) {
    throw new Error(`Invalid event index: ${event.eventIndex}, expected: ${eventIndex}`)
  }
  return fromApiEventFields(event.fields, eventSig, true)
}

function toContractCreatedEventFields(fields: Fields): ContractCreatedEventFields {
  const parentAddress = fields['parentAddress'] as string
  const stdInterfaceId = fields['stdInterfaceId'] as string
  return {
    address: fields['address'] as Address,
    parentAddress: parentAddress === '' ? undefined : (parentAddress as Address),
    stdInterfaceIdGuessed: stdInterfaceId === '' ? undefined : (stdInterfaceId as HexString)
  }
}

export function decodeContractCreatedEvent(event: node.ContractEvent): Omit<ContractCreatedEvent, 'contractAddress'> {
  const fields = decodeSystemEvent(event, Contract.ContractCreatedEvent, Contract.ContractCreatedEventIndex)
  return {
    blockHash: event.blockHash,
    txId: event.txId,
    eventIndex: event.eventIndex,
    name: Contract.ContractCreatedEvent.name,
    fields: toContractCreatedEventFields(fields)
  }
}

export function decodeContractDestroyedEvent(
  event: node.ContractEvent
): Omit<ContractDestroyedEvent, 'contractAddress'> {
  const fields = decodeSystemEvent(event, Contract.ContractDestroyedEvent, Contract.ContractDestroyedEventIndex)
  return {
    blockHash: event.blockHash,
    txId: event.txId,
    eventIndex: event.eventIndex,
    name: Contract.ContractDestroyedEvent.name,
    fields: { address: fields['address'] as Address }
  }
}

export function subscribeEventsFromContract<T extends Fields, M extends ContractEvent<T>>(
  options: EventSubscribeOptions<M>,
  address: string,
  eventIndex: number,
  decodeFunc: (event: node.ContractEvent) => M,
  fromCount?: number
): EventSubscription {
  const messageCallback = (event: node.ContractEvent) => {
    if (event.eventIndex !== eventIndex) {
      return Promise.resolve()
    }
    return options.messageCallback(decodeFunc(event))
  }

  const errorCallback = (err: any, subscription: Subscription<node.ContractEvent>) => {
    return options.errorCallback(err, subscription as unknown as Subscription<M>)
  }
  const opt: EventSubscribeOptions<node.ContractEvent> = {
    pollingInterval: options.pollingInterval,
    messageCallback: messageCallback,
    errorCallback: errorCallback,
    onEventCountChanged: options.onEventCountChanged
  }
  return subscribeToEvents(opt, address, fromCount)
}

export function addStdIdToFields<F extends Fields>(
  contract: Contract,
  fields: F
): F | (F & { __stdInterfaceId: HexString }) {
  const stdInterfaceIdPrefix = '414c5048' // the hex of 'ALPH'
  return contract.stdInterfaceId === undefined
    ? fields
    : { ...fields, __stdInterfaceId: stdInterfaceIdPrefix + contract.stdInterfaceId }
}

function calcWrapperContractId(
  parentContractId: string,
  mapIndex: number,
  key: Val,
  keyType: string,
  group: number
): string {
  const prefix = ralph.encodeMapPrefix(mapIndex)
  const encodedKey = ralph.encodeMapKey(key, keyType)
  const path = binToHex(prefix) + binToHex(encodedKey)
  return subContractId(parentContractId, path, group)
}

function genCodeForType(type: string, structs: Struct[]): { bytecode: string; codeHash: string } {
  const { immFields, mutFields } = ralph.calcFieldSize(type, true, structs)
  const loadImmFieldByIndex: Method = {
    isPublic: true,
    usePreapprovedAssets: false,
    useContractAssets: false,
    usePayToContractOnly: false,
    argsLength: 1,
    localsLength: 1,
    returnLength: 1,
    instrs: [LoadLocal(0), LoadImmFieldByIndex]
  }
  const loadMutFieldByIndex: Method = {
    ...loadImmFieldByIndex,
    instrs: [LoadLocal(0), LoadMutFieldByIndex]
  }
  const parentContractIdIndex = immFields
  const storeMutFieldByIndex: Method = {
    ...loadImmFieldByIndex,
    argsLength: 2,
    localsLength: 2,
    returnLength: 0,
    instrs: [
      CallerContractId,
      LoadImmField(parentContractIdIndex),
      ByteVecEq,
      Assert,
      LoadLocal(0), // value
      LoadLocal(1), // index
      StoreMutFieldByIndex
    ]
  }
  const destroy: Method = {
    isPublic: true,
    usePreapprovedAssets: false,
    useContractAssets: true,
    usePayToContractOnly: false,
    argsLength: 1,
    localsLength: 1,
    returnLength: 0,
    instrs: [CallerContractId, LoadImmField(parentContractIdIndex), ByteVecEq, Assert, LoadLocal(0), DestroySelf]
  }
  const c = {
    fieldLength: immFields + mutFields + 1, // parentContractId
    methods: [loadImmFieldByIndex, loadMutFieldByIndex, storeMutFieldByIndex, destroy]
  }
  const bytecode = contract.contractCodec.encodeContract(c)
  const codeHash = blake.blake2b(bytecode, undefined, 32)
  return { bytecode: binToHex(bytecode), codeHash: binToHex(codeHash) }
}

function getContractFieldsSig(mapValueType: string): FieldsSig {
  return {
    names: ['value', 'parentContractId'],
    types: [mapValueType, 'ByteVec'],
    isMutable: [true, false]
  }
}

function mapToExistingContracts(
  contract: Contract,
  parentContractId: string,
  group: number,
  map: Map<Val, Val>,
  mapIndex: number,
  type: string
): ContractState[] {
  const [keyType, valueType] = ralph.parseMapType(type)
  const generatedContract = genCodeForType(valueType, contract.structs)
  return Array.from(map.entries()).map(([key, value]) => {
    const fields = { value, parentContractId }
    const contractId = calcWrapperContractId(parentContractId, mapIndex, key, keyType, group)
    return {
      ...generatedContract,
      address: addressFromContractId(contractId),
      contractId: contractId,
      fieldsSig: getContractFieldsSig(valueType),
      fields,
      asset: { alphAmount: ONE_ALPH }
    }
  })
}

function mapsToExistingContracts(
  contract: Contract,
  parentContractId: string,
  group: number,
  initialMaps: Record<string, Map<Val, Val>>
) {
  const mapsSig = contract.mapsSig
  if (mapsSig === undefined) return []
  const contractStates: ContractState[] = []
  Object.keys(initialMaps).forEach((name) => {
    const index = mapsSig.names.findIndex((n) => n === name)
    if (index === -1) throw new Error(`Map var ${name} does not exist in contract ${contract.name}`)
    const mapType = mapsSig.types[`${index}`]
    const states = mapToExistingContracts(contract, parentContractId, group, initialMaps[`${name}`], index, mapType)
    contractStates.push(...states)
  })
  return contractStates
}

function hasMap(state: ContractState): state is ContractStateWithMaps {
  return (state as ContractStateWithMaps).maps !== undefined
}

function getTestExistingContracts(
  selfContract: Contract,
  selfContractId: string,
  group: number,
  params: Optional<TestContractParams, 'testArgs' | 'initialFields'>,
  getContractByCodeHash: (codeHash: string) => Contract
): ContractState[] {
  const selfMaps = params.initialMaps ?? {}
  const selfMapEntries = mapsToExistingContracts(selfContract, selfContractId, group, selfMaps)
  const existingContracts = params.existingContracts ?? []
  const existingMapEntries = existingContracts.flatMap((contractState) => {
    return hasMap(contractState)
      ? mapsToExistingContracts(
          getContractByCodeHash(contractState.codeHash),
          contractState.contractId,
          group,
          contractState.maps ?? {}
        )
      : []
  })
  return existingContracts.concat(selfMapEntries, existingMapEntries)
}

function getNewCreatedContractExceptMaps(
  result: node.TestContractResult,
  getContractByCodeHash: (codeHash: string) => Contract
) {
  const isMapContract = (codeHash: string): boolean => {
    try {
      getContractByCodeHash(codeHash)
      return false
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unknown code with code hash')) {
        // the contract does not exist, because it is a map item contract
        return true
      }
      throw error
    }
  }

  const states: node.ContractState[] = []
  result.events.forEach((event) => {
    if (event.eventIndex === Contract.ContractCreatedEventIndex) {
      const contractAddress = event.fields[0].value as string
      const contractState = result.contracts.find((c) => c.address === contractAddress)
      if (contractState !== undefined && !isMapContract(contractState.codeHash)) {
        states.push(contractState)
      }
    }
  })
  return states
}

export function extractMapsFromApiResult(
  selfAddress: string,
  params: Optional<TestContractParams, 'testArgs' | 'initialFields'>,
  group: number,
  apiResult: node.TestContractResult,
  getContractByCodeHash: (codeHash: string) => Contract
): { address: string; maps: Record<string, Map<Val, Val>> }[] {
  const selfMaps = params.initialMaps ?? {}
  const existingContracts = params.existingContracts ?? []
  const updatedExistingContracts = apiResult.contracts.filter(
    (c) => c.address === selfAddress || existingContracts.find((s) => s.address === c.address) !== undefined
  )
  const newCreateContracts = getNewCreatedContractExceptMaps(apiResult, getContractByCodeHash)
  const allMaps: { address: string; maps: Record<string, Map<Val, Val>> }[] = []
  updatedExistingContracts.concat(newCreateContracts).forEach((state) => {
    const artifact = getContractByCodeHash(state.codeHash)
    if (artifact.mapsSig !== undefined) {
      const originMaps =
        state.address === selfAddress ? selfMaps : existingContracts.find((s) => s.address === state.address)?.maps
      const maps = existingContractsToMaps(artifact, state.address, group, apiResult, originMaps ?? {})
      allMaps.push({ address: state.address, maps })
    }
  })
  return allMaps
}

export async function testMethod<
  I extends ContractInstance,
  F extends Fields,
  A extends Arguments,
  R,
  M extends Record<string, Map<Val, Val>> = Record<string, Map<Val, Val>>
>(
  factory: ContractFactory<I, F>,
  methodName: string,
  params: Optional<TestContractParams<F, A, M>, 'testArgs' | 'initialFields'>,
  getContractByCodeHash: (codeHash: string) => Contract
): Promise<TestContractResult<R, M>> {
  const txId = params?.txId ?? randomTxId()
  const selfContract = factory.contract
  const selfAddress = params.address ?? addressFromContractId(binToHex(crypto.getRandomValues(new Uint8Array(32))))
  const selfContractId = binToHex(contractIdFromAddress(selfAddress))
  const group = params.group ?? 0
  const existingContracts = getTestExistingContracts(selfContract, selfContractId, group, params, getContractByCodeHash)

  const apiParams = selfContract.toApiTestContractParams(methodName, {
    ...params,
    address: selfAddress,
    txId: txId,
    initialFields: addStdIdToFields(selfContract, params.initialFields ?? {}),
    testArgs: params.testArgs === undefined ? {} : params.testArgs,
    existingContracts
  })
  const apiResult = await getCurrentNodeProvider().contracts.postContractsTestContract(apiParams)
  const allMaps = extractMapsFromApiResult(selfAddress, params, group, apiResult, getContractByCodeHash)
  const testResult = selfContract.fromApiTestContractResult(methodName, apiResult, txId, getContractByCodeHash)
  testResult.contracts.forEach((c) => {
    const maps = allMaps.find((v) => v.address === c.address)?.maps
    if (maps !== undefined) c['maps'] = maps
  })
  selfContract.printDebugMessages(methodName, testResult.debugMessages)
  return {
    ...testResult,
    maps: allMaps.find((v) => v.address === selfAddress)?.maps
  } as TestContractResult<R, M>
}

function printDebugMessage(m: node.DebugMessage) {
  console.log(`> Contract @ ${m.contractAddress} - ${m.message}`)
}

export async function getDebugMessagesFromTx(txId: HexString, provider?: NodeProvider) {
  if (isHexString(txId) && txId.length === 64) {
    const nodeProvider = provider ?? getCurrentNodeProvider()
    const events = await nodeProvider.events.getEventsTxIdTxid(txId)
    return events.events
      .filter((e) => e.eventIndex === Contract.DebugEventIndex)
      .map((e) => {
        if (e.fields.length === 1 && e.fields[0].type === 'ByteVec') {
          return {
            contractAddress: e.contractAddress,
            message: hexToString(e.fields[0].value as string)
          }
        } else {
          throw new Error(`Invalid debug log: ${JSON.stringify(e.fields)}`)
        }
      })
  } else {
    throw new Error(`Invalid tx id: ${txId}`)
  }
}

export async function printDebugMessagesFromTx(txId: HexString, provider?: NodeProvider) {
  const messages = await getDebugMessagesFromTx(txId, provider)
  if (messages.length > 0) {
    messages.forEach((m) => printDebugMessage(m))
  }
}

export class RalphMap<K extends Val, V extends Val> {
  private readonly groupIndex: number
  constructor(
    private readonly parentContract: Contract,
    private readonly parentContractId: HexString,
    private readonly mapName: string
  ) {
    this.groupIndex = groupOfAddress(addressFromContractId(parentContractId))
  }

  async get(key: K): Promise<V | undefined> {
    return getMapItem(this.parentContract, this.parentContractId, this.groupIndex, this.mapName, key)
  }

  async contains(key: K): Promise<boolean> {
    return this.get(key).then((v) => v !== undefined)
  }

  toJSON() {
    return {
      parentContractId: this.parentContractId,
      mapName: this.mapName,
      groupIndex: this.groupIndex
    }
  }
}

export async function getMapItem<R extends Val>(
  parentContract: Contract,
  parentContractId: HexString,
  groupIndex: number,
  mapName: string,
  key: Val
): Promise<R | undefined> {
  const index = parentContract.mapsSig?.names.findIndex((name) => name === mapName)
  const mapType = index === undefined ? undefined : parentContract.mapsSig?.types[`${index}`]
  if (mapType === undefined) {
    throw new Error(`Map ${mapName} does not exist in contract ${parentContract.name}`)
  }
  const [keyType, valueType] = ralph.parseMapType(mapType)
  const mapItemContractId = calcWrapperContractId(parentContractId, index!, key, keyType, groupIndex)
  const mapItemAddress = addressFromContractId(mapItemContractId)
  try {
    const state = await getCurrentNodeProvider().contracts.getContractsAddressState(mapItemAddress)
    const fieldsSig = getContractFieldsSig(valueType)
    const fields = fromApiFields(state.immFields, state.mutFields, fieldsSig, parentContract.structs)
    return fields['value'] as R
  } catch (error) {
    if (error instanceof Error && error.message.includes('KeyNotFound')) {
      // the map item contract does not exist
      return undefined
    }
    throw new TraceableError(
      `Failed to get value from map ${mapName}, key: ${key}, parent contract id: ${parentContractId}`,
      error
    )
  }
}

interface MapInfo {
  name: string
  value: Map<Val, Val>
  keyType: string
  valueType: string
  index: number
}

function buildMapInfo(contract: Contract, fields: Fields): MapInfo[] {
  const mapsSig = contract.mapsSig
  if (mapsSig === undefined) return []
  return mapsSig.names.map((name, index) => {
    const mapType = mapsSig.types[`${index}`]
    const value = (fields[`${name}`] ?? new Map<Val, Val>()) as Map<Val, Val>
    const [keyType, valueType] = ralph.parseMapType(mapType)
    return { name, value, keyType, valueType, index }
  })
}

function extractFromEventLog(
  contract: Contract,
  result: node.TestContractResult,
  allMaps: MapInfo[],
  address: string,
  group: number
): string[] {
  const parentContractId = binToHex(contractIdFromAddress(address))
  const newInserted: string[] = []
  result.debugMessages.forEach((message) => {
    if (message.contractAddress !== address) return
    const decoded = ralph.tryDecodeMapDebugLog(message.message)
    if (decoded === undefined) return
    const map = allMaps[`${decoded.mapIndex}`]
    const decodedKey = ralph.decodePrimitive(decoded.encodedKey, map.keyType)
    const contractId = subContractId(parentContractId, decoded.path, group)
    if (!decoded.isInsert) {
      map.value.delete(decodedKey)
      return
    }
    const state = result.contracts.find((s) => s.address === addressFromContractId(contractId))
    if (state === undefined) {
      throw new Error(`Cannot find contract state for map value, map field: ${map.name}, value type: ${map.valueType}`)
    }
    newInserted.push(state.address)
    const fieldsSig = getContractFieldsSig(map.valueType)
    const fields = fromApiFields(state.immFields, state.mutFields, fieldsSig, contract.structs)
    map.value.set(decodedKey, fields['value'])
  })
  return newInserted
}

function updateMaps(
  contract: Contract,
  result: node.TestContractResult,
  allMaps: MapInfo[],
  address: Address,
  group: number
): string[] {
  const parentContractId = binToHex(contractIdFromAddress(address))
  const updated: string[] = []
  allMaps.forEach((map) => {
    Array.from(map.value.keys()).forEach((key) => {
      const contractId = calcWrapperContractId(parentContractId, map.index, key, map.keyType, group)
      const updatedState = result.contracts.find((s) => s.address === addressFromContractId(contractId))
      if (updatedState === undefined) return
      updated.push(updatedState.address)
      const fieldsSig = getContractFieldsSig(map.valueType)
      const fields = fromApiFields(updatedState.immFields, updatedState.mutFields, fieldsSig, contract.structs)
      map.value.set(key, fields['value'])
    })
  })
  return updated
}

function existingContractsToMaps(
  contract: Contract,
  address: Address,
  group: number,
  result: node.TestContractResult,
  maps: Record<string, Map<Val, Val>>
): Record<string, Map<Val, Val>> {
  const allMaps = buildMapInfo(contract, maps)
  const updated = updateMaps(contract, result, allMaps, address, group)
  const newInserted = extractFromEventLog(contract, result, allMaps, address, group)
  const mapEntries = updated.concat(newInserted)
  const remainContracts = result.contracts.filter((c) => mapEntries.find((addr) => c.address === addr) === undefined)
  result.contracts = remainContracts
  return allMaps.reduce((acc, map) => {
    acc[`${map.name}`] = map.value
    return acc
  }, {})
}

export abstract class ContractInstance {
  readonly address: Address
  readonly contractId: string
  readonly groupIndex: number

  constructor(address: Address) {
    this.address = address
    this.contractId = binToHex(contractIdFromAddress(address))
    this.groupIndex = groupOfAddress(address)
  }
}

export async function fetchContractState<F extends Fields, I extends ContractInstance>(
  contract: ContractFactory<I, F>,
  instance: ContractInstance
): Promise<ContractState<F>> {
  const contractState = await getCurrentNodeProvider().contracts.getContractsAddressState(instance.address)
  const state = contract.contract.fromApiContractState(contractState)
  return {
    ...state,
    fields: state.fields as F
  }
}

function checkGroupIndex(groupIndex: number) {
  if (groupIndex < 0 || groupIndex >= TOTAL_NUMBER_OF_GROUPS) {
    throw new Error(
      `Invalid group index ${groupIndex}, expected a value within the range [0, ${TOTAL_NUMBER_OF_GROUPS})`
    )
  }
}

export function subscribeContractCreatedEvent(
  options: EventSubscribeOptions<ContractCreatedEvent>,
  fromGroup: number,
  fromCount?: number
): EventSubscription {
  checkGroupIndex(fromGroup)
  const contractAddress = CreateContractEventAddresses[`${fromGroup}`]
  return subscribeEventsFromContract(
    options,
    contractAddress,
    Contract.ContractCreatedEventIndex,
    (event) => {
      return {
        ...decodeContractCreatedEvent(event),
        contractAddress: contractAddress
      }
    },
    fromCount
  )
}

export function subscribeContractDestroyedEvent(
  options: EventSubscribeOptions<ContractDestroyedEvent>,
  fromGroup: number,
  fromCount?: number
): EventSubscription {
  checkGroupIndex(fromGroup)
  const contractAddress = DestroyContractEventAddresses[`${fromGroup}`]
  return subscribeEventsFromContract(
    options,
    contractAddress,
    Contract.ContractDestroyedEventIndex,
    (event) => {
      return {
        ...decodeContractDestroyedEvent(event),
        contractAddress: contractAddress
      }
    },
    fromCount
  )
}

export function decodeEvent<F extends Fields, M extends ContractEvent<F>>(
  contract: Contract,
  instance: ContractInstance,
  event: node.ContractEvent,
  targetEventIndex: number
): M {
  if (
    event.eventIndex !== targetEventIndex &&
    !(targetEventIndex >= 0 && targetEventIndex < contract.eventsSig.length)
  ) {
    throw new Error('Invalid event index: ' + event.eventIndex + ', expected: ' + targetEventIndex)
  }
  const eventSig = contract.eventsSig[`${targetEventIndex}`]
  const fields = fromApiEventFields(event.fields, eventSig)
  return {
    contractAddress: instance.address,
    blockHash: event.blockHash,
    txId: event.txId,
    eventIndex: event.eventIndex,
    name: eventSig.name,
    fields: fields
  } as M
}

export function subscribeContractEvent<F extends Fields, M extends ContractEvent<F>>(
  contract: Contract,
  instance: ContractInstance,
  options: EventSubscribeOptions<M>,
  eventName: string,
  fromCount?: number
): EventSubscription {
  const eventIndex = contract.eventsSig.findIndex((sig) => sig.name === eventName)
  return subscribeEventsFromContract<F, M>(
    options,
    instance.address,
    eventIndex,
    (event) => decodeEvent(contract, instance, event, eventIndex),
    fromCount
  )
}

export function subscribeContractEvents(
  contract: Contract,
  instance: ContractInstance,
  options: EventSubscribeOptions<ContractEvent<any>>,
  fromCount?: number
): EventSubscription {
  const messageCallback = (event: node.ContractEvent) => {
    return options.messageCallback({
      ...decodeEvent(contract, instance, event, event.eventIndex),
      contractAddress: instance.address
    })
  }
  const errorCallback = (err: any, subscription: Subscription<node.ContractEvent>) => {
    return options.errorCallback(err, subscription as unknown as Subscription<ContractEvent<any>>)
  }
  const opt: EventSubscribeOptions<node.ContractEvent> = {
    pollingInterval: options.pollingInterval,
    messageCallback: messageCallback,
    errorCallback: errorCallback,
    onEventCountChanged: options.onEventCountChanged
  }
  return subscribeToEvents(opt, instance.address, fromCount)
}

export async function callMethod<I extends ContractInstance, F extends Fields, A extends Arguments, R>(
  contract: ContractFactory<I, F>,
  instance: ContractInstance,
  methodName: string,
  params: Optional<CallContractParams<A>, 'args'>,
  getContractByCodeHash: (codeHash: string) => Contract
): Promise<CallContractResult<R>> {
  const methodIndex = contract.contract.getMethodIndex(methodName)
  const txId = params?.txId ?? randomTxId()
  const callParams = contract.contract.toApiCallContract(
    { ...params, txId: txId, args: params.args === undefined ? {} : params.args },
    instance.groupIndex,
    instance.address,
    methodIndex
  )
  const result = await getCurrentNodeProvider().contracts.postContractsCallContract(callParams)
  const callResult = contract.contract.fromApiCallContractResult(result, txId, methodIndex, getContractByCodeHash)
  contract.contract.printDebugMessages(methodName, callResult.debugMessages)
  return callResult as CallContractResult<R>
}

export async function signExecuteMethod<I extends ContractInstance, F extends Fields, A extends Arguments, R>(
  contract: ContractFactory<I, F>,
  instance: ContractInstance,
  methodName: string,
  params: Optional<SignExecuteContractMethodParams<A>, 'args'>
): Promise<SignExecuteScriptTxResult> {
  const methodIndex = contract.contract.getMethodIndex(methodName)
  const functionSig = contract.contract.functions[methodIndex]
  const isDevnet = await contract.contract.isDevnet(params.signer)
  const methodUsePreapprovedAssets = contract.contract.isMethodUsePreapprovedAssets(isDevnet, methodIndex)
  const bytecodeTemplate = getBytecodeTemplate(
    methodIndex,
    methodUsePreapprovedAssets,
    functionSig,
    contract.contract.structs,
    params.attoAlphAmount,
    params.tokens
  )

  const fieldsSig = toFieldsSig(contract.contract.name, functionSig)
  const bytecode = ralph.buildScriptByteCode(
    bytecodeTemplate,
    { __contract__: instance.contractId, ...params.args },
    fieldsSig,
    contract.contract.structs
  )

  const signer = params.signer
  const selectedAccount = await signer.getSelectedAccount()
  const signerParams: SignExecuteScriptTxParams = {
    signerAddress: selectedAccount.address,
    signerKeyType: selectedAccount.keyType,
    bytecode: bytecode,
    attoAlphAmount: params.attoAlphAmount,
    tokens: params.tokens,
    gasAmount: params.gasAmount,
    gasPrice: params.gasPrice
  }

  const result = await signer.signAndSubmitExecuteScriptTx(signerParams)
  if (isContractDebugMessageEnabled() && isDevnet) {
    await printDebugMessagesFromTx(result.txId, signer.nodeProvider)
  }
  return result
}

function getBytecodeTemplate(
  methodIndex: number,
  methodUsePreapprovedAssets: boolean,
  functionSig: FunctionSig,
  structs: Struct[],
  attoAlphAmount?: Number256,
  tokens?: Token[]
): string {
  // For the default TxScript main function
  const numberOfMethods = '01'
  const isPublic = '01'
  const scriptUseApprovedAssets = attoAlphAmount !== undefined || tokens !== undefined
  const modifier = scriptUseApprovedAssets ? '03' : '00'
  const argsLength = '00'
  const returnsLength = '00'

  if (methodUsePreapprovedAssets && !scriptUseApprovedAssets) {
    throw new Error('The contract call requires preapproved assets but none are provided')
  }

  const [templateVarStoreLocalInstrs, templateVarsLength] = getTemplateVarStoreLocalInstrs(functionSig, structs)

  const approveAlphInstrs: string[] = getApproveAlphInstrs(methodUsePreapprovedAssets ? attoAlphAmount : undefined)
  const approveTokensInstrs: string[] = getApproveTokensInstrs(methodUsePreapprovedAssets ? tokens : undefined)
  const callerInstrs: string[] = getCallAddressInstrs(approveAlphInstrs.length / 2 + approveTokensInstrs.length / 3)

  // First template var is the contract
  const functionArgsNum = encodeU256Const(BigInt(templateVarsLength - 1))
  const localsLength = encodeI32(templateVarStoreLocalInstrs.length / 2)

  const templateVarLoadLocalInstrs = getTemplateVarLoadLocalInstrs(functionSig, structs)

  const functionReturnTypesLength: number = functionSig.returnTypes.reduce(
    (acc, returnType) => acc + ralph.typeLength(returnType, structs),
    0
  )
  const functionReturnPopInstrs = encodeInstr(Pop).repeat(functionReturnTypesLength)
  const functionReturnNum = encodeU256Const(BigInt(functionReturnTypesLength))

  const contractTemplateVar = '{0}' // always the 1st argument
  const externalCallInstr = encodeInstr(CallExternal(methodIndex))
  const numberOfInstrs = encodeI32(
    callerInstrs.length +
      approveAlphInstrs.length +
      approveTokensInstrs.length +
      templateVarStoreLocalInstrs.length +
      templateVarLoadLocalInstrs.length +
      functionReturnTypesLength +
      4 // functionArgsNum, functionReturnNum, contractTemplate, externalCallInstr
  )

  return (
    numberOfMethods +
    isPublic +
    modifier +
    argsLength +
    localsLength +
    returnsLength +
    numberOfInstrs +
    callerInstrs.join('') +
    approveAlphInstrs.join('') +
    approveTokensInstrs.join('') +
    templateVarStoreLocalInstrs.join('') +
    templateVarLoadLocalInstrs.join('') +
    functionArgsNum +
    functionReturnNum +
    contractTemplateVar +
    externalCallInstr +
    functionReturnPopInstrs
  )
}

function getApproveAlphInstrs(attoAlphAmount?: Number256): string[] {
  const approveAlphInstrs: string[] = []
  if (attoAlphAmount) {
    const approvedAttoAlphAmount = encodeU256Const(BigInt(attoAlphAmount))
    approveAlphInstrs.push(approvedAttoAlphAmount)
    approveAlphInstrs.push(encodeInstr(ApproveAlph))
  }

  return approveAlphInstrs
}

function getApproveTokensInstrs(tokens?: Token[]): string[] {
  const approveTokensInstrs: string[] = []
  if (tokens) {
    tokens.forEach((token) => {
      const tokenIdBin = hexToBinUnsafe(token.id)
      approveTokensInstrs.push(encodeInstr(BytesConst(tokenIdBin)))
      approveTokensInstrs.push(encodeU256Const(BigInt(token.amount)))
      approveTokensInstrs.push(encodeInstr(ApproveToken))
    })
  }

  return approveTokensInstrs
}

function getCallAddressInstrs(approveAssetsNum: number): string[] {
  const callerInstrs: string[] = []
  if (approveAssetsNum > 0) {
    callerInstrs.push(encodeInstr(CallerAddress))

    const dup = encodeInstr(Dup)
    if (approveAssetsNum > 1) {
      callerInstrs.push(...new Array(approveAssetsNum - 1).fill(dup))
    }
  }

  return callerInstrs
}

function getTemplateVarStoreLocalInstrs(functionSig: FunctionSig, structs: Struct[]): [string[], number] {
  let templateVarIndex = 1 // Start from 1 since first one is always the contract id
  let localsLength = 0
  const templateVarStoreInstrs: string[] = []
  functionSig.paramTypes.forEach((paramType) => {
    const fieldsLength = ralph.typeLength(paramType, structs)
    if (fieldsLength > 1) {
      for (let i = 0; i < fieldsLength; i++) {
        templateVarStoreInstrs.push(`{${templateVarIndex + i}}`)
      }
      for (let i = 0; i < fieldsLength; i++) {
        templateVarStoreInstrs.push(encodeStoreLocalInstr(localsLength + (fieldsLength - i - 1)))
      }

      localsLength = localsLength + fieldsLength
    }

    templateVarIndex = templateVarIndex + fieldsLength
  })

  return [templateVarStoreInstrs, templateVarIndex]
}

function getTemplateVarLoadLocalInstrs(functionSig: FunctionSig, structs: Struct[]): string[] {
  let templateVarIndex = 1
  let loadIndex = 0
  const templateVarLoadInstrs: string[] = []
  functionSig.paramTypes.forEach((paramType) => {
    const fieldsLength = ralph.typeLength(paramType, structs)

    if (fieldsLength === 1) {
      templateVarLoadInstrs.push(`{${templateVarIndex}}`)
    }

    if (fieldsLength > 1) {
      for (let i = 0; i < fieldsLength; i++) {
        templateVarLoadInstrs.push(encodeLoadLocalInstr(loadIndex + i))
      }

      loadIndex = loadIndex + fieldsLength
    }

    templateVarIndex = templateVarIndex + fieldsLength
  })

  return templateVarLoadInstrs
}

function encodeStoreLocalInstr(index: number): string {
  if (index < 0 || index > 0xff) {
    throw new Error(`StoreLocal index ${index} must be between 0 and 255 inclusive`)
  }
  return encodeInstr(StoreLocal(index))
}

function encodeLoadLocalInstr(index: number): string {
  if (index < 0 || index > 0xff) {
    throw new Error(`LoadLocal index ${index} must be between 0 and 255 inclusive`)
  }

  return encodeInstr(LoadLocal(index))
}

function encodeI32(value: number): string {
  return binToHex(i32Codec.encode(value))
}

function encodeU256Const(value: bigint): string {
  if (value < 0) {
    throw new Error(`value ${value} must be non-negative`)
  }

  if (value < 6) {
    return (BigInt(0x0c) + value).toString(16).padStart(2, '0')
  } else {
    return encodeInstr(U256Const(value))
  }
}

function encodeInstr(instr: Instr): string {
  return binToHex(instrCodec.encode(instr))
}

function toFieldsSig(contractName: string, functionSig: FunctionSig): FieldsSig {
  return {
    names: ['__contract__'].concat(functionSig.paramNames),
    types: [contractName].concat(functionSig.paramTypes),
    isMutable: [false].concat(functionSig.paramIsMutable)
  }
}

type Calls = Record<string, Optional<CallContractParams<any>, 'args'>>
export async function multicallMethods<I extends ContractInstance, F extends Fields>(
  contract: ContractFactory<I, F>,
  instance: ContractInstance,
  _callss: Calls | Calls[],
  getContractByCodeHash: (codeHash: string) => Contract
): Promise<Record<string, CallContractResult<any>>[] | Record<string, CallContractResult<any>>> {
  const callss = Array.isArray(_callss) ? _callss : [_callss]
  const callEntries = callss.map((calls) => Object.entries(calls))
  const callsParams = callEntries.map((entries) => {
    return entries.map((entry) => {
      const [methodName, params] = entry
      const methodIndex = contract.contract.getMethodIndex(methodName)
      const txId = params?.txId ?? randomTxId()
      return contract.contract.toApiCallContract(
        { ...params, txId: txId, args: params.args === undefined ? {} : params.args },
        instance.groupIndex,
        instance.address,
        methodIndex
      )
    })
  })
  const result = await getCurrentNodeProvider().contracts.postContractsMulticallContract({ calls: callsParams.flat() })
  let callResultIndex = 0
  const results = callsParams.map((calls, index0) => {
    const callsResult: Record<string, CallContractResult<any>> = {}
    const entries = callEntries[`${index0}`]
    calls.forEach((call, index1) => {
      const methodIndex = call.methodIndex
      const callResult = result.results[`${callResultIndex}`]
      const methodName = entries[`${index1}`][`0`]
      callsResult[`${methodName}`] = contract.contract.fromApiCallContractResult(
        callResult,
        call.txId!,
        methodIndex,
        getContractByCodeHash
      ) as CallContractResult<any>
      callResultIndex += 1
    })
    return callsResult
  })
  return Array.isArray(_callss) ? results : results[0]
}

export async function getContractEventsCurrentCount(contractAddress: Address): Promise<number> {
  return getCurrentNodeProvider()
    .events.getEventsContractContractaddressCurrentCount(contractAddress)
    .catch((error) => {
      if (error instanceof Error && error.message.includes(`${contractAddress} not found`)) {
        return 0
      }
      throw new TraceableError(`Failed to get the event count for the contract ${contractAddress}`, error)
    })
}

// This function only works in the simple case where a single non-subcontract is created in the tx
export const getContractIdFromUnsignedTx = async (
  nodeProvider: NodeProvider,
  unsignedTx: string
): Promise<HexString> => {
  const result = await nodeProvider.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx })
  const outputIndex = result.unsignedTx.fixedOutputs.length
  const hex = result.unsignedTx.txId + outputIndex.toString(16).padStart(8, '0')
  const hashHex = binToHex(blake.blake2b(hexToBinUnsafe(hex), undefined, 32))
  return hashHex.slice(0, 62) + result.fromGroup.toString(16).padStart(2, '0')
}

// This function only works in the simple case where a single non-subcontract is created in the tx
export const getTokenIdFromUnsignedTx = getContractIdFromUnsignedTx

export async function getContractCodeByCodeHash(
  nodeProvider: NodeProvider,
  codeHash: HexString
): Promise<HexString | undefined> {
  if (isHexString(codeHash) && codeHash.length === 64) {
    try {
      return await nodeProvider.contracts.getContractsCodehashCode(codeHash)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return undefined
      }
      throw new TraceableError(`Failed to get contract by code hash ${codeHash}`, error)
    }
  }
  throw new Error(`Invalid code hash: ${codeHash}`)
}
