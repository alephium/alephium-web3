import { web3, Project, TestContractParams, addressFromContractId, AssetOutput, Contract, Script } from '@alephium/web3'
import { expectAssertionError, randomContractId, testAddress, testNodeWallet } from '@alephium/web3-test'
import { deployToDevnet } from '@alephium/cli'
import tokenContractJson from '../artifacts/token.ral.json'
import withdrawJson from '../artifacts/withdraw.ral.json'

describe("unit tests", () => {
  let token: Contract
  let testContractId: string
  let testTokenId: string
  let testContractAddress: string
  let testParamsFixture: TestContractParams

  // We initialize the fixture variables before all tests
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    await Project.build()
    token = Project.contract('TokenFaucet')
    testContractId = randomContractId()
    testTokenId = testContractId
    testContractAddress = addressFromContractId(testContractId)
    testParamsFixture = {
      // a random address that the test contract resides in the tests
      address: testContractAddress,
      // assets owned by the test contract before a test
      initialAsset: { alphAmount: 1e18, tokens: [{id: testTokenId, amount: 10 }]},
      // initial state of the test contract
      initialFields: { supply: 1e18, balance: 10 },
      // arguments to test the target function of the test contract
      testArgs: { amount: 1 },
      // assets owned by the caller of the function
      inputAssets: [{ address: testAddress, asset: { alphAmount: 1e18 } }]
    }
  })

  it("test withdraw", async () => {
    const testParams = testParamsFixture
    const testResult = await token.testPublicMethod('withdraw', testParams)

    // only one contract involved in the test
    const contractState = testResult.contracts[0]
    expect(contractState.address).toEqual(testContractAddress)
    expect(contractState.fields.supply).toEqual(BigInt(1e18))
    // the balance of the test token is: 10 - 1 = 9
    expect(contractState.fields.balance).toEqual(9)
    // double check the balance of the contract assets
    expect(contractState.asset).toEqual({ alphAmount: BigInt(1e18), tokens: [{id: testTokenId, amount: 9 }]})

    // two transaction outputs in total
    expect(testResult.txOutputs.length).toEqual(2)

    // the first transaction output is for the caller
    const callerOutput = testResult.txOutputs[0] as AssetOutput
    expect(callerOutput.type).toEqual('AssetOutput')
    expect(callerOutput.address).toEqual(testAddress)
    expect(callerOutput.alphAmount).toBeLessThan(BigInt(1e18)) // the caller paid gas
    // the caller withdrawn 1 token from the contract
    expect(callerOutput.tokens).toEqual([{ id: testTokenId, amount: 1 }])

    // the second transaction output is for the contract
    const contractOutput = testResult.txOutputs[1]
    expect(contractOutput.type).toEqual('ContractOutput')
    expect(contractOutput.address).toEqual(testContractAddress)
    expect(contractOutput.alphAmount).toEqual(BigInt(1e18))
    // the contract has transferred 1 token to the caller
    expect(contractOutput.tokens).toEqual([{ id: testTokenId, amount: 9 }])

    // a `Withdraw` event is emitted when the test passes
    expect(testResult.events.length).toEqual(1)
    const event = testResult.events[0]
    // the event is emitted by the test contract
    expect(event.contractAddress).toEqual(testContractAddress)
    // the name of the event is `Withdraw`
    expect(event.name).toEqual('Withdraw')
    // the first field of the event
    expect(event.fields.to).toEqual(testAddress)
    // the second field of the event
    expect(event.fields.amount).toEqual(1)

    // the test framework support debug messages too
    // debug will be disabled automatically at the deployment to real networks
    expect(testResult.debugMessages).toEqual([{contractAddress: testContractAddress, message: 'The current balance is 10'}])
  })

  it("test withdraw", async () => {
    const testParams: TestContractParams = { ...testParamsFixture, testArgs: { amount: 3 } }
    // test that assertion failed in the withdraw function
    await expectAssertionError(token.testPublicMethod('withdraw', testParams), testContractAddress, 0)
  })
})

describe("integration tests", () => {
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    await Project.build()
  })

  it("should withdraw on devnet", async () => {
    const script = Script.fromJson(withdrawJson)
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()

    // Test with all of the addresses of the wallet
    for (const account of await signer.getAccounts()) {
      const testAddress = account.address
      await signer.setSelectedAccount(testAddress)
      const testGroup = account.group

      // The contract is deployed to all groups
      const deployed = deployments.getDeployedContractResult(testGroup, 'TokenFaucet')
      const tokenId = deployed.contractId
      const tokenAddress = deployed.contractAddress
      expect(deployed.groupIndex).toEqual(testGroup)

      const token = Contract.fromJson(tokenContractJson)
      const initialState = await token.fetchState(tokenAddress, testGroup)
      const initialBalance = initialState.fields.balance as number

      // Call `withdraw` function 10 times
      for (let i = 0; i < 10; i++) {
        const withdrawTX = await script.transactionForDeployment(signer, {
          initialFields: { token: tokenId, amount: 1 }
        })

        await signer.submitTransaction(withdrawTX.unsignedTx)

        const newState = await token.fetchState(tokenAddress, testGroup)
        const newBalance = newState.fields.balance as number
        expect(newBalance).toEqual(initialBalance - i - 1)
      }
    }
  }, 20000)
})
