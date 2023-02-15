import { Deployments } from '@alephium/cli'
import { web3, Project } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'
import configuration from '../alephium.config'
import { TokenFaucet, Withdraw } from '../artifacts/ts'

async function withdraw() {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  // Compile the contracts of the project if they are not compiled
  Project.build()

  // Attention: test wallet is used for demonstration purpose
  const signer = await testNodeWallet()

  const deployments = await Deployments.load(configuration, 'devnet')

  // The test wallet has four accounts with one in each address group
  // The wallet calls withdraw function for all of the address groups
  for (const account of await signer.getAccounts()) {
    // Set an active account to prepare and sign transactions
    await signer.setSelectedAddress(account.address)
    const accountGroup = account.group

    // Load the metadata of the deployed contract in the right group
    const deployed = deployments.getDeployedContractResult(accountGroup, 'TokenFaucet')
    const tokenId = deployed.contractId
    const tokenAddress = deployed.contractAddress

    // Submit a transaction to use the transaction script
    await Withdraw.execute(signer, {
      initialFields: { token: tokenId, amount: 1n }
    })

    const faucet = TokenFaucet.at(tokenAddress)
    // Fetch the latest state of the token contract
    const state = await faucet.fetchState()
    console.log(JSON.stringify(state.fields, null, '  '))
  }
}

withdraw()
