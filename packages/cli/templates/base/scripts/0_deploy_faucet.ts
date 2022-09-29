import { Deployer, DeployFunction, Network } from "@alephium/cli"
import { Project } from "@alephium/web3"
import { Settings } from "../alephium.config"

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployFaucet: DeployFunction<Settings> = async (deployer: Deployer, network: Network<Settings>): Promise<void> => {
  // Get the faucet contract
  const token = Project.contract("TokenFaucet")
  // Get settings
  const issueTokenAmount = network.settings.issueTokenAmount
  const result = await deployer.deployContract(token, {
    // The amount of token to be issued
    issueTokenAmount: issueTokenAmount,
    // The initial states of the faucet contract
    initialFields: { supply: issueTokenAmount, balance: issueTokenAmount }
  })
  console.log("Token faucet contract id: " + result.contractId)
  console.log("Token faucet contract address: " + result.contractAddress)
}

export default deployFaucet
