/*
 * greeter.ts
 */

import { NodeProvider, Contract, Script, TestContractParams } from 'alephium-web3'
import { testWallet } from 'alephium-web3/test'

async function greet() {
  const provider = new NodeProvider('http://127.0.0.1:22973')

  const greeter = await Contract.fromSource(provider, 'greeter.ral')

  const testParams: TestContractParams = {
    initialFields: { btcPrice: 1 }
  }
  const testResult = await greeter.testPublicMethod(provider, 'greet', testParams)
  console.log(testResult)

  const signer = await testWallet(provider)

  const deployTx = await greeter.transactionForDeployment(signer, { initialFields: testParams.initialFields })
  const greeterContractId = deployTx.contractId
  console.log(deployTx.fromGroup)
  console.log(deployTx.toGroup)

  const submitResult = await signer.submitTransaction(deployTx.unsignedTx, deployTx.txId)
  console.log(submitResult)

  const main = await Script.fromSource(provider, 'greeter_main.ral')

  const mainScriptTx = await main.transactionForDeployment(signer, {
    initialFields: { greeterContractId: greeterContractId }
  })
  console.log(mainScriptTx.fromGroup)
  console.log(mainScriptTx.toGroup)

  const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
  console.log(mainSubmitResult)
}

greet()
