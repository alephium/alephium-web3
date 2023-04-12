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

import { Project, web3, NetworkId, networkIds } from '@alephium/web3'
import { program } from 'commander'
import { run as runJestTests } from 'jest'
import path from 'path'
import { deployAndSaveProgress } from './scripts/deploy'
import { Configuration, DEFAULT_CONFIGURATION_VALUES } from './src/types'
import { startDevnet } from './scripts/start-devnet'
import { stopDevnet } from './scripts/stop-devnet'
import { createProject } from './scripts/create-project'
import { codegen, getConfigFile, isNetworkLive, loadConfig } from './src'

function getConfig(options: any): Configuration {
  const configFile = options.config ? (options.config as string) : getConfigFile()
  console.log(`Loading alephium config file: ${configFile}`)
  return loadConfig(configFile)
}

function checkAndGetNetworkId(networkId?: string): NetworkId {
  if (networkId === undefined) {
    return DEFAULT_CONFIGURATION_VALUES.networkId
  }
  if (!(networkIds as ReadonlyArray<string>).includes(networkId)) {
    throw Error(`Invalid network id, expect one of ${networkIds}`)
  }
  return networkId as NetworkId
}

program
  .command('init')
  .description('creates a new and empty project')
  .argument('<dir>', 'project directory')
  .option('-t, --template <template-type>', 'specify a template for the project: either base or react', 'base')
  .action((dir, options) => {
    if (dir === undefined) {
      program.error('Please specify the project directory')
    }
    const templateType = options.template as string
    if (!['base', 'react', 'nextjs'].includes(templateType)) {
      program.error(`Invalid template type ${templateType}, expected base, react or nextjs`)
    }
    const projectRoot = path.resolve(dir as string)
    createProject(templateType, __dirname, projectRoot)
  })

const nodeCommand = program.command('devnet').description('start/stop a devnet')
nodeCommand
  .command('start')
  .description('start devnet')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .action(async (options) => {
    const config = getConfig(options)
    const version = config.nodeVersion! // there is a default value always
    const nodeConfigFile = path.join(__dirname, config.nodeConfigFile!) // there is a default value always
    await startDevnet(version, nodeConfigFile)
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
  .option('--skipGenerate', 'skip generate typescript code by contract artifacts')
  .action(async (options) => {
    try {
      const config = getConfig(options)
      console.log(`Full node version: ${config.nodeVersion}`)
      const networkId = checkAndGetNetworkId(options.network)
      const nodeUrl = config.networks[networkId].nodeUrl
      if (!(await isNetworkLive(nodeUrl))) {
        console.log(`${networkId} is not live`)
        process.exit(1)
      }
      web3.setCurrentNodeProvider(nodeUrl)
      const cwd = path.resolve(process.cwd())
      await Project.build(
        config.compilerOptions,
        cwd,
        config.sourceDir,
        config.artifactDir,
        DEFAULT_CONFIGURATION_VALUES.nodeVersion
      )
      console.log('✅ Compilation completed!')
      if (options.skipGenerate) {
        return
      }
      const artifactDir = config.artifactDir! // there is a default value always
      codegen(artifactDir)
      console.log('✅ Codegen completed!')
    } catch (error) {
      program.error(`Failed to compile, error: ${(error as Error).stack}`)
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
      const config = getConfig(options)
      const networkId = checkAndGetNetworkId(options.network)
      await deployAndSaveProgress(config, networkId)
    } catch (error) {
      program.error(`Failed to deploy contracts, error: ${(error as Error).stack}`)
    }
  })

program.parseAsync(process.argv)
