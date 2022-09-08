/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import * as fs from 'fs'
import * as path from 'path'
import { setCurrentNodeProvider } from '@alephium/web3'
import { Contract, Project, Script, TestContractParams } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-wallet'
import { addressFromContractId } from '@alephium/web3'

describe('contract', function () {
  async function testSuite1() {
    setCurrentNodeProvider('http://127.0.0.1:22973')
    await Project.build({ errorOnWarnings: false })

    // ignore unused private function warnings
    const add = Project.contract('add/add.ral')
    const sub = Project.contract('sub/sub.ral')

    const subState = sub.toState({ result: 0 }, { alphAmount: BigInt('1000000000000000000') })
    const testParams: TestContractParams = {
      initialFields: { sub: subState.contractId, result: 0 },
      testArgs: { array: [2, 1] },
      existingContracts: [subState]
    }
    const testResult = await add.testPublicMethod('add', testParams)
    expect(testResult.returns).toEqual([[3, 1]])
    expect(testResult.contracts[0].codeHash).toEqual(sub.codeHash)
    expect(testResult.contracts[0].fields.result).toEqual(1)
    expect(testResult.contracts[1].codeHash).toEqual(add.codeHash)
    expect(testResult.contracts[1].fields.sub).toEqual(subState.contractId)
    expect(testResult.contracts[1].fields.result).toEqual(3)
    const events = testResult.events.sort((a, b) => a.name.localeCompare(b.name))
    expect(events[0].name).toEqual('Add')
    expect(events[0].fields.x).toEqual(2)
    expect(events[0].fields.y).toEqual(1)
    expect(events[1].name).toEqual('Sub')
    expect(events[1].fields.x).toEqual(2)
    expect(events[1].fields.y).toEqual(1)

    const testResultPrivate = await add.testPrivateMethod('addPrivate', testParams)
    expect(testResultPrivate.returns).toEqual([[3, 1]])

    const signer = await testNodeWallet()

    const subDeployTx = await sub.transactionForDeployment(signer, {
      initialFields: { result: 0 },
      initialTokenAmounts: []
    })
    const subContractId = subDeployTx.contractId
    const subContractAddress = addressFromContractId(subContractId)
    expect(subDeployTx.fromGroup).toEqual(0)
    expect(subDeployTx.toGroup).toEqual(0)
    const subSubmitResult = await signer.submitTransaction(subDeployTx.unsignedTx, subDeployTx.txId)
    expect(subSubmitResult.fromGroup).toEqual(0)
    expect(subSubmitResult.toGroup).toEqual(0)
    expect(subSubmitResult.txId).toEqual(subDeployTx.txId)

    const addDeployTx = await add.transactionForDeployment(signer, {
      initialFields: { sub: subContractId, result: 0 },
      initialTokenAmounts: []
    })
    expect(addDeployTx.fromGroup).toEqual(0)
    expect(addDeployTx.toGroup).toEqual(0)
    const addSubmitResult = await signer.submitTransaction(addDeployTx.unsignedTx, addDeployTx.txId)
    expect(addSubmitResult.fromGroup).toEqual(0)
    expect(addSubmitResult.toGroup).toEqual(0)
    expect(addSubmitResult.txId).toEqual(addDeployTx.txId)

    const addContractId = addDeployTx.contractId
    const addContractAddress = addressFromContractId(addContractId)

    // Check state for add/sub before main script is executed
    let fetchedSubState = await sub.fetchState(subContractAddress, 0)
    expect(fetchedSubState.fields.result).toEqual(0)
    let fetchedAddState = await add.fetchState(addContractAddress, 0)
    expect(fetchedAddState.fields.sub).toEqual(subContractId)
    expect(fetchedAddState.fields.result).toEqual(0)

    const main = Project.script('main.ral')
    const mainScriptTx = await main.transactionForDeployment(signer, {
      initialFields: { addContractId: addContractId }
    })
    expect(mainScriptTx.fromGroup).toEqual(0)
    expect(mainScriptTx.toGroup).toEqual(0)
    const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
    expect(mainSubmitResult.fromGroup).toEqual(0)
    expect(mainSubmitResult.toGroup).toEqual(0)

    // Check state for add/sub after main script is executed
    fetchedSubState = await sub.fetchState(subContractAddress, 0)
    expect(fetchedSubState.fields.result).toEqual(1)
    fetchedAddState = await add.fetchState(addContractAddress, 0)
    expect(fetchedAddState.fields.sub).toEqual(subContractId)
    expect(fetchedAddState.fields.result).toEqual(3)
  }

  async function testSuite2() {
    setCurrentNodeProvider('http://127.0.0.1:22973')
    await Project.build({ errorOnWarnings: false })

    const greeter = Project.contract('greeter/greeter.ral')

    const testParams: TestContractParams = {
      initialFields: { btcPrice: 1 }
    }
    const testResult = await greeter.testPublicMethod('greet', testParams)
    expect(testResult.returns).toEqual([1])
    expect(testResult.contracts[0].codeHash).toEqual(greeter.codeHash)
    expect(testResult.contracts[0].fields.btcPrice).toEqual(1)

    const signer = await testNodeWallet()

    const deployTx = await greeter.transactionForDeployment(signer, {
      initialFields: { btcPrice: 1 },
      initialTokenAmounts: []
    })
    expect(deployTx.fromGroup).toEqual(0)
    expect(deployTx.toGroup).toEqual(0)
    const submitResult = await signer.submitTransaction(deployTx.unsignedTx, deployTx.txId)
    expect(submitResult.fromGroup).toEqual(0)
    expect(submitResult.toGroup).toEqual(0)
    expect(submitResult.txId).toEqual(deployTx.txId)

    const greeterContractId = deployTx.contractId
    const main = Project.script('greeter_main.ral')

    const mainScriptTx = await main.transactionForDeployment(signer, {
      initialFields: { greeterContractId: greeterContractId }
    })
    expect(mainScriptTx.fromGroup).toEqual(0)
    expect(mainScriptTx.toGroup).toEqual(0)
    const mainSubmitResult = await signer.submitTransaction(mainScriptTx.unsignedTx, mainScriptTx.txId)
    expect(mainSubmitResult.fromGroup).toEqual(0)
    expect(mainSubmitResult.toGroup).toEqual(0)
  }

  it('should test contracts', async () => {
    await testSuite1()
    await testSuite2()
  })

  function loadJson(fileName: string) {
    const filePath = path.resolve(process.cwd() + path.sep + fileName)
    const rawData = fs.readFileSync(filePath).toString()
    return JSON.parse(rawData)
  }

  function loadContract(fileName: string) {
    Contract.fromJson(loadJson(fileName))
  }

  function loadScript(fileName: string) {
    Script.fromJson(loadJson(fileName))
  }

  it('should load source files by order', async () => {
    const sourceFiles = await Project['loadSourceFiles']('./contracts') // `loadSourceFiles` is a private method
    expect(sourceFiles.length).toEqual(8)
    sourceFiles.slice(0, 5).forEach((c) => expect(c.type).toEqual(0)) // contracts
    sourceFiles.slice(5, 7).forEach((s) => expect(s.type).toEqual(1)) // scripts
    sourceFiles.slice(7).forEach((i) => expect(i.type).toEqual(3)) // interfaces
  })

  it('should load contract from json', async () => {
    loadContract('./artifacts/add/add.ral.json')
    loadContract('./artifacts/sub/sub.ral.json')
    loadScript('./artifacts/main.ral.json')

    loadContract('./artifacts/greeter/greeter.ral.json')
    loadScript('./artifacts/greeter_main.ral.json')
  })

  it('should extract metadata of contracts', async () => {
    setCurrentNodeProvider('http://127.0.0.1:22973')
    await Project.build({ errorOnWarnings: false })

    const contract = Project.contract('test/metadata.ral')
    expect(contract.functions.map((func) => func.name)).toEqual(['foo', 'bar', 'baz'])
    expect(contract.publicFunctions()).toEqual(['foo'])
    expect(contract.usingPreapprovedAssetsFunctions()).toEqual(['foo'])
    expect(contract.usingAssetsInContractFunctions()).toEqual(['bar'])
  })

  it('should handle compiler warnings', async () => {
    setCurrentNodeProvider('http://127.0.0.1:22973')
    await expect(Project.build()).rejects.toThrow(/Compilation warnings\:/)

    await Project.build({ errorOnWarnings: false, ignoreUnusedConstantsWarnings: true })
    expect(Project.currentProject.projectArtifact.infos.get('contracts/test/warnings.ral')!.warnings).toEqual([
      'Found unused variables in Warnings: foo.y',
      'Found unused fields in Warnings: b'
    ])

    await Project.build({ errorOnWarnings: false, ignoreUnusedConstantsWarnings: false })
    expect(Project.currentProject.projectArtifact.infos.get('contracts/test/warnings.ral')!.warnings).toEqual([
      'Found unused variables in Warnings: foo.y',
      'Found unused constants in Warnings: C',
      'Found unused fields in Warnings: b'
    ])
  })
})
