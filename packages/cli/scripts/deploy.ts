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

import { Configuration } from '../src/types'
import { deploy, Deployments } from '../src/deployment'
import { getDeploymentFilePath } from '../src'
import { NetworkId, TraceableError } from '@alephium/web3'

export async function deployAndSaveProgress<Settings = unknown>(
  configuration: Configuration<Settings>,
  networkId: NetworkId,
  silent: boolean,
  fromIndex?: number,
  toIndex?: number
): Promise<void> {
  const deploymentsFile = getDeploymentFilePath(configuration, networkId)
  const deployments = await Deployments.from(deploymentsFile)
  let scriptExecuted: boolean
  try {
    scriptExecuted = await deploy(configuration, networkId, deployments, fromIndex, toIndex, silent)
  } catch (error) {
    await deployments.saveToFile(deploymentsFile, configuration, false)
    if (configuration.enableDebugMode) {
      console.log(`Failed to deploy the project, error: `, error)
    }
    throw new TraceableError('Failed to deploy the project', error)
  }

  await deployments.saveToFile(deploymentsFile, configuration, true)
  if (scriptExecuted && !silent) console.log('✅ Scripts deployment executed!')
}
