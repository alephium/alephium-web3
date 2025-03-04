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
  DEFAULT_NODE_COMPILER_OPTIONS,
  DUST_AMOUNT,
  DEFAULT_GAS_AMOUNT,
  stringToHex,
  encodePrimitiveValues,
  addressVal,
  byteVecVal,
  u256Val,
  ZERO_ADDRESS,
  MINIMAL_CONTRACT_DEPOSIT,
  getDebugMessagesFromTx,
  getContractCodeByCodeHash
} from '../packages/web3'
import { Contract, Script, getContractIdFromUnsignedTx } from '../packages/web3'
import {
  expectAssertionError,
  testAddress,
  randomContractAddress,
  getSigner,
  mintToken,
  randomContractId
} from '../packages/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { Greeter, GreeterTypes } from '../artifacts/ts/Greeter'
import {
  GreeterMain,
  InsertIntoMap,
  AddMain,
  RemoveFromMap,
  TemplateArrayVar,
  TestAssert,
  UpdateMapValue,
  UpdateUserAccount,
  CallScript0,
  CallScript1
} from '../artifacts/ts/scripts'
import { Sub, SubTypes } from '../artifacts/ts/Sub'
import { Add, AddTypes } from '../artifacts/ts/Add'
import { MetaData } from '../artifacts/ts/MetaData'
import { Assert } from '../artifacts/ts/Assert'
import { Debug } from '../artifacts/ts/Debug'
import { getContractByCodeHash } from '../artifacts/ts/contracts'
import {
  UserAccount,
  NFTTest,
  OwnerOnly,
  TokenTest,
  MapTest,
  MapTestWrapper,
  MapTestSub,
  UserAccountTypes,
  InlineTest
} from '../artifacts/ts'
import { randomBytes } from 'crypto'
import { TokenBalance } from '../artifacts/ts/types'
import { ProjectArtifact, Project } from '../packages/cli/src/project'
import { A, Addresses, B, ByteVecs, AssertError, Numbers, ConstantTrue, ConstantFalse } from '../artifacts/ts/constants'

describe('contract', function () {
  let signer: PrivateKeyWallet
  let signerAccount: Account
  let signerGroup: number
  let exposePrivateFunctions: boolean

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)

    signer = await getSigner()
    signerAccount = signer.account
    signerGroup = signerAccount.group
    exposePrivateFunctions = Math.random() < 0.5

    expect(signerGroup).toEqual(groupOfAddress(testAddress))
  })

  it('should test event index', () => {
    expect(Add.eventIndex.Add).toEqual(0)
    expect(Add.eventIndex.Add1).toEqual(1)
    expect(Add.eventIndex.Empty).toEqual(2)
    expect(Sub.eventIndex.Sub).toEqual(0)
  })

  it('should get contract id from tx id', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const deployResult0 = await Sub.deploy(signer, { initialFields: { result: 0n }, exposePrivateFunctions })
    const subContractId = await getContractIdFromUnsignedTx(nodeProvider, deployResult0.unsignedTx)
    expect(subContractId).toEqual(deployResult0.contractInstance.contractId)

    const deployResult1 = await Add.deploy(signer, {
      initialFields: { sub: subContractId, result: 0n },
      exposePrivateFunctions
    })
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
    expect(contract1.codeHash).toEqual(Add.contract.codeHashDebug)
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

      const event2 = events[2] as AddTypes.EmptyEvent
      expect(event2.name).toEqual('Empty')
      expect(event2.eventIndex).toEqual(2)
      expect(event2.fields).toEqual({})

      const event3 = events[3] as SubTypes.SubEvent
      expect(event3.name).toEqual('Sub')
      expect(event3.eventIndex).toEqual(0)
      expect(event3.fields.x).toEqual(2n)
      expect(event3.fields.y).toEqual(1n)
    }

    checkEvents(testResult.events)

    const testResultPrivate = await Add.tests.addPrivate({
      initialFields: { sub: subState.contractId, result: 0n },
      testArgs: { array: [2n, 1n] },
      existingContracts: [subState]
    })
    expect(testResultPrivate.returns).toEqual([3n, 1n])

    const sub = (await Sub.deploy(signer, { initialFields: { result: 0n }, exposePrivateFunctions })).contractInstance
    expect(sub.groupIndex).toEqual(signerGroup)
    const add = (
      await Add.deploy(signer, { initialFields: { sub: sub.contractId, result: 0n }, exposePrivateFunctions })
    ).contractInstance
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

    const mainScriptTx = await AddMain.execute(signer, { initialFields: { add: add.contractId, array: [2n, 1n] } })
    expect(mainScriptTx.groupIndex).toEqual(signerGroup)

    // Check state for add/sub after main script is executed
    const subContractState1 = await sub.fetchState()
    expect(subContractState1.fields.result).toEqual(1n)

    const addContractState1 = await add.fetchState()
    expect(addContractState1.fields.sub).toEqual(sub.contractId)
    expect(addContractState1.fields.result).toEqual(3n)

    const callResult = await add.view.add({
      args: { array: [2n, 1n] },
      interestedContracts: [sub.address]
    })
    expect(callResult.returns).toEqual([6n, 2n])
    checkEvents(callResult.events)
  })

  it('should test contract (2)', async () => {
    const initialFields = Greeter.contract.getInitialFieldsWithDefaultValues() as GreeterTypes.Fields
    const testResult = await Greeter.tests.greet({ initialFields: { ...initialFields, btcPrice: 1n } })
    expect(testResult.returns).toEqual(1n)
    expect(testResult.contracts[0].codeHash).toEqual(Greeter.contract.codeHash)
    expect(testResult.contracts[0].fields.btcPrice).toEqual(1n)

    const greeter = (
      await Greeter.deploy(signer, { initialFields: { ...initialFields, btcPrice: 1n }, exposePrivateFunctions })
    ).contractInstance
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
    expect(sourceFiles.length).toEqual(62)
    sourceFiles.slice(0, 29).forEach((c) => expect(c.type).toEqual(0)) // contracts
    sourceFiles.slice(29, 47).forEach((s) => expect(s.type).toEqual(1)) // scripts
    sourceFiles.slice(47, 49).forEach((i) => expect(i.type).toEqual(2)) // abstract class
    sourceFiles.slice(49, 56).forEach((i) => expect(i.type).toEqual(3)) // interfaces
    sourceFiles.slice(59, 56).forEach((i) => expect(i.type).toEqual(4)) // structs
    expect(sourceFiles[61].type).toEqual(5) // constants
  })

  it('should load contract from json', () => {
    loadContract('./artifacts/add/Add.ral.json')
    loadContract('./artifacts/sub/Sub.ral.json')
    loadScript('./artifacts/add/AddMain.ral.json')

    loadContract('./artifacts/greeter/Greeter.ral.json')
    loadScript('./artifacts/greeter/GreeterMain.ral.json')
  })

  it('should extract metadata of contracts', () => {
    expect(MetaData.contract.functions.map((func) => func.name)).toEqual(['foo', 'bar', 'baz'])
    expect(MetaData.contract.publicFunctions().map((f) => f.name)).toEqual(['foo'])
    expect(MetaData.contract.usingPreapprovedAssetsFunctions().map((f) => f.name)).toEqual(['foo'])
    expect(MetaData.contract.usingAssetsInContractFunctions().map((f) => f.name)).toEqual(['bar'])
  })

  it('should handle compiler warnings', async () => {
    await expect(Project.compile({}, '.', 'contracts', 'artifacts', undefined, true)).rejects.toThrow(
      /Compilation warnings\:/
    )

    expect(() =>
      Project.compile({ errorOnWarnings: false }, '.', 'contracts', 'artifacts', undefined, true)
    ).not.toThrow()
  })

  it('should debug', async () => {
    const result = await Debug.tests.debug()
    expect(result.debugMessages.length).toEqual(1)
    expect(result.debugMessages[0].contractAddress).toEqual(result.contractAddress)
    const nullContractAddress = addressFromContractId('0'.repeat(64))
    expect(result.debugMessages[0].message).toEqual(`Hello, ${nullContractAddress}!`)
  })

  it('should get debug messages from tx', async () => {
    const deployResult = await Debug.deploy(signer, { initialFields: {} })
    const txResult = await deployResult.contractInstance.transact.debug({ signer })
    const messages = await getDebugMessagesFromTx(txResult.txId)
    expect(messages).toEqual([
      { contractAddress: deployResult.contractInstance.address, message: `Hello, ${ZERO_ADDRESS}!` }
    ])
  })

  it('should test assert!', async () => {
    expect(Numbers.C).toEqual((1n << 256n) - 1n)

    const contractAddress = randomContractAddress()
    expectAssertionError(Assert.tests.test({ address: contractAddress }), contractAddress, AssertError)

    const assertDeployResult = await Assert.deploy(signer, { initialFields: {}, exposePrivateFunctions })
    const assertAddress = assertDeployResult.contractInstance.address

    expectAssertionError(
      TestAssert.execute(signer, { initialFields: { assert: assertAddress } }),
      assertAddress,
      AssertError
    )

    expectAssertionError(
      TestAssert.execute(signer, {
        initialFields: { assert: assertAddress },
        gasAmount: DEFAULT_GAS_AMOUNT
      }),
      assertAddress,
      3
    )
  })

  it('should test enums and constants', () => {
    expect(AssertError).toEqual(3n)
    expect(A).toEqual(-3n)
    expect(B).toEqual('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(ConstantTrue).toEqual(true)
    expect(ConstantFalse).toEqual(false)
    expect(Numbers.A).toEqual(0n)
    expect(Numbers.B).toEqual(1n)
    expect(Addresses.A).toEqual('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(Addresses.B).toEqual('14UAjZ3qcmEVKdTo84Kwf4RprTQi86w2TefnnGFjov9xF')
    expect(ByteVecs.A).toEqual('00')
    expect(ByteVecs.B).toEqual('11')
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

  it('should support template array variables in script', async () => {
    await TemplateArrayVar.execute(signer, {
      initialFields: {
        address: testAddress,
        numbers0: [
          [0n, 1n],
          [2n, 3n]
        ],
        bytes: '0011',
        numbers1: [0n, 1n, 2n]
      }
    })
  })

  it('should test contract with parent', async () => {
    const address = randomContractAddress()
    const parentAddress = randomContractAddress()

    const test0 = OwnerOnly.tests.testOwner({
      initialFields: { owner: parentAddress },
      address: address,
      callerAddress: randomContractAddress()
    })
    expectAssertionError(test0, address, 0)

    const test1 = await OwnerOnly.tests.testOwner({
      initialFields: { owner: parentAddress },
      address: address,
      callerAddress: parentAddress
    })
    // expectAssertionError(test2, address, 0)
    expect(test1.returns).toEqual(null)
  })

  it('should test struct', async () => {
    const initialFields = {
      id: '',
      address: ZERO_ADDRESS,
      balances: {
        totalAmount: 0n,
        tokens: [
          { tokenId: '0011', amount: 0n },
          { tokenId: '0022', amount: 0n }
        ] as [TokenBalance, TokenBalance]
      },
      name: ''
    }
    const result = await UserAccount.deploy(signer, { initialFields, exposePrivateFunctions })
    const state = await result.contractInstance.fetchState()
    expect(state.fields).toEqual(initialFields)

    const balances0 = await result.contractInstance.view.getBalances()
    expect(balances0.returns).toEqual(initialFields.balances)

    await UpdateUserAccount.execute(signer, {
      initialFields: {
        address: signer.address,
        account: result.contractInstance.contractId,
        tokens: [
          { tokenId: '0011', amount: 100n },
          { tokenId: '0022', amount: 101n }
        ]
      }
    })

    const balances1 = await result.contractInstance.view.getBalances()
    expect(balances1.returns.totalAmount).toEqual(201n)
    expect(balances1.returns.tokens[0].amount).toEqual(100n)
    expect(balances1.returns.tokens[1].amount).toEqual(101n)
  })

  it('should test map(unit test)', async () => {
    const insertResult = await MapTest.tests.insert({
      testArgs: { key: signer.address, value: { id: 1n, balance: 10n } },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH * 3n } }]
    })
    expect(insertResult.maps?.map0?.get(signer.address)).toEqual({ id: 1n, balance: 10n })
    expect(insertResult.maps?.map1?.get(1n)).toEqual(10n)
    expect(insertResult.maps?.map2?.get('0011')).toEqual(10n)

    const updateResult = await MapTest.tests.update({
      initialMaps: {
        map0: new Map([[signer.address, { id: 1n, balance: 10n }]]),
        map1: new Map([[1n, 10n]]),
        map2: new Map([['0011', 10n]])
      },
      testArgs: { key: signer.address },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH } }]
    })
    expect(updateResult.maps?.map0?.get(signer.address)).toEqual({ id: 1n, balance: 11n })
    expect(updateResult.maps?.map1?.get(1n)).toEqual(11n)
    expect(updateResult.maps?.map2?.get('0011')).toEqual(11n)

    const removeResult = await MapTest.tests.remove({
      initialMaps: {
        map0: new Map([[signer.address, { id: 1n, balance: 10n }]]),
        map1: new Map([[1n, 10n]]),
        map2: new Map([['0011', 10n]])
      },
      testArgs: { key: signer.address },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH } }]
    })
    expect(removeResult.maps?.map0?.get(signer.address)).toEqual(undefined)
    expect(removeResult.maps?.map1?.get(1n)).toEqual(undefined)
    expect(removeResult.maps?.map2?.get('0011')).toEqual(undefined)
  })

  it('should test nested map call(unit test)', async () => {
    const mapTestId = randomContractId()
    const mapTestAddress = addressFromContractId(mapTestId)
    const insertResult = await MapTestWrapper.tests.insert({
      testArgs: { key: signer.address, value: { id: 1n, balance: 10n } },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH * 3n } }],
      initialFields: { inner: mapTestId },
      existingContracts: [MapTest.stateForTest({}, undefined, mapTestAddress)]
    })
    const mapTestState0 = insertResult.contracts.find((c) => c.address === mapTestAddress)!
    expect(mapTestState0.maps?.map0?.get(signer.address)).toEqual({ id: 1n, balance: 10n })
    expect(mapTestState0.maps?.map1?.get(1n)).toEqual(10n)
    expect(mapTestState0.maps?.map2?.get('0011')).toEqual(10n)

    const updateResult = await MapTestWrapper.tests.update({
      testArgs: { key: signer.address },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH } }],
      initialFields: { inner: mapTestId },
      existingContracts: [
        MapTest.stateForTest({}, undefined, mapTestAddress, {
          map0: new Map([[signer.address, { id: 1n, balance: 10n }]]),
          map1: new Map([[1n, 10n]]),
          map2: new Map([['0011', 10n]])
        })
      ]
    })
    const mapTestState1 = updateResult.contracts.find((c) => c.address === mapTestAddress)!
    expect(mapTestState1.maps?.map0?.get(signer.address)).toEqual({ id: 1n, balance: 11n })
    expect(mapTestState1.maps?.map1?.get(1n)).toEqual(11n)
    expect(mapTestState1.maps?.map2?.get('0011')).toEqual(11n)

    const removeResult = await MapTestWrapper.tests.remove({
      testArgs: { key: signer.address },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH } }],
      initialFields: { inner: mapTestId },
      existingContracts: [
        MapTest.stateForTest({}, undefined, mapTestAddress, {
          map0: new Map([[signer.address, { id: 1n, balance: 10n }]]),
          map1: new Map([[1n, 10n]]),
          map2: new Map([['0011', 10n]])
        })
      ]
    })
    const mapTestState2 = removeResult.contracts.find((c) => c.address === mapTestAddress)!
    expect(mapTestState2.maps?.map0?.get(signer.address)).toEqual(undefined)
    expect(mapTestState2.maps?.map1?.get(1n)).toEqual(undefined)
    expect(mapTestState2.maps?.map2?.get('0011')).toEqual(undefined)
  })

  it('should test map subcontract(unit test)', async () => {
    const mapTestId = randomContractId()
    const mapTestAddress = addressFromContractId(mapTestId)
    const initResult = await MapTestSub.tests.init({
      testArgs: { caller: signer.address, value: { id: 1n, balance: 10n } },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH * 3n } }],
      initialFields: { mapTestTemplateId: mapTestId },
      existingContracts: [MapTest.stateForTest({}, undefined, mapTestAddress)]
    })
    const mapTestSubState = initResult.contracts.find((c) => c.address === addressFromContractId(initResult.returns))!
    expect(mapTestSubState.maps?.map0?.get(signer.address)).toEqual({ id: 1n, balance: 10n })
    expect(mapTestSubState.maps?.map1?.get(1n)).toEqual(10n)
    expect(mapTestSubState.maps?.map2?.get('0011')).toEqual(10n)
  })

  it('should test map(integration test)', async () => {
    const result = await MapTest.deploy(signer, { initialFields: {}, exposePrivateFunctions })

    const mapTest = result.contractInstance
    await InsertIntoMap.execute(signer, {
      initialFields: {
        mapTest: mapTest.contractId,
        from: signer.address,
        value: { id: 1n, balance: 10n }
      },
      attoAlphAmount: ONE_ALPH * 2n
    })

    const invalidAddress = randomContractAddress()
    expect(await mapTest.maps.map0.contains(invalidAddress)).toEqual(false)
    expect(await mapTest.maps.map0.contains(signer.address)).toEqual(true)
    expect(await mapTest.maps.map0.get(signer.address)).toEqual({ id: 1n, balance: 10n })
    expect(await mapTest.maps.map1.contains(0n)).toEqual(false)
    expect(await mapTest.maps.map1.contains(1n)).toEqual(true)
    expect(await mapTest.maps.map1.get(1n)).toEqual(10n)
    expect(await mapTest.maps.map2.contains('0010')).toEqual(false)
    expect(await mapTest.maps.map2.contains('0011')).toEqual(true)
    expect(await mapTest.maps.map2.get('0011')).toEqual(10n)

    await UpdateMapValue.execute(signer, {
      initialFields: {
        mapTest: mapTest.contractId,
        key: signer.address
      }
    })

    expect(await mapTest.maps.map0.get(signer.address)).toEqual({ id: 1n, balance: 11n })
    expect(await mapTest.maps.map1.get(1n)).toEqual(11n)
    expect(await mapTest.maps.map2.get('0011')).toEqual(11n)

    await RemoveFromMap.execute(signer, {
      initialFields: {
        mapTest: mapTest.contractId,
        key: signer.address
      }
    })

    expect(await mapTest.maps.map0.contains(signer.address)).toEqual(false)
    expect(await mapTest.maps.map0.get(signer.address)).toEqual(undefined)
    expect(await mapTest.maps.map1.contains(1n)).toEqual(false)
    expect(await mapTest.maps.map1.get(1n)).toEqual(undefined)
    expect(await mapTest.maps.map2.contains('0011')).toEqual(false)
    expect(await mapTest.maps.map2.get('0011')).toEqual(undefined)
  })

  it('should test sign execute method with primitive arguments', async () => {
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n }, exposePrivateFunctions })
    const add = (
      await Add.deploy(signer, {
        initialFields: { sub: sub.contractInstance.contractId, result: 0n },
        exposePrivateFunctions
      })
    ).contractInstance
    const caller = (await signer.getSelectedAccount()).address
    const provider = web3.getCurrentNodeProvider()

    const state = await provider.contracts.getContractsAddressState(add.address)
    expect(state).toBeDefined()

    await add.transact.destroy({ args: { caller: caller }, signer })
    await expect(provider.contracts.getContractsAddressState(add.address)).rejects.toThrow(Error)
  })

  it('should test sign execute method with array arguments', async () => {
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n }, exposePrivateFunctions })
    const add = (
      await Add.deploy(signer, {
        initialFields: { sub: sub.contractInstance.contractId, result: 0n },
        exposePrivateFunctions
      })
    ).contractInstance
    const provider = web3.getCurrentNodeProvider()

    const stateBefore = await provider.contracts.getContractsAddressState(add.address)
    expect(stateBefore.mutFields[0].value).toEqual('0')

    await add.transact.add({ args: { array: [2n, 1n] }, signer })

    const stateAfter = await provider.contracts.getContractsAddressState(add.address)
    expect(stateAfter.mutFields[0].value).toEqual('3')
  })

  it('should test sign execute method with struct arguments', async () => {
    const sub = await Sub.deploy(signer, { initialFields: { result: 0n }, exposePrivateFunctions })
    const add = (
      await Add.deploy(signer, {
        initialFields: { sub: sub.contractInstance.contractId, result: 0n },
        exposePrivateFunctions
      })
    ).contractInstance
    const provider = web3.getCurrentNodeProvider()

    const stateBefore = await provider.contracts.getContractsAddressState(add.address)
    expect(stateBefore.mutFields[0].value).toEqual('0')

    await add.transact.add2({
      args: {
        array1: [2n, 1n],
        address: signer.address,
        array2: [2n, 1n],
        addS: {
          a: 1n,
          b: [
            { a: 1n, b: [2n, 1n] },
            { a: 1n, b: [2n, 1n] }
          ]
        }
      },
      signer
    })

    const stateAfter = await provider.contracts.getContractsAddressState(add.address)
    expect(stateAfter.mutFields[0].value).toEqual('3')
  })

  it('should test sign execute method with approved assets', async () => {
    const signerAddress = (await signer.getSelectedAccount()).address
    const sub = await Sub.deploy(signer, {
      initialFields: { result: 0n },
      issueTokenAmount: 300n,
      issueTokenTo: signerAddress,
      exposePrivateFunctions
    })
    const add = (
      await Add.deploy(signer, {
        initialFields: { sub: sub.contractInstance.contractId, result: 0n },
        exposePrivateFunctions
      })
    ).contractInstance
    const provider = web3.getCurrentNodeProvider()

    const state = await provider.contracts.getContractsAddressState(add.address)
    expect(state).toBeDefined()

    const beforeBalances = await signer.nodeProvider.addresses.getAddressesAddressBalance(signerAddress)
    expect(beforeBalances.tokenBalances?.find((t) => t.id === sub.contractInstance.contractId)!.amount).toEqual('300')

    const txResult = await add.transact.createSubContractAndTransfer({
      args: {
        a: 1n,
        path: stringToHex('test-path'),
        subContractId: sub.contractInstance.contractId,
        payer: signerAddress
      },
      signer,
      attoAlphAmount: ONE_ALPH * 2n,
      tokens: [{ id: sub.contractInstance.contractId, amount: 200n }]
    })

    const afterBalances = await signer.nodeProvider.addresses.getAddressesAddressBalance(signerAddress)
    const gasFee = BigInt(txResult.gasAmount) * BigInt(txResult.gasPrice)
    expect(BigInt(beforeBalances.balance)).toEqual(BigInt(afterBalances.balance) + ONE_ALPH / 10n + gasFee)
    expect(afterBalances.tokenBalances?.find((t) => t.id === sub.contractInstance.contractId)!.amount).toEqual('100')
  })

  it('should test encode contract fields', async () => {
    const contractFields: UserAccountTypes.Fields = {
      id: '0011',
      address: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3',
      balances: {
        totalAmount: 100n,
        tokens: [
          { tokenId: '0022', amount: 101n },
          { tokenId: '0033', amount: 102n }
        ]
      },
      name: '0044'
    }
    const encodedImmFields = encodePrimitiveValues([
      byteVecVal(contractFields.id),
      byteVecVal(contractFields.balances.tokens[0].tokenId),
      byteVecVal(contractFields.balances.tokens[1].tokenId),
      byteVecVal(contractFields.name)
    ])

    const encodedMutFields = encodePrimitiveValues([
      addressVal(contractFields.address),
      u256Val(contractFields.balances.totalAmount),
      u256Val(contractFields.balances.tokens[0].amount),
      u256Val(contractFields.balances.tokens[1].amount)
    ])

    const encoded = UserAccount.encodeFields(contractFields)
    expect(encoded.encodedImmFields).toEqual(encodedImmFields)
    expect(encoded.encodedMutFields).toEqual(encodedMutFields)

    const result = await signer.signAndSubmitDeployContractTx({
      signerAddress: signer.address,
      bytecode: UserAccount.contract.bytecode + binToHex(encodedImmFields) + binToHex(encodedMutFields)
    })
    const contractInstance = UserAccount.at(result.contractAddress)
    expect((await contractInstance.fetchState()).fields).toEqual(contractFields)
  })

  it('should call TxScript', async () => {
    const result0 = await MapTest.deploy(signer, { initialFields: {}, exposePrivateFunctions })
    const mapTest = result0.contractInstance
    await InsertIntoMap.execute(signer, {
      initialFields: {
        mapTest: mapTest.contractId,
        from: signer.address,
        value: { id: 1n, balance: 10n }
      },
      attoAlphAmount: ONE_ALPH * 2n
    })

    const callResult0 = await CallScript0.call({ initialFields: { mapTest: mapTest.contractId, key: signer.address } })
    expect(callResult0.returns.id).toEqual(1n)
    expect(callResult0.returns.balance).toEqual(10n)

    const initialFields = {
      id: '',
      address: ZERO_ADDRESS,
      balances: {
        totalAmount: 0n,
        tokens: [
          { tokenId: '0011', amount: 0n },
          { tokenId: '0022', amount: 0n }
        ] as [TokenBalance, TokenBalance]
      },
      name: ''
    }
    const result1 = await UserAccount.deploy(signer, { initialFields, exposePrivateFunctions })
    const userAccount = result1.contractInstance

    const callResult1 = await CallScript1.call({
      initialFields: { mapTest: mapTest.contractId, key: signer.address, userAccount: userAccount.contractId }
    })
    expect(callResult1.returns).toEqual([
      { id: 1n, balance: 10n },
      {
        totalAmount: 0n,
        tokens: [
          { tokenId: '0011', amount: 0n },
          { tokenId: '0022', amount: 0n }
        ]
      }
    ])
  })

  it('should deploy contract template', async () => {
    const signer = await getSigner()
    const template0 = await Assert.deployTemplate(signer)
    const state0 = await template0.contractInstance.fetchState()
    expect(state0['fields']).toEqual({})
    expect(BigInt(state0.asset.alphAmount)).toEqual(MINIMAL_CONTRACT_DEPOSIT)

    const template1 = await Add.deployTemplate(signer)
    const state1 = await template1.contractInstance.fetchState()
    expect(state1.fields).toEqual({ sub: '', result: 0n })
    expect(BigInt(state1.asset.alphAmount)).toEqual(MINIMAL_CONTRACT_DEPOSIT)

    const template2 = await UserAccount.deployTemplate(signer)
    const state2 = await template2.contractInstance.fetchState()
    expect(state2.fields).toEqual({
      id: '',
      address: ZERO_ADDRESS,
      balances: {
        totalAmount: 0n,
        tokens: [
          { tokenId: '', amount: 0n },
          { tokenId: '', amount: 0n }
        ]
      },
      name: ''
    })
    expect(BigInt(state2.asset.alphAmount)).toEqual(MINIMAL_CONTRACT_DEPOSIT)
  })

  it('should get the contract bytecode for testing', async () => {
    expect(Add.contract.publicFunctions().length).not.toEqual(Add.contract.functions.length)
    const instance0 = (
      await Add.deploy(signer, { initialFields: { sub: randomContractId(), result: 0n }, exposePrivateFunctions: true })
    ).contractInstance
    const state0 = await instance0.fetchState()
    expect(state0.bytecode).toEqual(Add.contract.getByteCodeForTesting())
    expect(state0.bytecode).not.toEqual(Add.contract.bytecode)
    expect(state0.bytecode).not.toEqual(Add.contract.bytecodeDebug)
    expect(state0.codeHash).not.toEqual(Add.contract.codeHash)
    expect(state0.codeHash).not.toEqual(Add.contract.codeHashDebug)
    expect(Add.contract.hasCodeHash(state0.codeHash)).toEqual(true)

    expect(Assert.contract.publicFunctions().length).toEqual(Assert.contract.functions.length)
    const instance1 = (await Assert.deploy(signer, { initialFields: {}, exposePrivateFunctions: true }))
      .contractInstance
    const state1 = await instance1.fetchState()
    expect(state1.bytecode).toEqual(Assert.contract.bytecodeDebug)
    expect(state1.codeHash).toEqual(Assert.contract.codeHashDebug)
    expect(Assert.contract.hasCodeHash(state1.codeHash)).toEqual(true)
  })

  it('should test contract private functions', async () => {
    const sub = (await Sub.deploy(signer, { initialFields: { result: 0n }, exposePrivateFunctions: true }))
      .contractInstance
    const add = (
      await Add.deploy(signer, { initialFields: { sub: sub.contractId, result: 0n }, exposePrivateFunctions: true })
    ).contractInstance
    await add.transact.addPrivate({ args: { array: [2n, 1n] }, signer })
    const state0 = await add.fetchState()
    expect(state0.fields.result).toEqual(3n)
    const state1 = await sub.fetchState()
    expect(state1.fields.result).toEqual(1n)
  })

  it('should get contract code by code hash', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const contractCode = await getContractCodeByCodeHash(nodeProvider, Sub.contract.codeHash)
    expect(contractCode).toEqual(Sub.contract.bytecode)
    const randomHash = binToHex(randomBytes(32))
    const notExist = await getContractCodeByCodeHash(nodeProvider, randomHash)
    expect(notExist).toEqual(undefined)
  })

  it('should test inline functions(unit test)', async () => {
    const contractAddress = randomContractAddress()
    const result0 = await InlineTest.tests.nextCountWithPay({
      address: contractAddress,
      initialFields: { count: 0n },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH } }],
      initialAsset: { alphAmount: ONE_ALPH }
    })
    expect(result0.returns).toEqual(1n)
    const assets0 = result0.contracts.find((c) => c.address === contractAddress)!.asset
    expect(assets0.alphAmount).toEqual(ONE_ALPH + ONE_ALPH / 100n)

    const result1 = await InlineTest.tests.nextCountWithoutPay({
      address: contractAddress,
      initialFields: { count: 0n },
      initialAsset: { alphAmount: ONE_ALPH }
    })
    expect(result1.returns).toEqual(1n)
    const assets1 = result1.contracts.find((c) => c.address === contractAddress)!.asset
    expect(assets1.alphAmount).toEqual(ONE_ALPH)

    const result2 = await InlineTest.tests.nextCount({
      address: contractAddress,
      initialFields: { count: 0n },
      inputAssets: [{ address: signer.address, asset: { alphAmount: ONE_ALPH } }],
      initialAsset: { alphAmount: ONE_ALPH }
    })
    expect(result2.returns).toEqual(2n)
    const assets2 = result2.contracts.find((c) => c.address === contractAddress)!.asset
    expect(assets2.alphAmount).toEqual(ONE_ALPH + ONE_ALPH / 100n)
  })

  it('should test inline functions(integration test)', async () => {
    const deployResult0 = await InlineTest.deploy(signer, {
      initialFields: { count: 0n },
      initialAttoAlphAmount: ONE_ALPH,
      exposePrivateFunctions: true
    })
    const instance = deployResult0.contractInstance
    await instance.transact.nextCountWithPay({ signer, attoAlphAmount: ONE_ALPH })
    const state0 = await instance.fetchState()
    expect(state0.fields.count).toEqual(1n)
    expect(state0.asset.alphAmount).toEqual(ONE_ALPH + ONE_ALPH / 100n)

    await instance.transact.nextCountWithoutPay({ signer })
    const state1 = await instance.fetchState()
    expect(state1.fields.count).toEqual(2n)
    expect(state1.asset.alphAmount).toEqual(ONE_ALPH + ONE_ALPH / 100n)

    await instance.transact.nextCount({ signer, attoAlphAmount: ONE_ALPH })
    const state2 = await instance.fetchState()
    expect(state2.fields.count).toEqual(4n)
    expect(state2.asset.alphAmount).toEqual(ONE_ALPH + (ONE_ALPH / 100n) * 2n)
  })
})
