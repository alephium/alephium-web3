/*
 * greeter.ts
 */

import { CliqueClient, Contract, Script, Signer, TestContractParams } from 'alephium-web3'

async function greet() {
  const client = new CliqueClient({ baseUrl: 'http://127.0.0.1:22973' })
  await client.init(false)

  const greeter = await Contract.fromSource(client, 'greeter.ral')

  const testParams: TestContractParams = {
    initialFields: [1]
  }
  const testResult = await greeter.testPublicMethod(client, 'greet', testParams)
  console.log(testResult)

  const signer = Signer.testSigner(client)

  const deployTx = await greeter.transactionForDeployment(signer, testParams.initialFields)
  const greeterContractId = deployTx.contractId
  console.log(deployTx.group)

  const submitResult = await signer.submitTransaction(deployTx.unsignedTx, deployTx.txId)
  console.log(submitResult)

  const main = await Script.fromSource(client, 'greeter_main.ral')

  const mainScriptTx = await main.transactionForDeployment(signer, { greeterContractId: greeterContractId })
  console.log(mainScriptTx.group)

  const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
  console.log(mainSubmitResult)
}

greet()
