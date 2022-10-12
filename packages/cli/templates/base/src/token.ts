import { Deployments } from '@alephium/cli'
import { web3, Script, Project, Contract } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'
import configuration from '../alephium.config'
import tokenContractJson from '../artifacts/token.ral.json'
import withdrawJson from '../artifacts/withdraw.ral.json'

async function withdraw() {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  // Compile the contracts of the project if they are not compiled
  Project.build()

  // Load the transaction script from compiled artifacts
  const script = Script.fromJson(withdrawJson)
  // Load the token contract from compiled artifacts
  const token = Contract.fromJson(tokenContractJson)
  // Attention: test wallet is used for demonstration purpose
  const signer = await testNodeWallet()

  const deployments = await Deployments.load(configuration, 'devnet')

  // The test wallet has four accounts with one in each address group
  // The wallet calls withdraw function for all of the address groups
  for (const account of await signer.getAccounts()) {
    // Set an active account to prepare and sign transactions
    await signer.setSelectedAccount(account.address)
    const accountGroup = account.group

    // Load the metadata of the deployed contract in the right group
    const deployed = deployments.getDeployedContractResult(accountGroup, 'TokenFaucet')
    const tokenId = deployed.contractId
    const tokenAddress = deployed.contractAddress

    // Submit a transaction to use the transaction script
    const withdrawTX = await script.execute(signer, {
      initialFields: { token: tokenId, amount: 1n }
    })

    // Fetch the latest state of the token contract
    let state = await token.fetchState(tokenAddress, accountGroup)
    console.log(JSON.stringify(state.fields, null, '  '))
  }
}

withdraw()
