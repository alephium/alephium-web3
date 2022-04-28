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
import bs58 from './bs58'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { CliqueClient } from './clique'
import * as api from '../api/api-alephium'
import { SingleAddressSigner } from './signer'
import * as ralph from './ralph'
import { binToHex, convertHttpResponse, contractIdFromAddress } from './utils'

export abstract class Common {
  readonly sourceCodeSha256: string
  readonly functions: api.FunctionSig[]

  static readonly importRegex = new RegExp('^import "[a-z][a-z_0-9]*.ral"', 'mg')
  static readonly contractRegex = new RegExp('^TxContract [A-Z][a-zA-Z0-9]*', 'mg')
  static readonly interfaceRegex = new RegExp('^Interface [A-Z][a-zA-Z0-9]* \\{', 'mg')
  static readonly scriptRegex = new RegExp('^TxScript [A-Z][a-zA-Z0-9]*', 'mg')

  private static _artifactCache: Map<string, Contract | Script> = new Map<string, Contract | Script>()
  static artifactCacheCapacity = 20
  protected static _getArtifactFromCache(artifactId: string): Contract | Script | undefined {
    return this._artifactCache.get(artifactId)
  }
  protected static _putArtifactToCache(artifactId: string, contract: Contract): void {
    if (!this._artifactCache.has(artifactId)) {
      if (this._artifactCache.size >= this.artifactCacheCapacity) {
        const keyToDelete = this._artifactCache.keys().next().value
        this._artifactCache.delete(keyToDelete)
      }
      this._artifactCache.set(artifactId, contract)
    }
  }

  constructor(sourceCodeSha256: string, functions: api.FunctionSig[]) {
    this.sourceCodeSha256 = sourceCodeSha256
    this.functions = functions
  }

  protected static _contractPath(fileName: string): string {
    if (fileName.endsWith('.json')) {
      return `./contracts/${fileName.slice(0, -5)}`
    } else {
      return `./contracts/${fileName}`
    }
  }

  protected static _artifactPath(fileName: string): string {
    if (fileName.endsWith('.json')) {
      return `./artifacts/${fileName}`
    } else {
      return `./artifacts/${fileName}.json`
    }
  }

  protected static _artifactsFolder(): string {
    return './artifacts/'
  }

  protected static async _handleImports(contractStr: string, importsCache: string[]): Promise<string> {
    const localImportsCache: string[] = []
    let result = contractStr.replace(Common.importRegex, (match) => {
      localImportsCache.push(match)
      return ''
    })
    for (const myImport of localImportsCache) {
      const fileName = myImport.slice(8, -1)
      if (!importsCache.includes(fileName)) {
        importsCache.push(fileName)
        const importContractStr = await Common._loadContractStr(fileName, importsCache, (code) =>
          Contract.checkCodeType(fileName, code)
        )
        result = result.concat('\n', importContractStr)
      }
    }
    return result
  }

  protected static async _loadContractStr(
    fileName: string,
    importsCache: string[],
    validate: (fileName: string) => void
  ): Promise<string> {
    const contractPath = this._contractPath(fileName)
    const contractBuffer = await fsPromises.readFile(contractPath)
    const contractStr = contractBuffer.toString()

    validate(contractStr)
    return Common._handleImports(contractStr, importsCache)
  }

  static checkFileNameExtension(fileName: string): void {
    if (!fileName.endsWith('.ral')) {
      throw new Error('Smart contract file name should end with ".ral"')
    }
  }

  protected static async _from<T extends { sourceCodeSha256: string }>(
    client: CliqueClient,
    fileName: string,
    loadContractStr: (fileName: string, importsCache: string[]) => Promise<string>,
    compile: (client: CliqueClient, fileName: string, contractStr: string, contractHash: string) => Promise<T>
  ): Promise<T> {
    Common.checkFileNameExtension(fileName)

    const contractStr = await loadContractStr(fileName, [])
    const contractHash = cryptojs.SHA256(contractStr).toString()
    const existingContract = this._getArtifactFromCache(contractHash)
    if (typeof existingContract !== 'undefined') {
      return existingContract as unknown as T
    } else {
      return compile(client, fileName, contractStr, contractHash)
    }
  }

  protected _saveToFile(fileName: string): Promise<void> {
    const artifactPath = Common._artifactPath(fileName)
    return fsPromises.writeFile(artifactPath, this.toString())
  }

  abstract buildByteCode(templateVariables?: ralph.TemplateVariables): string
}

export class Contract extends Common {
  readonly compiled: api.CompiledContractTrait
  readonly fields: api.FieldsSig
  readonly events: api.EventSig[]

  constructor(
    sourceCodeSha256: string,
    compiled: api.CompiledContractTrait,
    fields: api.FieldsSig,
    functions: api.FunctionSig[],
    events: api.EventSig[]
  ) {
    super(sourceCodeSha256, functions)
    this.compiled = compiled
    this.fields = fields
    this.events = events
  }

  static checkCodeType(fileName: string, contractStr: string): void {
    const interfaceMatches = contractStr.match(Contract.interfaceRegex)
    if (interfaceMatches) {
      return
    }

    const contractMatches = contractStr.match(Contract.contractRegex)
    if (contractMatches === null) {
      throw new Error(`No contract found in: ${fileName}`)
    } else if (contractMatches.length > 1) {
      throw new Error(`Multiple contracts in: ${fileName}`)
    } else {
      return
    }
  }

  private static async loadContractStr(fileName: string, importsCache: string[]): Promise<string> {
    return Common._loadContractStr(fileName, importsCache, (code) => Contract.checkCodeType(fileName, code))
  }

  static async fromSource(client: CliqueClient, fileName: string): Promise<Contract> {
    if (!fs.existsSync(Common._artifactsFolder())) {
      fs.mkdirSync(Common._artifactsFolder(), { recursive: true })
    }
    const contract = await Common._from(
      client,
      fileName,
      (fileName, importCaches) => Contract.loadContractStr(fileName, importCaches),
      Contract.compile
    )
    this._putArtifactToCache(contract.sourceCodeSha256, contract)
    return contract
  }

  private static async compile(
    client: CliqueClient,
    fileName: string,
    contractStr: string,
    contractHash: string
  ): Promise<Contract> {
    const compiled = (await client.contracts.postContractsCompileContract({ code: contractStr })).data
    const artifact = new Contract(contractHash, compiled.compiled, compiled.fields, compiled.functions, compiled.events)
    await artifact._saveToFile(fileName)
    return artifact
  }

  // TODO: safely parse json
  static fromJson(artifact: any): Contract {
    if (artifact.compiled == null || artifact.fields == null || artifact.functions == null || artifact.events == null) {
      throw new Event('The artifact JSON is incomplete')
    }
    const contract = new Contract(
      artifact.sourceCodeSha256,
      artifact.compiled,
      artifact.fields,
      artifact.functions,
      artifact.events
    )
    this._putArtifactToCache(contract.sourceCodeSha256, contract)
    return contract
  }

  // support both 'code.ral' and 'code.ral.json'
  static async fromArtifactFile(fileName: string): Promise<Contract> {
    const artifactPath = Contract._artifactPath(fileName)
    const content = await fsPromises.readFile(artifactPath)
    const artifact = JSON.parse(content.toString())
    return Contract.fromJson(artifact)
  }

  toString(): string {
    return JSON.stringify(
      {
        sourceCodeSha256: this.sourceCodeSha256,
        compiled: this.compiled,
        fields: this.fields,
        functions: this.functions,
        events: this.events
      },
      null,
      2
    )
  }

  toState(fields: Val[], asset: Asset, address?: string, templateVariables?: ralph.TemplateVariables): ContractState {
    const addressDef = typeof address !== 'undefined' ? address : Contract.randomAddress()
    return {
      address: addressDef,
      contractId: binToHex(contractIdFromAddress(addressDef)),
      bytecode: this.buildByteCode(templateVariables),
      artifactId: this.sourceCodeSha256,
      fields: fields,
      fieldTypes: this.fields.types,
      asset: asset
    }
  }

  static randomAddress(): string {
    const bytes = crypto.randomBytes(33)
    bytes[0] = 3
    return bs58.encode(bytes)
  }

  private async _test(
    client: CliqueClient,
    funcName: string,
    params: TestContractParams,
    expectPublic: boolean,
    accessType: string,
    templateVariables?: ralph.TemplateVariables
  ): Promise<TestContractResult> {
    const apiParams: api.TestContract = this.toTestContract(funcName, params, templateVariables)
    const response = await client.contracts.postContractsTestContract(apiParams)
    const apiResult = response.data

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
    client: CliqueClient,
    funcName: string,
    params: TestContractParams,
    templateVariables?: ralph.TemplateVariables
  ): Promise<TestContractResult> {
    return this._test(client, funcName, params, true, 'public', templateVariables)
  }

  async testPrivateMethod(
    client: CliqueClient,
    funcName: string,
    params: TestContractParams,
    templateVariables?: ralph.TemplateVariables
  ): Promise<TestContractResult> {
    return this._test(client, funcName, params, false, 'private', templateVariables)
  }

  toApiFields(fields?: Val[]): api.Val[] {
    return typeof fields !== 'undefined' ? toApiFields(fields, this.fields.types) : []
  }

  toApiArgs(funcName: string, args?: Val[]): api.Val[] {
    if (args) {
      const func = this.functions.find((func) => func.name == funcName)
      if (func == null) {
        throw new Error(`Invalid function name: ${funcName}`)
      }

      if (args.length === func.argTypes.length) {
        return args.map((arg, index) => toApiVal(arg, func.argTypes[`${index}`]))
      } else {
        throw new Error(`Invalid number of arguments: ${args}`)
      }
    } else {
      return []
    }
  }

  getMethodIndex(funcName: string): number {
    return this.functions.findIndex((func) => func.name === funcName)
  }

  toApiContractStates(states?: ContractState[]): api.ContractState[] | undefined {
    return typeof states != 'undefined' ? states.map((state) => toApiContractState(state)) : undefined
  }

  toTestContract(
    funcName: string,
    params: TestContractParams,
    templateVariables?: ralph.TemplateVariables
  ): api.TestContract {
    return {
      group: params.group,
      address: params.address,
      bytecode: this.buildByteCode(templateVariables),
      artifactId: this.sourceCodeSha256,
      initialFields: this.toApiFields(params.initialFields),
      initialAsset: typeof params.initialAsset !== 'undefined' ? toApiAsset(params.initialAsset) : undefined,
      testMethodIndex: this.getMethodIndex(funcName),
      testArgs: this.toApiArgs(funcName, params.testArgs),
      existingContracts: this.toApiContractStates(params.existingContracts),
      inputAssets: toApiInputAssets(params.inputAssets)
    }
  }

  static async fromArtifactId(artifactId: string): Promise<Contract> {
    const cached = this._getArtifactFromCache(artifactId)
    if (typeof cached !== 'undefined') {
      return cached as Contract
    }

    const files = await fsPromises.readdir(Common._artifactsFolder())
    for (const file of files) {
      if (file.endsWith('.ral.json')) {
        try {
          const contract = await Contract.fromArtifactFile(file)
          if (contract.sourceCodeSha256 === artifactId) {
            return contract as Contract
          }
        } catch (_) {}
      }
    }

    throw new Error(`Unknown code with source hash: ${artifactId}`)
  }

  static async getFieldTypes(state: api.ContractState): Promise<string[]> {
    return Contract.fromArtifactId(state.artifactId).then((contract) => contract.fields.types)
  }

  async fromApiContractState(state: api.ContractState): Promise<ContractState> {
    const contract = await Contract.fromArtifactId(state.artifactId)
    return {
      address: state.address,
      contractId: binToHex(contractIdFromAddress(state.address)),
      bytecode: state.bytecode,
      artifactId: state.artifactId,
      fields: fromApiVals(state.fields, contract.fields.types),
      fieldTypes: await Contract.getFieldTypes(state),
      asset: fromApiAsset(state.asset)
    }
  }

  static async fromApiEvent(event: api.Event, artifactId: string): Promise<ContractEvent> {
    let fieldTypes: string[]
    let name: string

    if (event.eventIndex == -1) {
      name = 'ContractCreated'
      fieldTypes = ['Address']
    } else if (event.eventIndex == -2) {
      name = 'ContractDestroyed'
      fieldTypes = ['Address']
    } else {
      const contract = await Contract.fromArtifactId(artifactId)
      const eventDef = await contract.events[event.eventIndex]
      name = eventDef.name
      fieldTypes = eventDef.fieldTypes
    }

    if (event.type === 'ContractEvent') {
      return {
        blockHash: event.blockHash,
        contractAddress: (event as api.ContractEvent).contractAddress,
        txId: event.txId,
        name: name,
        fields: fromApiVals(event.fields, fieldTypes)
      }
    } else {
      throw new Error(`Expected ContractEvent only, but got ${event.type}`)
    }
  }

  async fromTestContractResult(methodIndex: number, result: api.TestContractResult): Promise<TestContractResult> {
    const addressToArtifactId = new Map<string, string>()
    addressToArtifactId.set(result.address, result.artifactId)
    result.contracts.forEach((contract) => addressToArtifactId.set(contract.address, contract.artifactId))
    return {
      address: result.address,
      contractId: binToHex(contractIdFromAddress(result.address)),
      artifactId: result.artifactId,
      returns: fromApiVals(result.returns, this.functions[`${methodIndex}`].returnTypes),
      gasUsed: result.gasUsed,
      contracts: await Promise.all(result.contracts.map((contract) => this.fromApiContractState(contract))),
      txOutputs: result.txOutputs.map(fromApiOutput),
      events: await Promise.all(
        result.events.map((event) => {
          const contractAddress = (event as api.ContractEvent).contractAddress
          const artifactId = addressToArtifactId.get(contractAddress)
          if (typeof artifactId !== 'undefined') {
            return Contract.fromApiEvent(event, artifactId)
          } else {
            throw Error(`Cannot find artifact id for the contract address: ${contractAddress}`)
          }
        })
      )
    }
  }

  async transactionForDeployment(
    signer: SingleAddressSigner,
    initialFields?: Val[],
    issueTokenAmount?: string,
    templateVariables?: ralph.TemplateVariables
  ): Promise<DeployContractTransaction> {
    const params: api.BuildContractDeployScriptTx = {
      fromPublicKey: signer.publicKey,
      bytecode: this.buildByteCode(templateVariables),
      initialFields: this.toApiFields(initialFields),
      issueTokenAmount: issueTokenAmount
    }
    const response = await signer.client.contracts.postContractsUnsignedTxBuildContract(params)
    return fromApiDeployContractUnsignedTx(convertHttpResponse(response))
  }

  buildByteCode(templateVariables?: ralph.TemplateVariables): string {
    switch (this.compiled.type) {
      case 'SimpleContractByteCode':
        if (typeof templateVariables !== 'undefined') {
          throw Error('The contract does not need template variable')
        }
        return (this.compiled as api.SimpleContractByteCode).bytecode
      case 'TemplateContractByteCode':
        if (typeof templateVariables === 'undefined') {
          throw Error('The contract needs template variable')
        }
        return ralph.buildContractByteCode(this.compiled as api.TemplateContractByteCode, templateVariables)
      default:
        throw Error(`Unknown bytecode type: ${this.compiled.type}`)
    }
  }
}

export class Script extends Common {
  readonly compiled: api.CompiledScriptTrait

  constructor(sourceCodeSha256: string, compiled: api.CompiledScriptTrait, functions: api.FunctionSig[]) {
    super(sourceCodeSha256, functions)
    this.compiled = compiled
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

  private static async loadContractStr(fileName: string, importsCache: string[]): Promise<string> {
    return Common._loadContractStr(fileName, importsCache, (code) => Script.checkCodeType(fileName, code))
  }

  static async fromSource(client: CliqueClient, fileName: string): Promise<Script> {
    return Common._from(
      client,
      fileName,
      (fileName, importsCache) => Script.loadContractStr(fileName, importsCache),
      Script.compile
    )
  }

  private static async compile(
    client: CliqueClient,
    fileName: string,
    scriptStr: string,
    contractHash: string
  ): Promise<Script> {
    const compiled = (await client.contracts.postContractsCompileScript({ code: scriptStr })).data
    const artifact = new Script(contractHash, compiled.compiled, compiled.functions)
    await artifact._saveToFile(fileName)
    return artifact
  }

  // TODO: safely parse json
  static fromJson(artifact: any): Script {
    if (artifact.compiled == null || artifact.functions == null) {
      throw new Event('= Compilation did not return the right data')
    }
    return new Script(artifact.sourceCodeSha256, artifact.compiled, artifact.functions)
  }

  static async fromArtifactFile(fileName: string): Promise<Script> {
    const artifactPath = Common._artifactPath(fileName)
    const content = await fsPromises.readFile(artifactPath)
    const artifact = JSON.parse(content.toString())
    return this.fromJson(artifact)
  }

  toString(): string {
    return JSON.stringify(
      {
        sourceCodeSha256: this.sourceCodeSha256,
        compiled: this.compiled,
        functions: this.functions
      },
      null,
      2
    )
  }

  async transactionForDeployment(
    signer: SingleAddressSigner,
    templateVariables?: ralph.TemplateVariables,
    params?: BuildScriptTx
  ): Promise<BuildScriptTxResult> {
    const apiParams: api.BuildScriptTx =
      typeof params !== 'undefined'
        ? {
            fromPublicKey: signer.publicKey,
            bytecode: this.buildByteCode(templateVariables),
            alphAmount: typeof params.alphAmount !== 'undefined' ? extractNumber256(params.alphAmount) : undefined,
            tokens: typeof params.tokens !== 'undefined' ? params.tokens.map(toApiToken) : undefined,
            gas: typeof params.gas !== 'undefined' ? params.gas : undefined,
            gasPrice: typeof params.gasPrice !== 'undefined' ? extractNumber256(params.gasPrice) : undefined,
            utxosLimit: typeof params.utxosLimit !== 'undefined' ? params.utxosLimit : undefined
          }
        : {
            fromPublicKey: signer.publicKey,
            bytecode: this.buildByteCode(templateVariables)
          }
    const response = await signer.client.contracts.postContractsUnsignedTxBuildScript(apiParams)
    return convertHttpResponse(response)
  }

  buildByteCode(templateVariables?: ralph.TemplateVariables): string {
    switch (this.compiled.type) {
      case 'SimpleScriptByteCode':
        if (typeof templateVariables !== 'undefined') {
          throw Error('The script does not need template variable')
        }
        return (this.compiled as api.SimpleScriptByteCode).bytecode
      case 'TemplateScriptByteCode':
        if (typeof templateVariables === 'undefined') {
          throw Error('The script needs template variable')
        }
        return ralph.buildByteCode((this.compiled as api.TemplateScriptByteCode).templateByteCode, templateVariables)
      default:
        throw Error(`Unknown bytecode type: ${this.compiled.type}`)
    }
  }
}

export type Number256 = number | bigint
export type Val = Number256 | boolean | string | Val[]

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

export function extractArray(tpe: string, v: Val): api.Val {
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

function toApiVal(v: Val, tpe: string): api.Val {
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

function _fromApiVal(vals: api.Val[], valIndex: number, tpe: string): [result: Val, nextIndex: number] {
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

function fromApiVals(vals: api.Val[], types: string[]): Val[] {
  let valIndex = 0
  const result: Val[] = []
  for (const currentType of types) {
    const [val, nextIndex] = _fromApiVal(vals, valIndex, currentType)
    result.push(val)
    valIndex = nextIndex
  }
  return result
}

function fromApiVal(v: api.Val, tpe: string): Val {
  if (v.type === 'Bool' && v.type === tpe) {
    return v.value as boolean
  } else if ((v.type === 'U256' || v.type === 'I256') && v.type === tpe) {
    return decodeNumber256(v.value as string)
  } else if ((v.type === 'ByteVec' || v.type === 'Address') && v.type === tpe) {
    return v.value as string
  } else {
    throw new Error(`Invalid api.Val type: ${v}`)
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

function toApiToken(token: Token): api.Token {
  return { id: token.id, amount: extractNumber256(token.amount) }
}

function fromApiToken(token: api.Token): Token {
  return { id: token.id, amount: decodeNumber256(token.amount) }
}

function toApiAsset(asset: Asset): api.AssetState {
  return {
    alphAmount: extractNumber256(asset.alphAmount),
    tokens: typeof asset.tokens !== 'undefined' ? asset.tokens.map(toApiToken) : []
  }
}

function fromApiAsset(asset: api.AssetState): Asset {
  return {
    alphAmount: decodeNumber256(asset.alphAmount),
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
  artifactId: string
  fields: Val[]
  fieldTypes: string[]
  asset: Asset
}

function toApiContractState(state: ContractState): api.ContractState {
  return {
    address: state.address,
    bytecode: state.bytecode,
    artifactId: state.artifactId,
    fields: toApiFields(state.fields, state.fieldTypes),
    asset: toApiAsset(state.asset)
  }
}

function toApiFields(fields: Val[], fieldTypes: string[]): api.Val[] {
  if (fields.length === fieldTypes.length) {
    return fields.map((field, index) => toApiVal(field, fieldTypes[`${index}`]))
  } else {
    throw new Error(`Invalid number of fields: ${fields}`)
  }
}

function toApiInputAsset(inputAsset: InputAsset): api.InputAsset {
  return { address: inputAsset.address, asset: toApiAsset(inputAsset.asset) }
}

function toApiInputAssets(inputAssets?: InputAsset[]): api.InputAsset[] | undefined {
  return typeof inputAssets !== 'undefined' ? inputAssets.map(toApiInputAsset) : undefined
}

export interface TestContractParams {
  group?: number // default 0
  address?: string
  initialFields?: Val[] // default no fields
  initialAsset?: Asset // default 1 ALPH
  testMethodIndex?: number // default 0
  testArgs?: Val[] // default no arguments
  existingContracts?: ContractState[] // default no existing contracts
  inputAssets?: InputAsset[] // default no input asserts
}

type Event = ContractEvent | TxScriptEvent

export interface ContractEvent {
  blockHash: string
  contractAddress: string
  txId: string
  name: string
  fields: Val[]
}

export interface TxScriptEvent {
  blockHash: string
  txId: string
  name: string
  fields: Val[]
}

export interface TestContractResult {
  address: string
  contractId: string
  artifactId: string
  returns: Val[]
  gasUsed: number
  contracts: ContractState[]
  txOutputs: Output[]
  events: Event[]
}
export declare type Output = AssetOutput | ContractOutput
export interface AssetOutput extends Asset {
  type: string
  address: string
  lockTime: number
  additionalData: string
}
export interface ContractOutput {
  type: string
  address: string
  alphAmount: Number256
  tokens: Token[]
}

function fromApiOutput(output: api.Output): Output {
  if (output.type === 'AssetOutput') {
    const asset = output as api.AssetOutput
    return {
      type: 'AssetOutput',
      address: asset.address,
      alphAmount: decodeNumber256(asset.alphAmount),
      tokens: asset.tokens.map(fromApiToken),
      lockTime: asset.lockTime,
      additionalData: asset.additionalData
    }
  } else if (output.type === 'ContractOutput') {
    const asset = output as api.ContractOutput
    return {
      type: 'ContractOutput',
      address: asset.address,
      alphAmount: decodeNumber256(asset.alphAmount),
      tokens: asset.tokens.map(fromApiToken)
    }
  } else {
    throw new Error(`Unknown output type: ${output}`)
  }
}

export interface DeployContractTransaction {
  group: number
  unsignedTx: string
  txId: string
  contractAddress: string
  contractId: string
}

function fromApiDeployContractUnsignedTx(result: api.BuildContractDeployScriptTxResult): DeployContractTransaction {
  return { ...result, contractId: binToHex(contractIdFromAddress(result.contractAddress)) }
}

export interface BuildScriptTx {
  alphAmount?: Number256
  tokens?: Token[]
  gas?: number
  gasPrice?: Number256
  utxosLimit?: number
}

export interface BuildScriptTxResult {
  unsignedTx: string
  txId: string
  group: number
}
