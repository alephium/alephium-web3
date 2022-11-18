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
import { webcrypto as crypto } from 'crypto'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import {
  fromApiArray,
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
  fromApiVals
} from '../api'
import {
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignerProvider,
  SignExecuteScriptTxResult,
  SignDeployContractTxResult
} from '../signer'
import * as ralph from './ralph'
import { bs58, binToHex, contractIdFromAddress, assertType, Eq } from '../utils'
import { getCurrentNodeProvider } from '../global'
import { web3 } from '..'

export type FieldsSig = node.FieldsSig
export type EventSig = node.EventSig
export type FunctionSig = node.FunctionSig
export type Fields = NamedVals
export type Arguments = NamedVals

enum SourceType {
  Contract = 0,
  Script = 1,
  AbstractContract = 2,
  Interface = 3
}

export type CompilerOptions = node.CompilerOptions & {
  errorOnWarnings: boolean
}

export const DEFAULT_NODE_COMPILER_OPTIONS: node.CompilerOptions = {
  ignoreUnusedConstantsWarnings: false,
  ignoreUnusedVariablesWarnings: false,
  ignoreUnusedFieldsWarnings: false,
  ignoreUnusedPrivateFunctionsWarnings: false,
  ignoreReadonlyCheckWarnings: false,
  ignoreExternalCallCheckWarnings: false
}

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = { errorOnWarnings: true, ...DEFAULT_NODE_COMPILER_OPTIONS }

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

  getArtifactPath(artifactsRootDir: string): string {
    return artifactsRootDir + this.contractPath.slice(this.contractPath.indexOf('/')) + '.json'
  }

  constructor(type: SourceType, sourceCode: string, sourceCodeHash: string, contractPath: string) {
    this.type = type
    this.sourceCode = sourceCode
    this.sourceCodeHash = sourceCodeHash
    this.contractPath = contractPath
  }

  static async from(type: SourceType, sourceCode: string, contractPath: string): Promise<SourceFile> {
    const sourceCodeHash = await crypto.subtle.digest('SHA-256', Buffer.from(sourceCode))
    return new SourceFile(type, sourceCode, Buffer.from(sourceCodeHash).toString('hex'), contractPath)
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

type CodeInfo = { sourceCodeHash: string; bytecodeDebugPatch: string; codeHashDebug: string; warnings: string[] }

class ProjectArtifact {
  static readonly artifactFileName = '.project.json'

  compilerOptionsUsed: node.CompilerOptions
  infos: Map<string, CodeInfo>

  static checkCompilerOptionsParameter(compilerOptions: node.CompilerOptions): void {
    if (Object.keys(compilerOptions).length != Object.keys(DEFAULT_NODE_COMPILER_OPTIONS).length) {
      throw Error(`Not all compiler options are set: ${compilerOptions}`)
    }

    const combined = { ...compilerOptions, ...DEFAULT_NODE_COMPILER_OPTIONS }
    if (Object.keys(combined).length !== Object.keys(DEFAULT_NODE_COMPILER_OPTIONS).length) {
      throw Error(`There are unknown compiler options: ${compilerOptions}`)
    }
  }

  constructor(compilerOptionsUsed: node.CompilerOptions, infos: Map<string, CodeInfo>) {
    ProjectArtifact.checkCompilerOptionsParameter(compilerOptionsUsed)
    this.compilerOptionsUsed = compilerOptionsUsed
    this.infos = infos
  }

  async saveToFile(rootPath: string): Promise<void> {
    const filepath = rootPath + '/' + ProjectArtifact.artifactFileName
    const artifact = { compilerOptionsUsed: this.compilerOptionsUsed, infos: Object.fromEntries(this.infos) }
    const content = JSON.stringify(artifact, null, 2)
    return fsPromises.writeFile(filepath, content)
  }

  needToReCompile(compilerOptions: node.CompilerOptions, files: SourceFile[]): boolean {
    ProjectArtifact.checkCompilerOptionsParameter(compilerOptions)

    const optionsMatched = Object.entries(compilerOptions).every(([key, inputOption]) => {
      const usedOption = this.compilerOptionsUsed[`${key}`]
      return usedOption === inputOption
    })
    if (!optionsMatched) {
      return true
    }

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
    const json = JSON.parse(content.toString())
    const compilerOptionsUsed = json.compilerOptionsUsed as node.CompilerOptions
    const files = new Map(Object.entries<CodeInfo>(json.infos))
    return new ProjectArtifact(compilerOptionsUsed, files)
  }
}

export class Project {
  sourceFiles: SourceFile[]
  contracts: Compiled<Contract>[]
  scripts: Compiled<Script>[]
  projectArtifact: ProjectArtifact

  readonly contractsRootDir: string
  readonly artifactsRootDir: string

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

  static buildProjectArtifact(
    sourceFiles: SourceFile[],
    contracts: Compiled<Contract>[],
    scripts: Compiled<Script>[],
    compilerOptions: node.CompilerOptions
  ): ProjectArtifact {
    const files: Map<string, CodeInfo> = new Map()
    contracts.forEach((c) => {
      files.set(c.sourceFile.contractPath, {
        sourceCodeHash: c.sourceFile.sourceCodeHash,
        bytecodeDebugPatch: c.artifact.bytecodeDebugPatch,
        codeHashDebug: c.artifact.codeHashDebug,
        warnings: c.warnings
      })
    })
    scripts.forEach((s) => {
      files.set(s.sourceFile.contractPath, {
        sourceCodeHash: s.sourceFile.sourceCodeHash,
        bytecodeDebugPatch: s.artifact.bytecodeDebugPatch,
        codeHashDebug: '',
        warnings: s.warnings
      })
    })
    const compiledSize = contracts.length + scripts.length
    sourceFiles.slice(compiledSize).forEach((c) => {
      files.set(c.contractPath, {
        sourceCodeHash: c.sourceCodeHash,
        bytecodeDebugPatch: '',
        codeHashDebug: '',
        warnings: []
      })
    })
    return new ProjectArtifact(compilerOptions, files)
  }

  private constructor(
    contractsRootDir: string,
    artifactsRootDir: string,
    sourceFiles: SourceFile[],
    contracts: Compiled<Contract>[],
    scripts: Compiled<Script>[],
    errorOnWarnings: boolean,
    projectArtifact: ProjectArtifact
  ) {
    this.contractsRootDir = contractsRootDir
    this.artifactsRootDir = artifactsRootDir
    this.sourceFiles = sourceFiles
    this.contracts = contracts
    this.scripts = scripts
    this.projectArtifact = projectArtifact

    if (errorOnWarnings) {
      Project.checkCompilerWarnings(
        [...contracts.map((c) => c.warnings).flat(), ...scripts.map((s) => s.warnings).flat()],
        errorOnWarnings
      )
    }
  }

  private getContractPath(path: string): string {
    return path.startsWith(`./${this.contractsRootDir}`)
      ? path.slice(2)
      : path.startsWith(this.contractsRootDir)
      ? path
      : this.contractsRootDir + '/' + path
  }

  static checkCompilerWarnings(warnings: string[], errorOnWarnings: boolean): void {
    if (warnings.length !== 0) {
      const prefixPerWarning = '  - '
      const warningString = prefixPerWarning + warnings.join('\n' + prefixPerWarning)
      const output = `Compilation warnings:\n` + warningString + '\n'
      if (errorOnWarnings) {
        throw new Error(output)
      } else {
        console.log(output)
      }
    }
  }

  static contract(name: string): Contract {
    const contract = Project.currentProject.contracts.find((c) => c.artifact.name === name)
    if (typeof contract === 'undefined') {
      throw new Error(`Contract "${name}" does not exist`)
    }
    return contract.artifact
  }

  static script(name: string): Script {
    const script = Project.currentProject.scripts.find((c) => c.artifact.name === name)
    if (typeof script === 'undefined') {
      throw new Error(`Script "${name}" does not exist`)
    }
    return script.artifact
  }

  private async saveArtifactsToFile(): Promise<void> {
    const artifactsRootDir = this.artifactsRootDir
    const saveToFile = async function (compiled: Compiled<Artifact>): Promise<void> {
      const artifactDir = compiled.sourceFile.getArtifactPath(artifactsRootDir)
      const folder = artifactDir.slice(0, artifactDir.lastIndexOf('/'))
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }
      return fsPromises.writeFile(artifactDir, compiled.artifact.toString())
    }
    for (const contract of this.contracts) {
      saveToFile(contract)
    }
    for (const script of this.scripts) {
      await saveToFile(script)
    }
    await this.projectArtifact.saveToFile(this.artifactsRootDir)
  }

  contractByCodeHash(codeHash: string): Contract {
    const contract = this.contracts.find(
      (c) => c.artifact.codeHash === codeHash || c.artifact.codeHashDebug == codeHash
    )
    if (typeof contract === 'undefined') {
      throw new Error(`Unknown code with code hash: ${codeHash}`)
    }
    return contract.artifact
  }

  private static async compile(
    provider: NodeProvider,
    files: SourceFile[],
    contractsRootDir: string,
    artifactsRootDir: string,
    errorOnWarnings: boolean,
    compilerOptions: node.CompilerOptions
  ): Promise<Project> {
    const sourceStr = files.map((f) => f.sourceCode).join('\n')
    const result = await provider.contracts.postContractsCompileProject({
      code: sourceStr,
      compilerOptions: compilerOptions
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
    const projectArtifact = Project.buildProjectArtifact(files, contracts, scripts, compilerOptions)
    const project = new Project(
      contractsRootDir,
      artifactsRootDir,
      files,
      contracts,
      scripts,
      errorOnWarnings,
      projectArtifact
    )
    await project.saveArtifactsToFile()
    return project
  }

  private static async loadArtifacts(
    provider: NodeProvider,
    files: SourceFile[],
    projectArtifact: ProjectArtifact,
    contractsRootDir: string,
    artifactsRootDir: string,
    errorOnWarnings: boolean,
    compilerOptions: node.CompilerOptions
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
        const artifactDir = file.getArtifactPath(artifactsRootDir)
        if (file.type === SourceType.Contract) {
          const artifact = await Contract.fromArtifactFile(artifactDir, info.bytecodeDebugPatch, info.codeHashDebug)
          contracts.push(new Compiled(file, artifact, warnings))
        } else if (file.type === SourceType.Script) {
          const artifact = await Script.fromArtifactFile(artifactDir, info.bytecodeDebugPatch)
          scripts.push(new Compiled(file, artifact, warnings))
        }
      }

      return new Project(
        contractsRootDir,
        artifactsRootDir,
        files,
        contracts,
        scripts,
        errorOnWarnings,
        projectArtifact
      )
    } catch (error) {
      console.log(`Failed to load artifacts, error: ${error}, try to re-compile contracts...`)
      return Project.compile(provider, files, contractsRootDir, artifactsRootDir, errorOnWarnings, compilerOptions)
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
    return SourceFile.from(type, sourceStr, contractPath)
  }

  private static async loadSourceFiles(contractsRootDir: string): Promise<SourceFile[]> {
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
    await loadDir(contractsRootDir, sourceFiles)
    const contractAndScriptSize = sourceFiles.filter(
      (f) => f.type === SourceType.Contract || f.type === SourceType.Script
    ).length
    if (sourceFiles.length === 0 || contractAndScriptSize === 0) {
      throw new Error('Project have no source files')
    }
    return sourceFiles.sort((a, b) => a.type - b.type)
  }

  static readonly DEFAULT_CONTRACTS_DIR = 'contracts'
  static readonly DEFAULT_ARTIFACTS_DIR = 'artifacts'

  static async build(
    compilerOptionsPartial: Partial<CompilerOptions> = {},
    contractsRootDir = Project.DEFAULT_CONTRACTS_DIR,
    artifactsRootDir = Project.DEFAULT_ARTIFACTS_DIR
  ): Promise<void> {
    const provider = getCurrentNodeProvider()
    const sourceFiles = await Project.loadSourceFiles(contractsRootDir)
    const { errorOnWarnings, ...nodeCompilerOptions } = { ...DEFAULT_COMPILER_OPTIONS, ...compilerOptionsPartial }
    const projectArtifact = await ProjectArtifact.from(artifactsRootDir)
    if (typeof projectArtifact === 'undefined' || projectArtifact.needToReCompile(nodeCompilerOptions, sourceFiles)) {
      console.log(`Compiling contracts in folder "${contractsRootDir}"`)
      Project.currentProject = await Project.compile(
        provider,
        sourceFiles,
        contractsRootDir,
        artifactsRootDir,
        errorOnWarnings,
        nodeCompilerOptions
      )
    } else {
      console.log(`Contracts are compiled already. Loading them from folder "${artifactsRootDir}"`)
      Project.currentProject = await Project.loadArtifacts(
        provider,
        sourceFiles,
        projectArtifact,
        contractsRootDir,
        artifactsRootDir,
        errorOnWarnings,
        nodeCompilerOptions
      )
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
  readonly bytecodeDebugPatch: string
  readonly codeHash: string
  readonly fieldsSig: FieldsSig
  readonly eventsSig: EventSig[]

  readonly bytecodeDebug: string
  readonly codeHashDebug: string

  constructor(
    version: string,
    name: string,
    bytecode: string,
    bytecodeDebugPatch: string,
    codeHash: string,
    codeHashDebug: string,
    fieldsSig: FieldsSig,
    eventsSig: EventSig[],
    functions: FunctionSig[]
  ) {
    super(version, name, functions)
    this.bytecode = bytecode
    this.bytecodeDebugPatch = bytecodeDebugPatch
    this.codeHash = codeHash
    this.fieldsSig = fieldsSig
    this.eventsSig = eventsSig

    this.bytecodeDebug = ralph.buildDebugBytecode(this.bytecode, this.bytecodeDebugPatch)
    this.codeHashDebug = codeHashDebug
  }

  // TODO: safely parse json
  static fromJson(artifact: any, bytecodeDebugPatch = '', codeHashDebug = ''): Contract {
    if (
      artifact.version == null ||
      artifact.name == null ||
      artifact.bytecode == null ||
      artifact.codeHash == null ||
      artifact.fieldsSig == null ||
      artifact.eventsSig == null ||
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
      artifact.functions
    )
    return contract
  }

  static fromCompileResult(result: node.CompileContractResult): Contract {
    return new Contract(
      result.version,
      result.name,
      result.bytecode,
      result.bytecodeDebugPatch,
      result.codeHash,
      result.codeHashDebug,
      result.fields,
      result.events,
      result.functions
    )
  }

  // support both 'code.ral' and 'code.ral.json'
  static async fromArtifactFile(path: string, bytecodeDebugPatch: string, codeHashDebug: string): Promise<Contract> {
    const content = await fsPromises.readFile(path)
    const artifact = JSON.parse(content.toString())
    return Contract.fromJson(artifact, bytecodeDebugPatch, codeHashDebug)
  }

  async fetchState(address: string, group: number): Promise<ContractState> {
    const state = await web3.getCurrentNodeProvider().contracts.getContractsAddressState(address, {
      group: group
    })
    return this.fromApiContractState(state)
  }

  override toString(): string {
    const object = {
      version: this.version,
      name: this.name,
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

  // no need to be cryptographically strong random
  static randomAddress(): string {
    const bytes = new Uint8Array(33)
    crypto.getRandomValues(bytes)
    bytes[0] = 3
    return bs58.encode(bytes)
  }

  private _printDebugMessages(funcName: string, messages: DebugMessage[]) {
    if (messages.length != 0) {
      console.log(`Testing ${this.name}.${funcName}:`)
      messages.forEach((m) => console.log(`Debug - ${m.contractAddress} - ${m.message}`))
    }
  }

  private async _test(
    funcName: string,
    params: TestContractParams,
    expectPublic: boolean,
    accessType: string,
    printDebugMessages: boolean
  ): Promise<TestContractResult> {
    const apiParams: node.TestContract = this.toTestContract(funcName, params)
    const apiResult = await web3.getCurrentNodeProvider().contracts.postContractsTestContract(apiParams)

    const methodIndex =
      typeof params.testMethodIndex !== 'undefined' ? params.testMethodIndex : this.getMethodIndex(funcName)
    const isPublic = this.functions[`${methodIndex}`].isPublic
    if (printDebugMessages) {
      this._printDebugMessages(funcName, apiResult.debugMessages)
    }
    if (isPublic === expectPublic) {
      const result = await this.fromTestContractResult(methodIndex, apiResult)
      return result
    } else {
      throw new Error(`The test method ${funcName} is not ${accessType}`)
    }
  }

  async testPublicMethod(
    funcName: string,
    params: TestContractParams,
    printDebugMessages = true
  ): Promise<TestContractResult> {
    return this._test(funcName, params, true, 'public', printDebugMessages)
  }

  async testPrivateMethod(
    funcName: string,
    params: TestContractParams,
    printDebugMessages = true
  ): Promise<TestContractResult> {
    return this._test(funcName, params, false, 'private', printDebugMessages)
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
      bytecode: this.bytecodeDebug,
      initialFields: this.toApiFields(params.initialFields),
      initialAsset: typeof params.initialAsset !== 'undefined' ? toApiAsset(params.initialAsset) : undefined,
      methodIndex: this.getMethodIndex(funcName),
      args: this.toApiArgs(funcName, params.testArgs),
      existingContracts: this.toApiContractStates(params.existingContracts),
      inputAssets: toApiInputAssets(params.inputAssets)
    }
  }

  fromApiContractState(state: node.ContractState): ContractState {
    return {
      address: state.address,
      contractId: binToHex(contractIdFromAddress(state.address)),
      bytecode: state.bytecode,
      initialStateHash: state.initialStateHash,
      codeHash: state.codeHash,
      fields: fromApiFields(state.fields, this.fieldsSig),
      fieldsSig: this.fieldsSig,
      asset: fromApiAsset(state.asset)
    }
  }

  static fromApiContractState(state: node.ContractState): ContractState {
    const contract = Project.currentProject.contractByCodeHash(state.codeHash)
    return contract.fromApiContractState(state)
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

  static fromApiEvent(event: node.ContractEventByTxId, codeHash: string | undefined): ContractEventByTxId {
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

  fromTestContractResult(methodIndex: number, result: node.TestContractResult): TestContractResult {
    const addressToCodeHash = new Map<string, string>()
    addressToCodeHash.set(result.address, result.codeHash)
    result.contracts.forEach((contract) => addressToCodeHash.set(contract.address, contract.codeHash))
    return {
      contractId: binToHex(contractIdFromAddress(result.address)),
      contractAddress: result.address,
      returns: fromApiArray(result.returns, this.functions[`${methodIndex}`].returnTypes),
      gasUsed: result.gasUsed,
      contracts: result.contracts.map((contract) => Contract.fromApiContractState(contract)),
      txOutputs: result.txOutputs.map(fromApiOutput),
      events: result.events.map((event) => {
        const contractAddress = event.contractAddress
        const codeHash = addressToCodeHash.get(contractAddress)
        if (typeof codeHash !== 'undefined' || event.eventIndex < 0) {
          return Contract.fromApiEvent(event, codeHash)
        } else {
          throw Error(`Cannot find codeHash for the contract address: ${contractAddress}`)
        }
      }),
      debugMessages: result.debugMessages
    }
  }

  async txParamsForDeployment(
    signer: SignerProvider,
    params: Omit<BuildDeployContractTx, 'signerAddress'>
  ): Promise<SignDeployContractTxParams> {
    const bytecode = this.buildByteCodeToDeploy(params.initialFields ? params.initialFields : {})
    const signerParams: SignDeployContractTxParams = {
      signerAddress: (await signer.getSelectedAccount()).address,
      bytecode: bytecode,
      initialAttoAlphAmount: params.initialAttoAlphAmount,
      issueTokenAmount: params.issueTokenAmount,
      initialTokenAmounts: params.initialTokenAmounts,
      gasAmount: params.gasAmount,
      gasPrice: params.gasPrice
    }
    return signerParams
  }

  async deploy(
    signer: SignerProvider,
    params: Omit<BuildDeployContractTx, 'signerAddress'>
  ): Promise<SignDeployContractTxResult> {
    const signerParams = await this.txParamsForDeployment(signer, params)
    return signer.signAndSubmitDeployContractTx(signerParams)
  }

  buildByteCodeToDeploy(initialFields: Fields): string {
    return ralph.buildContractByteCode(this.bytecode, initialFields, this.fieldsSig)
  }
}

export class Script extends Artifact {
  readonly bytecodeTemplate: string
  readonly bytecodeDebugPatch: string
  readonly fieldsSig: FieldsSig

  constructor(
    version: string,
    name: string,
    bytecodeTemplate: string,
    bytecodeDebugPatch: string,
    fieldsSig: FieldsSig,
    functions: FunctionSig[]
  ) {
    super(version, name, functions)
    this.bytecodeTemplate = bytecodeTemplate
    this.bytecodeDebugPatch = bytecodeDebugPatch
    this.fieldsSig = fieldsSig
  }

  static fromCompileResult(result: node.CompileScriptResult): Script {
    return new Script(
      result.version,
      result.name,
      result.bytecodeTemplate,
      result.bytecodeDebugPatch,
      result.fields,
      result.functions
    )
  }

  // TODO: safely parse json
  static fromJson(artifact: any, bytecodeDebugPatch = ''): Script {
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
      artifact.functions
    )
  }

  static async fromArtifactFile(path: string, bytecodeDebugPatch: string): Promise<Script> {
    const content = await fsPromises.readFile(path)
    const artifact = JSON.parse(content.toString())
    return this.fromJson(artifact, bytecodeDebugPatch)
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

  async txParamsForExecution(
    signer: SignerProvider,
    params: Omit<BuildExecuteScriptTx, 'signerAddress'>
  ): Promise<SignExecuteScriptTxParams> {
    const signerParams: SignExecuteScriptTxParams = {
      signerAddress: (await signer.getSelectedAccount()).address,
      bytecode: this.buildByteCodeToDeploy(params.initialFields ? params.initialFields : {}),
      attoAlphAmount: params.attoAlphAmount,
      tokens: params.tokens,
      gasAmount: params.gasAmount,
      gasPrice: params.gasPrice
    }
    return signerParams
  }

  async execute(
    signer: SignerProvider,
    params: Omit<BuildExecuteScriptTx, 'signerAddress'>
  ): Promise<SignExecuteScriptTxResult> {
    const signerParams = await this.txParamsForExecution(signer, params)
    return await signer.signAndSubmitExecuteScriptTx(signerParams)
  }

  buildByteCodeToDeploy(initialFields: Fields): string {
    return ralph.buildScriptByteCode(this.bytecodeTemplate, initialFields, this.fieldsSig)
  }
}

function fromApiFields(vals: node.Val[], fieldsSig: node.FieldsSig): Fields {
  return fromApiVals(vals, fieldsSig.names, fieldsSig.types)
}

function fromApiEventFields(vals: node.Val[], eventSig: node.EventSig): Fields {
  return fromApiVals(vals, eventSig.fieldNames, eventSig.fieldTypes)
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

export type DebugMessage = node.DebugMessage

export interface TestContractResult {
  contractId: string
  contractAddress: string
  returns: Val[]
  gasUsed: number
  contracts: ContractState[]
  txOutputs: Output[]
  events: ContractEventByTxId[]
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

export interface DeployContractTransaction {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
  contractAddress: string
  contractId: string
}

type BuildTxParams<T> = Omit<T, 'bytecode'> & { initialFields?: Val[] }

export interface BuildDeployContractTx {
  signerAddress: string
  initialFields?: Fields
  initialAttoAlphAmount?: Number256
  initialTokenAmounts?: Token[]
  issueTokenAmount?: Number256
  gasAmount?: number
  gasPrice?: Number256
}
assertType<Eq<keyof BuildDeployContractTx, keyof BuildTxParams<SignDeployContractTxParams>>>()

export interface BuildExecuteScriptTx {
  signerAddress: string
  initialFields?: Fields
  attoAlphAmount?: Number256
  tokens?: Token[]
  gasAmount?: number
  gasPrice?: Number256
}
assertType<Eq<keyof BuildExecuteScriptTx, keyof BuildTxParams<SignExecuteScriptTxParams>>>()

export interface BuildScriptTxResult {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  txId: string
}
