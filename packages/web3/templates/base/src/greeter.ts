/*
 * greeter.ts
 */

import { TestContractParams, web3, Project } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3/test'

async function greet() {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  await Project.build()

  const greeter = Project.contract('Greeter')

  const testParams: TestContractParams = {
    initialFields: { btcPrice: 1 }
  }
  const testResult = await greeter.testPublicMethod('greet', testParams)
  console.log(testResult)

  const signer = await testNodeWallet()

  const deployTx = await greeter.transactionForDeployment(signer, { initialFields: testParams.initialFields })
  const greeterContractId = deployTx.contractId
  console.log(deployTx.fromGroup)
  console.log(deployTx.toGroup)

  const submitResult = await signer.submitTransaction(deployTx.unsignedTx, deployTx.txId)
  console.log(submitResult)

  const main = Project.script('GreeterMain')

  const mainScriptTx = await main.transactionForDeployment(signer, {
    initialFields: { greeterContractId: greeterContractId }
  })
  console.log(mainScriptTx.fromGroup)
  console.log(mainScriptTx.toGroup)

  const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
  console.log(mainSubmitResult)
}

greet()
