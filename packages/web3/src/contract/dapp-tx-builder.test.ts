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

import { randomContractAddress, randomContractId, testAddress } from '@alephium/web3-test'
import { DappTransactionBuilder, genArgs } from './dapp-tx-builder'
import {
  AddressConst,
  BytesConst,
  ConstFalse,
  ConstTrue,
  I256Const,
  I256Const1,
  I256ConstN1,
  U256Const1,
  U256Const2
} from '../codec'
import { base58ToBytes, hexToBinUnsafe } from '../utils'
import { lockupScriptCodec } from '../codec/lockup-script-codec'
import { ALPH_TOKEN_ID, ONE_ALPH } from '../constants'

describe('dapp-tx-builder', function () {
  it('should gen code for args', () => {
    expect(genArgs(['1i', '2u', '-1', '2'])).toEqual([I256Const1, U256Const2, I256ConstN1, U256Const2])

    expect(genArgs([false, 1n, -1n, '0011', testAddress])).toEqual([
      ConstFalse,
      U256Const1,
      I256ConstN1,
      BytesConst(hexToBinUnsafe('0011')),
      AddressConst(lockupScriptCodec.decode(base58ToBytes(testAddress)))
    ])

    expect(genArgs([false, [1n, 2n], ['0011', '2233']])).toEqual([
      ConstFalse,
      U256Const1,
      U256Const2,
      BytesConst(hexToBinUnsafe('0011')),
      BytesConst(hexToBinUnsafe('2233'))
    ])

    expect(genArgs([true, { array0: [1n, 2n], array1: [-1n, -2n] }])).toEqual([
      ConstTrue,
      U256Const1,
      U256Const2,
      I256ConstN1,
      I256Const(-2n)
    ])

    expect(() => genArgs(['1234a'])).toThrow('Invalid number')
    expect(() => genArgs([2n ** 256n])).toThrow('Invalid u256 number')
    expect(() => genArgs([-(2n ** 256n)])).toThrow('Invalid i256 number')
    expect(() => genArgs([new Map<string, bigint>()])).toThrow('Map cannot be used as a function argument')
  })

  it('should build dapp txs', () => {
    expect(() => new DappTransactionBuilder(randomContractAddress())).toThrow('Invalid caller address')
    expect(() => new DappTransactionBuilder('Il')).toThrow('Invalid caller address')

    const builder = new DappTransactionBuilder(testAddress)
    expect(() =>
      builder.callContract({
        contractAddress: testAddress,
        methodIndex: 0,
        args: []
      })
    ).toThrow('Invalid contract address')

    expect(() =>
      builder.callContract({
        contractAddress: randomContractAddress(),
        methodIndex: -1,
        args: []
      })
    ).toThrow('Invalid method index')

    const commonParams = { contractAddress: randomContractAddress(), methodIndex: 0, args: [] }
    expect(() =>
      builder.callContract({
        ...commonParams,
        tokens: [{ id: 'invalid id', amount: 1n }]
      })
    ).toThrow('Invalid token id')

    expect(() =>
      builder.callContract({
        ...commonParams,
        tokens: [{ id: randomContractId().slice(0, 60), amount: 1n }]
      })
    ).toThrow('Invalid token id')

    expect(() =>
      builder.callContract({
        ...commonParams,
        tokens: [{ id: ALPH_TOKEN_ID, amount: -1n }]
      })
    ).toThrow('Invalid token amount')

    const result0 = builder.callContract({ ...commonParams }).getResult()
    expect(result0.attoAlphAmount).toEqual(undefined)
    expect(result0.tokens).toEqual([])

    const tokenId0 = randomContractId()
    const tokenId1 = randomContractId()
    const result1 = builder
      .callContract({
        ...commonParams,
        attoAlphAmount: ONE_ALPH,
        tokens: [
          { id: ALPH_TOKEN_ID, amount: ONE_ALPH },
          { id: tokenId0, amount: ONE_ALPH },
          { id: tokenId1, amount: 0n }
        ]
      })
      .getResult()
    expect(result1.attoAlphAmount).toEqual(ONE_ALPH * 2n)
    expect(result1.tokens).toEqual([{ id: tokenId0, amount: ONE_ALPH }])

    const result2 = builder
      .callContract({
        ...commonParams,
        attoAlphAmount: 0n,
        tokens: [
          { id: tokenId0, amount: 0n },
          { id: tokenId1, amount: ONE_ALPH }
        ]
      })
      .callContract({
        ...commonParams,
        attoAlphAmount: ONE_ALPH,
        tokens: [
          { id: tokenId0, amount: ONE_ALPH },
          { id: tokenId1, amount: ONE_ALPH }
        ]
      })
      .getResult()
    expect(result2.attoAlphAmount).toEqual(ONE_ALPH)
    expect(result2.tokens).toEqual([
      { id: tokenId1, amount: ONE_ALPH * 2n },
      { id: tokenId0, amount: ONE_ALPH }
    ])
  })
})
