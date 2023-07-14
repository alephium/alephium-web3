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

import { Project, web3, NetworkId, networkIds, validateEnumerableNFTBaseUri } from '@alephium/web3'
import { program } from 'commander'
import { run as runJestTests } from 'jest'
import path from 'path'
import { deployAndSaveProgress } from './scripts/deploy'
import { Configuration, DEFAULT_CONFIGURATION_VALUES } from './src/types'
import { startDevnet } from './scripts/start-devnet'
import { stopDevnet } from './scripts/stop-devnet'
import { createProject } from './scripts/create-project'
import { generateImagesWithOpenAI, uploadImagesAndMetadataToIPFS } from './scripts/pre-designed-nft'
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
      const networkId = checkAndGetNetworkId(options.network)
      const nodeUrl = config.networks[networkId].nodeUrl
      if (!(await isNetworkLive(nodeUrl))) {
        console.log(`${networkId} is not live`)
        process.exit(1)
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

program
  .command('generate-images-with-openai')
  .description('Generate images using OpenAI')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .option('-n, --network <network-type>', 'specify the network to use', 'devnet')
  .option('-d, --dir <directory-of-stored-images>', 'Directory where to store the images')
  .option('-n, --number <number-of-images>', 'Number of images to generate', '1')
  .option('-s, --size <size-of-image>', 'Size of the image to generate', '512x512')
  .action(async (options, args) => {
    try {
      const config = getConfig(options)
      const networkId = checkAndGetNetworkId(options.network)
      const openaiAPIKey = config.networks[networkId].settings.openaiAPIKey
      if (!openaiAPIKey) {
        program.error('OpenAI API key not specified')
      }
      const numberOfImages = Number(options.number)
      const imageSize = options.size as CreateImageRequestSizeEnum
      const prompt = args.args.join(' ')
      const storedDir = options.dir as string

      await generateImagesWithOpenAI(openaiAPIKey, prompt, numberOfImages, imageSize, storedDir)
    } catch (error) {
      program.error(`Failed to generate images, error: ${(error as Error).stack}`)
    }
  })

program
  .command('upload-images-and-metadata-to-ipfs')
  .description('Upload images to IPFS')
  .option('-c, --config <config-file>', 'project config file (default: alephium.config.{ts|js})')
  .option('-n, --network <network-type>', 'specify the network to use', 'devnet')
  .option('-d, --localDir <directory-of-local-images>', 'Directory of local images to be uploaded')
  .option('-i, --ipfsDir <ipfs-directory-of-uploaded-images>', 'IPFS directory to upload the images')
  .option('-m, --metadataFile <metadata-file>', 'File to store the metadata of the uploaded images')
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
        program.error('Infura project id or secret not specified')
      }

      const result = await uploadImagesAndMetadataToIPFS(localDir, ipfsDir, metadataFile, projectId, projectSecret)
      console.log('NFTBaseUri:')
      console.log(result)
    } catch (error) {
      program.error(`Failed to upload images, error: ${(error as Error).stack}`)
    }
  })

program
  .command('validate-enumerable-nft-base-uri')
  .description('Validate token base uri for pre-designed collection')
  .option('-n, --nftBaseUri <nft-based-uri>', 'Enumerable NFT based uri')
  .option('-m, --maxSupply <max-supply-of-the-pre-designed-collection>', 'MaxSupply of the enumerable NFT collection')
  .action(async (options) => {
    try {
      const nftBaseUri = options.nftBaseUri as string
      const maxSupply = Number(options.maxSupply)
      const result = await validateEnumerableNFTBaseUri(nftBaseUri, maxSupply)
      console.log('Token Metadataz:')
      console.log(result)
    } catch (error) {
      program.error(`Failed to upload images metadata, error: ${(error as Error).stack} `)
    }
  })

program.parseAsync(process.argv)
