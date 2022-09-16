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

import { Project, web3 } from '@alephium/web3'
import { program } from 'commander'
import { run as runJestTests } from 'jest'
import fs from 'fs'
import path from 'path'
import { deploy } from './scripts/deployment'
import { NetworkType } from './types'
import { startDevnet } from './scripts/start-devnet'
import { stopDevnet } from './scripts/stop-devnet'
import { createProject } from './scripts/create-project'
import { getConfigFile, loadConfig } from './scripts/utils'

function getAlephiumVersion(): string {
  try {
    const pkgPath = path.join(__dirname, 'package.json')
    const content = fs.readFileSync(pkgPath).toString()
    const json = JSON.parse(content)
    return json.config.alephium_version as string
  } catch (error) {
    program.error('Failed to get alephium version, error: ' + error)
  }
}

program
  .command('init')
  .description('creates a new and empty project')
  .option('-d, --dir <project-directory>', 'project directory', '.')
  .option('-t, --template <template-type>', 'specify a template for the project: either base or react', 'base')
  .action(async (options) => {
    const templateType = options.template as string
    if (!['base', 'react'].includes(templateType)) {
      program.error(`Invalid template type ${templateType}, expected either base or react`)
    }
    const projectRoot = path.resolve(options.dir as string)
    createProject(templateType, __dirname, projectRoot)
  })

const nodeCommand = program.command('devnet').description('start/stop a devnet')
nodeCommand
  .command('start')
  .description('start devnet')
  .option('-v, --version <full-node-version>', 'Alephium full node version')
  .option('-c, --config <full-node-user-config>', 'Alephium full node config')
  .action(async (options) => {
    const version = options.version ? (options.version as string) : getAlephiumVersion()
    const configPath = options.config ? (options.config as string) : path.join(__dirname, 'devnet-user.conf')
    await startDevnet(version, path.resolve(configPath))
  })
nodeCommand
  .command('stop')
  .description('stop devnet')
  .action(() => stopDevnet())

program
  .command('compile')
  .description('compile the project')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .option('-n, --network <network-type>', 'network type')
  .action(async (options) => {
    try {
      const configFile = options.config ? (options.config as string) : getConfigFile()
      const config = await loadConfig(configFile)
      const networkType = options.network ? (options.network as NetworkType) : config.defaultNetwork
      const nodeUrl = config.networks[networkType].nodeUrl
      web3.setCurrentNodeProvider(nodeUrl)
      await Project.build(config.compilerOptions, config.sourceDir, config.artifactDir)
      console.log('Compilation completed!')
    } catch (error) {
      program.error(`Failed to compile, error: ${error}`)
    }
  })

program
  .command('test')
  .description('test contracts')
  .option('-p, --path <test-dir-path>', 'test directory path', 'test')
  .option('-f, --file <test-file>', 'test only one file')
  .option('-g, --grep <pattern>', 'run only tests with a name that matches the regex pattern')
  .option('-i, --runInBand', 'run all tests serially in the current process', false)
  .option('-v, --verbose', 'display individual test results with the test suite hierarchy', false)
  .option('-s, --silent', 'prevent tests from printing messages through the console', false)
  .action(async (options) => {
    const jestOptions: string[] = []
    const testPath = options.path as string
    const jestConfig = {
      transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest'
      },
      testRegex: `/${testPath}/.*(test|spec)\\.(jsx?|tsx?)$`
    }
    const jestConfigStr = JSON.stringify(jestConfig)

    if (options.file) {
      jestOptions.push(options.file as string)
    }
    if (options.grep) {
      jestOptions.push('-t', options.grep as string)
    }
    if (options.runInBand) {
      jestOptions.push('-i')
    }
    if (options.verbose) {
      jestOptions.push('--verbose')
    }
    if (options.silent) {
      jestOptions.push('--silent')
    }
    jestOptions.push('--config', jestConfigStr, '--detectOpenHandles', '--useStderr')
    await runJestTests(jestOptions)
  })

program
  .command('deploy')
  .description('deploy contracts')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .option('-n, --network <network-type>', 'specify the network to use')
  .action(async (options) => {
    try {
      const configFile = options.config ? (options.config as string) : getConfigFile()
      const config = await loadConfig(configFile)
      const networkType = options.network ? (options.network as NetworkType) : config.defaultNetwork
      await deploy(config, networkType)
    } catch (error) {
      program.error(`failed to deploy contracts, error: ${error}`)
    }
  })

program.parseAsync(process.argv)
