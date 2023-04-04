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
  Account,
  DeployContractParams,
  DeployContractResult,
  Fields,
  ContractFactory,
  ExecuteScriptParams,
  ExecuteScriptResult,
  CompilerOptions,
  web3,
  Project,
  DEFAULT_COMPILER_OPTIONS,
  SignerProvider,
  Script,
  NetworkId
} from '@alephium/web3'
import { getConfigFile, loadConfig } from './utils'
import path from 'path'

export interface Network<Settings = unknown> {
  networkId?: number
  nodeUrl: string
  privateKeys: string[]
  deploymentStatusFile?: string
  confirmations?: number
  settings: Settings
}

export interface Configuration<Settings = unknown> {
  nodeVersion?: string
  nodeConfigFile?: string

  sourceDir?: string
  artifactDir?: string

  deploymentScriptDir?: string
  compilerOptions?: CompilerOptions

  defaultNetwork: NetworkId
  networks: Record<NetworkId, Network<Settings>>
}

export const DEFAULT_CONFIGURATION_VALUES = {
  nodeVersion: '2.1.0',
  nodeConfigFile: 'devnet-user.conf',
  sourceDir: Project.DEFAULT_CONTRACTS_DIR,
  artifactDir: Project.DEFAULT_ARTIFACTS_DIR,
  compilerOptions: DEFAULT_COMPILER_OPTIONS,
  deploymentScriptDir: 'scripts',
  networks: {
    devnet: {
      networkId: 4,
      confirmations: 1,
      privateKeys: ['a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5']
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
  unsignedTx: string
  signature: string
  gasAmount: number
  gasPrice: string
  blockHash: string
  codeHash: string
  attoAlphAmount?: string
  tokens?: Record<string, string>
}

export interface DeployContractExecutionResult extends ExecutionResult {
  contractId: string
  contractAddress: string
  issueTokenAmount?: string
}

export type RunScriptResult = ExecutionResult

export interface Deployer {
  provider: NodeProvider
  account: Account

  deployContract<T, P extends Fields>(
    constractFactory: ContractFactory<T, P>,
    params: DeployContractParams<P>,
    taskTag?: string
  ): Promise<DeployContractResult<T>>

  runScript<P extends Fields>(
    executeFunc: (singer: SignerProvider, params: ExecuteScriptParams<P>) => Promise<ExecuteScriptResult>,
    script: Script,
    params: ExecuteScriptParams<P>,
    taskTag?: string
  ): Promise<ExecuteScriptResult>

  getDeployContractResult(name: string): DeployContractExecutionResult
  getRunScriptResult(name: string): RunScriptResult
}

export interface DeployFunction<Settings = unknown> {
  (deployer: Deployer, network: Network<Settings>): Promise<void | boolean>
  skip?: (config: Configuration<Settings>) => Promise<boolean>
  id?: string
}
