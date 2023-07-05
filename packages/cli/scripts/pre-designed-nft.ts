import fs from 'fs'
import path from 'path'
import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from 'openai'
import { create as ipfsHttpClient } from 'ipfs-http-client'

export async function generateImagesWithOpenAI(
  openaiApiKey: string,
  prompt: string,
  numberOfImages: number,
  imageSize: CreateImageRequestSizeEnum,
  storedDir: string
) {
  if (!fs.existsSync(storedDir)) {
    throw new Error(`Directory ${storedDir} does not exist`)
  }

  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createImage({
    prompt: prompt,
    n: numberOfImages,
    size: imageSize
  })

  for (let i = 0; i < numberOfImages; i++) {
    const imageUrl = response.data.data[i].url
    const imageResponse = await fetch(imageUrl)
    const fileStream = fs.createWriteStream(`${storedDir}/${i}`, { flags: 'wx' });
    await imageResponse.body.pipe(fileStream);
  }
}

export async function uploadImagesToIPFS(
  localDir: string,
  ipfsDir: string,
  metadataFile: string,
  infuraProjectId: string,
  infuraProjectSecret: string
) {
  if (fs.existsSync(localDir)) {
    const files = fs.readdirSync(localDir, { recursive: true });

    const toBeUploaded = []
    for (const file of files) {
      const localFilePath = path.join(localDir, file);
      const ipfsFilePath = path.join(ipfsDir, file);
      const fileStream = fs.createReadStream(localFilePath);
      toBeUploaded.push({ path: ipfsFilePath, content: fileStream })
    }

    if (toBeUploaded.length > 0) {
      const ipfsClient = createIPFSClient(infuraProjectId, infuraProjectSecret)

      let remoteDirURL: string | undefined = undefined
      const metadata = []
      for await (const result of ipfsClient.addAll(toBeUploaded)) {
        if (result.path === ipfsDir) {
          remoteDirURL = `https://ipfs.io/ipfs/${result.cid.toString()}`
        }
      }

      if (remoteDirURL) {
        for (const file of files) {
          metadata.push({
            "name": file,
            "description": "",
            "image": `${remoteDirURL}/${file}`
          })
        }
      }

      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2))
      console.log(metadata)
    } else {
      throw new Error(`Directory ${localDir} is empty`)
    }
  } else {
    throw new Error(`Directory ${localDir} does not exist`)
  }
}

export async function uploadImageMetadataToIPFS(
  ipfsDir: string,
  metadataFile: string,
  infuraProjectId: string,
  infuraProjectSecret: string
) {
  if (fs.existsSync(metadataFile)) {
    const content = fs.readFileSync(metadataFile, 'utf8')
    const metadataz = JSON.parse(content)

    const toBeUploaded = []
    metadataz.forEach((metadata, index) => {
      const remoteFilePath = path.join(ipfsDir, index.toString());
      toBeUploaded.push({ path: remoteFilePath, content: JSON.stringify(metadata) })
    })

    if (toBeUploaded.length > 0) {
      const ipfsClient = createIPFSClient(infuraProjectId, infuraProjectSecret)
      let remoteDirURL: string | undefined = undefined
      for await (const result of ipfsClient.addAll(toBeUploaded)) {
        if (result.path === ipfsDir) {
          remoteDirURL = `https://ipfs.io/ipfs/${result.cid.toString()}`
        }
      }

      console.log("tokenBaseUri", remoteDirURL)
    } else {
      throw new Error(`Directory ${metadataFile} is empty`)
    }
  } else {
    throw new Error(`Directory ${metadataFile} does not exist`)
  }
}

function createIPFSClient(projectId: string, projectSecret: string) {
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

  return ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  })
}