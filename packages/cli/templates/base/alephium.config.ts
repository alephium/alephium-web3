import { Configuration } from "@alephium/cli/types"

export type Settings = {
  btcPrice: number
}

const defaultSettings: Settings = { btcPrice: 1 }

const configuration: Configuration<Settings> = {
  sourcePath: "contracts",
  artifactPath: "artifacts",

  defaultNetwork: "devnet",
  networks: {
    "devnet": {
      nodeUrl: "http://localhost:22973",
      mnemonic: "vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava",
      settings: defaultSettings
    },

    "testnet": {
      nodeUrl: "http://localhost:22973",
      mnemonic: process.env.MNEMONIC as string,
      settings: defaultSettings
    },

    "mainnet": {
      nodeUrl: "http://localhost:22973",
      mnemonic: process.env.MNEMONIC as string,
      settings: defaultSettings
    },
  }
}

export default configuration
