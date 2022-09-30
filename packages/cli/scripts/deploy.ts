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

import { NetworkType, Configuration } from '../src/types'
import { deploy, Deployments } from '../src/deployment'
import { getDeploymentFilePath, getNetwork } from '../src'

export async function deployAndSaveProgress<Settings = unknown>(
  configuration: Configuration<Settings>,
  networkType: NetworkType
): Promise<void> {
  const network = getNetwork(configuration, networkType)
  const deploymentsFile = getDeploymentFilePath(networkType, network)
  const deployments = await Deployments.from(deploymentsFile)
  try {
    await deploy(configuration, networkType, deployments)
  } catch (error) {
    await deployments.saveToFile(deploymentsFile)
    console.error(`Failed to deploy the project`)
    throw error
  }

  await deployments.saveToFile(deploymentsFile)
  console.log('✅ Deployment scripts executed!')
}
