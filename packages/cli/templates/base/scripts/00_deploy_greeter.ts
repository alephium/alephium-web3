import { Deployer, DeployFunction, Network } from "@alephium/cli/types"
import { Project } from "@alephium/web3"
import { Settings } from "../alephium.config"

const deployGreeter: DeployFunction<Settings> = async (deployer: Deployer, network: Network<Settings>): Promise<void> => {
  const greeter = Project.contract("Greeter")
  const result = await deployer.deployContract(greeter, {initialFields: {
    'btcPrice': network.settings.btcPrice
  }})
  console.log("Greeter contract id: " + result.contractId)
  console.log("Greeter contract address: " + result.contractAddress)
}

export default deployGreeter
