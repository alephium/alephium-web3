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
import { NetworkId } from '@alephium/web3'

export async function deployAndSaveProgress<Settings = unknown>(
  configuration: Configuration<Settings>,
  networkId: NetworkId
): Promise<void> {
  const deploymentsFile = getDeploymentFilePath(configuration, networkId)
  const deployments = await Deployments.from(deploymentsFile)
  try {
    await deploy(configuration, networkId, deployments)
  } catch (error) {
    await deployments.saveToFile(deploymentsFile, configuration, false)
    console.error(`Failed to deploy the project`)
    throw error
  }

  await deployments.saveToFile(deploymentsFile, configuration, true)
  console.log('✅ Deployment scripts executed!')
}
