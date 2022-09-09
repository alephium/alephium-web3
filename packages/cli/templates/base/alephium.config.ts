import { Configuration } from "@alephium/cli/types"

export type Settings = {
  btcPrice: number
}

const defaultSettings: Settings = { btcPrice: 1 }

const configuration: Configuration<Settings> = {
  sourcePath: "contracts",
  artifactPath: "artifacts",

  deployScriptsPath: "scripts",
  compilerOptions: {
    errorOnWarnings: true
  },

  defaultNetwork: "devnet",
  networks: {
    "devnet": {
      networkId: 4,
      nodeUrl: "http://localhost:22973",
      mnemonic: "vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava",
      deploymentFile: ".deployments.json",
      confirmations: 0,
      settings: defaultSettings
    },

    "testnet": {
      networkId: 1,
      nodeUrl: "http://localhost:22973",
      mnemonic: process.env.MNEMONIC as string,
      deploymentFile: ".deployments.json",
      confirmations: 2,
      settings: defaultSettings
    },

    "mainnet": {
      networkId: 0,
      nodeUrl: "http://localhost:22973",
      mnemonic: process.env.MNEMONIC as string,
      deploymentFile: ".deployments.json",
      confirmations: 2,
      settings: defaultSettings
    },
  }
}

export default configuration
