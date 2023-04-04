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
  return path.join(__dirname, '../templates/base/alephium.config.ts')
}

export async function isNetworkLive(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/infos/node`, { method: 'Get' })
    return res.status === 200
  } catch (e) {
    return false
  }
}

export async function isDevnetLive(): Promise<boolean> {
  return await isNetworkLive('http://127.0.0.1:22973')
}

export function getDeploymentFilePath(
  artifactDir: string | undefined,
  networkType: NetworkId,
  network: Network
): string {
  return network.deploymentStatusFile
    ? network.deploymentStatusFile
    : path.join(artifactDir ?? DEFAULT_CONFIGURATION_VALUES.artifactDir, `.deployments.${networkType}.json`)
}

export function getNetwork<Settings = unknown>(
  configuration: Configuration<Settings>,
  networkType: NetworkId
): Network<Settings> & { networkId: number } {
  const networkInput = configuration.networks[`${networkType}`]
  const defaultValues = DEFAULT_CONFIGURATION_VALUES.networks[`${networkType}`]
  return { ...defaultValues, ...networkInput }
}
