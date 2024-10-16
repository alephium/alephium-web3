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

import path from 'path'
import fs from 'fs'
import { Configuration, DEFAULT_CONFIGURATION_VALUES, Network } from './types'
import { NetworkId } from '@alephium/web3'
import * as fetchRetry from 'fetch-retry'
import * as readline from 'readline'

export function loadConfig<Settings = unknown>(filename: string): Configuration<Settings> {
  const configPath = path.resolve(filename)
  if (!fs.existsSync(configPath)) {
    throw new Error(`${configPath} does not exist`)
  }
  /* eslint-disable @typescript-eslint/no-var-requires */
  const content = require(path.resolve(configPath))
  /* eslint-enable @typescript-eslint/no-var-requires */
  if (!content.default) {
    throw new Error(`config file ${filename} have no default export`)
  }
  const configurationInput = content.default as Configuration<Settings>
  return { ...DEFAULT_CONFIGURATION_VALUES, ...configurationInput }
}

export function getConfigFile(): string {
  const projectRootPath = path.resolve(process.cwd())
  const tsConfig = path.join(projectRootPath, 'alephium.config.ts')
  if (fs.existsSync(tsConfig)) {
    return tsConfig
  }
  const jsConfig = path.join(projectRootPath, 'alephium.config.js')
  if (fs.existsSync(jsConfig)) {
    return jsConfig
  }
  throw new Error('No config file `alephium.config.ts` or `alephium.config.js` found')
}

export async function isNetworkLive(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/infos/version`, { method: 'Get' })
    return res.status === 200
  } catch (e) {
    console.error(`Error when checking if network is live: ${e}`)
    return false
  }
}

export function getSdkFullNodeVersion() {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const web3Path = require.resolve('@alephium/web3')
  const packageJsonPath = path.join(web3Path, '..', '..', '..', 'package.json')
  return require(packageJsonPath).config.alephium_version
  /* eslint-enable @typescript-eslint/no-var-requires */
}

export function checkFullNodeVersion(connectedFullNodeVersion: string, sdkFullNodeVersion: string) {
  const connectedVersions = connectedFullNodeVersion.split('.')
  const sdkVersions = sdkFullNodeVersion.split('.')
  const connectedMajorVersion = Number(connectedVersions[0])
  const sdkMajorVersion = Number(sdkVersions[0])
  if (connectedMajorVersion > sdkMajorVersion) {
    return
  }
  const minimumRequiredVersion = `${sdkVersions[0]}.${sdkVersions[1]}.0`
  if (connectedMajorVersion < sdkMajorVersion) {
    throw new Error(
      `Connected full node version is ${connectedFullNodeVersion}, the minimum required version is ${minimumRequiredVersion}`
    )
  }

  const connectedMinorVersion = Number(connectedVersions[1])
  const sdkMinorVersion = Number(sdkVersions[1])
  if (connectedMinorVersion > sdkMinorVersion) {
    return
  }
  if (connectedMinorVersion < sdkMinorVersion) {
    throw new Error(
      `Connected full node version is ${connectedFullNodeVersion}, the minimum required version is ${minimumRequiredVersion}`
    )
  }
}

export async function isDevnetLive(): Promise<boolean> {
  return await isNetworkLive('http://127.0.0.1:22973')
}

export function getDeploymentFilePath(configuration: Configuration, networkId: NetworkId): string {
  const filename = `.deployments.${networkId}.json`
  const filepath = path.join(configuration.deploymentsDir ?? DEFAULT_CONFIGURATION_VALUES.deploymentsDir, filename)
  const legacyFilepath = path.join(configuration.artifactDir ?? DEFAULT_CONFIGURATION_VALUES.artifactDir, filename)
  // if the legacy deployments file exists, we need to update it within the
  // legacy deployments file when the user continues to deploy the contract
  return fs.existsSync(legacyFilepath) ? legacyFilepath : filepath
}

export function isDeployed(configuration: Configuration): boolean {
  const mainnet = getDeploymentFilePath(configuration, 'mainnet')
  const testnet = getDeploymentFilePath(configuration, 'testnet')
  return fs.existsSync(mainnet) || fs.existsSync(testnet)
}

export function getNetwork<Settings = unknown>(
  configuration: Configuration<Settings>,
  networkId: NetworkId
): Network<Settings> & { networkId: number } {
  const networkInput = configuration.networks[`${networkId}`]
  const defaultValues = DEFAULT_CONFIGURATION_VALUES.networks[`${networkId}`]
  return { ...defaultValues, ...networkInput }
}

export const retryFetch = fetchRetry.default(fetch, {
  retries: 20,
  retryDelay: 1000
})

export function waitUserConfirmation(msg: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(`${msg} (y) `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

export function taskIdToVariable(taskId: string): string {
  return taskId.replace(/[:\-]/g, '_')
}
