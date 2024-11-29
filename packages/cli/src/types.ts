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
  ExecutableScript,
  ExecuteScriptParams,
  ExecuteScriptResult,
  CompilerOptions,
  web3,
  DEFAULT_COMPILER_OPTIONS,
  NetworkId,
  ContractInstance,
  DeployContractExecutionResult,
  RunScriptResult
} from '@alephium/web3'
import { getConfigFile, loadConfig } from './utils'
import { Project } from './project'

export interface Network<Settings = unknown> {
  networkId?: number
  nodeUrl: string
  privateKeys: string[] | string
  confirmations?: number
  settings: Settings
}

export interface Configuration<Settings = unknown> {
  sourceDir?: string
  artifactDir?: string

  deployToMultipleGroupsInParallel?: boolean
  deploymentScriptDir?: string
  deploymentsDir?: string
  compilerOptions?: CompilerOptions
  skipRecompileOnDeployment?: boolean

  networks: Record<NetworkId, Network<Settings>>

  enableDebugMode?: boolean
  forceRecompile?: boolean
  skipRecompileIfDeployedOnMainnet?: boolean
  skipRecompileContracts?: string[]
}

export const DEFAULT_CONFIGURATION_VALUES = {
  sourceDir: Project.DEFAULT_CONTRACTS_DIR,
  artifactDir: Project.DEFAULT_ARTIFACTS_DIR,
  compilerOptions: DEFAULT_COMPILER_OPTIONS,
  deployToMultipleGroupsInParallel: true,
  deploymentScriptDir: 'scripts',
  deploymentsDir: 'deployments',
  networkId: 'devnet' as const,
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
  },
  forceRecompile: false
}

export interface Environment<Settings = unknown> {
  config: Configuration<Settings>
  network: Network<Settings>
  nodeProvider: NodeProvider
}

// it's convenient for users to write scripts
export function getEnv<Settings = unknown>(configFileName?: string, networkId?: NetworkId): Environment<Settings> {
  const configFile = configFileName ? configFileName : getConfigFile()
  const config = loadConfig<Settings>(configFile)
  const network = config.networks[networkId ?? DEFAULT_CONFIGURATION_VALUES.networkId]
  web3.setCurrentNodeProvider(network.nodeUrl)
  return {
    config: config,
    network: network,
    nodeProvider: web3.getCurrentNodeProvider()
  }
}

export interface Deployer {
  provider: NodeProvider
  account: Account

  deployContract<T extends ContractInstance, P extends Fields>(
    contractFactory: ContractFactory<T, P>,
    params: DeployContractParams<P>,
    taskTag?: string
  ): Promise<DeployContractResult<T>>

  deployContractTemplate<T extends ContractInstance, P extends Fields>(
    contractFactory: ContractFactory<T, P>,
    taskTag?: string
  ): Promise<DeployContractResult<T>>

  runScript<P extends Fields>(
    executableScript: ExecutableScript<P>,
    params: ExecuteScriptParams<P>,
    taskTag?: string
  ): Promise<ExecuteScriptResult>

  getDeployContractResult(name: string): DeployContractExecutionResult
  getRunScriptResult(name: string): RunScriptResult

  getDeployContractResultFromGroup(name: string, group: number): DeployContractExecutionResult
}

export interface DeployFunction<Settings = unknown> {
  (deployer: Deployer, network: Network<Settings>): Promise<void | boolean>
  skip?: (config: Configuration<Settings>, networkId: NetworkId) => Promise<boolean>
  id?: string
}
