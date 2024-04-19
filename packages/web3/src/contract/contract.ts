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
import fs from 'fs'
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
  fromApiPrimitiveVal
} from '../api'
import { CompileProjectResult } from '../api/api-alephium'
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
  contractIdFromAddress,
  Subscription,
  assertType,
  Eq,
  Optional,
  groupOfAddress,
  WebCrypto,
  hexToBinUnsafe,
  isDevnet,
  addressFromContractId,
  subContractId
} from '../utils'
import { getCurrentNodeProvider } from '../global'
import * as path from 'path'
import { EventSubscribeOptions, EventSubscription, subscribeToEvents } from './events'
import { ONE_ALPH, TOTAL_NUMBER_OF_GROUPS } from '../constants'
import * as blake from 'blakejs'
import { parseError } from '../utils/error'
import { isContractDebugMessageEnabled } from '../debug'
import {
  contract,
  compactUnsignedIntCodec,
  compactSignedIntCodec,
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
  byteStringCodec,
  StoreLocal,
  instrCodec,
  U256Const,
  Instr,
  ApproveToken,
  ApproveAlph,
  CallExternal,
  Dup,
  CallerAddress,
  ByteConst
} from '../codec'

const crypto = new WebCrypto()

export type FieldsSig = node.FieldsSig
export type MapsSig = node.MapsSig
export type EventSig = node.EventSig
export type FunctionSig = node.FunctionSig
export type Fields = NamedVals
export type Arguments = NamedVals
export type HexString = string
export type Constant = node.Constant
export type Enum = node.Enum

export const StdIdFieldName = '__stdInterfaceId'

enum SourceKind {
  Contract = 0,
  Script = 1,
  AbstractContract = 2,
  Interface = 3,
  Struct = 4
}

export type CompilerOptions = node.CompilerOptions & {
  errorOnWarnings: boolean
}

export const DEFAULT_NODE_COMPILER_OPTIONS: node.CompilerOptions = {
  ignoreUnusedConstantsWarnings: false,
  ignoreUnusedVariablesWarnings: false,
  ignoreUnusedFieldsWarnings: false,
  ignoreUnusedPrivateFunctionsWarnings: false,
  ignoreUpdateFieldsCheckWarnings: false,
  ignoreCheckExternalCallerWarnings: false
}

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = { errorOnWarnings: true, ...DEFAULT_NODE_COMPILER_OPTIONS }

class TypedMatcher<T extends SourceKind> {
  matcher: RegExp
  type: T

  constructor(pattern: string, type: T) {
    this.matcher = new RegExp(pattern, 'mg')
    this.type = type
  }
}

function removeParentsPrefix(parts: string[]): string {
  let index = 0
  for (let i = 0; i < parts.length; i++) {
    if (parts[`${i}`] === '..') {
      index += 1
    } else {
      break
    }
  }
  return path.join(...parts.slice(index))
}

class SourceInfo {
  type: SourceKind
  name: string
  contractRelativePath: string
  sourceCode: string
  sourceCodeHash: string
  isExternal: boolean

  getArtifactPath(artifactsRootDir: string): string {
    let fullPath: string
    if (this.isExternal) {
      const relativePath = removeParentsPrefix(this.contractRelativePath.split(path.sep))
      const externalPath = path.join('.external', relativePath)
      fullPath = path.join(artifactsRootDir, externalPath)
    } else {
      fullPath = path.join(artifactsRootDir, this.contractRelativePath)
    }
    return path.join(path.dirname(fullPath), `${this.name}.ral.json`)
  }

  constructor(
    type: SourceKind,
    name: string,
    sourceCode: string,
    sourceCodeHash: string,
    contractRelativePath: string,
    isExternal: boolean
  ) {
    this.type = type
    this.name = name
    this.sourceCode = sourceCode
    this.sourceCodeHash = sourceCodeHash
    this.contractRelativePath = contractRelativePath
    this.isExternal = isExternal
  }

  static async from(
    type: SourceKind,
    name: string,
    sourceCode: string,
    contractRelativePath: string,
    isExternal: boolean
  ): Promise<SourceInfo> {
    const sourceCodeHash = await crypto.subtle.digest('SHA-256', Buffer.from(sourceCode))
    const sourceCodeHashHex = Buffer.from(sourceCodeHash).toString('hex')
    return new SourceInfo(type, name, sourceCode, sourceCodeHashHex, contractRelativePath, isExternal)
  }
}

class Compiled<T extends Artifact> {
  sourceInfo: SourceInfo
  artifact: T
  warnings: string[]

  constructor(sourceInfo: SourceInfo, artifact: T, warnings: string[]) {
    this.sourceInfo = sourceInfo
    this.artifact = artifact
    this.warnings = warnings
  }
}

type CodeInfo = {
  sourceFile: string
  sourceCodeHash: string
  bytecodeDebugPatch: string
  codeHashDebug: string
  warnings: string[]
}

type SourceInfoIndexes = {
  sourceInfo: SourceInfo
  startIndex: number
  endIndex: number
}

function findSourceInfoAtLineNumber(sources: SourceInfo[], line: number): SourceInfoIndexes | undefined {
  let currentLine = 0
  const sourceInfosWithLine: SourceInfoIndexes[] = sources.map((source) => {
    const startIndex = currentLine + 1
    currentLine += source.sourceCode.split('\n').length
    const endIndex = currentLine
    return { sourceInfo: source, startIndex: startIndex, endIndex: endIndex }
  })

  const sourceInfo = sourceInfosWithLine.find((sourceInfoWithLine) => {
    return line >= sourceInfoWithLine.startIndex && line <= sourceInfoWithLine.endIndex
  })

  return sourceInfo
}

export class ProjectArtifact {
  static readonly artifactFileName = '.project.json'

  fullNodeVersion: string
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

  constructor(fullNodeVersion: string, compilerOptionsUsed: node.CompilerOptions, infos: Map<string, CodeInfo>) {
    ProjectArtifact.checkCompilerOptionsParameter(compilerOptionsUsed)
    this.fullNodeVersion = fullNodeVersion
    this.compilerOptionsUsed = compilerOptionsUsed
    this.infos = infos
  }

  static isCodeChanged(current: ProjectArtifact, previous: ProjectArtifact): boolean {
    if (current.infos.size !== previous.infos.size) {
      return true
    }
    for (const [name, codeInfo] of current.infos) {
      const prevCodeInfo = previous.infos.get(name)
      if (prevCodeInfo?.codeHashDebug !== codeInfo.codeHashDebug) {
        return true
      }
    }
    return false
  }

  async saveToFile(rootPath: string): Promise<void> {
    const filepath = path.join(rootPath, ProjectArtifact.artifactFileName)
    const artifact = {
      fullNodeVersion: this.fullNodeVersion,
      compilerOptionsUsed: this.compilerOptionsUsed,
      infos: Object.fromEntries(new Map([...this.infos].sort()))
    }
    const content = JSON.stringify(artifact, null, 2)
    return fsPromises.writeFile(filepath, content)
  }

  needToReCompile(compilerOptions: node.CompilerOptions, sourceInfos: SourceInfo[], fullNodeVersion: string): boolean {
    ProjectArtifact.checkCompilerOptionsParameter(compilerOptions)
    if (this.fullNodeVersion !== fullNodeVersion) {
      return true
    }

    const optionsMatched = Object.entries(compilerOptions).every(([key, inputOption]) => {
      const usedOption = this.compilerOptionsUsed[`${key}`]
      return usedOption === inputOption
    })
    if (!optionsMatched) {
      return true
    }

    if (sourceInfos.length !== this.infos.size) {
      return true
    }
    for (const sourceInfo of sourceInfos) {
      const info = this.infos.get(sourceInfo.name)
      if (typeof info === 'undefined' || info.sourceCodeHash !== sourceInfo.sourceCodeHash) {
        return true
      }
    }

    return false
  }

  static async from(rootPath: string): Promise<ProjectArtifact | undefined> {
    const filepath = path.join(rootPath, ProjectArtifact.artifactFileName)
    if (!fs.existsSync(filepath)) {
      return undefined
    }
    try {
      const content = await fsPromises.readFile(filepath)
      const json = JSON.parse(content.toString())
      const fullNodeVersion = json.fullNodeVersion as string
      const compilerOptionsUsed = json.compilerOptionsUsed as node.CompilerOptions
      const files = new Map(Object.entries<CodeInfo>(json.infos))
      return new ProjectArtifact(fullNodeVersion, compilerOptionsUsed, files)
    } catch (error) {
      console.error(`Failed to load project artifact, error: ${error}`)
      return undefined
    }
  }
}

function removeOldArtifacts(dir: string) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      removeOldArtifacts(filePath)
    } else if (filePath.endsWith('.ral.json') || filePath.endsWith('.ral')) {
      fs.unlinkSync(filePath)
    }
  })

  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir)
  }
}

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

export class Project {
  sourceInfos: SourceInfo[]
  contracts: Map<string, Compiled<Contract>>
  scripts: Map<string, Compiled<Script>>
  structs: Struct[]
  projectArtifact: ProjectArtifact

  readonly contractsRootDir: string
  readonly artifactsRootDir: string

  static currentProject: Project

  static readonly importRegex = new RegExp('^import "[^"./]+/[^"]*[a-z][a-z_0-9]*(.ral)?"', 'mg')
  static readonly abstractContractMatcher = new TypedMatcher<SourceKind>(
    '^Abstract Contract ([A-Z][a-zA-Z0-9]*)',
    SourceKind.AbstractContract
  )
  static readonly contractMatcher = new TypedMatcher('^Contract ([A-Z][a-zA-Z0-9]*)', SourceKind.Contract)
  static readonly interfaceMatcher = new TypedMatcher('^Interface ([A-Z][a-zA-Z0-9]*)', SourceKind.Interface)
  static readonly scriptMatcher = new TypedMatcher('^TxScript ([A-Z][a-zA-Z0-9]*)', SourceKind.Script)
  static readonly structMatcher = new TypedMatcher('struct ([A-Z][a-zA-Z0-9]*)', SourceKind.Struct)
  static readonly matchers = [
    Project.abstractContractMatcher,
    Project.contractMatcher,
    Project.interfaceMatcher,
    Project.scriptMatcher,
    Project.structMatcher
  ]

  static buildProjectArtifact(
    fullNodeVersion: string,
    sourceInfos: SourceInfo[],
    contracts: Map<string, Compiled<Contract>>,
    scripts: Map<string, Compiled<Script>>,
    compilerOptions: node.CompilerOptions
  ): ProjectArtifact {
    const files: Map<string, CodeInfo> = new Map()
    contracts.forEach((c) => {
      files.set(c.artifact.name, {
        sourceFile: c.sourceInfo.contractRelativePath,
        sourceCodeHash: c.sourceInfo.sourceCodeHash,
        bytecodeDebugPatch: c.artifact.bytecodeDebugPatch,
        codeHashDebug: c.artifact.codeHashDebug,
        warnings: c.warnings
      })
    })
    scripts.forEach((s) => {
      files.set(s.artifact.name, {
        sourceFile: s.sourceInfo.contractRelativePath,
        sourceCodeHash: s.sourceInfo.sourceCodeHash,
        bytecodeDebugPatch: s.artifact.bytecodeDebugPatch,
        codeHashDebug: '',
        warnings: s.warnings
      })
    })
    const compiledSize = contracts.size + scripts.size
    sourceInfos.slice(compiledSize).forEach((c) => {
      files.set(c.name, {
        sourceFile: c.contractRelativePath,
        sourceCodeHash: c.sourceCodeHash,
        bytecodeDebugPatch: '',
        codeHashDebug: '',
        warnings: []
      })
    })
    return new ProjectArtifact(fullNodeVersion, compilerOptions, files)
  }

  private constructor(
    contractsRootDir: string,
    artifactsRootDir: string,
    sourceInfos: SourceInfo[],
    contracts: Map<string, Compiled<Contract>>,
    scripts: Map<string, Compiled<Script>>,
    structs: Struct[],
    errorOnWarnings: boolean,
    projectArtifact: ProjectArtifact
  ) {
    this.contractsRootDir = contractsRootDir
    this.artifactsRootDir = artifactsRootDir
    this.sourceInfos = sourceInfos
    this.contracts = contracts
    this.scripts = scripts
    this.structs = structs
    this.projectArtifact = projectArtifact

    if (errorOnWarnings) {
      Project.checkCompilerWarnings(
        [
          ...[...contracts.entries()].map((c) => c[1].warnings).flat(),
          ...[...scripts.entries()].map((s) => s[1].warnings).flat()
        ],
        errorOnWarnings
      )
    }
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
    const contract = Project.currentProject.contracts.get(name)
    if (typeof contract === 'undefined') {
      throw new Error(`Contract "${name}" does not exist`)
    }
    return contract.artifact
  }

  static script(name: string): Script {
    const script = Project.currentProject.scripts.get(name)
    if (typeof script === 'undefined') {
      throw new Error(`Script "${name}" does not exist`)
    }
    return script.artifact
  }

  private static async loadStructs(artifactsRootDir: string): Promise<Struct[]> {
    const filePath = path.join(artifactsRootDir, 'structs.ral.json')
    if (!fs.existsSync(filePath)) return []
    const content = await fsPromises.readFile(filePath)
    const json = JSON.parse(content.toString())
    if (!Array.isArray(json)) {
      throw Error(`Invalid structs JSON: ${content}`)
    }
    return Array.from(json).map((item) => Struct.fromJson(item))
  }

  private async saveStructsToFile(): Promise<void> {
    if (this.structs.length === 0) return
    const structs = this.structs.map((s) => s.toJson())
    const filePath = path.join(this.artifactsRootDir, 'structs.ral.json')
    return fsPromises.writeFile(filePath, JSON.stringify(structs, null, 2))
  }

  private async saveArtifactsToFile(projectRootDir: string): Promise<void> {
    const artifactsRootDir = this.artifactsRootDir
    const saveToFile = async function (compiled: Compiled<Artifact>): Promise<void> {
      const artifactPath = compiled.sourceInfo.getArtifactPath(artifactsRootDir)
      const dirname = path.dirname(artifactPath)
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true })
      }
      return fsPromises.writeFile(artifactPath, compiled.artifact.toString())
    }
    this.contracts.forEach((contract) => saveToFile(contract))
    this.scripts.forEach((script) => saveToFile(script))
    this.saveStructsToFile()
    await this.projectArtifact.saveToFile(projectRootDir)
  }

  contractByCodeHash(codeHash: string): Contract {
    const contract = [...this.contracts.values()].find(
      (c) => c.artifact.codeHash === codeHash || c.artifact.codeHashDebug == codeHash
    )
    if (typeof contract === 'undefined') {
      throw new Error(`Unknown code with code hash: ${codeHash}`)
    }
    return contract.artifact
  }

  private static async getCompileResult(
    provider: NodeProvider,
    compilerOptions: node.CompilerOptions,
    sources: SourceInfo[]
  ): Promise<CompileProjectResult> {
    try {
      const sourceStr = sources.map((f) => f.sourceCode).join('\n')
      return await provider.contracts.postContractsCompileProject({
        code: sourceStr,
        compilerOptions: compilerOptions
      })
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }

      const parsed = parseError(error.message)
      if (!parsed) {
        throw error
      }

      const sourceInfo = findSourceInfoAtLineNumber(sources, parsed.lineStart)
      if (!sourceInfo) {
        throw error
      }

      const shiftIndex = parsed.lineStart - sourceInfo.startIndex + 1
      const newError = parsed.reformat(shiftIndex, sourceInfo.sourceInfo.contractRelativePath)
      throw new Error(newError)
    }
  }

  private static async compile(
    fullNodeVersion: string,
    provider: NodeProvider,
    sourceInfos: SourceInfo[],
    projectRootDir: string,
    contractsRootDir: string,
    artifactsRootDir: string,
    errorOnWarnings: boolean,
    compilerOptions: node.CompilerOptions
  ): Promise<Project> {
    const removeDuplicates = sourceInfos.reduce((acc: SourceInfo[], sourceInfo: SourceInfo) => {
      if (acc.find((info) => info.sourceCodeHash === sourceInfo.sourceCodeHash) === undefined) {
        acc.push(sourceInfo)
      }
      return acc
    }, [])

    const result = await Project.getCompileResult(provider, compilerOptions, removeDuplicates)
    const contracts = new Map<string, Compiled<Contract>>()
    const scripts = new Map<string, Compiled<Script>>()
    const structs = result.structs === undefined ? [] : result.structs.map((item) => Struct.fromStructSig(item))
    result.contracts.forEach((contractResult) => {
      const sourceInfo = sourceInfos.find(
        (sourceInfo) => sourceInfo.type === SourceKind.Contract && sourceInfo.name === contractResult.name
      )
      if (sourceInfo === undefined) {
        // this should never happen
        throw new Error(`SourceInfo does not exist for contract ${contractResult.name}`)
      }
      const contract = Contract.fromCompileResult(contractResult, structs)
      contracts.set(contract.name, new Compiled(sourceInfo, contract, contractResult.warnings))
    })
    result.scripts.forEach((scriptResult) => {
      const sourceInfo = sourceInfos.find(
        (sourceInfo) => sourceInfo.type === SourceKind.Script && sourceInfo.name === scriptResult.name
      )
      if (sourceInfo === undefined) {
        // this should never happen
        throw new Error(`SourceInfo does not exist for script ${scriptResult.name}`)
      }
      const script = Script.fromCompileResult(scriptResult, structs)
      scripts.set(script.name, new Compiled(sourceInfo, script, scriptResult.warnings))
    })
    const projectArtifact = Project.buildProjectArtifact(
      fullNodeVersion,
      sourceInfos,
      contracts,
      scripts,
      compilerOptions
    )
    const project = new Project(
      contractsRootDir,
      artifactsRootDir,
      sourceInfos,
      contracts,
      scripts,
      structs,
      errorOnWarnings,
      projectArtifact
    )
    await project.saveArtifactsToFile(projectRootDir)
    return project
  }

  private static async loadArtifacts(
    provider: NodeProvider,
    sourceInfos: SourceInfo[],
    projectArtifact: ProjectArtifact,
    projectRootDir: string,
    contractsRootDir: string,
    artifactsRootDir: string,
    errorOnWarnings: boolean,
    compilerOptions: node.CompilerOptions
  ): Promise<Project> {
    try {
      const contracts = new Map<string, Compiled<Contract>>()
      const scripts = new Map<string, Compiled<Script>>()
      const structs = await Project.loadStructs(artifactsRootDir)
      for (const sourceInfo of sourceInfos) {
        const info = projectArtifact.infos.get(sourceInfo.name)
        if (typeof info === 'undefined') {
          throw Error(`Unable to find project info for ${sourceInfo.name}, please rebuild the project`)
        }
        const warnings = info.warnings
        const artifactDir = sourceInfo.getArtifactPath(artifactsRootDir)
        if (sourceInfo.type === SourceKind.Contract) {
          const artifact = await Contract.fromArtifactFile(
            artifactDir,
            info.bytecodeDebugPatch,
            info.codeHashDebug,
            structs
          )
          contracts.set(artifact.name, new Compiled(sourceInfo, artifact, warnings))
        } else if (sourceInfo.type === SourceKind.Script) {
          const artifact = await Script.fromArtifactFile(artifactDir, info.bytecodeDebugPatch, structs)
          scripts.set(artifact.name, new Compiled(sourceInfo, artifact, warnings))
        }
      }

      return new Project(
        contractsRootDir,
        artifactsRootDir,
        sourceInfos,
        contracts,
        scripts,
        structs,
        errorOnWarnings,
        projectArtifact
      )
    } catch (error) {
      console.log(`Failed to load artifacts, error: ${error}, try to re-compile contracts...`)
      return Project.compile(
        projectArtifact.fullNodeVersion,
        provider,
        sourceInfos,
        projectRootDir,
        contractsRootDir,
        artifactsRootDir,
        errorOnWarnings,
        compilerOptions
      )
    }
  }

  private static getImportSourcePath(projectRootDir: string, importPath: string): string {
    const parts = importPath.split('/')
    if (parts.length > 1 && parts[0] === 'std') {
      const currentDir = path.dirname(__filename)
      return path.join(...[currentDir, '..', '..', '..', importPath])
    }
    let moduleDir = projectRootDir
    while (true) {
      const expectedPath = path.join(...[moduleDir, 'node_modules', importPath])
      if (fs.existsSync(expectedPath)) {
        return expectedPath
      }
      const oldModuleDir = moduleDir
      moduleDir = path.join(moduleDir, '..')
      if (oldModuleDir === moduleDir) {
        throw new Error(`Specified import file does not exist: ${importPath}`)
      }
    }
  }

  private static async handleImports(
    projectRootDir: string,
    contractRootDir: string,
    sourceStr: string,
    importsCache: string[]
  ): Promise<[string, SourceInfo[]]> {
    const localImportsCache: string[] = []
    const result = sourceStr.replace(Project.importRegex, (match) => {
      localImportsCache.push(match)
      return ''
    })
    const externalSourceInfos: SourceInfo[] = []
    for (const myImport of localImportsCache) {
      const originImportPath = myImport.slice(8, -1)
      const importPath = originImportPath.endsWith('.ral') ? originImportPath : originImportPath + '.ral'
      if (!importsCache.includes(importPath)) {
        importsCache.push(importPath)
        const sourcePath = Project.getImportSourcePath(projectRootDir, importPath)
        const sourceInfos = await Project.loadSourceFile(
          projectRootDir,
          contractRootDir,
          sourcePath,
          importsCache,
          true
        )
        externalSourceInfos.push(...sourceInfos)
      }
    }
    return [result, externalSourceInfos]
  }

  private static async loadSourceFile(
    projectRootDir: string,
    contractsRootDir: string,
    sourcePath: string,
    importsCache: string[],
    isExternal: boolean
  ): Promise<SourceInfo[]> {
    const contractRelativePath = path.relative(contractsRootDir, sourcePath)
    if (!sourcePath.endsWith('.ral')) {
      throw new Error(`Invalid filename: ${sourcePath}, smart contract file name should end with ".ral"`)
    }

    const sourceBuffer = await fsPromises.readFile(sourcePath)
    const [sourceStr, externalSourceInfos] = await Project.handleImports(
      projectRootDir,
      contractsRootDir,
      sourceBuffer.toString(),
      importsCache
    )
    if (sourceStr.match(new RegExp('^import "', 'mg')) !== null) {
      throw new Error(`Invalid import statements, source: ${sourcePath}`)
    }
    const sourceInfos = externalSourceInfos
    for (const matcher of this.matchers) {
      const results = sourceStr.matchAll(matcher.matcher)
      for (const result of results) {
        const sourceInfo = await SourceInfo.from(matcher.type, result[1], sourceStr, contractRelativePath, isExternal)
        sourceInfos.push(sourceInfo)
      }
    }
    return sourceInfos
  }

  private static async loadSourceFiles(projectRootDir: string, contractsRootDir: string): Promise<SourceInfo[]> {
    const importsCache: string[] = []
    const sourceInfos: SourceInfo[] = []
    const loadDir = async function (dirPath: string): Promise<void> {
      const dirents = await fsPromises.readdir(dirPath, { withFileTypes: true })
      for (const dirent of dirents) {
        if (dirent.isFile()) {
          const sourcePath = path.join(dirPath, dirent.name)
          const infos = await Project.loadSourceFile(projectRootDir, contractsRootDir, sourcePath, importsCache, false)
          sourceInfos.push(...infos)
        } else {
          const newPath = path.join(dirPath, dirent.name)
          await loadDir(newPath)
        }
      }
    }
    await loadDir(contractsRootDir)
    const contractAndScriptSize = sourceInfos.filter(
      (f) => f.type === SourceKind.Contract || f.type === SourceKind.Script
    ).length
    if (sourceInfos.length === 0 || contractAndScriptSize === 0) {
      throw new Error('Project have no source files')
    }
    return sourceInfos.sort((a, b) => a.type - b.type)
  }

  static readonly DEFAULT_CONTRACTS_DIR = 'contracts'
  static readonly DEFAULT_ARTIFACTS_DIR = 'artifacts'

  static async build(
    compilerOptionsPartial: Partial<CompilerOptions> = {},
    projectRootDir = '.',
    contractsRootDir = Project.DEFAULT_CONTRACTS_DIR,
    artifactsRootDir = Project.DEFAULT_ARTIFACTS_DIR,
    defaultFullNodeVersion: string | undefined = undefined
  ): Promise<void> {
    const provider = getCurrentNodeProvider()
    const fullNodeVersion = defaultFullNodeVersion ?? (await provider.infos.getInfosVersion()).version
    const sourceFiles = await Project.loadSourceFiles(projectRootDir, contractsRootDir)
    const { errorOnWarnings, ...nodeCompilerOptions } = { ...DEFAULT_COMPILER_OPTIONS, ...compilerOptionsPartial }
    const projectArtifact = await ProjectArtifact.from(projectRootDir)
    if (
      projectArtifact === undefined ||
      projectArtifact.needToReCompile(nodeCompilerOptions, sourceFiles, fullNodeVersion)
    ) {
      if (fs.existsSync(artifactsRootDir)) {
        removeOldArtifacts(artifactsRootDir)
      }
      console.log(`Compiling contracts in folder "${contractsRootDir}"`)
      Project.currentProject = await Project.compile(
        fullNodeVersion,
        provider,
        sourceFiles,
        projectRootDir,
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
        projectRootDir,
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

  abstract buildByteCodeToDeploy(initialFields: Fields, isDevnet: boolean): string

  publicFunctions(): string[] {
    return this.functions.filter((func) => func.isPublic).map((func) => func.name)
  }

  usingPreapprovedAssetsFunctions(): string[] {
    return this.functions.filter((func) => func.usePreapprovedAssets).map((func) => func.name)
  }

  usingAssetsInContractFunctions(): string[] {
    return this.functions.filter((func) => func.useAssetsInContract).map((func) => func.name)
  }

  async isDevnet(signer: SignerProvider): Promise<boolean> {
    if (!signer.nodeProvider) {
      return false
    }
    const chainParams = await signer.nodeProvider.infos.getInfosChainParams()
    return isDevnet(chainParams.networkId)
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
      result.functions,
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
      messages.forEach((m) => console.log(`> Contract @ ${m.contractAddress} - ${m.message}`))
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
    return {
      group: params.group,
      blockHash: params.blockHash,
      blockTimeStamp: params.blockTimeStamp,
      txId: params.txId,
      address: params.address,
      callerAddress: params.callerAddress,
      bytecode: this.bytecodeDebug,
      initialImmFields: immFields,
      initialMutFields: mutFields,
      initialAsset: typeof params.initialAsset !== 'undefined' ? toApiAsset(params.initialAsset) : undefined,
      methodIndex: this.getMethodIndex(funcName),
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
    getContractByCodeHash?: (codeHash: string) => Contract
  ): ContractState {
    const contract = getContractByCodeHash
      ? getContractByCodeHash(state.codeHash)
      : Project.currentProject.contractByCodeHash(state.codeHash)
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

  static fromApiEvent(
    event: node.ContractEventByTxId,
    codeHash: string | undefined,
    txId: string,
    getContractByCodeHash?: (codeHash: string) => Contract
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
      const contract = getContractByCodeHash
        ? getContractByCodeHash(codeHash!)
        : Project.currentProject.contractByCodeHash(codeHash!)
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
    txId: string
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
      contracts: result.contracts.map((contract) => Contract.fromApiContractState(contract)),
      txOutputs: result.txOutputs.map(fromApiOutput),
      events: Contract.fromApiEvents(result.events, addressToCodeHash, txId),
      debugMessages: result.debugMessages
    }
  }

  async txParamsForDeployment<P extends Fields>(
    signer: SignerProvider,
    params: DeployContractParams<P>
  ): Promise<SignDeployContractTxParams> {
    const isDevnet = await this.isDevnet(signer)
    const initialFields: Fields = params.initialFields ?? {}
    const bytecode = this.buildByteCodeToDeploy(addStdIdToFields(this, initialFields), isDevnet)
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

  buildByteCodeToDeploy(initialFields: Fields, isDevnet: boolean): string {
    try {
      return ralph.buildContractByteCode(
        isDevnet ? this.bytecodeDebug : this.bytecode,
        initialFields,
        this.fieldsSig,
        this.structs
      )
    } catch (error) {
      throw new Error(`Failed to build bytecode for contract ${this.name}, error: ${error}`)
    }
  }

  static fromApiEvents(
    events: node.ContractEventByTxId[],
    addressToCodeHash: Map<string, string>,
    txId: string,
    getContractByCodeHash?: (codeHash: string) => Contract
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
      args: args
    }
  }

  fromApiCallContractResult(
    result: node.CallContractResult,
    txId: string,
    methodIndex: number,
    getContractByCodeHash?: (codeHash: string) => Contract
  ): CallContractResult<unknown> {
    const returnTypes = this.functions[`${methodIndex}`].returnTypes
    const callResult = tryGetCallResult(result)
    const rawReturn = fromApiArray(callResult.returns, returnTypes, this.structs)
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
      result.functions,
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
      throw new Error(`Failed to build bytecode for script ${this.name}, error: ${error}`)
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
  existingContracts?: ContractState[] // default no existing contracts
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
  contracts: ContractState[]
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
}
assertType<
  Eq<
    Omit<DeployContractParams<undefined>, 'initialFields'>,
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

  // This is used for testing contract functions
  stateForTest(initFields: F, asset?: Asset, address?: string): ContractState<F> {
    const newAsset = {
      alphAmount: asset?.alphAmount ?? ONE_ALPH,
      tokens: asset?.tokens
    }
    return this.contract.toState(addStdIdToFields(this.contract, initFields), newAsset, address)
  }
}

export class ExecutableScript<P extends Fields = Fields> {
  readonly script: Script

  constructor(script: Script) {
    this.script = script
  }

  async execute(signer: SignerProvider, params: ExecuteScriptParams<P>): Promise<ExecuteScriptResult> {
    const signerParams = await this.script.txParamsForExecution(signer, params)
    return await signer.signAndSubmitExecuteScriptTx(signerParams)
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

export interface CallContractParams<T extends Arguments = Arguments> {
  args: T
  worldStateBlockHash?: string
  txId?: string
  existingContracts?: string[]
  inputAssets?: node.TestInputAsset[]
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
  const messageCallback = (event: node.ContractEvent): Promise<void> => {
    if (event.eventIndex !== eventIndex) {
      return Promise.resolve()
    }
    return options.messageCallback(decodeFunc(event))
  }

  const errorCallback = (err: any, subscription: Subscription<node.ContractEvent>): Promise<void> => {
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
  const encodedKey = ralph.primitiveToByteVec(key, keyType)
  const path = binToHex(prefix) + binToHex(encodedKey)
  return subContractId(parentContractId, path, group)
}

function genCodeForType(type: string, structs: Struct[]): { bytecode: string; codeHash: string } {
  const { immFields, mutFields } = ralph.calcFieldSize(type, true, structs)
  const loadImmFieldByIndex: Method = {
    isPublic: true,
    assetModifier: 0,
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
    assetModifier: 2,
    argsLength: 1,
    localsLength: 1,
    returnLength: 0,
    instrs: [CallerContractId, LoadImmField(parentContractIdIndex), ByteVecEq, Assert, LoadLocal(0), DestroySelf]
  }
  const c = {
    fieldLength: immFields + mutFields + 1, // parentContractId
    methods: [loadImmFieldByIndex, loadMutFieldByIndex, storeMutFieldByIndex, destroy]
  }
  const bytecode = contract.contractCodec.encode(contract.toHalfDecoded(c))
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

export async function testMethod<
  I extends ContractInstance,
  F extends Fields,
  A extends Arguments,
  R,
  M extends Record<string, Map<Val, Val>> = Record<string, Map<Val, Val>>
>(
  factory: ContractFactory<I, F>,
  methodName: string,
  params: Optional<TestContractParams<F, A, M>, 'testArgs' | 'initialFields'>
): Promise<TestContractResult<R, M>> {
  const txId = params?.txId ?? randomTxId()
  const contract = factory.contract
  const address = params.address ?? addressFromContractId(binToHex(crypto.getRandomValues(new Uint8Array(32))))
  const contractId = binToHex(contractIdFromAddress(address))
  const group = params.group ?? 0
  const initialMaps = params.initialMaps ?? {}
  const contractStates = mapsToExistingContracts(contract, contractId, group, initialMaps)
  const apiParams = contract.toApiTestContractParams(methodName, {
    ...params,
    address,
    txId: txId,
    initialFields: addStdIdToFields(contract, params.initialFields ?? {}),
    testArgs: params.testArgs === undefined ? {} : params.testArgs,
    existingContracts: (params.existingContracts ?? []).concat(contractStates)
  })
  const apiResult = await getCurrentNodeProvider().contracts.postContractsTestContract(apiParams)
  const maps = existingContractsToMaps(contract, address, group, apiResult, initialMaps)
  const testResult = contract.fromApiTestContractResult(methodName, apiResult, txId)
  contract.printDebugMessages(methodName, testResult.debugMessages)
  return {
    ...testResult,
    maps
  } as TestContractResult<R, M>
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
  const messageCallback = (event: node.ContractEvent): Promise<void> => {
    return options.messageCallback({
      ...decodeEvent(contract, instance, event, event.eventIndex),
      contractAddress: instance.address
    })
  }
  const errorCallback = (err: any, subscription: Subscription<node.ContractEvent>): Promise<void> => {
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
  getContractByCodeHash?: (codeHash: string) => Contract
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

  const bytecodeTemplate = getBytecodeTemplate(
    methodIndex,
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

  return await signer.signAndSubmitExecuteScriptTx(signerParams)
}

function getBytecodeTemplate(
  methodIndex: number,
  functionSig: FunctionSig,
  structs: Struct[],
  attoAlphAmount?: Number256,
  tokens?: Token[]
): string {
  // For the default TxScript main function
  const numberOfMethods = '01'
  const isPublic = '01'
  const modifier = functionSig.usePreapprovedAssets ? '03' : '00'
  const argsLength = '00'
  const returnsLength = '00'

  const [templateVarStoreLocalInstrs, templateVarsLength] = getTemplateVarStoreLocalInstrs(functionSig, structs)

  const approveAlphInstrs: string[] = getApproveAlphInstrs(
    functionSig.usePreapprovedAssets ? attoAlphAmount : undefined
  )
  const approveTokensInstrs: string[] = getApproveTokensInstrs(functionSig.usePreapprovedAssets ? tokens : undefined)
  const callerInstrs: string[] = getCallAddressInstrs(approveAlphInstrs.length / 2 + approveTokensInstrs.length / 3)

  // First template var is the contract
  const functionArgsNum = encodeU256Const(BigInt(templateVarsLength - 1))
  const localsLength = compactSignedIntCodec.encodeI32(templateVarStoreLocalInstrs.length / 2).toString('hex')

  const templateVarLoadLocalInstrs = getTemplateVarLoadLocalInstrs(functionSig, structs)

  const functionReturnTypesLength: number = functionSig.returnTypes.reduce(
    (acc, returnType) => acc + ralph.typeLength(returnType, structs),
    0
  )
  const functionReturnPopInstrs = encodeInstr(Pop).repeat(functionReturnTypesLength)
  const functionReturnNum = encodeU256Const(BigInt(functionReturnTypesLength))

  const contractTemplateVar = '{0}' // always the 1st argument
  const externalCallInstr = encodeInstr(CallExternal(methodIndex))
  const numberOfInstrs = compactSignedIntCodec
    .encodeI32(
      callerInstrs.length +
        approveAlphInstrs.length +
        approveTokensInstrs.length +
        templateVarStoreLocalInstrs.length +
        templateVarLoadLocalInstrs.length +
        functionReturnTypesLength +
        4 // functionArgsNum, functionReturnNum, contractTemplate, externalCallInstr
    )
    .toString('hex')

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
      approveTokensInstrs.push('14' + byteStringCodec.encodeBuffer(Buffer.from(token.id, 'hex')).toString('hex'))
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

function encodeU256Const(value: bigint): string {
  if (value < 0) {
    throw new Error(`value ${value} must be non-negative`)
  }

  if (value < 6) {
    return (BigInt(0x0c) + value).toString(16).padStart(2, '0')
  } else {
    return encodeInstr(U256Const(compactUnsignedIntCodec.fromU256(BigInt(value))))
  }
}

function encodeInstr(instr: Instr): string {
  return instrCodec.encode(instr).toString('hex')
}

function toFieldsSig(contractName: string, functionSig: FunctionSig): FieldsSig {
  return {
    names: ['__contract__'].concat(functionSig.paramNames),
    types: [contractName].concat(functionSig.paramTypes),
    isMutable: [false].concat(functionSig.paramIsMutable)
  }
}

export async function multicallMethods<I extends ContractInstance, F extends Fields>(
  contract: ContractFactory<I, F>,
  instance: ContractInstance,
  calls: Record<string, Optional<CallContractParams<any>, 'args'>>,
  getContractByCodeHash?: (codeHash: string) => Contract
): Promise<Record<string, CallContractResult<any>>> {
  const callEntries = Object.entries(calls)
  const callsParams = callEntries.map((entry) => {
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
  const result = await getCurrentNodeProvider().contracts.postContractsMulticallContract({ calls: callsParams })
  const callsResult: Record<string, CallContractResult<any>> = {}
  callsParams.forEach((call, index) => {
    const methodIndex = call.methodIndex
    const callResult = result.results[`${methodIndex}`]
    const methodName = callEntries[`${index}`][`0`]
    callsResult[`${methodName}`] = contract.contract.fromApiCallContractResult(
      callResult,
      call.txId!,
      methodIndex,
      getContractByCodeHash
    ) as CallContractResult<any>
  })
  return callsResult
}

export async function getContractEventsCurrentCount(contractAddress: Address): Promise<number> {
  return getCurrentNodeProvider()
    .events.getEventsContractContractaddressCurrentCount(contractAddress)
    .catch((error) => {
      if (error instanceof Error && error.message.includes(`${contractAddress} not found`)) {
        return 0
      }
      throw error
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

export function tryGetCallResult(result: node.CallContractResult): node.CallContractSucceeded {
  if (result.type === 'CallContractFailed') {
    throw new Error(`Failed to call contract, error: ${(result as node.CallContractFailed).error}`)
  }
  return result as node.CallContractSucceeded
}
