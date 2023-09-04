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
import {
  Account,
  web3,
  ContractEvent,
  Fields,
  ContractCreatedEvent,
  ONE_ALPH,
  subContractId,
  contractIdFromAddress,
  binToHex,
  addressFromContractId,
  groupOfAddress,
  ProjectArtifact,
  DEFAULT_NODE_COMPILER_OPTIONS,
  DUST_AMOUNT
} from '../packages/web3'
import { Contract, Project, Script, getContractIdFromUnsignedTx } from '../packages/web3'
import { expectAssertionError, testAddress, randomContractAddress, getSigner, mintToken } from '../packages/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { Greeter } from '../artifacts/ts/Greeter'
import { GreeterMain, Main } from '../artifacts/ts/scripts'
import { Sub, SubTypes } from '../artifacts/ts/Sub'
import { Add, AddTypes } from '../artifacts/ts/Add'
import { MetaData } from '../artifacts/ts/MetaData'
import { Assert } from '../artifacts/ts/Assert'
import { Debug } from '../artifacts/ts/Debug'
import { getContractByCodeHash } from '../artifacts/ts/contracts'
import { NFTTest, TokenTest } from '../artifacts/ts'
import { randomBytes } from 'crypto'

describe('contract', function() {
  let signer: PrivateKeyWallet
  let signerAccount: Account
  let signerGroup: number

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)

    await Project.build({ errorOnWarnings: false })
    signer = await getSigner()
    signerAccount = signer.account
    signerGroup = signerAccount.group

    expect(signerGroup).toEqual(groupOfAddress(testAddress))
  })

  it('should test event index', () => {
    expect(Add.eventIndex.Add).toEqual(0)
    expect(Add.eventIndex.Add1).toEqual(1)
    expect(Sub.eventIndex.Sub).toEqual(0)
  })

  it('should get contract id from tx id', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const deployResult0 = await Sub.deploy(signer, { initialFields: { result: 0n } })
    const subContractId = await getContractIdFromUnsignedTx(nodeProvider, deployResult0.unsignedTx)
    expect(subContractId).toEqual(deployResult0.contractInstance.contractId)

    const deployResult1 = await Add.deploy(signer, { initialFields: { sub: subContractId, result: 0n } })
    const addContractId = await getContractIdFromUnsignedTx(nodeProvider, deployResult1.unsignedTx)
    expect(addContractId).toEqual(deployResult1.contractInstance.contractId)
  })

  it('should test contract (1)', async () => {
    const subState = Sub.stateForTest({ result: 0n })
    const testResult = await Add.tests.add({
      initialFields: { sub: subState.contractId, result: 0n },
      testArgs: { array: [2n, 1n] },
      existingContracts: [subState]
    })
    expect(testResult.returns).toEqual([3n, 1n])
    const contract0 = testResult.contracts[0] as SubTypes.State
    expect(contract0.codeHash).toEqual(subState.codeHash)
    expect(contract0.fields.result).toEqual(1n)

    const contract1 = testResult.contracts[1] as AddTypes.State
    expect(contract1.codeHash).toEqual(Add.contract.codeHash)
    expect(contract1.fields.sub).toEqual(subState.contractId)
    expect(contract1.fields.result).toEqual(3n)

    const checkEvents = (eventList: ContractEvent<Fields>[]) => {
      const events = eventList.sort((a, b) => a.name.localeCompare(b.name))
      const event0 = events[0] as AddTypes.AddEvent
      expect(event0.name).toEqual('Add')
      expect(event0.eventIndex).toEqual(0)
      expect(event0.fields.x).toEqual(2n)
      expect(event0.fields.y).toEqual(1n)

      const event1 = events[1] as AddTypes.Add1Event
      expect(event1.name).toEqual('Add1')
      expect(event1.eventIndex).toEqual(1)
      expect(event1.fields.a).toEqual(2n)
      expect(event1.fields.b).toEqual(1n)

      const event2 = events[2] as SubTypes.SubEvent
      expect(event2.name).toEqual('Sub')
      expect(event2.eventIndex).toEqual(0)
      expect(event2.fields.x).toEqual(2n)
      expect(event2.fields.y).toEqual(1n)
    }

    checkEvents(testResult.events)

    const testResultPrivate = await Add.tests.addPrivate({
      initialFields: { sub: subState.contractId, result: 0n },
      testArgs: { array: [2n, 1n] },
      existingContracts: [subState]
    })
    expect(testResultPrivate.returns).toEqual([3n, 1n])

    const sub = (await Sub.deploy(signer, { initialFields: { result: 0n } })).contractInstance
    expect(sub.groupIndex).toEqual(signerGroup)
    const add = (await Add.deploy(signer, { initialFields: { sub: sub.contractId, result: 0n } })).contractInstance
    expect(add.groupIndex).toEqual(signerGroup)

    // Check state for add/sub before main script is executed
    const subContractState0 = await sub.fetchState()
    expect(subContractState0.fields.result).toEqual(0n)
    expect(subContractState0.address).toEqual(sub.address)
    expect(subContractState0.contractId).toEqual(sub.contractId)

    const addContractState0 = await add.fetchState()
    expect(addContractState0.fields.sub).toEqual(sub.contractId)
    expect(addContractState0.fields.result).toEqual(0n)
    expect(addContractState0.address).toEqual(add.address)
    expect(addContractState0.contractId).toEqual(add.contractId)

    const mainScriptTx = await Main.execute(signer, { initialFields: { addContractId: add.contractId } })
    expect(mainScriptTx.groupIndex).toEqual(signerGroup)

    // Check state for add/sub after main script is executed
    const subContractState1 = await sub.fetchState()
    expect(subContractState1.fields.result).toEqual(1n)

    const addContractState1 = await add.fetchState()
    expect(addContractState1.fields.sub).toEqual(sub.contractId)
    expect(addContractState1.fields.result).toEqual(3n)

    const callResult = await add.methods.add({
      args: { array: [2n, 1n] },
      existingContracts: [sub.address]
    })
    expect(callResult.returns).toEqual([6n, 2n])
    checkEvents(callResult.events)
  })

  it('should test contract (2)', async () => {
    const initialFields = Greeter.getInitialFieldsWithDefaultValues()
    const testResult = await Greeter.tests.greet({ initialFields: { ...initialFields, btcPrice: 1n } })
    expect(testResult.returns).toEqual(1n)
    expect(testResult.contracts[0].codeHash).toEqual(Greeter.contract.codeHash)
    expect(testResult.contracts[0].fields.btcPrice).toEqual(1n)

    const greeter = (await Greeter.deploy(signer, { initialFields: { ...initialFields, btcPrice: 1n } }))
      .contractInstance
    expect(greeter.groupIndex).toEqual(signerGroup)
    const contractState = await greeter.fetchState()
    expect(contractState.fields.btcPrice).toEqual(1n)
    expect(contractState.address).toEqual(greeter.address)
    expect(contractState.contractId).toEqual(greeter.contractId)

    const mainScriptTx = await GreeterMain.execute(signer, { initialFields: { greeterContractId: greeter.contractId } })
    expect(mainScriptTx.groupIndex).toEqual(signerGroup)
  })

  it('should test contract (3)', async () => {
    const subState = Sub.stateForTest({ result: 0n })
    const groupIndex = 0
    const addAddress = randomContractAddress()
    const subContractPath = '0011'
    const expectedSubContractId = subContractId(
      binToHex(contractIdFromAddress(addAddress)),
      subContractPath,
      groupIndex
    )
    const payer = signer.address
    const testResult = await Add.tests.createSubContract({
      address: addAddress,
      group: groupIndex,
      initialFields: { sub: subState.contractId, result: 0n },
      testArgs: { a: 0n, path: subContractPath, subContractId: subState.contractId, payer },
      existingContracts: [subState],
      inputAssets: [{ address: payer, asset: { alphAmount: ONE_ALPH * 2n } }]
    })
    expect(testResult.events.length).toEqual(1)
    const event = testResult.events[0] as ContractCreatedEvent
    expect(event.fields.address).toEqual(addressFromContractId(expectedSubContractId))
    expect(event.fields.parentAddress).toEqual(addAddress)
    expect(event.fields.stdInterfaceIdGuessed).toEqual(undefined)
  })

  it('should deploy contract with default initial values', async () => {
    const initialFields = Greeter.getInitialFieldsWithDefaultValues()
    const result = await Greeter.deploy(signer, { initialFields })
    const state = await result.contractInstance.fetchState()
    expect(state.fields).toEqual(initialFields)
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
    expect(sourceFiles.length).toEqual(24)
    sourceFiles.slice(0, 11).forEach((c) => expect(c.type).toEqual(0)) // contracts
    sourceFiles.slice(12, 16).forEach((s) => expect(s.type).toEqual(1)) // scripts
    sourceFiles.slice(17, 18).forEach((i) => expect(i.type).toEqual(2)) // abstract class
    sourceFiles.slice(19).forEach((i) => expect(i.type).toEqual(3)) // interfaces
  })

  it('should load contract from json', () => {
    loadContract('./artifacts/add/Add.ral.json')
    loadContract('./artifacts/sub/Sub.ral.json')
    loadScript('./artifacts/add/Main.ral.json')

    loadContract('./artifacts/greeter/Greeter.ral.json')
    loadScript('./artifacts/greeter/GreeterMain.ral.json')
  })

  it('should extract metadata of contracts', async () => {
    await Project.build({ errorOnWarnings: false })

    expect(MetaData.contract.functions.map((func) => func.name)).toEqual(['foo', 'bar', 'baz'])
    expect(MetaData.contract.publicFunctions()).toEqual(['foo'])
    expect(MetaData.contract.usingPreapprovedAssetsFunctions()).toEqual(['foo'])
    expect(MetaData.contract.usingAssetsInContractFunctions()).toEqual(['bar'])
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
    const result = await Debug.tests.debug()
    expect(result.debugMessages.length).toEqual(1)
    expect(result.debugMessages[0].contractAddress).toEqual(result.contractAddress)
    expect(result.debugMessages[0].message).toEqual(`Hello, ${result.contractAddress}!`)
  })

  it('should test assert!', async () => {
    await Project.build({ errorOnWarnings: false })
    const contractAddress = randomContractAddress()
    expectAssertionError(Assert.tests.test({ address: contractAddress }), contractAddress, 3)
  })

  it('should test enums and constants', async () => {
    await Project.build({ errorOnWarnings: false })
    expect(Assert.consts.Error).toEqual(3n)
    expect(Assert.consts.A).toEqual(-3n)
    expect(Assert.consts.B).toEqual('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(Assert.consts.C).toEqual('0011')
    expect(Assert.consts.Numbers.A).toEqual(0n)
    expect(Assert.consts.Numbers.B).toEqual(1n)
    expect(Assert.consts.Addresses.A).toEqual('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(Assert.consts.Addresses.B).toEqual('14UAjZ3qcmEVKdTo84Kwf4RprTQi86w2TefnnGFjov9xF')
    expect(Assert.consts.ByteVecs.A).toEqual('00')
    expect(Assert.consts.ByteVecs.B).toEqual('11')
  })

  it('should get contract by code hash', () => {
    expect(getContractByCodeHash(Add.contract.codeHash).bytecode).toEqual(Add.contract.bytecode)
    expect(getContractByCodeHash(Sub.contract.codeHash).bytecode).toEqual(Sub.contract.bytecode)
    expect(getContractByCodeHash(Greeter.contract.codeHash).bytecode).toEqual(Greeter.contract.bytecode)
    expect(getContractByCodeHash(Assert.contract.codeHash).bytecode).toEqual(Assert.contract.bytecode)
    expect(getContractByCodeHash(Debug.contract.codeHash).bytecode).toEqual(Debug.contract.bytecode)
    expect(getContractByCodeHash(NFTTest.contract.codeHash).bytecode).toEqual(NFTTest.contract.bytecode)
    expect(getContractByCodeHash(TokenTest.contract.codeHash).bytecode).toEqual(TokenTest.contract.bytecode)

    const invalidCodeHash = randomBytes(32).toString('hex')
    expect(() => getContractByCodeHash(invalidCodeHash)).toThrow(`Unknown code with code hash: ${invalidCodeHash}`)
  })

  it('should test contract code changed', () => {
    const createArtifact = (codes: [string, string][]): ProjectArtifact => {
      const codeInfos = new Map()
      codes.forEach(([name, codeHash]) => {
        const codeInfo = { codeHashDebug: codeHash }
        codeInfos.set(name, codeInfo)
      })
      return new ProjectArtifact('', DEFAULT_NODE_COMPILER_OPTIONS, codeInfos as any)
    }

    const artifact0 = createArtifact([['Foo', '00']])
    const artifact1 = createArtifact([
      ['Foo', '01'],
      ['Bar', '00']
    ])
    const artifact2 = createArtifact([
      ['Foo', '01'],
      ['Bar', '01']
    ])
    const artifact3 = createArtifact([
      ['Add', '03'],
      ['Sub', '04'],
      ['Greeter', '05']
    ])
    expect(ProjectArtifact.isCodeChanged(artifact0, artifact0)).toEqual(false)
    expect(ProjectArtifact.isCodeChanged(artifact1, artifact1)).toEqual(false)
    expect(ProjectArtifact.isCodeChanged(artifact2, artifact2)).toEqual(false)
    expect(ProjectArtifact.isCodeChanged(artifact0, artifact1)).toEqual(true)
    expect(ProjectArtifact.isCodeChanged(artifact1, artifact0)).toEqual(true)
    expect(ProjectArtifact.isCodeChanged(artifact1, artifact2)).toEqual(true)
    expect(ProjectArtifact.isCodeChanged(artifact3, artifact2)).toEqual(true)
  })

  it('should mint token', async () => {
    const tokenAmount = ONE_ALPH * 10n
    const alphAmount = ONE_ALPH * 5n
    const wallet = await getSigner(ONE_ALPH * 5n)
    const result = await mintToken(wallet.address, tokenAmount)
    const contractId = result.contractId
    const nodeProvider = web3.getCurrentNodeProvider()
    expect(await nodeProvider.guessStdTokenType(contractId)).toEqual('fungible')

    const balances = await nodeProvider.addresses.getAddressesAddressBalance(wallet.address)
    expect(balances.balance).toEqual((alphAmount + DUST_AMOUNT).toString())
    const tokenBalance = balances.tokenBalances?.find((t) => t.id === contractId)
    expect(tokenBalance?.amount).toEqual(tokenAmount.toString())
  })
})
