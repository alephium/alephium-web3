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

import { Buffer } from 'buffer/'
import * as cryptojs from 'crypto-js'
import * as crypto from 'crypto'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { NodeProvider } from '../api'
import { node } from '../api'
import { SignDeployContractTxParams, SignExecuteScriptTxParams, SignerWithNodeProvider } from '../signer'
import * as ralph from './ralph'
import { bs58, binToHex, contractIdFromAddress, assertType, Eq } from '../utils'

class SourceFile {
  readonly dirs: string[]
  readonly dirPath: string
  readonly contractPath: string
  readonly artifactPath: string

  constructor(dirs: string[], fileName: string) {
    this.dirs = dirs
    this.dirPath = dirs.length === 0 ? '' : dirs.join('/') + '/'
    if (fileName.endsWith('.json')) {
      this.contractPath = './contracts/' + this.dirPath + fileName.slice(0, -5)
      this.artifactPath = './artifacts/' + this.dirPath + fileName
    } else {
      this.contractPath = './contracts/' + this.dirPath + fileName
      this.artifactPath = './artifacts/' + this.dirPath + fileName + '.json'
    }
  }
}

export abstract class Common {
  readonly sourceCodeSha256: string
  readonly functions: node.FunctionSig[]

  static readonly importRegex = new RegExp('^import "([^"/]+/(([^"]+)/)?)?[a-z][a-z_0-9]*.ral"', 'mg')
  static readonly contractRegex = new RegExp('^(Abstract[ ]+)?Contract [A-Z][a-zA-Z0-9]*', 'mg')
  static readonly interfaceRegex = new RegExp('^Interface [A-Z][a-zA-Z0-9]* \\{', 'mg')
  static readonly scriptRegex = new RegExp('^TxScript [A-Z][a-zA-Z0-9]*', 'mg')

  private static _artifactCache: Map<string, Contract | Script> = new Map<string, Contract | Script>()
  static artifactCacheCapacity = 20
  protected static _getArtifactFromCache(codeHash: string): Contract | Script | undefined {
    return this._artifactCache.get(codeHash)
  }
  protected static _putArtifactToCache(contract: Contract): void {
    if (!this._artifactCache.has(contract.codeHash)) {
      if (this._artifactCache.size >= this.artifactCacheCapacity) {
        const keyToDelete = this._artifactCache.keys().next().value
        this._artifactCache.delete(keyToDelete)
      }
      this._artifactCache.set(contract.codeHash, contract)
    }
  }

  constructor(sourceCodeSha256: string, functions: node.FunctionSig[]) {
    this.sourceCodeSha256 = sourceCodeSha256
    this.functions = functions
  }

  protected static _artifactsFolder(): string {
    return './artifacts/'
  }

  static getSourceFile(path: string, _dirs: string[]): SourceFile {
    const parts = path.split('/')
    const dirs = Array.from(_dirs)
    if (parts.length === 1) {
      return new SourceFile(dirs, path)
    }
    parts.slice(0, parts.length - 1).forEach((part) => {
      switch (part) {
        case '.': {
          break
        }
        case '..': {
          if (dirs.length === 0) {
            throw new Error('Invalid file path: ' + path)
          }
          dirs.pop()
          break
        }
        default: {
          dirs.push(part)
        }
      }
    })
    return new SourceFile(dirs, parts[parts.length - 1])
  }

  protected static async _handleImports(
    pathes: string[],
    contractStr: string,
    importsCache: string[]
  ): Promise<string> {
    const localImportsCache: string[] = []
    let result = contractStr.replace(Common.importRegex, (match) => {
      localImportsCache.push(match)
      return ''
    })
    for (const myImport of localImportsCache) {
      const relativePath = myImport.slice(8, -1)
      const importSourceFile = this.getSourceFile(relativePath, pathes)
      if (!importsCache.includes(importSourceFile.contractPath)) {
        importsCache.push(importSourceFile.contractPath)
        const importContractStr = await Common._loadContractStr(importSourceFile, importsCache, (code) =>
          Contract.checkCodeType(importSourceFile.contractPath, code)
        )
        result = result.concat('\n', importContractStr)
      }
    }
    return result
  }

  protected static async _loadContractStr(
    sourceFile: SourceFile,
    importsCache: string[],
    validate: (code: string) => void
  ): Promise<string> {
    const contractPath = sourceFile.contractPath
    const contractBuffer = await fsPromises.readFile(contractPath)
    const contractStr = contractBuffer.toString()

    validate(contractStr)
    return Common._handleImports(sourceFile.dirs, contractStr, importsCache)
  }

  static checkFileNameExtension(fileName: string): void {
    if (!fileName.endsWith('.ral')) {
      throw new Error('Smart contract file name should end with ".ral"')
    }
  }

  protected static async _from<T extends { sourceCodeSha256: string }>(
    provider: NodeProvider,
    sourceFile: SourceFile,
    loadContractStr: (sourceFile: SourceFile, importsCache: string[]) => Promise<string>,
    compile: (provider: NodeProvider, sourceFile: SourceFile, contractStr: string, contractHash: string) => Promise<T>
  ): Promise<T> {
    Common.checkFileNameExtension(sourceFile.contractPath)

    const contractStr = await loadContractStr(sourceFile, [])
    const contractHash = cryptojs.SHA256(contractStr).toString()
    const existingContract = this._getArtifactFromCache(contractHash)
    if (typeof existingContract !== 'undefined') {
      return existingContract as unknown as T
    } else {
      return compile(provider, sourceFile, contractStr, contractHash)
    }
  }

  protected _saveToFile(sourceFile: SourceFile): Promise<void> {
    const folder = Common._artifactsFolder() + sourceFile.dirPath
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
    return fsPromises.writeFile(sourceFile.artifactPath, this.toString())
  }

  abstract buildByteCodeToDeploy(initialFields?: Fields): string
}

export class Contract extends Common {
  readonly bytecode: string
  readonly codeHash: string
  readonly fieldsSig: node.FieldsSig
  readonly eventsSig: node.EventSig[]

  constructor(
    sourceCodeSha256: string,
    bytecode: string,
    codeHash: string,
    fieldsSig: node.FieldsSig,
    eventsSig: node.EventSig[],
    functions: node.FunctionSig[]
  ) {
    super(sourceCodeSha256, functions)
    this.bytecode = bytecode
    this.codeHash = codeHash
    this.fieldsSig = fieldsSig
    this.eventsSig = eventsSig
  }

  static checkCodeType(fileName: string, contractStr: string): void {
    const interfaceMatches = contractStr.match(Contract.interfaceRegex)
    const contractMatches = contractStr.match(Contract.contractRegex)
    if (interfaceMatches === null && contractMatches === null) {
      throw new Error(`No contract found in: ${fileName}`)
    }
    if (interfaceMatches && contractMatches) {
      throw new Error(`Multiple contracts and interfaces in: ${fileName}`)
    }
    if (interfaceMatches === null) {
      if (contractMatches !== null && contractMatches.length > 1) {
        throw new Error(`Multiple contracts in: ${fileName}`)
      }
    }
    if (contractMatches === null) {
      if (interfaceMatches !== null && interfaceMatches.length > 1) {
        throw new Error(`Multiple interfaces in: ${fileName}`)
      }
    }
  }

  private static async loadContractStr(sourceFile: SourceFile): Promise<string> {
    return Common._loadContractStr(sourceFile, [], (code) => Contract.checkCodeType(sourceFile.contractPath, code))
  }

  static async fromSource(provider: NodeProvider, path: string): Promise<Contract> {
    if (!fs.existsSync(Common._artifactsFolder())) {
      fs.mkdirSync(Common._artifactsFolder(), { recursive: true })
    }
    const sourceFile = this.getSourceFile(path, [])
    const contract = await Common._from(
      provider,
      sourceFile,
      (sourceFile) => Contract.loadContractStr(sourceFile),
      Contract.compile
    )
    this._putArtifactToCache(contract)
    return contract
  }

  private static async compile(
    provider: NodeProvider,
    sourceFile: SourceFile,
    contractStr: string,
    contractHash: string
  ): Promise<Contract> {
    const compiled = await provider.contracts.postContractsCompileContract({ code: contractStr })
    const artifact = new Contract(
      contractHash,
      compiled.bytecode,
      compiled.codeHash,
      compiled.fields,
      compiled.events,
      compiled.functions
    )
    await artifact._saveToFile(sourceFile)
    return artifact
  }

  // TODO: safely parse json
  static fromJson(artifact: any): Contract {
    if (
      artifact.sourceCodeSha256 == null ||
      artifact.bytecode == null ||
      artifact.codeHash == null ||
      artifact.fieldsSig == null ||
      artifact.eventsSig == null ||
      artifact.functions == null
    ) {
      throw Error('The artifact JSON for contract is incomplete')
    }
    const contract = new Contract(
      artifact.sourceCodeSha256,
      artifact.bytecode,
      artifact.codeHash,
      artifact.fieldsSig,
      artifact.eventsSig,
      artifact.functions
    )
    this._putArtifactToCache(contract)
    return contract
  }

  // support both 'code.ral' and 'code.ral.json'
  static async fromArtifactFile(path: string): Promise<Contract> {
    const sourceFile = this.getSourceFile(path, [])
    const artifactPath = sourceFile.artifactPath
    const content = await fsPromises.readFile(artifactPath)
    const artifact = JSON.parse(content.toString())
    return Contract.fromJson(artifact)
  }

  async fetchState(provider: NodeProvider, address: string, group: number): Promise<ContractState> {
    const state = await provider.contracts.getContractsAddressState(address, { group: group })
    return this.fromApiContractState(state)
  }

  override toString(): string {
    return JSON.stringify(
      {
        sourceCodeSha256: this.sourceCodeSha256,
        bytecode: this.bytecode,
        codeHash: this.codeHash,
        fieldsSig: this.fieldsSig,
        eventsSig: this.eventsSig,
        functions: this.functions
      },
      null,
      2
    )
  }

  toState(fields: Fields, asset: Asset, address?: string): ContractState {
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

  static randomAddress(): string {
    const bytes = crypto.randomBytes(33)
    bytes[0] = 3
    return bs58.encode(bytes)
  }

  private async _test(
    provider: NodeProvider,
    funcName: string,
    params: TestContractParams,
    expectPublic: boolean,
    accessType: string
  ): Promise<TestContractResult> {
    const apiParams: node.TestContract = this.toTestContract(funcName, params)
    const apiResult = await provider.contracts.postContractsTestContract(apiParams)

    const methodIndex =
      typeof params.testMethodIndex !== 'undefined' ? params.testMethodIndex : this.getMethodIndex(funcName)
    const isPublic = this.functions[`${methodIndex}`].signature.indexOf('pub ') !== -1
    if (isPublic === expectPublic) {
      const result = await this.fromTestContractResult(methodIndex, apiResult)
      return result
    } else {
      throw new Error(`The test method ${funcName} is not ${accessType}`)
    }
  }

  async testPublicMethod(
    provider: NodeProvider,
    funcName: string,
    params: TestContractParams
  ): Promise<TestContractResult> {
    return this._test(provider, funcName, params, true, 'public')
  }

  async testPrivateMethod(
    provider: NodeProvider,
    funcName: string,
    params: TestContractParams
  ): Promise<TestContractResult> {
    return this._test(provider, funcName, params, false, 'private')
  }

  toApiFields(fields?: Fields): node.Val[] {
    if (typeof fields === 'undefined') {
      return []
    } else {
      return toApiFields(fields, this.fieldsSig)
    }
  }

  toApiArgs(funcName: string, args?: Arguments): node.Val[] {
    if (args) {
      const func = this.functions.find((func) => func.name == funcName)
      if (func == null) {
        throw new Error(`Invalid function name: ${funcName}`)
      }

      return toApiArgs(args, func)
    } else {
      return []
    }
  }

  getMethodIndex(funcName: string): number {
    return this.functions.findIndex((func) => func.name === funcName)
  }

  toApiContractStates(states?: ContractState[]): node.ContractState[] | undefined {
    return typeof states != 'undefined' ? states.map((state) => toApiContractState(state)) : undefined
  }

  toTestContract(funcName: string, params: TestContractParams): node.TestContract {
    return {
      group: params.group,
      address: params.address,
      bytecode: this.bytecode,
      initialFields: this.toApiFields(params.initialFields),
      initialAsset: typeof params.initialAsset !== 'undefined' ? toApiAsset(params.initialAsset) : undefined,
      methodIndex: this.getMethodIndex(funcName),
      args: this.toApiArgs(funcName, params.testArgs),
      existingContracts: this.toApiContractStates(params.existingContracts),
      inputAssets: toApiInputAssets(params.inputAssets)
    }
  }

  static async fromCodeHash(codeHash: string): Promise<Contract> {
    const cached = this._getArtifactFromCache(codeHash)
    if (typeof cached !== 'undefined') {
      return cached as Contract
    }

    const files = await fsPromises.readdir(Common._artifactsFolder())
    for (const file of files) {
      if (file.endsWith('.ral.json')) {
        try {
          const contract = await Contract.fromArtifactFile(file)
          if (contract.codeHash === codeHash) {
            return contract as Contract
          }
        } catch (_) {}
      }
    }

    throw new Error(`Unknown code with code hash: ${codeHash}`)
  }

  static async getFieldsSig(state: node.ContractState): Promise<node.FieldsSig> {
    return Contract.fromCodeHash(state.codeHash).then((contract) => contract.fieldsSig)
  }

  async fromApiContractState(state: node.ContractState): Promise<ContractState> {
    const contract = await Contract.fromCodeHash(state.codeHash)
    return {
      address: state.address,
      contractId: binToHex(contractIdFromAddress(state.address)),
      bytecode: state.bytecode,
      initialStateHash: state.initialStateHash,
      codeHash: state.codeHash,
      fields: fromApiFields(state.fields, contract.fieldsSig),
      fieldsSig: await Contract.getFieldsSig(state),
      asset: fromApiAsset(state.asset)
    }
  }

  static ContractCreatedEvent: node.EventSig = {
    name: 'ContractCreated',
    signature: 'event ContractCreated(address:Address)',
    fieldNames: ['address'],
    fieldTypes: ['Address']
  }

  static ContractDestroyedEvent: node.EventSig = {
    name: 'ContractDestroyed',
    signature: 'event ContractDestroyed(address:Address)',
    fieldNames: ['address'],
    fieldTypes: ['Address']
  }

  static async fromApiEvent(
    event: node.ContractEventByTxId,
    codeHash: string | undefined
  ): Promise<ContractEventByTxId> {
    let eventSig: node.EventSig

    if (event.eventIndex == -1) {
      eventSig = this.ContractCreatedEvent
    } else if (event.eventIndex == -2) {
      eventSig = this.ContractDestroyedEvent
    } else {
      const contract = await Contract.fromCodeHash(codeHash!)
      eventSig = contract.eventsSig[event.eventIndex]
    }

    return {
      blockHash: event.blockHash,
      contractAddress: event.contractAddress,
      name: eventSig.name,
      fields: fromApiEventFields(event.fields, eventSig)
    }
  }

  async fromTestContractResult(methodIndex: number, result: node.TestContractResult): Promise<TestContractResult> {
    const addressToCodeHash = new Map<string, string>()
    addressToCodeHash.set(result.address, result.codeHash)
    result.contracts.forEach((contract) => addressToCodeHash.set(contract.address, contract.codeHash))
    return {
      address: result.address,
      contractId: binToHex(contractIdFromAddress(result.address)),
      returns: fromApiArray(result.returns, this.functions[`${methodIndex}`].returnTypes),
      gasUsed: result.gasUsed,
      contracts: await Promise.all(result.contracts.map((contract) => this.fromApiContractState(contract))),
      txOutputs: result.txOutputs.map(fromApiOutput),
      events: await Promise.all(
        result.events.map((event) => {
          const contractAddress = event.contractAddress
          const codeHash = addressToCodeHash.get(contractAddress)
          if (typeof codeHash !== 'undefined' || event.eventIndex < 0) {
            return Contract.fromApiEvent(event, codeHash)
          } else {
            throw Error(`Cannot find codeHash for the contract address: ${contractAddress}`)
          }
        })
      )
    }
  }

  async paramsForDeployment(params: BuildDeployContractTx): Promise<SignDeployContractTxParams> {
    const bytecode = this.buildByteCodeToDeploy(params.initialFields ? params.initialFields : {})
    const signerParams: SignDeployContractTxParams = {
      signerAddress: params.signerAddress,
      bytecode: bytecode,
      initialAttoAlphAmount: extractOptionalNumber256(params.initialAttoAlphAmount),
      issueTokenAmount: extractOptionalNumber256(params.issueTokenAmount),
      initialTokenAmounts: params.initialTokenAmounts?.map(toApiToken),
      gasAmount: params.gasAmount,
      gasPrice: extractOptionalNumber256(params.gasPrice)
    }
    return signerParams
  }

  async transactionForDeployment(
    signer: SignerWithNodeProvider,
    params: Omit<BuildDeployContractTx, 'signerAddress'>
  ): Promise<DeployContractTransaction> {
    const signerParams = await this.paramsForDeployment({
      ...params,
      signerAddress: (await signer.getAccounts())[0].address
    })
    const response = await signer.buildContractCreationTx(signerParams)
    return fromApiDeployContractUnsignedTx(response)
  }

  buildByteCodeToDeploy(initialFields: Fields): string {
    return ralph.buildContractByteCode(this.bytecode, initialFields, this.fieldsSig)
  }
}

export class Script extends Common {
  readonly bytecodeTemplate: string
  readonly fieldsSig: node.FieldsSig

  constructor(
    sourceCodeSha256: string,
    bytecodeTemplate: string,
    fieldsSig: node.FieldsSig,
    functions: node.FunctionSig[]
  ) {
    super(sourceCodeSha256, functions)
    this.bytecodeTemplate = bytecodeTemplate
    this.fieldsSig = fieldsSig
  }

  static checkCodeType(fileName: string, contractStr: string): void {
    const scriptMatches = contractStr.match(this.scriptRegex)
    if (scriptMatches === null) {
      throw new Error(`No script found in: ${fileName}`)
    } else if (scriptMatches.length > 1) {
      throw new Error(`Multiple scripts in: ${fileName}`)
    } else {
      return
    }
  }

  private static async loadContractStr(sourceFile: SourceFile): Promise<string> {
    return Common._loadContractStr(sourceFile, [], (code) => Script.checkCodeType(sourceFile.contractPath, code))
  }

  static async fromSource(provider: NodeProvider, path: string): Promise<Script> {
    const sourceFile = this.getSourceFile(path, [])
    return Common._from(provider, sourceFile, (sourceFile) => Script.loadContractStr(sourceFile), Script.compile)
  }

  private static async compile(
    provider: NodeProvider,
    sourceFile: SourceFile,
    scriptStr: string,
    contractHash: string
  ): Promise<Script> {
    const compiled = await provider.contracts.postContractsCompileScript({ code: scriptStr })
    const artifact = new Script(contractHash, compiled.bytecodeTemplate, compiled.fields, compiled.functions)
    await artifact._saveToFile(sourceFile)
    return artifact
  }

  // TODO: safely parse json
  static fromJson(artifact: any): Script {
    if (
      artifact.sourceCodeSha256 == null ||
      artifact.bytecodeTemplate == null ||
      artifact.fieldsSig == null ||
      artifact.functions == null
    ) {
      throw Error('The artifact JSON for script is incomplete')
    }
    return new Script(artifact.sourceCodeSha256, artifact.bytecodeTemplate, artifact.fieldsSig, artifact.functions)
  }

  static async fromArtifactFile(path: string): Promise<Script> {
    const sourceFile = this.getSourceFile(path, [])
    const artifactPath = sourceFile.artifactPath
    const content = await fsPromises.readFile(artifactPath)
    const artifact = JSON.parse(content.toString())
    return this.fromJson(artifact)
  }

  override toString(): string {
    return JSON.stringify(
      {
        sourceCodeSha256: this.sourceCodeSha256,
        bytecodeTemplate: this.bytecodeTemplate,
        fieldsSig: this.fieldsSig,
        functions: this.functions
      },
      null,
      2
    )
  }

  async paramsForDeployment(params: BuildExecuteScriptTx): Promise<SignExecuteScriptTxParams> {
    const signerParams: SignExecuteScriptTxParams = {
      signerAddress: params.signerAddress,
      bytecode: this.buildByteCodeToDeploy(params.initialFields ? params.initialFields : {}),
      attoAlphAmount: extractOptionalNumber256(params.attoAlphAmount),
      tokens: typeof params.tokens !== 'undefined' ? params.tokens.map(toApiToken) : undefined,
      gasAmount: params.gasAmount,
      gasPrice: extractOptionalNumber256(params.gasPrice)
    }
    return signerParams
  }

  async transactionForDeployment(
    signer: SignerWithNodeProvider,
    params: Omit<BuildExecuteScriptTx, 'signerAddress'>
  ): Promise<BuildScriptTxResult> {
    const signerParams = await this.paramsForDeployment({
      ...params,
      signerAddress: (await signer.getAccounts())[0].address
    })
    return await signer.buildScriptTx(signerParams)
  }

  buildByteCodeToDeploy(initialFields: Fields): string {
    return ralph.buildScriptByteCode(this.bytecodeTemplate, initialFields, this.fieldsSig)
  }
}

export type Number256 = number | bigint | string
export type Val = Number256 | boolean | string | Val[]
export type NamedVals = Record<string, Val>
export type Fields = NamedVals
export type Arguments = NamedVals

function extractBoolean(v: Val): boolean {
  if (typeof v === 'boolean') {
    return v
  } else {
    throw new Error(`Invalid boolean value: ${v}`)
  }
}

// TODO: check integer bounds
function extractNumber256(v: Val): string {
  if ((typeof v === 'number' && Number.isInteger(v)) || typeof v === 'bigint') {
    return v.toString()
  } else if (typeof v === 'string') {
    return v
  } else {
    throw new Error(`Invalid 256 bit number: ${v}`)
  }
}

function extractOptionalNumber256(v?: Val): string | undefined {
  return typeof v !== 'undefined' ? extractNumber256(v) : undefined
}

// TODO: check hex string
function extractByteVec(v: Val): string {
  if (typeof v === 'string') {
    // try to convert from address to contract id
    try {
      const address = bs58.decode(v)
      if (address.length == 33 && address[0] == 3) {
        return Buffer.from(address.slice(1)).toString('hex')
      }
    } catch (_) {
      return v as string
    }
    return v as string
  } else {
    throw new Error(`Invalid string: ${v}`)
  }
}

function extractBs58(v: Val): string {
  if (typeof v === 'string') {
    try {
      bs58.decode(v)
      return v as string
    } catch (error) {
      throw new Error(`Invalid base58 string: ${v}`)
    }
  } else {
    throw new Error(`Invalid string: ${v}`)
  }
}

function decodeNumber256(n: string): Number256 {
  if (Number.isSafeInteger(Number.parseInt(n))) {
    return Number(n)
  } else {
    return BigInt(n)
  }
}

export function extractArray(tpe: string, v: Val): node.Val {
  if (!Array.isArray(v)) {
    throw new Error(`Expected array, got ${v}`)
  }

  const semiColonIndex = tpe.lastIndexOf(';')
  if (semiColonIndex == -1) {
    throw new Error(`Invalid Val type: ${tpe}`)
  }

  const subType = tpe.slice(1, semiColonIndex)
  const dim = parseInt(tpe.slice(semiColonIndex + 1, -1))
  if ((v as Val[]).length != dim) {
    throw new Error(`Invalid val dimension: ${v}`)
  } else {
    return { value: (v as Val[]).map((v) => toApiVal(v, subType)), type: 'Array' }
  }
}

export function toApiVal(v: Val, tpe: string): node.Val {
  if (tpe === 'Bool') {
    return { value: extractBoolean(v), type: tpe }
  } else if (tpe === 'U256' || tpe === 'I256') {
    return { value: extractNumber256(v), type: tpe }
  } else if (tpe === 'ByteVec') {
    return { value: extractByteVec(v), type: tpe }
  } else if (tpe === 'Address') {
    return { value: extractBs58(v), type: tpe }
  } else {
    return extractArray(tpe, v)
  }
}

function decodeArrayType(tpe: string): [baseType: string, dims: number[]] {
  const semiColonIndex = tpe.lastIndexOf(';')
  if (semiColonIndex === -1) {
    throw new Error(`Invalid Val type: ${tpe}`)
  }

  const subType = tpe.slice(1, semiColonIndex)
  const dim = parseInt(tpe.slice(semiColonIndex + 1, -1))
  if (subType[0] == '[') {
    const [baseType, subDim] = decodeArrayType(subType)
    return [baseType, (subDim.unshift(dim), subDim)]
  } else {
    return [subType, [dim]]
  }
}

function foldVals(vals: Val[], dims: number[]): Val {
  if (dims.length == 1) {
    return vals
  } else {
    const result: Val[] = []
    const chunkSize = vals.length / dims[0]
    const chunkDims = dims.slice(1)
    for (let i = 0; i < vals.length; i += chunkSize) {
      const chunk = vals.slice(i, i + chunkSize)
      result.push(foldVals(chunk, chunkDims))
    }
    return result
  }
}

function _fromApiVal(vals: node.Val[], valIndex: number, tpe: string): [result: Val, nextIndex: number] {
  if (vals.length === 0) {
    throw new Error('Not enough Vals')
  }

  const firstVal = vals[`${valIndex}`]
  if (tpe === 'Bool' && firstVal.type === tpe) {
    return [firstVal.value as boolean, valIndex + 1]
  } else if ((tpe === 'U256' || tpe === 'I256') && firstVal.type === tpe) {
    return [decodeNumber256(firstVal.value as string), valIndex + 1]
  } else if ((tpe === 'ByteVec' || tpe === 'Address') && firstVal.type === tpe) {
    return [firstVal.value as string, valIndex + 1]
  } else {
    const [baseType, dims] = decodeArrayType(tpe)
    const arraySize = dims.reduce((a, b) => a * b)
    const nextIndex = valIndex + arraySize
    const valsToUse = vals.slice(valIndex, nextIndex)
    if (valsToUse.length == arraySize && valsToUse.every((val) => val.type === baseType)) {
      const localVals = valsToUse.map((val) => fromApiVal(val, baseType))
      return [foldVals(localVals, dims), nextIndex]
    } else {
      throw new Error(`Invalid array Val type: ${valsToUse}, ${tpe}`)
    }
  }
}

function fromApiFields(vals: node.Val[], fieldsSig: node.FieldsSig): Fields {
  return fromApiVals(vals, fieldsSig.names, fieldsSig.types)
}

function fromApiEventFields(vals: node.Val[], eventSig: node.EventSig): Fields {
  return fromApiVals(vals, eventSig.fieldNames, eventSig.fieldTypes)
}

function fromApiVals(vals: node.Val[], names: string[], types: string[]): Fields {
  let valIndex = 0
  const result: Fields = {}
  types.forEach((currentType, index) => {
    const currentName = names[`${index}`]
    const [val, nextIndex] = _fromApiVal(vals, valIndex, currentType)
    valIndex = nextIndex
    result[`${currentName}`] = val
  })
  return result
}

function fromApiArray(vals: node.Val[], types: string[]): Val[] {
  let valIndex = 0
  const result: Val[] = []
  for (const currentType of types) {
    const [val, nextIndex] = _fromApiVal(vals, valIndex, currentType)
    result.push(val)
    valIndex = nextIndex
  }
  return result
}

function fromApiVal(v: node.Val, tpe: string): Val {
  if (v.type === 'Bool' && v.type === tpe) {
    return v.value as boolean
  } else if ((v.type === 'U256' || v.type === 'I256') && v.type === tpe) {
    return decodeNumber256(v.value as string)
  } else if ((v.type === 'ByteVec' || v.type === 'Address') && v.type === tpe) {
    return v.value as string
  } else {
    throw new Error(`Invalid node.Val type: ${v}`)
  }
}

export interface Asset {
  alphAmount: Number256
  tokens?: Token[]
}

export interface Token {
  id: string
  amount: Number256
}

function toApiToken(token: Token): node.Token {
  return { id: token.id, amount: extractNumber256(token.amount) }
}

function fromApiToken(token: node.Token): Token {
  return { id: token.id, amount: decodeNumber256(token.amount) }
}

function toApiAsset(asset: Asset): node.AssetState {
  return {
    attoAlphAmount: extractNumber256(asset.alphAmount),
    tokens: typeof asset.tokens !== 'undefined' ? asset.tokens.map(toApiToken) : []
  }
}

function fromApiAsset(asset: node.AssetState): Asset {
  return {
    alphAmount: decodeNumber256(asset.attoAlphAmount),
    tokens: typeof asset.tokens !== 'undefined' ? asset.tokens.map(fromApiToken) : undefined
  }
}

export interface InputAsset {
  address: string
  asset: Asset
}

export interface ContractState {
  address: string
  contractId: string
  bytecode: string
  initialStateHash?: string
  codeHash: string
  fields: Fields
  fieldsSig: node.FieldsSig
  asset: Asset
}

function getVal(vals: NamedVals, name: string): Val {
  if (name in vals) {
    return vals[`${name}`]
  } else {
    throw Error(`No Val exists for ${name}`)
  }
}

function toApiContractState(state: ContractState): node.ContractState {
  return {
    address: state.address,
    bytecode: state.bytecode,
    codeHash: state.codeHash,
    initialStateHash: state.initialStateHash,
    fields: toApiFields(state.fields, state.fieldsSig),
    asset: toApiAsset(state.asset)
  }
}

function toApiFields(fields: Fields, fieldsSig: node.FieldsSig): node.Val[] {
  return toApiVals(fields, fieldsSig.names, fieldsSig.types)
}

function toApiArgs(args: Arguments, funcSig: node.FunctionSig): node.Val[] {
  return toApiVals(args, funcSig.argNames, funcSig.argTypes)
}

function toApiVals(fields: Fields, names: string[], types: string[]): node.Val[] {
  return names.map((name, index) => {
    const val = getVal(fields, name)
    const tpe = types[`${index}`]
    return toApiVal(val, tpe)
  })
}

function toApiInputAsset(inputAsset: InputAsset): node.TestInputAsset {
  return { address: inputAsset.address, asset: toApiAsset(inputAsset.asset) }
}

function toApiInputAssets(inputAssets?: InputAsset[]): node.TestInputAsset[] | undefined {
  return typeof inputAssets !== 'undefined' ? inputAssets.map(toApiInputAsset) : undefined
}

export interface TestContractParams {
  group?: number // default 0
  address?: string
  initialFields?: Fields // default no fields
  initialAsset?: Asset // default 1 ALPH
  testMethodIndex?: number // default 0
  testArgs?: Arguments // default no arguments
  existingContracts?: ContractState[] // default no existing contracts
  inputAssets?: InputAsset[] // default no input asserts
}

export interface ContractEvent {
  blockHash: string
  txId: string
  name: string
  fields: Fields
}

export interface ContractEventByTxId {
  blockHash: string
  contractAddress: string
  name: string
  fields: Fields
}

export interface TestContractResult {
  address: string
  contractId: string
  returns: Val[]
  gasUsed: number
  contracts: ContractState[]
  txOutputs: Output[]
  events: ContractEventByTxId[]
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
  tokens: Token[]
}

function fromApiOutput(output: node.Output): Output {
  if (output.type === 'AssetOutput') {
    const asset = output as node.AssetOutput
    return {
      type: 'AssetOutput',
      address: asset.address,
      alphAmount: decodeNumber256(asset.attoAlphAmount),
      tokens: asset.tokens.map(fromApiToken),
      lockTime: asset.lockTime,
      message: asset.message
    }
  } else if (output.type === 'ContractOutput') {
    const asset = output as node.ContractOutput
    return {
      type: 'ContractOutput',
      address: asset.address,
      alphAmount: decodeNumber256(asset.attoAlphAmount),
      tokens: asset.tokens.map(fromApiToken)
    }
  } else {
    throw new Error(`Unknown output type: ${output}`)
  }
}

export interface DeployContractTransaction {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
  contractAddress: string
  contractId: string
}

function fromApiDeployContractUnsignedTx(result: node.BuildDeployContractTxResult): DeployContractTransaction {
  return { ...result, contractId: binToHex(contractIdFromAddress(result.contractAddress)) }
}

type BuildTxParams<T> = Omit<T, 'bytecode'> & { initialFields?: Val[] }

export interface BuildDeployContractTx {
  signerAddress: string
  initialFields?: Fields
  initialAttoAlphAmount?: string
  initialTokenAmounts?: Token[]
  issueTokenAmount?: Number256
  gasAmount?: number
  gasPrice?: Number256
  submitTx?: boolean
}
assertType<Eq<keyof BuildDeployContractTx, keyof BuildTxParams<SignDeployContractTxParams>>>()

export interface BuildExecuteScriptTx {
  signerAddress: string
  initialFields?: Fields
  attoAlphAmount?: Number256
  tokens?: Token[]
  gasAmount?: number
  gasPrice?: Number256
  submitTx?: boolean
}
assertType<Eq<keyof BuildExecuteScriptTx, keyof BuildTxParams<SignExecuteScriptTxParams>>>()

export interface BuildScriptTxResult {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
}
