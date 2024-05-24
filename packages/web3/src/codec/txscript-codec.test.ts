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
  U256Eq
} from './instr-codec'
import { Buffer } from 'buffer/'
import { DestroyAdd, GreeterMain } from '../../../../artifacts/ts'
import { LockupScript } from './lockup-script-codec'
import { Method } from './method-codec'
import { Script, Fields, bs58 } from '@alephium/web3'
import { randomContractId, testAddress } from '@alephium/web3-test'
import { txScriptCodec } from './txscript-codec'
import { StoreLocal } from '../../dist/src/codec'

describe('Encode & decode TxScript', function () {
  it('should encode & decode TxScript', () => {
    const contractId = randomContractId()
    const decodedTestAddress = Buffer.from(bs58.decode(testAddress))
    const lockupScript = {
      scriptType: decodedTestAddress[0],
      script: {
        publicKeyHash: decodedTestAddress.slice(1)
      }
    } as LockupScript
    const contractIdByteString = {
      length: { mode: 64, rest: Buffer.from(['32']) },
      value: Buffer.from(contractId, 'hex')
    }

    testTxScript(DestroyAdd.script, { add: contractId, caller: testAddress }, [
      {
        isPublic: true,
        assetModifier: 3,
        argsLength: 0,
        localsLength: 0,
        returnLength: 0,
        instrs: [AddressConst(lockupScript), U256Const1, U256Const0, ByteConst(contractIdByteString), CallExternal(3)]
      }
    ])

    testTxScript(GreeterMain.script, { greeterContractId: contractId }, [
      {
        isPublic: true,
        assetModifier: 3,
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
          CallExternal(0),
          U256Const1,
          U256Eq,
          U256Const0,
          AssertWithErrorCode
        ]
      }
    ])
  })

  function testTxScript(script: Script, fields: Fields, methods: Method[]) {
    const bytecode = script.buildByteCodeToDeploy(fields)
    const decodedTxScript = txScriptCodec.decodeTxScript(Buffer.from(bytecode, 'hex'))
    expect(decodedTxScript.methods.length).toEqual(methods.length)
    decodedTxScript.methods.map((decodedMethod, index) => {
      expect(decodedMethod.isPublic).toEqual(methods[index].isPublic)
      expect(decodedMethod.assetModifier).toEqual(methods[index].assetModifier)
      expect(decodedMethod.argsLength).toEqual(methods[index].argsLength)
      expect(decodedMethod.localsLength).toEqual(methods[index].localsLength)
      expect(decodedMethod.returnLength).toEqual(methods[index].returnLength)
      expect(decodedMethod.instrs).toEqual(methods[index].instrs)
    })
  }
})
