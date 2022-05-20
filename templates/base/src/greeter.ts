/*
 * greeter.ts
 */

import { NodeProvider, Contract, Script, Signer, TestContractParams } from 'alephium-web3'

async function greet() {
  const provider = new NodeProvider('http://127.0.0.1:22973')

  const greeter = await Contract.fromSource(provider, 'greeter.ral')

  const testParams: TestContractParams = {
    initialFields: [1]
  }
  const testResult = await greeter.testPublicMethod(provider, 'greet', testParams)
  console.log(testResult)

  const signer = Signer.testSigner(provider)

  const deployTx = await greeter.transactionForDeployment(signer, testParams.initialFields)
  const greeterContractId = deployTx.contractId
  console.log(deployTx.group)

  const submitResult = await signer.submitTransaction(deployTx.unsignedTx, deployTx.txId)
  console.log(submitResult)

  const main = await Script.fromSource(provider, 'greeter_main.ral')

  const mainScriptTx = await main.transactionForDeployment(signer, { greeterContractId: greeterContractId })
  console.log(mainScriptTx.group)

  const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
  console.log(mainSubmitResult)
}

greet()
