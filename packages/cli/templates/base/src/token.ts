import { Deployments } from '@alephium/cli'
import { web3, DUST_AMOUNT } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'
import configuration from '../alephium.config'
import { TokenFaucet } from '../artifacts/ts'

async function withdraw() {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

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
    const faucet = deployments.getInstance(TokenFaucet, accountGroup)
    if (faucet === undefined) {
      console.log(`The contract is not deployed on group ${account.group}`)
      continue
    }
    const tokenId = faucet.contractId
    const tokenAddress = faucet.address
    console.log(`Token faucet contract id: ${tokenId}`)
    console.log(`Token faucet contract address: ${tokenAddress}`)

    // Submit a transaction to use the transaction script
    await faucet.transact.withdraw({
      signer: signer,
      attoAlphAmount: DUST_AMOUNT * 2n,
      args: {
        amount: 1n
      },
    })

    // Fetch the latest state of the token contract
    const state = await faucet.fetchState()
    console.log(JSON.stringify(state.fields, null, '  '))
  }
}

withdraw()
