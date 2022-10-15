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
import { Account, web3 } from '../packages/web3'
import { Contract, Project, Script, TestContractParams } from '../packages/web3'
import { testNodeWallet } from '../packages/web3-test'
import { expectAssertionError, randomContractAddress } from '../packages/web3-test'
import { NodeWallet } from '@alephium/web3-wallet'

describe('contract', function () {
  let signer: NodeWallet
  let signerAccount: Account
  let signerGroup: number

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    signer = await testNodeWallet()
    signerAccount = await signer.getSelectedAccount()
    signerGroup = signerAccount.group
  })

  async function testSuite1() {
    await Project.build({ errorOnWarnings: false })

    // ignore unused private function warnings
    const add = Project.contract('Add')
    const sub = Project.contract('Sub')

    const subState = sub.toState({ result: 0n }, { alphAmount: BigInt('1000000000000000000') })
    const testParams: TestContractParams = {
      initialFields: { sub: subState.contractId, result: 0n },
      testArgs: { array: [2n, 1n] },
      existingContracts: [subState]
    }
    const testResult = await add.testPublicMethod('add', testParams)
    expect(testResult.returns).toEqual([[3n, 1n]])
    expect(testResult.contracts[0].codeHash).toEqual(sub.codeHash)
    expect(testResult.contracts[0].fields.result).toEqual(1n)
    expect(testResult.contracts[1].codeHash).toEqual(add.codeHash)
    expect(testResult.contracts[1].fields.sub).toEqual(subState.contractId)
    expect(testResult.contracts[1].fields.result).toEqual(3n)
    const events = testResult.events.sort((a, b) => a.name.localeCompare(b.name))
    expect(events[0].name).toEqual('Add')
    expect(events[0].fields.x).toEqual(2n)
    expect(events[0].fields.y).toEqual(1n)
    expect(events[1].name).toEqual('Sub')
    expect(events[1].fields.x).toEqual(2n)
    expect(events[1].fields.y).toEqual(1n)

    const testResultPrivate = await add.testPrivateMethod('addPrivate', testParams)
    expect(testResultPrivate.returns).toEqual([[3n, 1n]])

    const subDeployTx = await sub.deploy(signer, {
      initialFields: { result: 0n },
      initialTokenAmounts: []
    })
    const subContractId = subDeployTx.contractId
    const subContractAddress = subDeployTx.contractAddress
    expect(subDeployTx.fromGroup).toEqual(signerGroup)
    expect(subDeployTx.toGroup).toEqual(signerGroup)
    expect(subDeployTx.fromGroup).toEqual(signerGroup)
    expect(subDeployTx.toGroup).toEqual(signerGroup)
    expect(subDeployTx.txId).toEqual(subDeployTx.txId)

    const addDeployTx = await add.deploy(signer, {
      initialFields: { sub: subContractId, result: 0n },
      initialTokenAmounts: []
    })
    expect(addDeployTx.fromGroup).toEqual(signerGroup)
    expect(addDeployTx.toGroup).toEqual(signerGroup)
    expect(addDeployTx.fromGroup).toEqual(signerGroup)
    expect(addDeployTx.toGroup).toEqual(signerGroup)
    expect(addDeployTx.txId).toEqual(addDeployTx.txId)

    const addContractId = addDeployTx.contractId
    const addContractAddress = addDeployTx.contractAddress

    // Check state for add/sub before main script is executed
    let fetchedSubState = await sub.fetchState(subContractAddress, signerGroup)
    expect(fetchedSubState.fields.result).toEqual(0n)
    let fetchedAddState = await add.fetchState(addContractAddress, signerGroup)
    expect(fetchedAddState.fields.sub).toEqual(subContractId)
    expect(fetchedAddState.fields.result).toEqual(0n)

    const main = Project.script('Main')
    const mainScriptTx = await main.execute(signer, {
      initialFields: { addContractId: addContractId }
    })
    expect(mainScriptTx.fromGroup).toEqual(signerGroup)
    expect(mainScriptTx.toGroup).toEqual(signerGroup)
    expect(mainScriptTx.fromGroup).toEqual(signerGroup)
    expect(mainScriptTx.toGroup).toEqual(signerGroup)

    // Check state for add/sub after main script is executed
    fetchedSubState = await sub.fetchState(subContractAddress, signerGroup)
    expect(fetchedSubState.fields.result).toEqual(1n)
    fetchedAddState = await add.fetchState(addContractAddress, signerGroup)
    expect(fetchedAddState.fields.sub).toEqual(subContractId)
    expect(fetchedAddState.fields.result).toEqual(3n)
  }

  async function testSuite2() {
    await Project.build({ errorOnWarnings: false })

    const greeter = Project.contract('Greeter')

    const testParams: TestContractParams = {
      initialFields: { btcPrice: 1n }
    }
    const testResult = await greeter.testPublicMethod('greet', testParams)
    expect(testResult.returns).toEqual([1n])
    expect(testResult.contracts[0].codeHash).toEqual(greeter.codeHash)
    expect(testResult.contracts[0].fields.btcPrice).toEqual(1n)

    const deployTx = await greeter.deploy(signer, {
      initialFields: { btcPrice: 1n },
      initialTokenAmounts: []
    })
    expect(deployTx.fromGroup).toEqual(signerGroup)
    expect(deployTx.toGroup).toEqual(signerGroup)
    expect(deployTx.fromGroup).toEqual(signerGroup)
    expect(deployTx.toGroup).toEqual(signerGroup)
    expect(deployTx.txId).toEqual(deployTx.txId)

    const greeterContractId = deployTx.contractId
    const main = Project.script('GreeterMain')

    const mainScriptTx = await main.execute(signer, {
      initialFields: { greeterContractId: greeterContractId }
    })
    expect(mainScriptTx.fromGroup).toEqual(signerGroup)
    expect(mainScriptTx.toGroup).toEqual(signerGroup)
    expect(mainScriptTx.fromGroup).toEqual(signerGroup)
    expect(mainScriptTx.toGroup).toEqual(signerGroup)
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
    expect(sourceFiles.length).toEqual(10)
    sourceFiles.slice(0, 7).forEach((c) => expect(c.type).toEqual(0)) // contracts
    sourceFiles.slice(7, 9).forEach((s) => expect(s.type).toEqual(1)) // scripts
    sourceFiles.slice(10).forEach((i) => expect(i.type).toEqual(3)) // interfaces
  })

  it('should load contract from json', () => {
    loadContract('./artifacts/add/add.ral.json')
    loadContract('./artifacts/sub/sub.ral.json')
    loadScript('./artifacts/main.ral.json')

    loadContract('./artifacts/greeter/greeter.ral.json')
    loadScript('./artifacts/greeter_main.ral.json')
  })

  it('should extract metadata of contracts', async () => {
    await Project.build({ errorOnWarnings: false })

    const contract = Project.contract('MetaData')
    expect(contract.functions.map((func) => func.name)).toEqual(['foo', 'bar', 'baz'])
    expect(contract.publicFunctions()).toEqual(['foo'])
    expect(contract.usingPreapprovedAssetsFunctions()).toEqual(['foo'])
    expect(contract.usingAssetsInContractFunctions()).toEqual(['bar'])
  })

  it('should handle compiler warnings', async () => {
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

  it('should debug', async () => {
    await Project.build({ errorOnWarnings: false })
    const contract = Project.contract('Debug')
    const result = await contract.testPublicMethod('debug', {})
    expect(result.debugMessages.length).toEqual(1)
    expect(result.debugMessages[0].contractAddress).toEqual(result.contractAddress)
    expect(result.debugMessages[0].message).toEqual(`Hello, ${result.contractAddress}!`)
  })

  it('should test assert!', async () => {
    await Project.build({ errorOnWarnings: false })
    const contract = Project.contract('Assert')
    const testAddress = randomContractAddress()
    expectAssertionError(contract.testPublicMethod('test', { address: testAddress }), testAddress, 3)
  })
})
