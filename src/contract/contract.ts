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
import { node, NodeProvider } from '../api'
import { SignDeployContractTxParams, SignExecuteScriptTxParams, SignerWithNodeProvider } from '../signer'
import * as ralph from './ralph'
import { bs58, binToHex, contractIdFromAddress, assertType, Eq } from '../utils'
import { CompileContractResult, CompileScriptResult } from '../api/api-alephium'
import { getCurrentNodeProvider } from '../global'

type FieldsSig = node.FieldsSig
type EventSig = node.EventSig
type FunctionSig = node.FunctionSig

enum SourceType {
  Contract = 0,
  Script = 1,
  AbstractContract = 2,
  Interface = 3
}

export type CompilerOptions = {
  errorOnWarnings: boolean
  ignoreUnusedConstantsWarnings: boolean
}

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
  errorOnWarnings: true,
  ignoreUnusedConstantsWarnings: true
}

class TypedMatcher<T extends SourceType> {
  matcher: RegExp
  type: T

  constructor(pattern: string, type: T) {
    this.matcher = new RegExp(pattern, 'mg')
    this.type = type
  }

  match(str: string): number {
    const results = str.match(this.matcher)
    return results === null ? 0 : results.length
  }
}

class SourceFile {
  type: SourceType
  contractPath: string
  sourceCode: string
  sourceCodeHash: string

  getArtifactPath(artifactsRootPath: string): string {
    return artifactsRootPath + this.contractPath.slice(this.contractPath.indexOf('/')) + '.json'
  }

  constructor(type: SourceType, sourceCode: string, contractPath: string) {
    this.type = type
    this.sourceCode = sourceCode
    this.sourceCodeHash = cryptojs.SHA256(sourceCode).toString()
    this.contractPath = contractPath
  }
}

class Compiled<T extends Artifact> {
  sourceFile: SourceFile
  artifact: T
  warnings: string[]

  constructor(sourceFile: SourceFile, artifact: T, warnings: string[]) {
    this.sourceFile = sourceFile
    this.artifact = artifact
    this.warnings = warnings
  }
}

class ProjectArtifact {
  static readonly artifactFileName = '.project.json'

  infos: Map<string, { sourceCodeHash: string; warnings: string[] }>

  constructor(infos: Map<string, { sourceCodeHash: string; warnings: string[] }>) {
    this.infos = infos
  }

  async saveToFile(rootPath: string): Promise<void> {
    const filepath = rootPath + '/' + ProjectArtifact.artifactFileName
    const content = JSON.stringify(Object.fromEntries(this.infos), null, 2)
    return fsPromises.writeFile(filepath, content)
  }

  sourceHasChanged(files: SourceFile[]): boolean {
    if (files.length !== this.infos.size) {
      return true
    }
    for (const file of files) {
      const info = this.infos.get(file.contractPath)
      if (typeof info === 'undefined' || info.sourceCodeHash !== file.sourceCodeHash) {
        return true
      }
    }
    return false
  }

  static async from(rootPath: string): Promise<ProjectArtifact | undefined> {
    const filepath = rootPath + '/' + ProjectArtifact.artifactFileName
    if (!fs.existsSync(filepath)) {
      return undefined
    }
    const content = await fsPromises.readFile(filepath)
    const files = new Map(
      Object.entries<{ sourceCodeHash: string; warnings: string[] }>(JSON.parse(content.toString()))
    )
    return new ProjectArtifact(files)
  }
}

export class Project {
  sourceFiles: SourceFile[]
  contracts: Compiled<Contract>[]
  scripts: Compiled<Script>[]

  readonly contractsRootPath: string
  readonly artifactsRootPath: string
  readonly nodeProvider: NodeProvider

  static currentProject: Project

  static readonly abstractContractMatcher = new TypedMatcher<SourceType>(
    '^Abstract Contract [A-Z][a-zA-Z0-9]*',
    SourceType.AbstractContract
  )
  static readonly contractMatcher = new TypedMatcher('^Contract [A-Z][a-zA-Z0-9]*', SourceType.Contract)
  static readonly interfaceMatcher = new TypedMatcher('^Interface [A-Z][a-zA-Z0-9]* \\{', SourceType.Interface)
  static readonly scriptMatcher = new TypedMatcher('^TxScript [A-Z][a-zA-Z0-9]*', SourceType.Script)
  static readonly matchers = [
    Project.abstractContractMatcher,
    Project.contractMatcher,
    Project.interfaceMatcher,
    Project.scriptMatcher
  ]

  private constructor(
    provider: NodeProvider,
    contractsRootPath: string,
    artifactsRootPath: string,
    sourceFiles: SourceFile[],
    contracts: Compiled<Contract>[],
    scripts: Compiled<Script>[]
  ) {
    this.nodeProvider = provider
    this.contractsRootPath = contractsRootPath
    this.artifactsRootPath = artifactsRootPath
    this.sourceFiles = sourceFiles
    this.contracts = contracts
    this.scripts = scripts
  }

  private getContractPath(path: string): string {
    return path.startsWith(`./${this.contractsRootPath}`)
      ? path.slice(2)
      : path.startsWith(this.contractsRootPath)
      ? path
      : this.contractsRootPath + '/' + path
  }

  private static checkCompilerWarnings(warnings: string[], compilerOptions: CompilerOptions): void {
    const remains = compilerOptions.ignoreUnusedConstantsWarnings
      ? warnings.filter((s) => !s.includes('unused constants'))
      : warnings
    if (remains.length !== 0) {
      const prefixPerWarning = '  - '
      const warningString = prefixPerWarning + remains.join('\n' + prefixPerWarning)
      const output = 'Compilation warnings:\n' + warningString + '\n'
      if (compilerOptions.errorOnWarnings) {
        throw new Error(output)
      } else {
        console.log(output)
      }
    }
  }

  static contract(path: string, compilerOptions?: Partial<CompilerOptions>): Contract {
    const contractPath = Project.currentProject.getContractPath(path)
    const contract = Project.currentProject.contracts.find((c) => c.sourceFile.contractPath === contractPath)
    if (typeof contract === 'undefined') {
      throw new Error(`Contract ${contractPath} does not exist`)
    }
    Project.checkCompilerWarnings(contract.warnings, { ...DEFAULT_COMPILER_OPTIONS, ...compilerOptions })
    return contract.artifact
  }

  static script(path: string, compilerOptions?: Partial<CompilerOptions>): Script {
    const contractPath = Project.currentProject.getContractPath(path)
    const script = Project.currentProject.scripts.find((c) => c.sourceFile.contractPath === contractPath)
    if (typeof script === 'undefined') {
      throw new Error(`Script ${contractPath} does not exist`)
    }
    Project.checkCompilerWarnings(script.warnings, { ...DEFAULT_COMPILER_OPTIONS, ...compilerOptions })
    return script.artifact
  }

  private async saveArtifactsToFile(): Promise<void> {
    const artifactsRootPath = this.artifactsRootPath
    const saveToFile = async function (compiled: Compiled<Artifact>): Promise<void> {
      const artifactPath = compiled.sourceFile.getArtifactPath(artifactsRootPath)
      const folder = artifactPath.slice(0, artifactPath.lastIndexOf('/'))
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }
      return fsPromises.writeFile(artifactPath, compiled.artifact.toString())
    }
    for (const contract of this.contracts) {
      await saveToFile(contract)
    }
    for (const script of this.scripts) {
      await saveToFile(script)
    }
  }

  contractByCodeHash(codeHash: string): Contract {
    const contract = this.contracts.find((c) => c.artifact.codeHash === codeHash)
    if (typeof contract === 'undefined') {
      throw new Error(`Unknown code with code hash: ${codeHash}`)
    }
    return contract.artifact
  }

  private async saveProjectArtifactToFile(): Promise<void> {
    const files: Map<string, { sourceCodeHash: string; warnings: string[] }> = new Map()
    this.contracts.forEach((c) => {
      files.set(c.sourceFile.contractPath, {
        sourceCodeHash: c.sourceFile.sourceCodeHash,
        warnings: c.warnings
      })
    })
    this.scripts.forEach((s) => {
      files.set(s.sourceFile.contractPath, {
        sourceCodeHash: s.sourceFile.sourceCodeHash,
        warnings: s.warnings
      })
    })
    const compiledSize = this.contracts.length + this.scripts.length
    this.sourceFiles.slice(compiledSize).forEach((c) => {
      files.set(c.contractPath, {
        sourceCodeHash: c.sourceCodeHash,
        warnings: []
      })
    })
    const projectArtifact = new ProjectArtifact(files)
    await projectArtifact.saveToFile(this.artifactsRootPath)
  }

  private static async compile(
    provider: NodeProvider,
    files: SourceFile[],
    contractsRootPath: string,
    artifactsRootPath: string
  ): Promise<Project> {
    const sourceStr = files.map((f) => f.sourceCode).join('\n')
    const result = await provider.contracts.postContractsCompileProject({
      code: sourceStr
    })
    const contracts: Compiled<Contract>[] = []
    const scripts: Compiled<Script>[] = []
    result.contracts.forEach((contractResult, index) => {
      const sourceFile = files[`${index}`]
      const contract = Contract.fromCompileResult(contractResult)
      contracts.push(new Compiled(sourceFile, contract, contractResult.warnings))
    })
    result.scripts.forEach((scriptResult, index) => {
      const sourceFile = files[index + contracts.length]
      const script = Script.fromCompileResult(scriptResult)
      scripts.push(new Compiled(sourceFile, script, scriptResult.warnings))
    })
    const project = new Project(provider, contractsRootPath, artifactsRootPath, files, contracts, scripts)
    await project.saveArtifactsToFile()
    await project.saveProjectArtifactToFile()
    return project
  }

  private static async loadArtifacts(
    provider: NodeProvider,
    files: SourceFile[],
    projectArtifact: ProjectArtifact,
    contractsRootPath: string,
    artifactsRootPath: string
  ): Promise<Project> {
    try {
      const contracts: Compiled<Contract>[] = []
      const scripts: Compiled<Script>[] = []
      for (const file of files) {
        const info = projectArtifact.infos.get(file.contractPath)
        if (typeof info === 'undefined') {
          throw Error(`Unable to find project info for ${file.contractPath}, please rebuild the project`)
        }
        const warnings = info.warnings
        const artifactPath = file.getArtifactPath(artifactsRootPath)
        if (file.type === SourceType.Contract) {
          const artifact = await Contract.fromArtifactFile(artifactPath)
          contracts.push(new Compiled(file, artifact, warnings))
        } else if (file.type === SourceType.Script) {
          const artifact = await Script.fromArtifactFile(artifactPath)
          scripts.push(new Compiled(file, artifact, warnings))
        }
      }
      return new Project(provider, contractsRootPath, artifactsRootPath, files, contracts, scripts)
    } catch (error) {
      console.log(`Failed to load artifacts, error: ${error}, try to re-compile contracts...`)
      return Project.compile(provider, files, contractsRootPath, artifactsRootPath)
    }
  }

  private static async loadSourceFile(dirPath: string, filename: string): Promise<SourceFile> {
    const contractPath = dirPath + '/' + filename
    if (!filename.endsWith('.ral')) {
      throw new Error(`Invalid filename: ${contractPath}, smart contract file name should end with ".ral"`)
    }

    const sourceBuffer = await fsPromises.readFile(contractPath)
    const sourceStr = sourceBuffer.toString()
    const results = this.matchers.map((m) => m.match(sourceStr))
    const matchNumber = results.reduce((a, b) => a + b, 0)
    if (matchNumber === 0) {
      throw new Error(`No contract defined in file: ${contractPath}`)
    }
    if (matchNumber > 1) {
      throw new Error(`Multiple definitions in file: ${contractPath}`)
    }
    const matcherIndex = results.indexOf(1)
    const type = this.matchers[`${matcherIndex}`].type
    return new SourceFile(type, sourceStr, contractPath)
  }

  private static async loadSourceFiles(contractsRootPath: string): Promise<SourceFile[]> {
    const loadDir = async function (dirPath: string, results: SourceFile[]): Promise<void> {
      const dirents = await fsPromises.readdir(dirPath, { withFileTypes: true })
      for (const dirent of dirents) {
        if (dirent.isFile()) {
          const file = await Project.loadSourceFile(dirPath, dirent.name)
          results.push(file)
        } else {
          const newPath = dirPath + '/' + dirent.name
          await loadDir(newPath, results)
        }
      }
    }
    const sourceFiles: SourceFile[] = []
    await loadDir(contractsRootPath, sourceFiles)
    const contractAndScriptSize = sourceFiles.filter(
      (f) => f.type === SourceType.Contract || f.type === SourceType.Script
    ).length
    if (sourceFiles.length === 0 || contractAndScriptSize === 0) {
      throw new Error('Project have no source files')
    }
    return sourceFiles.sort((a, b) => a.type - b.type)
  }

  static async build(contractsRootPath = 'contracts', artifactsRootPath = 'artifacts'): Promise<void> {
    const provider = getCurrentNodeProvider()
    const sourceFiles = await Project.loadSourceFiles(contractsRootPath)
    const projectArtifact = await ProjectArtifact.from(artifactsRootPath)
    if (typeof projectArtifact === 'undefined' || projectArtifact.sourceHasChanged(sourceFiles)) {
      Project.currentProject = await Project.compile(provider, sourceFiles, contractsRootPath, artifactsRootPath)
    } else {
      Project.currentProject = await Project.loadArtifacts(
        provider,
        sourceFiles,
        projectArtifact,
        contractsRootPath,
        artifactsRootPath
      )
    }
  }
}

export abstract class Artifact {
  readonly functions: FunctionSig[]

  constructor(functions: FunctionSig[]) {
    this.functions = functions
  }

  abstract buildByteCodeToDeploy(initialFields?: Fields): string

  publicFunctions(): string[] {
    return this.functions.filter((func) => func.isPublic).map((func) => func.name)
  }

  usingPreapprovedAssetsFunctions(): string[] {
    return this.functions.filter((func) => func.usePreapprovedAssets).map((func) => func.name)
  }

  usingAssetsInContractFunctions(): string[] {
    return this.functions.filter((func) => func.useAssetsInContract).map((func) => func.name)
  }
}

export class Contract extends Artifact {
  readonly bytecode: string
  readonly codeHash: string
  readonly fieldsSig: FieldsSig
  readonly eventsSig: EventSig[]

  constructor(
    bytecode: string,
    codeHash: string,
    fieldsSig: FieldsSig,
    eventsSig: EventSig[],
    functions: FunctionSig[]
  ) {
    super(functions)
    this.bytecode = bytecode
    this.codeHash = codeHash
    this.fieldsSig = fieldsSig
    this.eventsSig = eventsSig
  }

  // TODO: safely parse json
  static fromJson(artifact: any): Contract {
    if (
      artifact.bytecode == null ||
      artifact.codeHash == null ||
      artifact.fieldsSig == null ||
      artifact.eventsSig == null ||
      artifact.functions == null
    ) {
      throw Error('The artifact JSON for contract is incomplete')
    }
    const contract = new Contract(
      artifact.bytecode,
      artifact.codeHash,
      artifact.fieldsSig,
      artifact.eventsSig,
      artifact.functions
    )
    return contract
  }

  static fromCompileResult(result: CompileContractResult): Contract {
    return new Contract(result.bytecode, result.codeHash, result.fields, result.events, result.functions)
  }

  // support both 'code.ral' and 'code.ral.json'
  static async fromArtifactFile(path: string): Promise<Contract> {
    const content = await fsPromises.readFile(path)
    const artifact = JSON.parse(content.toString())
    return Contract.fromJson(artifact)
  }

  async fetchState(address: string, group: number): Promise<ContractState> {
    const state = await Project.currentProject.nodeProvider.contracts.getContractsAddressState(address, {
      group: group
    })
    return this.fromApiContractState(state)
  }

  override toString(): string {
    const object = {
      bytecode: this.bytecode,
      codeHash: this.codeHash,
      fieldsSig: this.fieldsSig,
      eventsSig: this.eventsSig,
      functions: this.functions
    }
    return JSON.stringify(object, null, 2)
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
    funcName: string,
    params: TestContractParams,
    expectPublic: boolean,
    accessType: string
  ): Promise<TestContractResult> {
    const apiParams: node.TestContract = this.toTestContract(funcName, params)
    const apiResult = await Project.currentProject.nodeProvider.contracts.postContractsTestContract(apiParams)

    const methodIndex =
      typeof params.testMethodIndex !== 'undefined' ? params.testMethodIndex : this.getMethodIndex(funcName)
    const isPublic = this.functions[`${methodIndex}`].isPublic
    if (isPublic === expectPublic) {
      const result = await this.fromTestContractResult(methodIndex, apiResult)
      return result
    } else {
      throw new Error(`The test method ${funcName} is not ${accessType}`)
    }
  }

  async testPublicMethod(funcName: string, params: TestContractParams): Promise<TestContractResult> {
    return this._test(funcName, params, true, 'public')
  }

  async testPrivateMethod(funcName: string, params: TestContractParams): Promise<TestContractResult> {
    return this._test(funcName, params, false, 'private')
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

  async fromApiContractState(state: node.ContractState): Promise<ContractState> {
    const contract = Project.currentProject.contractByCodeHash(state.codeHash)
    return {
      address: state.address,
      contractId: binToHex(contractIdFromAddress(state.address)),
      bytecode: state.bytecode,
      initialStateHash: state.initialStateHash,
      codeHash: state.codeHash,
      fields: fromApiFields(state.fields, contract.fieldsSig),
      fieldsSig: contract.fieldsSig,
      asset: fromApiAsset(state.asset)
    }
  }

  static ContractCreatedEvent: EventSig = {
    name: 'ContractCreated',
    fieldNames: ['address'],
    fieldTypes: ['Address']
  }

  static ContractDestroyedEvent: EventSig = {
    name: 'ContractDestroyed',
    fieldNames: ['address'],
    fieldTypes: ['Address']
  }

  static async fromApiEvent(
    event: node.ContractEventByTxId,
    codeHash: string | undefined
  ): Promise<ContractEventByTxId> {
    let eventSig: EventSig

    if (event.eventIndex == -1) {
      eventSig = this.ContractCreatedEvent
    } else if (event.eventIndex == -2) {
      eventSig = this.ContractDestroyedEvent
    } else {
      const contract = Project.currentProject.contractByCodeHash(codeHash!)
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

export class Script extends Artifact {
  readonly bytecodeTemplate: string
  readonly fieldsSig: FieldsSig

  constructor(bytecodeTemplate: string, fieldsSig: FieldsSig, functions: FunctionSig[]) {
    super(functions)
    this.bytecodeTemplate = bytecodeTemplate
    this.fieldsSig = fieldsSig
  }

  static fromCompileResult(result: CompileScriptResult): Script {
    return new Script(result.bytecodeTemplate, result.fields, result.functions)
  }

  // TODO: safely parse json
  static fromJson(artifact: any): Script {
    if (artifact.bytecodeTemplate == null || artifact.fieldsSig == null || artifact.functions == null) {
      throw Error('The artifact JSON for script is incomplete')
    }
    return new Script(artifact.bytecodeTemplate, artifact.fieldsSig, artifact.functions)
  }

  static async fromArtifactFile(path: string): Promise<Script> {
    const content = await fsPromises.readFile(path)
    const artifact = JSON.parse(content.toString())
    return this.fromJson(artifact)
  }

  override toString(): string {
    const object = {
      bytecodeTemplate: this.bytecodeTemplate,
      fieldsSig: this.fieldsSig,
      functions: this.functions
    }
    return JSON.stringify(object, null, 2)
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
  fieldsSig: FieldsSig
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

function toApiFields(fields: Fields, fieldsSig: FieldsSig): node.Val[] {
  return toApiVals(fields, fieldsSig.names, fieldsSig.types)
}

function toApiArgs(args: Arguments, funcSig: FunctionSig): node.Val[] {
  return toApiVals(args, funcSig.paramNames, funcSig.paramTypes)
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
