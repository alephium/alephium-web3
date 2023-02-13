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
  NodeProvider,
  Contract,
  Script,
  Account,
  DeployContractParams,
  DeployContractResult,
  Fields,
  ContractFactory,
  BuildExecuteScriptTx,
  CompilerOptions,
  web3,
  Project,
  DEFAULT_COMPILER_OPTIONS,
  Number256,
  SignerProvider
} from '@alephium/web3'
import { getConfigFile, loadConfig } from './utils'
import path from 'path'

export interface Network<Settings = unknown> {
  networkId?: number
  nodeUrl: string
  mnemonic: string
  deploymentStatusFile?: string
  confirmations?: number
  settings: Settings
}

export type NetworkType = 'mainnet' | 'testnet' | 'devnet'

export interface Configuration<Settings = unknown> {
  nodeVersion?: string
  nodeConfigFile?: string
  toDeployGroups?: number[]

  sourceDir?: string
  artifactDir?: string

  deploymentScriptDir?: string
  compilerOptions?: CompilerOptions

  defaultNetwork: NetworkType
  networks: Record<NetworkType, Network<Settings>>
}

export const DEFAULT_CONFIGURATION_VALUES = {
  nodeVersion: '1.7.0-rc1',
  nodeConfigFile: 'devnet-user.conf',
  toDeployGroups: [0],
  sourceDir: Project.DEFAULT_CONTRACTS_DIR,
  artifactDir: Project.DEFAULT_ARTIFACTS_DIR,
  compilerOptions: DEFAULT_COMPILER_OPTIONS,
  deploymentScriptDir: 'scripts',
  networks: {
    devnet: {
      networkId: 4,
      confirmations: 1,
      mnemonic:
        'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
    },
    testnet: {
      networkId: 1,
      confirmations: 2
    },
    mainnet: {
      networkId: 0,
      confirmations: 2
    }
  }
}

export interface Environment<Settings = unknown> {
  config: Configuration<Settings>
  network: Network<Settings>
  nodeProvider: NodeProvider
}

// it's convenient for users to write scripts
export async function getEnv<Settings = unknown>(configFileName?: string): Promise<Environment<Settings>> {
  const configFile = configFileName ? configFileName : getConfigFile()
  const config = await loadConfig<Settings>(configFile)
  const network = config.networks[config.defaultNetwork]
  web3.setCurrentNodeProvider(network.nodeUrl)
  await Project.build(config.compilerOptions, path.resolve(process.cwd()), config.sourceDir, config.artifactDir)
  return {
    config: config,
    network: network,
    nodeProvider: web3.getCurrentNodeProvider()
  }
}

export interface ExecutionResult {
  groupIndex: number
  txId: string
  blockHash: string
  codeHash: string
  attoAlphAmount?: Number256
  tokens?: Record<string, string>
}

export interface DeployContractExecutionResult extends ExecutionResult {
  contractId: string
  contractAddress: string
  unsignedTx: string
  signature: string
  gasAmount: number
  gasPrice: bigint
  issueTokenAmount?: Number256
}

export type RunScriptResult = ExecutionResult

export type RunScriptParams = Omit<BuildExecuteScriptTx, 'signerAddress'>

export interface Deployer {
  provider: NodeProvider
  account: Account

  deployContract<T, P extends Fields | undefined>(
    constractFactory: ContractFactory<T, P>,
    params: DeployContractParams<P>,
    taskTag?: string
  ): Promise<DeployContractResult<T>>
  runScript(script: Script, params: RunScriptParams, taskTag?: string): Promise<RunScriptResult>

  getDeployContractResult(name: string): DeployContractExecutionResult
  getRunScriptResult(name: string): RunScriptResult
}

export interface DeployFunction<Settings = unknown> {
  (deployer: Deployer, network: Network<Settings>): Promise<void | boolean>
  skip?: (config: Configuration<Settings>) => Promise<boolean>
  id?: string
}
