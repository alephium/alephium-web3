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

import { web3, Fields, FieldsSig, buildScriptByteCode } from '@alephium/web3'
import { randomContractId } from '@alephium/web3-test'
import { scriptCodec } from './script-codec'

describe('Encode & decode scripts', function () {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should encode and decode scripts', async () => {
    const externalCallScript = `
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
        `
    await testScriptCode(
      externalCallScript,
      { faucetContract: randomContractId() },
      { names: ['faucetContract'], types: ['ByteVec'], isMutable: [false] }
    )
  })

  async function testScriptCode(scriptCode: string, fields: Fields, fieldsSig: FieldsSig) {
    const nodeProvider = web3.getCurrentNodeProvider()
    const compileScriptResult = await nodeProvider.contracts.postContractsCompileScript({ code: scriptCode })
    const scriptBytecode = buildScriptByteCode(compileScriptResult.bytecodeTemplate, fields, fieldsSig)
    const decoded = scriptCodec.decode(Buffer.from(scriptBytecode, 'hex'))
    const encoded = scriptCodec.encode(decoded)
    expect(scriptBytecode).toEqual(encoded.toString('hex'))
  }
})
