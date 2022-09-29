import { Configuration } from '@alephium/cli'
import { Number256 } from '@alephium/web3'

// Settings are usually for configuring
export type Settings = {
  issueTokenAmount: Number256
}
const defaultSettings: Settings = { issueTokenAmount: 100 }

const configuration: Configuration<Settings> = {
  defaultNetwork: 'devnet',
  toDeployGroups: [0, 1, 2, 3], // here we could configure which address groups to deploy the contract
  networks: {
    devnet: {
      nodeUrl: 'http://localhost:22973',
      mnemonic:
        'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava',
      settings: defaultSettings
    },

    testnet: {
      nodeUrl: process.env.NODE_URL as string,
      mnemonic: process.env.MNEMONIC as string,
      settings: defaultSettings
    },

    mainnet: {
      nodeUrl: process.env.NODE_URL as string,
      mnemonic: process.env.MNEMONIC as string,
      settings: defaultSettings
    }
  }
}

export default configuration
