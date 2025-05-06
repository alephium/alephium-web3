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

import { Configuration, Network } from '@alephium/cli'
import { getConfigFile, getDeploymentFilePath, getNetwork, loadConfig } from '@alephium/cli'
import path from 'path'

describe.skip('utils', () => {
  let config: Configuration
  let devnet: Network
  beforeAll(() => {
    config = loadConfig(getConfigFile())
    devnet = getNetwork(config, 'devnet')
  })

  it('should load the config', () => {
    expect(config.networks).toBeDefined
  })

  it('should get the network', () => {
    expect(devnet.networkId).toEqual(4)
  })

  it('should get the deployment file path', () => {
    expect(getDeploymentFilePath(config, 'devnet')).toEqual(path.join('deployments', '.deployments.devnet.json'))
    expect(getDeploymentFilePath({ ...config, deploymentsDir: 'contracts' }, 'devnet')).toEqual(
      path.join('contracts', '.deployments.devnet.json')
    )
  })
})
