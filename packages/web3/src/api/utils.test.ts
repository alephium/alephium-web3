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

import { ONE_ALPH } from '../constants'
import { TraceableError } from '../error'
import { NodeProvider, isBalanceEqual, node } from './index'

describe('utils', function () {
  it('should throw API error', async () => {
    const provider = new NodeProvider('http://127.0.0.1:22973')
    await expect(provider.addresses.getAddressesAddressGroup('000')).rejects.toThrowError(
      new TraceableError(
        'Failed to request getAddressesAddressGroup',
        new Error(
          '[API Error] - Invalid value for: path parameter address (Invalid address 000: 000) - Status code: 400'
        )
      )
    )
  })

  test('is balance equal', () => {
    const b0: node.Balance = {
      balance: ONE_ALPH.toString(),
      balanceHint: '',
      lockedBalance: ONE_ALPH.toString(),
      lockedBalanceHint: '',
      utxoNum: 1
    }
    const b1 = { ...b0 }

    expect(isBalanceEqual(b0, b1)).toEqual(true)
    expect(isBalanceEqual(b0, { ...b1, utxoNum: 2 })).toEqual(false)
    expect(isBalanceEqual(b0, { ...b1, balance: '10000' })).toEqual(false)
    expect(isBalanceEqual(b0, { ...b1, lockedBalance: '10000' })).toEqual(false)

    expect(isBalanceEqual(b0, { ...b1, tokenBalances: [] })).toEqual(true)
    expect(isBalanceEqual(b0, { ...b1, lockedTokenBalances: [] })).toEqual(true)
    expect(isBalanceEqual(b0, { ...b1, tokenBalances: [], lockedTokenBalances: [] })).toEqual(true)

    expect(isBalanceEqual(b0, { ...b1, tokenBalances: [{ id: '0', amount: '1' }] })).toEqual(false)
    expect(
      isBalanceEqual(
        { ...b0, tokenBalances: [{ id: '0', amount: '1' }] },
        { ...b1, tokenBalances: [{ id: '0', amount: '1' }] }
      )
    ).toEqual(true)
    expect(
      isBalanceEqual(
        { ...b0, tokenBalances: [{ id: '1', amount: '1' }] },
        { ...b1, tokenBalances: [{ id: '0', amount: '1' }] }
      )
    ).toEqual(false)
    expect(
      isBalanceEqual(
        { ...b0, tokenBalances: [{ id: '0', amount: '2' }] },
        { ...b1, tokenBalances: [{ id: '0', amount: '1' }] }
      )
    ).toEqual(false)
    expect(
      isBalanceEqual(
        {
          ...b0,
          tokenBalances: [
            { id: '0', amount: '2' },
            { id: '0', amount: '2' }
          ]
        },
        {
          ...b1,
          tokenBalances: [
            { id: '0', amount: '2' },
            { id: '1', amount: '2' }
          ]
        }
      )
    ).toEqual(false)
    expect(
      isBalanceEqual(
        {
          ...b0,
          tokenBalances: [
            { id: '0', amount: '2' },
            { id: '0', amount: '2' }
          ]
        },
        {
          ...b1,
          tokenBalances: [
            { id: '0', amount: '2' },
            { id: '0', amount: '2' }
          ]
        }
      )
    ).toEqual(true)

    expect(isBalanceEqual(b0, { ...b1, lockedTokenBalances: [{ id: '0', amount: '1' }] })).toEqual(false)
    expect(
      isBalanceEqual(
        { ...b0, lockedTokenBalances: [{ id: '0', amount: '1' }] },
        { ...b1, lockedTokenBalances: [{ id: '0', amount: '1' }] }
      )
    ).toEqual(true)
    expect(
      isBalanceEqual(
        { ...b0, lockedTokenBalances: [{ id: '1', amount: '1' }] },
        { ...b1, lockedTokenBalances: [{ id: '0', amount: '1' }] }
      )
    ).toEqual(false)
    expect(
      isBalanceEqual(
        { ...b0, lockedTokenBalances: [{ id: '0', amount: '2' }] },
        { ...b1, lockedTokenBalances: [{ id: '0', amount: '1' }] }
      )
    ).toEqual(false)
  })
})
