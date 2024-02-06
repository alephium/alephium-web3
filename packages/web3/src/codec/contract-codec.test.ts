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

import { web3 } from '@alephium/web3'
import { Method } from './method-codec'
import { contractCodec } from './contract-codec'

describe('Encode & decode contract', function() {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should encode and decode contracts', async () => {
    await testContractCode(
      `
        Contract ShinyToken(
          symbol: ByteVec,
          name: ByteVec,
          decimals: U256,
          totalSupply: U256
        ) {
          pub fn getTotalSupply() -> U256 {
              return totalSupply
          }

          pub fn getSymbol() -> ByteVec {
              return symbol
          }

          pub fn getName() -> ByteVec {
              return name
          }

          pub fn getDecimals() -> U256 {
              return decimals
          }
        }
      `,
      [
        {
          isPublic: true,
          assetModifier: 0,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [
            { code: 206, value: { index: 3 } },
            { code: 2, value: {} }
          ]
        },
        {
          isPublic: true,
          assetModifier: 0,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [
            { code: 206, value: { index: 0 } }, { code: 2, value: {} }
          ]
        },
        {
          isPublic: true,
          assetModifier: 0,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [
            { code: 206, value: { index: 1 } }, { code: 2, value: {} }
          ]
        },
        {
          isPublic: true,
          assetModifier: 0,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [
            { code: 206, value: { index: 2 } }, { code: 2, value: {} }
          ]
        }
      ]
    )
  })

  async function testContractCode(contractCode: string, methods: Method[]) {
    const nodeProvider = web3.getCurrentNodeProvider()
    const compileContractResult = await nodeProvider.contracts.postContractsCompileContract({ code: contractCode })
    const contractBytecode = compileContractResult.bytecode
    const decoded = contractCodec.decode(Buffer.from(contractBytecode, 'hex'))
    const encoded = contractCodec.encode(decoded)

    const decodedContract = contractCodec.decodeContract(Buffer.from(contractBytecode, 'hex'))
    expect(decodedContract.fieldLength).toEqual(methods.length)
    decodedContract.methods.map((decodedMethod, index) => {
      expect(decodedMethod.isPublic).toEqual(methods[index].isPublic)
      expect(decodedMethod.assetModifier).toEqual(methods[index].assetModifier)
      expect(decodedMethod.argsLength).toEqual(methods[index].argsLength)
      expect(decodedMethod.localsLength).toEqual(methods[index].localsLength)
      expect(decodedMethod.returnLength).toEqual(methods[index].returnLength)
      expect(decodedMethod.instrs).toEqual(methods[index].instrs)
    })
    expect(contractBytecode).toEqual(encoded.toString('hex'))
  }
})
