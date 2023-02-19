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
  Account,
  NodeProvider,
  Project,
  Contract,
  Script,
  node,
  web3,
  Token,
  Number256,
  DeployContractParams,
  DeployContractResult,
  ExecuteScriptParams,
  ExecuteScriptResult,
  SignerProvider,
  Fields,
  ContractFactory
} from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import path from 'path'
import fs, { promises as fsPromises } from 'fs'
import * as cryptojs from 'crypto-js'
import {
  DeployContractExecutionResult,
  RunScriptResult,
  Network,
  NetworkType,
  Deployer,
  DeployFunction,
  Configuration,
  ExecutionResult,
  DEFAULT_CONFIGURATION_VALUES
} from './types'
import { getConfigFile, getDeploymentFilePath, getNetwork, loadConfig } from './utils'

export class Deployments {
  groups: Map<number, DeploymentsPerGroup>

  constructor(groups: Map<number, DeploymentsPerGroup>) {
    this.groups = groups
  }

  static empty(): Deployments {
    return new Deployments(new Map())
  }

  getDeployedContractResult(group: number, name: string): DeployContractExecutionResult {
    const result = this.groups.get(group)?.deployContractResults.get(name)
    if (result === undefined) {
      throw Error(`Cannot find deployed contract for group ${group} and name ${name}`)
    }
    return result
  }

  getExecutedScriptResult(group: number, name: string): RunScriptResult {
    const result = this.groups.get(group)?.runScriptResults.get(name)
    if (result === undefined) {
      throw Error(`Cannot find executed script for group ${group} and name ${name}`)
    }
    return result
  }

  async saveToFile(filepath: string): Promise<void> {
    const dirpath = path.dirname(filepath)
    if (!fs.existsSync(dirpath)) {
      fs.mkdirSync(dirpath, { recursive: true })
    }
    const object: any = {}
    this.groups.forEach((value, groupIndex) => {
      object[`${groupIndex}`] = value.marshal()
    })
    const content = JSON.stringify(object, null, 2)
    return fsPromises.writeFile(filepath, content)
  }

  static async from(filepath: string): Promise<Deployments> {
    if (!fs.existsSync(filepath)) {
      return new Deployments(new Map())
    }
    const content = await fsPromises.readFile(filepath)
    const json = JSON.parse(content.toString(), (key, value) => {
      if ((key === 'gasPrice' || key === 'attoAlphAmount' || key === 'issueTokenAmount') && value !== undefined) {
        return BigInt(value)
      }
      return value
    })
    const groups = new Map<number, DeploymentsPerGroup>()
    Object.entries<any>(json).forEach(([key, value]) => {
      const groupIndex = parseInt(key)
      const deploymentsPerGroup = DeploymentsPerGroup.unmarshal(value)
      groups.set(groupIndex, deploymentsPerGroup)
    })
    return new Deployments(groups)
  }

  static async load(configuration: Configuration, networkType: NetworkType): Promise<Deployments> {
    const network = getNetwork(configuration, networkType)
    const deploymentsFile = getDeploymentFilePath(networkType, network)
    return Deployments.from(deploymentsFile)
  }
}

export class DeploymentsPerGroup {
  deployContractResults: Map<string, DeployContractExecutionResult>
  runScriptResults: Map<string, RunScriptResult>
  migrations: Map<string, number>

  constructor(
    deployContractResults: Map<string, DeployContractExecutionResult>,
    runScriptResults: Map<string, RunScriptResult>,
    migrations: Map<string, number>
  ) {
    this.deployContractResults = deployContractResults
    this.runScriptResults = runScriptResults
    this.migrations = migrations
  }

  static empty(): DeploymentsPerGroup {
    return new DeploymentsPerGroup(new Map(), new Map(), new Map())
  }

  marshal(): any {
    return {
      deployContractResults: Object.fromEntries(this.deployContractResults),
      runScriptResults: Object.fromEntries(this.runScriptResults),
      migrations: Object.fromEntries(this.migrations)
    }
  }

  static unmarshal(json: any): DeploymentsPerGroup {
    const deployContractResults = new Map(Object.entries<DeployContractExecutionResult>(json.deployContractResults))
    const runScriptResults = new Map(Object.entries<RunScriptResult>(json.runScriptResults))
    const migrations = new Map(Object.entries<number>(json.migrations))
    return new DeploymentsPerGroup(deployContractResults, runScriptResults, migrations)
  }
}

async function isTxExists(provider: NodeProvider, txId: string): Promise<boolean> {
  const txStatus = await provider.transactions.getTransactionsStatus({ txId: txId })
  return txStatus.type !== 'TxNotFound'
}

function recordEqual(left: Record<string, string>, right: Record<string, string>): boolean {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) {
    return false
  }
  for (const key of leftKeys) {
    if (left[`$key}`] !== right[`${key}`]) {
      return false
    }
  }
  return true
}

async function needToRetry(
  provider: NodeProvider,
  previous: ExecutionResult | undefined,
  attoAlphAmount: Number256 | undefined,
  tokens: Record<string, string> | undefined,
  codeHash: string
): Promise<boolean> {
  if (previous === undefined || previous.codeHash !== codeHash) {
    return true
  }
  const txExists = await isTxExists(provider, previous.txId)
  if (!txExists) {
    return true
  }
  const currentTokens = tokens ? tokens : {}
  const previousTokens = previous.tokens ? previous.tokens : {}
  const sameWithPrevious = attoAlphAmount === previous.attoAlphAmount && recordEqual(currentTokens, previousTokens)
  return !sameWithPrevious
}

async function needToDeployContract(
  provider: NodeProvider,
  previous: DeployContractExecutionResult | undefined,
  attoAlphAmount: Number256 | undefined,
  tokens: Record<string, string> | undefined,
  issueTokenAmount: Number256 | undefined,
  codeHash: string
): Promise<boolean> {
  const retry = await needToRetry(provider, previous, attoAlphAmount, tokens, codeHash)
  if (retry) {
    return true
  }
  // previous !== undefined if retry is false
  return previous!.issueTokenAmount !== issueTokenAmount
}

async function needToRunScript(
  provider: NodeProvider,
  previous: RunScriptResult | undefined,
  attoAlphAmount: Number256 | undefined,
  tokens: Record<string, string> | undefined,
  codeHash: string
): Promise<boolean> {
  return needToRetry(provider, previous, attoAlphAmount, tokens, codeHash)
}

function getTokenRecord(tokens: Token[]): Record<string, string> {
  return tokens.reduce<Record<string, string>>((acc, token) => {
    acc[token.id] = token.amount.toString()
    return acc
  }, {})
}

function isConfirmed(txStatus: node.TxStatus): txStatus is node.Confirmed {
  return txStatus.type === 'Confirmed'
}

async function waitTxConfirmed(provider: NodeProvider, txId: string, confirmations: number): Promise<node.Confirmed> {
  const status = await provider.transactions.getTransactionsStatus({ txId: txId })
  if (isConfirmed(status) && status.chainConfirmations >= confirmations) {
    return status
  }
  await new Promise((r) => setTimeout(r, 1000))
  return waitTxConfirmed(provider, txId, confirmations)
}

function getTaskId(code: Contract | Script, taskTag?: string): string {
  return taskTag ? `${code.name}:${taskTag}` : code.name
}

function createDeployer<Settings = unknown>(
  network: Network<Settings>,
  signer: PrivateKeyWallet,
  deployContractResults: Map<string, DeployContractExecutionResult>,
  runScriptResults: Map<string, RunScriptResult>
): Deployer {
  const account: Account = {
    keyType: 'default',
    address: signer.address,
    group: signer.group,
    publicKey: signer.publicKey
  }
  const confirmations = network.confirmations ? network.confirmations : 1

  const deployContract = async <T, P extends Fields>(
    contractFactory: ContractFactory<T, P>,
    params: DeployContractParams<P>,
    taskTag?: string
  ): Promise<DeployContractResult<T>> => {
    const initFieldsAndByteCode = contractFactory.contract.buildByteCodeToDeploy(params.initialFields ?? {})
    const codeHash = cryptojs.SHA256(initFieldsAndByteCode).toString()
    const taskId = getTaskId(contractFactory.contract, taskTag)
    const previous = deployContractResults.get(taskId)
    const tokens = params.initialTokenAmounts ? getTokenRecord(params.initialTokenAmounts) : undefined
    const needToDeploy = await needToDeployContract(
      web3.getCurrentNodeProvider(),
      previous,
      params.initialAttoAlphAmount,
      tokens,
      params.issueTokenAmount,
      codeHash
    )
    if (!needToDeploy) {
      // we have checked in `needToDeployContract`
      console.log(`The deployment of contract ${taskId} is skipped as it has been deployed`)
      const previousDeployResult = previous!
      return {
        ...previousDeployResult,
        instance: contractFactory.at(previousDeployResult.contractAddress)
      }
    }
    console.log(`Deploying contract ${taskId}`)
    console.log(`Deployer - group ${signer.group} - ${signer.address}`)
    const deployResult = await contractFactory.deploy(signer, params)
    const confirmed = await waitTxConfirmed(web3.getCurrentNodeProvider(), deployResult.txId, confirmations)
    const result: DeployContractExecutionResult = {
      ...deployResult,
      blockHash: confirmed.blockHash,
      codeHash: codeHash,
      attoAlphAmount: params.initialAttoAlphAmount,
      tokens: tokens,
      issueTokenAmount: params.issueTokenAmount
    }
    deployContractResults.set(taskId, result)
    return deployResult
  }

  const runScript = async <P extends Fields>(
    executeFunc: (singer: SignerProvider, params: ExecuteScriptParams<P>) => Promise<ExecuteScriptResult>,
    script: Script,
    params: ExecuteScriptParams<P>,
    taskTag?: string
  ): Promise<ExecuteScriptResult> => {
    const initFieldsAndByteCode = script.buildByteCodeToDeploy(params.initialFields ?? {})
    const codeHash = cryptojs.SHA256(initFieldsAndByteCode).toString()
    const taskId = getTaskId(script, taskTag)
    const previous = runScriptResults.get(taskId)
    const tokens = params.tokens ? getTokenRecord(params.tokens) : undefined
    const needToRun = await needToRunScript(
      web3.getCurrentNodeProvider(),
      previous,
      params.attoAlphAmount,
      tokens,
      codeHash
    )
    if (!needToRun) {
      // we have checked in `needToRunScript`
      console.log(`The execution of script ${taskId} is skipped as it has been executed`)
      const previousExecuteResult = previous!
      return { ...previousExecuteResult }
    }
    console.log(`Executing script ${taskId}`)
    const executeResult = await executeFunc(signer, params)
    const confirmed = await waitTxConfirmed(web3.getCurrentNodeProvider(), executeResult.txId, confirmations)
    const runScriptResult: RunScriptResult = {
      ...executeResult,
      blockHash: confirmed.blockHash,
      codeHash: codeHash,
      attoAlphAmount: params.attoAlphAmount,
      tokens: tokens
    }
    runScriptResults.set(taskId, runScriptResult)
    return executeResult
  }

  const getDeployContractResult = (name: string): DeployContractExecutionResult => {
    const result = deployContractResults.get(name)
    if (result === undefined) {
      throw new Error(`Deployment result of contract "${name}" does not exist`)
    }
    return result
  }

  const getRunScriptResult = (name: string): RunScriptResult => {
    const result = runScriptResults.get(name)
    if (result === undefined) {
      throw new Error(`Execution result of script "${name}" does not exist`)
    }
    return result
  }

  return {
    provider: web3.getCurrentNodeProvider(),
    account: account,
    deployContract: deployContract,
    runScript: runScript,
    getDeployContractResult: getDeployContractResult,
    getRunScriptResult: getRunScriptResult
  }
}

async function getDeployScriptFiles(rootPath: string): Promise<string[]> {
  const regex = '^([0-9]+)_.*\\.(ts|js)$'
  const dirents = await fsPromises.readdir(rootPath, { withFileTypes: true })
  const scripts: { filename: string; order: number }[] = []
  for (const f of dirents) {
    if (!f.isFile()) continue
    const result = f.name.match(regex)
    if (result === null) continue
    const order = parseInt(result[1])
    scripts.push({ filename: f.name, order: order })
  }
  scripts.sort((a, b) => a.order - b.order)
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[`${i}`].order !== i) {
      throw new Error('Script should begin with number prefix that consecutively starts from 0')
    }
  }
  return scripts.map((f) => path.join(rootPath, f.filename))
}

async function validateChainParams(networkId: number, groups: number[]): Promise<void> {
  const chainParams = await web3.getCurrentNodeProvider().infos.getInfosChainParams()
  if (chainParams.networkId !== networkId) {
    throw new Error(`The node chain id ${chainParams.networkId} is different from configured chain id ${networkId}`)
  }
  if (groups.some((group, index) => groups.indexOf(group) !== index)) {
    throw new Error(`Found duplicated groups in: ${groups}`)
  }
  if (groups.length > chainParams.groups) {
    throw new Error(`The number of group cannot larger than ${chainParams.groups}`)
  }
  if (groups.some((group) => group >= chainParams.groups || group < 0)) {
    throw new Error(`Group indexes should be subset of [${[...Array(chainParams.groups).keys()]}]`)
  }
}

function getSigners(privateKeys: string[]): PrivateKeyWallet[] {
  if (privateKeys.length === 0) {
    throw new Error('No private key specified')
  }
  const signers = privateKeys.map((key) => new PrivateKeyWallet(key, 'default'))
  const groups = signers.map((signer) => signer.group)
  const sameGroups = groups.filter((group, index) => groups.indexOf(group) !== index)
  if (sameGroups.length > 0) {
    throw new Error(`Duplicated private keys on group ${sameGroups}`)
  }
  return signers
}

export async function deploy<Settings = unknown>(
  configuration: Configuration<Settings>,
  networkType: NetworkType,
  deployments: Deployments
): Promise<void> {
  const network = await getNetwork(configuration, networkType)
  if (typeof network === 'undefined') {
    throw new Error(`no network ${networkType} config`)
  }

  const deployScriptsRootPath = configuration.deploymentScriptDir
    ? configuration.deploymentScriptDir
    : DEFAULT_CONFIGURATION_VALUES.deploymentScriptDir
  const scriptFiles = await getDeployScriptFiles(path.resolve(deployScriptsRootPath))
  const scripts: { scriptFilePath: string; func: DeployFunction<Settings> }[] = []
  for (const scriptFilePath of scriptFiles) {
    try {
      /* eslint-disable @typescript-eslint/no-var-requires */
      const content = require(scriptFilePath)
      /* eslint-enable @typescript-eslint/no-var-requires */
      if (content.default) {
        scripts.push({
          scriptFilePath: scriptFilePath,
          func: content.default as DeployFunction<Settings>
        })
      } else {
        throw new Error(`no default deploy function exported from ${scriptFilePath}`)
      }
    } catch (error) {
      throw new Error(`failed to load deploy script, filepath: ${scriptFilePath}, error: ${error}`)
    }
  }

  web3.setCurrentNodeProvider(network.nodeUrl)
  const signers = getSigners(network.privateKeys)
  await validateChainParams(
    network.networkId,
    signers.map((signer) => signer.group)
  )

  await Project.build(
    configuration.compilerOptions,
    path.resolve(process.cwd()),
    configuration.sourceDir ?? DEFAULT_CONFIGURATION_VALUES.sourceDir,
    configuration.artifactDir ?? DEFAULT_CONFIGURATION_VALUES.artifactDir
  )
  configuration.defaultNetwork = networkType

  for (const signer of signers) {
    const deploymentsPerGroup = deployments.groups.get(signer.group) ?? DeploymentsPerGroup.empty()
    deployments.groups.set(signer.group, deploymentsPerGroup)
    await deployToGroup(configuration, deploymentsPerGroup, signer, network, scripts)
  }
}

export async function deployToDevnet(): Promise<Deployments> {
  const deployments = Deployments.empty()
  const configuration = await loadConfig(getConfigFile())
  await deploy(configuration, 'devnet', deployments)
  return deployments
}

async function deployToGroup<Settings = unknown>(
  configuration: Configuration<Settings>,
  deployments: DeploymentsPerGroup,
  signer: PrivateKeyWallet,
  network: Network<Settings>,
  scripts: { scriptFilePath: string; func: DeployFunction<Settings> }[]
) {
  const deployer = createDeployer(network, signer, deployments.deployContractResults, deployments.runScriptResults)

  for (const script of scripts) {
    try {
      if (script.func.id && deployments.migrations.get(script.func.id) !== undefined) {
        console.log(`Skipping ${script.scriptFilePath} as the script already executed and complete`)
        continue
      }
      let skip = false
      if (script.func.skip !== undefined) {
        skip = await script.func.skip(configuration)
      }
      if (skip) {
        console.log(`Skip the execution of ${script.scriptFilePath}`)
        continue
      }
      const result = await script.func(deployer, network)
      if (result && typeof result === 'boolean') {
        if (script.func.id === undefined) {
          throw new Error(
            `${script.scriptFilePath} return true to not be executed again, but does not provide an id. The script function needs to have the field "id" to be set`
          )
        }
        deployments.migrations.set(script.func.id, Date.now())
      }
    } catch (error) {
      throw new Error(`failed to execute deploy script, filepath: ${script.scriptFilePath}, error: ${error}`)
    }
  }
}
