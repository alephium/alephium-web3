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
import { Greeter } from '../.generated/Greeter'
import { GreeterMain, Main } from '../.generated/scripts'
import { Sub } from '../.generated/Sub'
import { Add } from '../.generated/Add'
import { Assert } from '../.generated/Assert'

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
    // ignore unused private function warnings
    await Project.build({ errorOnWarnings: false })

    const subState = Sub.stateForTest(0n)
    const testResult = await Add.testAdd(
      { array: [2n, 1n] },
      { sub: subState.contractId, result: 0n },
      { existingContracts: [subState] }
    )
    expect(testResult.returns).toEqual([[3n, 1n]])
    expect(testResult.contracts[0].codeHash).toEqual(subState.codeHash)
    expect(testResult.contracts[0].fields.result).toEqual(1n)
    expect(testResult.contracts[1].codeHash).toEqual(Add.contract.codeHash)
    expect(testResult.contracts[1].fields.sub).toEqual(subState.contractId)
    expect(testResult.contracts[1].fields.result).toEqual(3n)
    const events = testResult.events.sort((a, b) => a.name.localeCompare(b.name))
    expect(events[0].name).toEqual('Add')
    expect(events[0].fields.x).toEqual(2n)
    expect(events[0].fields.y).toEqual(1n)
    expect(events[1].name).toEqual('Add1')
    expect(events[1].fields.a).toEqual(2n)
    expect(events[1].fields.b).toEqual(1n)
    expect(events[2].name).toEqual('Sub')
    expect(events[2].fields.x).toEqual(2n)
    expect(events[2].fields.y).toEqual(1n)

    const testResultPrivate = await Add.testAddPrivate(
      { array: [2n, 1n] },
      { sub: subState.contractId, result: 0n },
      { existingContracts: [subState] }
    )
    expect(testResultPrivate.returns).toEqual([[3n, 1n]])

    const sub = await Sub.deploy(signer, 0n)
    expect(sub.deployResult !== undefined).toEqual(true)
    expect(sub.groupIndex).toEqual(signerGroup)
    const add = await Add.deploy(signer, sub.contractId, 0n)
    expect(add.groupIndex).toEqual(signerGroup)
    expect(add.deployResult !== undefined).toEqual(true)

    // Check state for add/sub before main script is executed
    const subContractState0 = await sub.fetchState()
    expect(subContractState0.result).toEqual(0n)
    expect(subContractState0.address).toEqual(sub.address)
    expect(subContractState0.contractId).toEqual(sub.contractId)

    const addContractState0 = await add.fetchState()
    expect(addContractState0.sub).toEqual(sub.contractId)
    expect(addContractState0.result).toEqual(0n)
    expect(addContractState0.address).toEqual(add.address)
    expect(addContractState0.contractId).toEqual(add.contractId)

    const mainScriptTx = await Main.execute(signer, add.contractId)
    expect(mainScriptTx.fromGroup).toEqual(signerGroup)
    expect(mainScriptTx.toGroup).toEqual(signerGroup)

    // Check state for add/sub after main script is executed
    const subContractState1 = await sub.fetchState()
    expect(subContractState1.result).toEqual(1n)

    const addContractState1 = await add.fetchState()
    expect(addContractState1.sub).toEqual(sub.contractId)
    expect(addContractState1.result).toEqual(3n)
  }

  async function testSuite2() {
    await Project.build({ errorOnWarnings: false })

    const testParams: TestContractParams = {
      initialFields: { btcPrice: 1n }
    }
    const testResult = await Greeter.contract.testPublicMethod('greet', testParams)
    expect(testResult.returns).toEqual([1n])
    expect(testResult.contracts[0].codeHash).toEqual(Greeter.contract.codeHash)
    expect(testResult.contracts[0].fields.btcPrice).toEqual(1n)

    const greeter = await Greeter.deploy(signer, 1n)
    expect(greeter.groupIndex).toEqual(signerGroup)
    const contractState = await greeter.fetchState()
    expect(contractState.btcPrice).toEqual(1n)
    expect(contractState.address).toEqual(greeter.address)
    expect(contractState.contractId).toEqual(greeter.contractId)

    const mainScriptTx = await GreeterMain.execute(signer, greeter.contractId)
    expect(mainScriptTx.toGroup).toEqual(signerGroup)
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
    const sourceFiles = await Project['loadSourceFiles']('.', './contracts') // `loadSourceFiles` is a private method
    expect(sourceFiles.length).toEqual(12)
    sourceFiles.slice(0, 8).forEach((c) => expect(c.type).toEqual(0)) // contracts
    sourceFiles.slice(9, 10).forEach((s) => expect(s.type).toEqual(1)) // scripts
    sourceFiles.slice(11).forEach((i) => expect(i.type).toEqual(3)) // interfaces
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
    expect(Project.currentProject.projectArtifact.infos.get('Warnings')!.warnings).toEqual([
      'Found unused variables in Warnings: foo.y',
      'Found unused fields in Warnings: b'
    ])

    await Project.build({ errorOnWarnings: false, ignoreUnusedConstantsWarnings: false })
    expect(Project.currentProject.projectArtifact.infos.get('Warnings')!.warnings).toEqual([
      'Found unused variables in Warnings: foo.y',
      'Found unused constants in Warnings: C',
      'Found unused fields in Warnings: b'
    ])
  })

  it('should debug', async () => {
    await Project.build({ errorOnWarnings: false })
    // We still use contract to test because there is no `bytecodeDebug` in the contract artifact
    const contract = Project.contract('Debug')
    const result = await contract.testPublicMethod('debug', {})
    expect(result.debugMessages.length).toEqual(1)
    expect(result.debugMessages[0].contractAddress).toEqual(result.contractAddress)
    expect(result.debugMessages[0].message).toEqual(`Hello, ${result.contractAddress}!`)
  })

  it('should test assert!', async () => {
    await Project.build({ errorOnWarnings: false })
    const testAddress = randomContractAddress()
    expectAssertionError(Assert.testTest({ address: testAddress }), testAddress, 3)
  })
})
