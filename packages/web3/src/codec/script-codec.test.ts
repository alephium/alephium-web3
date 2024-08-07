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

import {
  AddressConst,
  AssertWithErrorCode,
  ByteConst,
  CallExternal,
  LoadLocal,
  U256Const0,
  U256Const1,
  U256Eq,
  StoreLocal,
  CallExternalBySelector
} from './instr-codec'
import { Script, bs58, web3, Fields, FieldsSig, buildScriptByteCode, hexToBinUnsafe, binToHex } from '@alephium/web3'
import { randomContractId, testAddress } from '@alephium/web3-test'
import { scriptCodec } from './script-codec'
import { Method } from './method-codec'
import { LockupScript } from './lockup-script-codec'
import { DestroyAdd, GreeterMain } from '../../../../artifacts/ts'

describe('Encode & decode scripts', function () {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should encode and decode scripts', async () => {
    await testScriptCode(
      `
        TxScript Withdraw(faucetContract: Faucet) {
           faucetContract.withdraw()
        }

        Contract Faucet() {
         @using(assetsInContract = true)
         pub fn withdraw() -> () {
           transferTokenFromSelf!(callerAddress!(), ALPH, dustAmount!())
           transferTokenFromSelf!(callerAddress!(), selfTokenId!(), 10)
         }
       }
     `,
      { faucetContract: randomContractId() },
      { names: ['faucetContract'], types: ['ByteVec'], isMutable: [false] }
    )

    await testScriptCode(
      `
        TxScript Main {
          let mut c = 10000000000000000000000000000000000000000u
          let mut d = 55555555555555555555555555555555555555555u
          let mut e = 777777777777777777777777u
          let mut f = 9999u

          let mut i = 0u
          while (i <= 100) {
            c = 50 + 60
            d = 60 - 50
            e = c + d
            f = c * d

            i = i + 1
          }
        }
      `
    )

    await testScriptCode(
      `
        TxScript Main {
          let mut c = -10000000000000000000000000000000000000000000000i
          let mut d = 555555555555555555555000000000004444444444i
          let e = c + d
          c = e + d
          d = e - c
        }
      `
    )

    await testScriptCode(
      `
        @using(preapprovedAssets = false)
        TxScript Foo {
          foo()

          fn foo() -> () {
            return
          }
        }
      `
    )

    await testScriptCode(
      `
        TxScript Foo {
          foo(100)

          fn foo(n: U256) -> () {
            if (n > 0) {
              foo(n - 1)
            }
          }
        }
      `
    )

    await testScriptCode(
      `
        @using(preapprovedAssets = false)
        TxScript Bar {
          let foo = Foo(#w4Ej7s4f1Sj6e3hbrtt5Hdvfpx1vzY14Et4ZYMTmcdE7)
          foo.add(4)
          return
        }

        Contract Foo(mut x: U256) {
          @using(updateFields = true)
          pub fn add(a: U256) -> () {
            x = x + a
            if (a > 0) {
              add(a - 1)
            }
            return
          }
        }
      `
    )

    await testScriptCode(
      `
          TxScript Main {
            let foo = Foo(#232b5b4ffdc25185a26630f7916855b8ade56ce7a589e5d9c66de07f72c59500)
            foo.burn{@w4Ej7s4f1Sj6e3hbrtt5Hdvfpx1vzY14Et4ZYMTmcdE7 -> #232b5b4ffdc25185a26630f7916855b8ade56ce7a589e5d9c66de07f72c59500: 2 alph}()
          }

          Contract Foo() {
            @using(preapprovedAssets = true, assetsInContract = true)
            pub fn burn() -> () {
              burnToken!(selfAddress!(), selfTokenId!(), 1 alph)
            }
          }
        `
    )
  })

  it('should encode & decode TxScript from the project', () => {
    const contractId = randomContractId()
    const decodedTestAddress = bs58.decode(testAddress)
    const lockupScript: LockupScript = {
      kind: 'P2PKH',
      value: decodedTestAddress.slice(1)
    }
    const contractIdByteString = hexToBinUnsafe(contractId)

    testScript(DestroyAdd.script, { add: contractId, caller: testAddress }, [
      {
        isPublic: true,
        usePreapprovedAssets: true,
        useContractAssets: false,
        usePayToContractOnly: false,
        argsLength: 0,
        localsLength: 0,
        returnLength: 0,
        instrs: [AddressConst(lockupScript), U256Const1, U256Const0, ByteConst(contractIdByteString), CallExternal(5)]
      }
    ])

    testScript(GreeterMain.script, { greeterContractId: contractId }, [
      {
        isPublic: true,
        usePreapprovedAssets: true,
        useContractAssets: false,
        usePayToContractOnly: false,
        argsLength: 0,
        localsLength: 2,
        returnLength: 0,
        instrs: [
          ByteConst(contractIdByteString),
          StoreLocal(0),
          U256Const0,
          U256Const1,
          LoadLocal(0),
          CallExternal(0),
          U256Const1,
          U256Eq,
          U256Const0,
          AssertWithErrorCode,
          ByteConst(contractIdByteString),
          StoreLocal(1),
          U256Const0,
          U256Const1,
          LoadLocal(1),
          CallExternalBySelector(-1792051845),
          U256Const1,
          U256Eq,
          U256Const0,
          AssertWithErrorCode
        ]
      }
    ])
  })

  async function testScriptCode(
    scriptCode: string,
    fields: Fields = {},
    fieldsSig: FieldsSig = { names: [], types: [], isMutable: [] }
  ) {
    const nodeProvider = web3.getCurrentNodeProvider()
    const compileScriptResult = await nodeProvider.contracts.postContractsCompileScript({ code: scriptCode })
    const scriptBytecode = buildScriptByteCode(compileScriptResult.bytecodeTemplate, fields, fieldsSig, [])
    const decoded = scriptCodec.decode(hexToBinUnsafe(scriptBytecode))
    const encoded = scriptCodec.encode(decoded)
    expect(scriptBytecode).toEqual(binToHex(encoded))
  }

  function testScript(script: Script, fields: Fields, methods: Method[]) {
    const txScriptBytecode = script.buildByteCodeToDeploy(fields)
    const decodedTxScript = scriptCodec.decode(hexToBinUnsafe(txScriptBytecode))

    expect(binToHex(scriptCodec.encode(decodedTxScript))).toEqual(txScriptBytecode)

    expect(decodedTxScript.methods.length).toEqual(methods.length)
    decodedTxScript.methods.map((decodedMethod, index) => {
      expect(decodedMethod.isPublic).toEqual(methods[index].isPublic)
      expect(decodedMethod.usePreapprovedAssets).toEqual(methods[index].usePreapprovedAssets)
      expect(decodedMethod.useContractAssets).toEqual(methods[index].useContractAssets)
      expect(decodedMethod.usePayToContractOnly).toEqual(methods[index].usePayToContractOnly)
      expect(decodedMethod.argsLength).toEqual(methods[index].argsLength)
      expect(decodedMethod.localsLength).toEqual(methods[index].localsLength)
      expect(decodedMethod.returnLength).toEqual(methods[index].returnLength)
      expect(decodedMethod.instrs).toEqual(methods[index].instrs)
    })
  }
})
