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

import { Project, web3, NetworkId, networkIds, validateNFTBaseUri, enableDebugMode } from '@alephium/web3'
import { program } from 'commander'
import { run as runJestTests } from 'jest'
import path from 'path'
import { deployAndSaveProgress } from './scripts/deploy'
import { Configuration, DEFAULT_CONFIGURATION_VALUES } from './src/types'
import { createProject } from './scripts/create-project'
import { generateImagesWithOpenAI, uploadImagesAndMetadataToIPFS } from './scripts/pre-designed-nft'
import { codegen, getConfigFile, isNetworkLive, loadConfig } from './src'

function getConfig(options: any): Configuration {
  const configFile = options.config ? (options.config as string) : getConfigFile()
  console.log(`Loading alephium config file: ${configFile}`)
  const config = loadConfig(configFile)
  if (config.enableDebugMode || options.debug) enableDebugMode()
  return config
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

const templateTypes = ['base', 'react', 'nextjs']

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
      const fullNodeVersion = (await web3.getCurrentNodeProvider().infos.getInfosVersion()).version
      console.log(`Full node version: ${fullNodeVersion}`)
      const cwd = path.resolve(process.cwd())
      await Project.build(config.compilerOptions, cwd, config.sourceDir, config.artifactDir, fullNodeVersion)
      console.log('✅ Compilation completed!')
      if (options.skipGenerate) {
        return
      }
      const artifactDir = config.artifactDir! // there is a default value always
      codegen(artifactDir)
      console.log('✅ Codegen completed!')
    } catch (error) {
      program.error(`✘ Failed to compile, error: ${buildErrorOutput(error, options.debug)}`)
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
  .action(async (options) => {
    try {
      const config = getConfig(options)
      const networkId = checkAndGetNetworkId(options.network)
      const fromIndex = tryGetScriptIndex(options.from)
      const toIndex = tryGetScriptIndex(options.to)
      await deployAndSaveProgress(config, networkId, fromIndex, toIndex)
    } catch (error) {
      program.error(`✘ Failed to deploy contracts, error: ${buildErrorOutput(error, options.debug)}`)
    }
  })

const nftCommand = program.command('nft').description('nft subcommand')

nftCommand
  .command('generate-images-with-openai')
  .description('generate images using OpenAI')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .option('-n, --network <network-type>', 'specify the network to use', 'devnet')
  .option('-d, --dir <directory-of-stored-images>', 'directory where to store the images')
  .option('-n, --number <number-of-images>', 'number of images to generate', '1')
  .option('-s, --size <size-of-image>', 'size of the image to generate', '512x512')
  .option('--debug', 'show detailed debug information such as error stack traces')
  .action(async (options, args) => {
    try {
      const config = getConfig(options)
      const networkId = checkAndGetNetworkId(options.network)
      const openaiAPIKey = config.networks[networkId].settings.openaiAPIKey
      if (!openaiAPIKey) {
        throw new Error('OpenAI API key not specified')
      }
      const numberOfImages = Number(options.number)
      const imageSize = options.size as CreateImageRequestSizeEnum
      const prompt = args.args.join(' ')
      const storedDir = options.dir as string

      await generateImagesWithOpenAI(openaiAPIKey, prompt, numberOfImages, imageSize, storedDir)
    } catch (error) {
      program.error(`✘ Failed to generate images, error: ${buildErrorOutput(error, options.debug)}`)
    }
  })

nftCommand
  .command('upload-images-and-metadata-to-ipfs')
  .description('upload images to IPFS')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .option('-n, --network <network-type>', 'specify the network to use', 'devnet')
  .option('-d, --localDir <directory-of-local-images>', 'directory of local images to be uploaded')
  .option('-i, --ipfsDir <ipfs-directory-of-uploaded-images>', 'IPFS directory to upload the images')
  .option('-m, --metadataFile <metadata-file>', 'file to store the metadata of the uploaded images')
  .option('--debug', 'show detailed debug information such as error stack traces')
  .action(async (options) => {
    try {
      const localDir = options.localDir as string
      const ipfsDir = options.ipfsDir as string
      const metadataFile = options.metadataFile as string
      const config = getConfig(options)
      const networkId = checkAndGetNetworkId(options.network)
      const settings = config.networks[networkId].settings
      const projectId = settings.ipfs.infura.projectId
      const projectSecret = settings.ipfs.infura.projectSecret
      if (!projectId || !projectSecret) {
        throw new Error('Infura project id or secret not specified')
      }

      const result = await uploadImagesAndMetadataToIPFS(localDir, ipfsDir, metadataFile, projectId, projectSecret)
      console.log('NFTBaseUri:')
      console.log(result)
    } catch (error) {
      program.error(`✘ Failed to upload images, error: ${buildErrorOutput(error, options.debug)}`)
    }
  })

nftCommand
  .command('validate-nft-base-uri')
  .description('validate nft base uri for pre-designed collection')
  .option('-n, --nftBaseUri <nft-base-uri>', 'NFT base uri')
  .option('-m, --maxSupply <max-supply-of-the-pre-designed-collection>', 'max supply of the NFT collection')
  .option('--debug', 'show detailed debug information such as error stack traces')
  .action(async (options) => {
    try {
      const nftBaseUri = options.nftBaseUri as string
      const maxSupply = Number(options.maxSupply)
      const result = await validateNFTBaseUri(nftBaseUri, maxSupply)
      console.log('Token Metadataz:')
      console.log(result)
    } catch (error) {
      program.error(`✘ Failed to upload images metadata, error: ${buildErrorOutput(error, options.debug)}`)
    }
  })

program.parseAsync(process.argv)
