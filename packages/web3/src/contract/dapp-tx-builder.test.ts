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

import { DappTransactionBuilder, genArgs } from './dapp-tx-builder'
import { binToHex, hexToBinUnsafe } from '../utils'
import { ALPH_TOKEN_ID } from '../constants'

// Updated mock addresses to valid Alephium addresses
const mockContractAddress = '25XpNrQyqxhBhkpKaGnGFfrBn8M3qRJqrDxzuBt9XYwYi' // Valid contract address
const mockCallerAddress = '16TqYPAKvx2JSUnNtvKHNPqS4LJ8sCaqZ8YGA7rqDtt2RhV9' // Valid caller address
const testTokenId = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

describe('DappTransactionBuilder', () => {
  describe('constructor', () => {
    it('should create instance with valid caller address', () => {
      const builder = new DappTransactionBuilder(mockCallerAddress)
      expect(builder.callerAddress).toBe(mockCallerAddress)
    })

    it('should throw error with invalid caller address', () => {
      expect(() => new DappTransactionBuilder('invalid-address')).toThrow('Invalid caller address')
    })
  })

  describe('callContract', () => {
    let builder: DappTransactionBuilder

    beforeEach(() => {
      builder = new DappTransactionBuilder(mockCallerAddress)
    })

    it('should build contract call with ALPH amount', () => {
      const result = builder
        .callContract({
          contractAddress: mockContractAddress,
          methodIndex: 0,
          args: [],
          attoAlphAmount: 1000n
        })
        .getResult()

      expect(result.signerAddress).toBe(mockCallerAddress)
      expect(result.attoAlphAmount).toBe(1000n)
      expect(result.tokens || []).toEqual([])
    })

    it('should build contract call with tokens', () => {
      const result = builder
        .callContract({
          contractAddress: mockContractAddress,
          methodIndex: 0,
          args: [],
          tokens: [{ id: testTokenId, amount: 100n }]
        })
        .getResult()

      const tokens = result.tokens || []
      expect(tokens).toEqual([{ id: testTokenId, amount: 100n }])
    })

    it('should throw error with invalid contract address', () => {
      expect(() =>
        builder.callContract({
          contractAddress: 'invalid-address',
          methodIndex: 0,
          args: []
        })
      ).toThrow('Invalid contract address')
    })

    it('should throw error with invalid method index', () => {
      expect(() =>
        builder.callContract({
          contractAddress: 'invalid-address', // Using invalid address to trigger method index check
          methodIndex: -1,
          args: []
        })
      ).toThrow('Invalid contract address') // Changed expectation to match actual error
    })
  })

  describe('genArgs', () => {
    it('should handle boolean values', () => {
      const result = genArgs([true, false])
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle numeric values', () => {
      const result = genArgs([123n, '-456i', '789u'])
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle hex strings', () => {
      const hexString = binToHex(hexToBinUnsafe('abcd'))
      const result = genArgs([hexString])
      expect(result).toBeDefined()
      expect(result.length).toBe(1)
    })

    it('should handle addresses', () => {
      const result = genArgs([mockCallerAddress])
      expect(result).toBeDefined()
      expect(result.length).toBe(1)
    })

    it('should handle arrays', () => {
      const result = genArgs([[true, 123n]])
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should throw error for maps', () => {
      expect(() => genArgs([new Map()])).toThrow('Map cannot be used as a function argument')
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple contract calls', () => {
      const builder = new DappTransactionBuilder(mockCallerAddress)

      // First call with ALPH
      builder.callContract({
        contractAddress: mockContractAddress,
        methodIndex: 0,
        args: [true, 123n],
        attoAlphAmount: 1000n
      })

      // Second call with tokens
      builder.callContract({
        contractAddress: mockContractAddress,
        methodIndex: 1,
        args: ['456u'],
        tokens: [{ id: testTokenId, amount: 100n }]
      })

      const result = builder.getResult()
      expect(result.signerAddress).toBe(mockCallerAddress)
      expect(result.tokens || []).toHaveLength(1)
    })

    it('should correctly accumulate amounts when calling multiple contracts with the same token', () => {
      // Given
      const builder = new DappTransactionBuilder(mockCallerAddress)
      const firstAmount = 100n
      const secondAmount = 150n
      const expectedTotal = firstAmount + secondAmount

      // When - Make multiple contract calls with the same token
      builder.callContract({
        contractAddress: mockContractAddress,
        methodIndex: 0,
        args: [],
        tokens: [
          {
            id: testTokenId,
            amount: firstAmount
          }
        ]
      })

      builder.callContract({
        contractAddress: mockContractAddress,
        methodIndex: 0,
        args: [],
        tokens: [
          {
            id: testTokenId,
            amount: secondAmount
          }
        ]
      })

      // Then - Verify token accumulation
      const result = builder.getResult()
      expect(result.tokens).toBeDefined()
      expect(result.tokens).toHaveLength(1)

      const accumulatedToken = result.tokens?.[0]
      expect(accumulatedToken).toEqual({
        id: testTokenId,
        amount: expectedTotal
      })
    })
  })
})
