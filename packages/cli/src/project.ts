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

import {
  Artifact,
  Contract,
  DEFAULT_COMPILER_OPTIONS,
  DEFAULT_NODE_COMPILER_OPTIONS,
  NodeProvider,
  Script,
  Struct,
  node,
  web3,
  WebCrypto,
  CompilerOptions
} from '@alephium/web3'
import * as path from 'path'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { parseError } from './error'

const crypto = new WebCrypto()

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

enum SourceKind {
  Contract = 0,
  Script = 1,
  AbstractContract = 2,
  Interface = 3,
  Struct = 4
}

export class SourceInfo {
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

export type CodeInfo = {
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

  getChangedSources(sourceInfos: SourceInfo[]): string[] {
    const result: string[] = []
    // get all changed and new sources
    sourceInfos.forEach((sourceInfo) => {
      const info = this.infos.get(sourceInfo.name)
      if (info === undefined || info.sourceCodeHash !== sourceInfo.sourceCodeHash) {
        result.push(sourceInfo.name)
      }
    })
    // get all removed sources
    this.infos.forEach((_, name) => {
      if (sourceInfos.find((s) => s.name === name) === undefined) {
        result.push(name)
      }
    })
    return result
  }

  needToReCompile(compilerOptions: node.CompilerOptions, fullNodeVersion: string): boolean {
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

function removeOldArtifacts(dir: string, sourceFiles: SourceInfo[]) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      removeOldArtifacts(filePath, sourceFiles)
    } else if (filePath.endsWith('.ral.json') || filePath.endsWith('.ral')) {
      const filename = path.basename(filePath)
      const artifactName = filename.slice(0, filename.indexOf('.'))
      const sourceFile = sourceFiles.find(
        (s) => s.name === artifactName && (s.type === SourceKind.Contract || s.type === SourceKind.Script)
      )
      if (sourceFile === undefined) {
        fs.unlinkSync(filePath)
      }
    }
  })

  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir)
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
    projectArtifact: ProjectArtifact
  ) {
    this.contractsRootDir = contractsRootDir
    this.artifactsRootDir = artifactsRootDir
    this.sourceInfos = sourceInfos
    this.contracts = contracts
    this.scripts = scripts
    this.structs = structs
    this.projectArtifact = projectArtifact
  }

  static checkCompilerWarnings(
    contracts: Map<string, Compiled<Contract>>,
    scripts: Map<string, Compiled<Script>>,
    changedSources: string[],
    forceRecompile: boolean,
    errorOnWarnings: boolean
  ): void {
    const warnings: string[] = []
    contracts.forEach((contract) => {
      if (Project.needToUpdate(forceRecompile, changedSources, contract.sourceInfo.name)) {
        warnings.push(...contract.warnings)
      }
    })
    scripts.forEach((script) => {
      if (Project.needToUpdate(forceRecompile, changedSources, script.sourceInfo.name)) {
        warnings.push(...script.warnings)
      }
    })
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

  contract(name: string): Contract {
    const contract = this.contracts.get(name)
    if (typeof contract === 'undefined') {
      throw new Error(`Contract "${name}" does not exist`)
    }
    return contract.artifact
  }

  script(name: string): Script {
    const script = this.scripts.get(name)
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

  private static needToUpdate(forceRecompile: boolean, changedSources: string[], name: string): boolean {
    return forceRecompile || changedSources.includes(name)
  }

  private async checkMethodIndex(newArtifact: Compiled<Contract>) {
    const artifactPath = newArtifact.sourceInfo.getArtifactPath(this.artifactsRootDir)
    let oldArtifact: Contract
    try {
      oldArtifact = await Contract.fromArtifactFile(artifactPath, '', '')
    } catch (error) {
      throw new Error(`Failed to load contract artifact, error: ${error}, contract: ${newArtifact.sourceInfo.name}`)
    }
    newArtifact.artifact.functions.forEach((newFuncSig, index) => {
      const oldFuncSig = oldArtifact.functions[`${index}`]
      if (oldFuncSig.name !== newFuncSig.name) {
        throw new Error(
          `The newly compiled contract ${newArtifact.artifact.name} has different method indexes compared to the existing deployment on mainnet/testnet`
        )
      }
    })
  }

  private async saveArtifactsToFile(
    projectRootDir: string,
    forceRecompile: boolean,
    changedSources: string[]
  ): Promise<void> {
    const artifactsRootDir = this.artifactsRootDir
    const saveToFile = async function (compiled: Compiled<Artifact>): Promise<void> {
      const artifactPath = compiled.sourceInfo.getArtifactPath(artifactsRootDir)
      const dirname = path.dirname(artifactPath)
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true })
      }
      return fsPromises.writeFile(artifactPath, compiled.artifact.toString())
    }
    for (const [_, contract] of this.contracts) {
      if (Project.needToUpdate(forceRecompile, changedSources, contract.sourceInfo.name)) {
        await saveToFile(contract)
      } else {
        await this.checkMethodIndex(contract)
      }
    }
    for (const [_, script] of this.scripts) {
      if (Project.needToUpdate(forceRecompile, changedSources, script.sourceInfo.name)) {
        await saveToFile(script)
      }
    }
    await this.saveStructsToFile()
    await this.saveProjectArtifact(projectRootDir, forceRecompile, changedSources)
  }

  private async saveProjectArtifact(projectRootDir: string, forceRecompile: boolean, changedSources: string[]) {
    if (!forceRecompile) {
      // we should not update the `codeHashDebug` if the `forceRecompile` is disable
      const prevProjectArtifact = await ProjectArtifact.from(projectRootDir)
      if (prevProjectArtifact !== undefined) {
        for (const [name, info] of this.projectArtifact.infos) {
          if (!changedSources.includes(name)) {
            const prevInfo = prevProjectArtifact.infos.get(name)
            info.bytecodeDebugPatch = prevInfo?.bytecodeDebugPatch ?? info.bytecodeDebugPatch
            info.codeHashDebug = prevInfo?.codeHashDebug ?? info.codeHashDebug
          }
        }
      }
    }
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
  ): Promise<node.CompileProjectResult> {
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

  private static async compile_(
    fullNodeVersion: string,
    provider: NodeProvider,
    sourceInfos: SourceInfo[],
    projectRootDir: string,
    contractsRootDir: string,
    artifactsRootDir: string,
    errorOnWarnings: boolean,
    compilerOptions: node.CompilerOptions,
    changedSources: string[],
    forceRecompile: boolean
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
    Project.checkCompilerWarnings(contracts, scripts, changedSources, forceRecompile, errorOnWarnings)
    const project = new Project(
      contractsRootDir,
      artifactsRootDir,
      sourceInfos,
      contracts,
      scripts,
      structs,
      projectArtifact
    )
    await project.saveArtifactsToFile(projectRootDir, forceRecompile, changedSources)
    return project
  }

  private static async loadArtifacts(
    provider: NodeProvider,
    sourceInfos: SourceInfo[],
    projectRootDir: string,
    contractsRootDir: string,
    artifactsRootDir: string,
    errorOnWarnings: boolean,
    compilerOptions: node.CompilerOptions,
    changedSources: string[],
    forceRecompile: boolean
  ): Promise<Project> {
    const projectArtifact = await ProjectArtifact.from(projectRootDir)
    if (projectArtifact === undefined) {
      throw Error('Failed to load project artifact')
    }
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

      Project.checkCompilerWarnings(contracts, scripts, changedSources, forceRecompile, errorOnWarnings)
      return new Project(contractsRootDir, artifactsRootDir, sourceInfos, contracts, scripts, structs, projectArtifact)
    } catch (error) {
      console.log(`Failed to load artifacts, error: ${error}, try to re-compile contracts...`)
      return Project.compile_(
        projectArtifact.fullNodeVersion,
        provider,
        sourceInfos,
        projectRootDir,
        contractsRootDir,
        artifactsRootDir,
        errorOnWarnings,
        compilerOptions,
        changedSources,
        forceRecompile
      )
    }
  }

  private static getImportSourcePath(projectRootDir: string, importPath: string): string {
    const parts = importPath.split('/')
    if (parts.length > 1 && parts[0] === 'std') {
      const currentDir = path.dirname(__filename)
      return path.join(...[currentDir, '..', '..', 'web3', importPath])
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

  static async compile(
    compilerOptionsPartial: Partial<CompilerOptions> = {},
    projectRootDir = '.',
    contractsRootDir = Project.DEFAULT_CONTRACTS_DIR,
    artifactsRootDir = Project.DEFAULT_ARTIFACTS_DIR,
    defaultFullNodeVersion: string | undefined = undefined,
    forceRecompile = false
  ): Promise<Project> {
    const provider = web3.getCurrentNodeProvider()
    const fullNodeVersion = defaultFullNodeVersion ?? (await provider.infos.getInfosVersion()).version
    const sourceFiles = await Project.loadSourceFiles(projectRootDir, contractsRootDir)
    const { errorOnWarnings, ...nodeCompilerOptions } = { ...DEFAULT_COMPILER_OPTIONS, ...compilerOptionsPartial }
    const projectArtifact = await ProjectArtifact.from(projectRootDir)
    const changedSources = projectArtifact?.getChangedSources(sourceFiles) ?? sourceFiles.map((s) => s.name)
    if (
      projectArtifact === undefined ||
      projectArtifact.needToReCompile(nodeCompilerOptions, fullNodeVersion) ||
      changedSources.length > 0
    ) {
      if (fs.existsSync(artifactsRootDir)) {
        removeOldArtifacts(artifactsRootDir, sourceFiles)
      }
      console.log(`Compiling contracts in folder "${contractsRootDir}"`)
      await Project.compile_(
        fullNodeVersion,
        provider,
        sourceFiles,
        projectRootDir,
        contractsRootDir,
        artifactsRootDir,
        errorOnWarnings,
        nodeCompilerOptions,
        changedSources,
        forceRecompile
      )
    }
    // we need to reload those contracts that did not regenerate bytecode
    return await Project.loadArtifacts(
      provider,
      sourceFiles,
      projectRootDir,
      contractsRootDir,
      artifactsRootDir,
      errorOnWarnings,
      nodeCompilerOptions,
      changedSources,
      forceRecompile
    )
  }
}
