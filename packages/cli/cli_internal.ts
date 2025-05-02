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

import { web3, NetworkId, networkIds, enableDebugMode, isDebugModeEnabled } from '@alephium/web3'
import { program } from 'commander'
import { run as runJestTests } from 'jest'
import path from 'path'
import { deployAndSaveProgress } from './scripts/deploy'
import { Configuration, DEFAULT_CONFIGURATION_VALUES } from './src/types'
import { createProject, genRalph } from './scripts/create-project'
import { checkFullNodeVersion, codegen, getConfigFile, getSdkFullNodeVersion, isNetworkLive, loadConfig } from './src'
import { Project } from './src/project'
import { genInterfaces } from './src/gen-interfaces'

function getConfig(options: any): Configuration {
  const configFile = options.config ? (options.config as string) : getConfigFile()
  console.log(`Loading alephium config file: ${configFile}`)
  const config = loadConfig(configFile)
  if (config.forceRecompile && config.skipRecompileIfDeployedOnMainnet) {
    throw new Error(`The forceRecompile and skipRecompileIfDeployedOnMainnet flags cannot be enabled at the same time`)
  }

  if (config.forceRecompile && (config.skipRecompileContracts ?? []).length > 0) {
    throw new Error(`The skipRecompileContracts cannot be specified when forceRecompile is enabled`)
  }

  const isDebugModeEnabled = config.enableDebugMode || options.debug
  if (isDebugModeEnabled) enableDebugMode()
  return { ...config, enableDebugMode: isDebugModeEnabled }
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

function buildErrorOutput(error: Error, isDebug: boolean): string {
  const debugMsg = error.stack ?? error.toString()
  return isDebug ? debugMsg : error.message
}

const templateTypes = ['base', 'react', 'nextjs', 'nextjs-app', 'nextjs-pages', 'remix']

program
  .command('init')
  .description('creates a new and empty project')
  .argument('<dir>', 'project directory')
  .option(
    '-t, --template <template-type>',
    `specify a template for the project: expect one of ${templateTypes}`,
    'base'
  )
  .action((dir, options) => {
    if (dir === undefined) {
      program.error('Please specify the project directory')
    }
    const templateType = options.template as string
    if (!templateTypes.includes(templateType)) {
      program.error(`Invalid template type ${templateType}, expect on of ${templateTypes}`)
    }
    const projectRoot = path.resolve(dir as string)
    createProject(templateType, __dirname, projectRoot)
  })

program
  .command('gen-ralph')
  .description('generate ralph contract template for an existing project')
  .action(() => {
    genRalph(__dirname, process.cwd())
  })

program
  .command('compile')
  .description('compile the project')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .option('-n, --network <network-type>', 'network type')
  .option('--skipGenerate', 'skip generate typescript code by contract artifacts')
  .option('--debug', 'show detailed debug information such as error stack traces')
  .action(async (options) => {
    try {
      const config = getConfig(options)
      const networkId = checkAndGetNetworkId(options.network)
      const nodeUrl = config.networks[networkId].nodeUrl
      if (!(await isNetworkLive(nodeUrl))) {
        throw new Error(`${networkId} is not live`)
      }

      web3.setCurrentNodeProvider(nodeUrl)
      const connectedFullNodeVersion = (await web3.getCurrentNodeProvider().infos.getInfosVersion()).version
      const sdkFullNodeVersion = getSdkFullNodeVersion()
      checkFullNodeVersion(connectedFullNodeVersion.slice(1), sdkFullNodeVersion)
      console.log(`Full node version: ${connectedFullNodeVersion}`)

      const cwd = path.resolve(process.cwd())
      const project = await Project.compile(
        config.compilerOptions,
        cwd,
        config.sourceDir,
        config.artifactDir,
        connectedFullNodeVersion,
        config.forceRecompile,
        config.skipRecompileIfDeployedOnMainnet,
        config.skipRecompileContracts ?? [],
        config.networks['mainnet'].nodeUrl
      )
      console.log('✅ Compilation completed!')
      if (options.skipGenerate) {
        return
      }
      codegen(project)
      console.log('✅ Codegen completed!')
    } catch (error) {
      program.error(`✘ Failed to compile, error: ${buildErrorOutput(error, isDebugModeEnabled())}`)
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

function tryGetScriptIndex(str: string | undefined): number | undefined {
  if (str === undefined) return undefined
  const num = parseInt(str)
  if (num.toString() !== str || num < 0) {
    throw new Error(`Invalid script index: ${str}`)
  }
  return num
}

program
  .command('deploy')
  .description('deploy contracts')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .option('-n, --network <network-type>', 'specify the network to use')
  .option(
    '-f, --from <number>',
    'run scripts from a specific index, the number refers to the prefix of the script file'
  )
  .option(
    '-t, --to <number>',
    'run scripts to a specific index(inclusive), the number refers to the prefix of the script file'
  )
  .option('--debug', 'show detailed debug information such as error stack traces')
  .option('--silent', 'remove deployment log output')
  .action(async (options) => {
    try {
      const config = getConfig(options)
      const networkId = checkAndGetNetworkId(options.network)
      const fromIndex = tryGetScriptIndex(options.from)
      const toIndex = tryGetScriptIndex(options.to)
      if (config.enableDebugMode && options.silent) {
        throw new Error('The `--silent` and `--debug` options cannot be enabled at the same time')
      }
      await deployAndSaveProgress(config, networkId, options.silent, fromIndex, toIndex)
    } catch (error) {
      program.error(`✘ Failed to deploy contracts, error: ${buildErrorOutput(error, isDebugModeEnabled())}`)
    }
  })

program
  .command('gen-interfaces')
  .description('generate interfaces based on contract artifacts')
  .requiredOption('-a, --artifactDir <artifact-dir>', 'the contract artifacts root dir')
  .requiredOption('-o, --outputDir <output-dir>', 'the dir where the generated interfaces will be saved')
  .action(async (options) => {
    try {
      await genInterfaces(options.artifactDir, options.outputDir)
    } catch (error) {
      program.error(`✘ Failed to generate interfaces, error: `, error)
    }
  })

program.parseAsync(process.argv)
