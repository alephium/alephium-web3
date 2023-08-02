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
import fs, { ReadStream } from 'fs'
import path from 'path'
import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from 'openai'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { validateNFTBaseUri, NFTTokenUriMetaData, validNFTUriMetadataAttributeTypes } from '@alephium/web3'
import { parse } from 'yaml'

export interface NFTMetadataConfig {
  name?: string
  description?: string
  attributes?: [
    {
      [key: string]: string | number | boolean
    }
  ]
}

const validMetadataConfigFields = ['name', 'description', 'attributes']

export async function generateImagesWithOpenAI(
  openaiApiKey: string,
  prompt: string,
  numberOfImages: number,
  imageSize: CreateImageRequestSizeEnum,
  storedDir: string
) {
  if (!fs.existsSync(storedDir)) {
    fs.mkdirSync(storedDir, { recursive: true })
  }

  const configuration = new Configuration({
    apiKey: openaiApiKey
  })
  const openai = new OpenAIApi(configuration)
  const response = await openai.createImage({
    prompt: prompt,
    n: numberOfImages,
    size: imageSize
  })

  for (let i = 0; i < numberOfImages; i++) {
    const imageUrl = response.data.data[i].url!
    const imageResponse: Response = await fetch(imageUrl)
    const fileStream = fs.createWriteStream(`${storedDir}/${i}`, { flags: 'wx' })
    // @ts-ignore
    await imageResponse.body!.pipe(fileStream)
  }
}

export async function uploadImagesAndMetadataToIPFS(
  localDir: string,
  ipfsDir: string,
  metadataConfigFile: string,
  infuraProjectId: string,
  infuraProjectSecret: string
): Promise<string | undefined> {
  const metadataConfig = parseNFTMetadataConfig(metadataConfigFile, localDir)
  console.log(metadataConfig)

  const files = Object.keys(metadataConfig)

  const toBeUploaded: { path: string, content: ReadStream }[] = []
  files.forEach((file) => {
    const localFilePath = path.join(localDir, file)
    const ipfsFilePath = path.join(ipfsDir, file)
    const fileStream = fs.createReadStream(localFilePath)
    toBeUploaded.push({ path: ipfsFilePath, content: fileStream })
    return file
  })

  const totalUploaded = toBeUploaded.length
  if (totalUploaded > 0) {
    const ipfsClient = createIPFSClient(infuraProjectId, infuraProjectSecret)

    let remoteDirURL: string | undefined = undefined
    const metadata: NFTTokenUriMetaData[] = []
    for await (const result of ipfsClient.addAll(toBeUploaded)) {
      if (result.path === ipfsDir) {
        remoteDirURL = `https://ipfs.io/ipfs/${result.cid.toString()}`
      }
    }

    const numberLength = totalUploaded.toString().length
    if (remoteDirURL) {
      files.forEach((file, index) => {
        metadata.push({
          name: metadataConfig[file]?.name ?? `#${padding(index, numberLength)}`,
          description: metadataConfig[file]?.description,
          image: `${remoteDirURL}/${file}`,
          attributes: convertAttributes(metadataConfig[file]?.attributes)
        })
      })
    }

    return await uploadImageMetadataToIPFS(ipfsDir, metadata, infuraProjectId, infuraProjectSecret)
  } else {
    throw new Error(`Directory ${localDir} is empty`)
  }
}

export function validateMetadataConfig(config: object, localDir: string): NFTMetadataConfig {
  const images = Object.keys(config)

  images.forEach((image) => {
    const fileExists = fs.existsSync(path.join(localDir, image))
    if (!fileExists) {
      throw new Error(`File ${image} does not exist in ${localDir}`)
    }

    const metadata = (config[image] as NFTMetadataConfig) || {}

    Object.keys(metadata).forEach((key) => {
      if (!validMetadataConfigFields.includes(key)) {
        throw new Error(`Invalid field ${key} in ${metadata}, only ${validMetadataConfigFields} are allowed`)
      }
    })

    validateStringTypeIfExists(image, metadata, 'name')
    validateStringTypeIfExists(image, metadata, 'description')
    validateAttributesTypeIfExists(image, metadata['attributes'])
  })

  return config as NFTMetadataConfig
}

function createIPFSClient(projectId: string, projectSecret: string) {
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

  return ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth
    }
  })
}

function validateStringTypeIfExists(parent: string, obj: object, key: string) {
  if (!!obj[key] && typeof obj[key] !== 'string') {
    throw new Error(`Key '${key}' under '${parent}' should be a string`)
  }
}

function validateAttributesTypeIfExists(parent: string, attributes?: object) {
  if (!!attributes) {
    if (!Array.isArray(attributes)) {
      throw new Error(`Field 'attributes' under '${parent}' should be an array`)
    }

    attributes.forEach((item) => {
      if (typeof item !== 'object') {
        throw new Error(`Field 'attributes' under '${parent}' should be an array of objects`)
      }

      Object.keys(item).forEach((key) => {
        if (!validNFTUriMetadataAttributeTypes.includes(typeof item[key])) {
          throw new Error(
            `Field '${key}' in 'attributes' should be a string, boolean or number, but is ${typeof item[key]}`
          )
        }
      })
    })
  }
}

async function uploadImageMetadataToIPFS(
  ipfsDir: string,
  metadataz: any[],
  infuraProjectId: string,
  infuraProjectSecret: string
): Promise<string | undefined> {
  const toBeUploaded: { path: string, content: string }[] = []
  metadataz.forEach((metadata, index) => {
    const remoteFilePath = path.join(ipfsDir, index.toString())
    toBeUploaded.push({ path: remoteFilePath, content: JSON.stringify(metadata) })
  })

  if (toBeUploaded.length > 0) {
    const ipfsClient = createIPFSClient(infuraProjectId, infuraProjectSecret)
    let remoteDirURL: string | undefined = undefined
    for await (const result of ipfsClient.addAll(toBeUploaded)) {
      if (result.path === ipfsDir) {
        remoteDirURL = `https://ipfs.io/ipfs/${result.cid.toString()}/`
      }
    }

    return remoteDirURL
  } else {
    throw new Error(`Empty metadata`)
  }
}

function parseNFTMetadataConfig(file: string, localImageDir: string): NFTMetadataConfig {
  const content = fs.readFileSync(file, 'utf8')
  const parsedContent = parse(content)
  return validateMetadataConfig(parsedContent, localImageDir)
}

function convertAttributes(attributes: NFTMetadataConfig['attributes']): NFTTokenUriMetaData['attributes'] {
  if (attributes) {
    return attributes.map((attribute) => {
      const traitType = Object.keys(attribute)[0]
      const value = attribute[traitType]
      return { trait_type: traitType, value: value }
    }) as NFTTokenUriMetaData['attributes']
  }
}

function padding(num: number, size: number): string {
  return num.toString().padStart(size, '0')
}
