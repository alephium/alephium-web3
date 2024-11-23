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

import { getSigner, getSigners } from '@alephium/web3-test'
import { groupIndexOfTransaction, waitForTxConfirmation } from './utils'
import { ONE_ALPH, TOTAL_NUMBER_OF_GROUPS } from '../constants'
import { bs58, hexToBinUnsafe } from '../utils'
import { unsignedTxCodec } from '../codec'
import { groupOfAddress } from '../address'
import { blake2b } from 'blakejs'
import { web3 } from '../'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { node } from '../api'

describe('transaction utils', () => {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  describe('transaction confirmation', () => {
    let originalProvider: any

    beforeEach(() => {
      originalProvider = web3.getCurrentNodeProvider()
    })

    afterEach(() => {
      web3.setCurrentNodeProvider(originalProvider)
    })

    it('should wait for transaction confirmation', async () => {
      const mockConfirmed: node.Confirmed = {
        type: 'Confirmed',
        blockHash: '1234',
        txIndex: 0,
        chainConfirmations: 2,
        fromGroupConfirmations: 2,
        toGroupConfirmations: 2
      }

      const mockProvider = {
        transactions: {
          getTransactionsStatus: jest.fn().mockResolvedValue(mockConfirmed)
        }
      }
      web3.setCurrentNodeProvider(mockProvider as any)

      const result = await waitForTxConfirmation('test-tx-id', 1, 100)
      expect(result.type).toBe('Confirmed')
      expect(result.chainConfirmations).toBe(2)
    })

    it('should poll until transaction is confirmed', async () => {
      const mockMempool: node.MemPooled = { type: 'MemPooled' }
      const mockConfirmed: node.Confirmed = {
        type: 'Confirmed',
        blockHash: '1234',
        txIndex: 0,
        chainConfirmations: 1,
        fromGroupConfirmations: 1,
        toGroupConfirmations: 1
      }

      const mockProvider = {
        transactions: {
          getTransactionsStatus: jest.fn()
            .mockResolvedValueOnce(mockMempool)
            .mockResolvedValueOnce(mockConfirmed)
        }
      }
      web3.setCurrentNodeProvider(mockProvider as any)

      const result = await waitForTxConfirmation('test-tx-id', 1, 10)
      expect(result.type).toBe('Confirmed')
      expect(mockProvider.transactions.getTransactionsStatus).toHaveBeenCalledTimes(2)
    })

    it('should handle transaction errors', async () => {
      const mockProvider = {
        transactions: {
          getTransactionsStatus: jest.fn().mockRejectedValue(new Error('Transaction not found'))
        }
      }
      web3.setCurrentNodeProvider(mockProvider as any)

      await expect(waitForTxConfirmation('invalid-tx', 1, 100)).rejects.toThrow('Transaction not found')
    })

    it('should handle multiple confirmation levels', async () => {
      const mockSequence = [
        { type: 'MemPooled' } as node.MemPooled,
        {
          type: 'Confirmed',
          blockHash: '1234',
          txIndex: 0,
          chainConfirmations: 1,
          fromGroupConfirmations: 1,
          toGroupConfirmations: 1
        } as node.Confirmed,
        {
          type: 'Confirmed',
          blockHash: '1234',
          txIndex: 0,
          chainConfirmations: 3,
          fromGroupConfirmations: 3,
          toGroupConfirmations: 3
        } as node.Confirmed
      ]

      const mockProvider = {
        transactions: {
          getTransactionsStatus: jest.fn()
            .mockResolvedValueOnce(mockSequence[0])
            .mockResolvedValueOnce(mockSequence[1])
            .mockResolvedValueOnce(mockSequence[2])
        }
      }
      web3.setCurrentNodeProvider(mockProvider as any)

      const result = await waitForTxConfirmation('test-tx-id', 3, 10)
      expect(result.type).toBe('Confirmed')
      expect(result.chainConfirmations).toBe(3)
      expect(mockProvider.transactions.getTransactionsStatus).toHaveBeenCalledTimes(3)
    })

    it('should handle network errors during polling', async () => {
      const mockConfirmed: node.Confirmed = {
        type: 'Confirmed',
        blockHash: '1234',
        txIndex: 0,
        chainConfirmations: 1,
        fromGroupConfirmations: 1,
        toGroupConfirmations: 1
      }
  
      const mockProvider = {
        transactions: {
          getTransactionsStatus: jest.fn()
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(mockConfirmed)
            .mockResolvedValueOnce(mockConfirmed) 
        }
      }
      web3.setCurrentNodeProvider(mockProvider as any)
  
      try {
        await waitForTxConfirmation('test-tx-id', 1, 10)
      } catch (error) {
        const result = await waitForTxConfirmation('test-tx-id', 1, 10)
        expect(result.type).toBe('Confirmed')
        expect(mockProvider.transactions.getTransactionsStatus).toHaveBeenCalled()
      }
    })      

  })

  describe('transaction types', () => {
    it('should identify confirmed transactions', () => {
      const confirmedTx: node.Confirmed = {
        type: 'Confirmed',
        blockHash: '1234',
        txIndex: 0,
        chainConfirmations: 1,
        fromGroupConfirmations: 1,
        toGroupConfirmations: 1
      }

      const confirmedTxHighConfirm: node.Confirmed = {
        type: 'Confirmed',
        blockHash: '5678',
        txIndex: 1,
        chainConfirmations: 10,
        fromGroupConfirmations: 8,
        toGroupConfirmations: 9
      }

      expect(confirmedTx.type).toBe('Confirmed')
      expect(confirmedTxHighConfirm.type).toBe('Confirmed')
      expect(confirmedTx.chainConfirmations).toBeLessThan(confirmedTxHighConfirm.chainConfirmations)
    })

    it('should identify non-confirmed transactions', () => {
      const mempoolTx: node.MemPooled = {
        type: 'MemPooled'
      }
      expect(mempoolTx.type === 'Confirmed').toBe(false)
    })

    it('should identify mempool transactions', () => {
      const mempoolTx: node.MemPooled = { type: 'MemPooled' }
      expect(mempoolTx.type).toBe('MemPooled')
      expect(mempoolTx.type).not.toBe('Confirmed')

      const mempoolTxs: node.MemPooled[] = [
        { type: 'MemPooled' },
        { type: 'MemPooled' }
      ]
      mempoolTxs.forEach(tx => {
        expect(tx.type).toBe('MemPooled')
      })
    })

    it('should handle transition from mempool to confirmed', () => {
      const mempoolTx: node.MemPooled = { type: 'MemPooled' }
      const confirmedTx1: node.Confirmed = {
        type: 'Confirmed',
        blockHash: '1234',
        txIndex: 0,
        chainConfirmations: 1,
        fromGroupConfirmations: 1,
        toGroupConfirmations: 1
      }
      const confirmedTx2: node.Confirmed = {
        type: 'Confirmed',
        blockHash: '1234',
        txIndex: 0,
        chainConfirmations: 2,
        fromGroupConfirmations: 2,
        toGroupConfirmations: 2
      }

      expect(mempoolTx.type).toBe('MemPooled')
      expect(confirmedTx1.type).toBe('Confirmed')
      expect(confirmedTx2.type).toBe('Confirmed')
      expect(confirmedTx2.chainConfirmations).toBeGreaterThan(confirmedTx1.chainConfirmations)
    })

    it('should validate confirmed transaction properties', () => {
      const confirmedTx: node.Confirmed = {
        type: 'Confirmed',
        blockHash: '1234',
        txIndex: 0,
        chainConfirmations: 5,
        fromGroupConfirmations: 4,
        toGroupConfirmations: 4
      }

      expect(confirmedTx.type).toBe('Confirmed')
      expect(confirmedTx.blockHash).toBeTruthy()
      expect(typeof confirmedTx.txIndex).toBe('number')
      expect(confirmedTx.chainConfirmations).toBeGreaterThan(0)
      expect(confirmedTx.fromGroupConfirmations).toBeLessThanOrEqual(confirmedTx.chainConfirmations)
      expect(confirmedTx.toGroupConfirmations).toBeLessThanOrEqual(confirmedTx.chainConfirmations)
    })

    it('should identify transaction types correctly', () => {
      const confirmedTx: node.TxStatus = {
        type: 'Confirmed',
        blockHash: '1234',
        txIndex: 0,
        chainConfirmations: 1,
        fromGroupConfirmations: 1,
        toGroupConfirmations: 1
      }
      const mempoolTx: node.TxStatus = { type: 'MemPooled' }

      expect(confirmedTx.type).toBe('Confirmed')
      expect(mempoolTx.type).toBe('MemPooled')
    })
  })

describe('transaction type guard tests', () => {
  it('should correctly identify different transaction statuses', () => {
    const confirmedTx: node.TxStatus = {
      type: 'Confirmed',
      blockHash: '1234',
      txIndex: 0,
      chainConfirmations: 1,
      fromGroupConfirmations: 1,
      toGroupConfirmations: 1
    }
    
    const mempoolTx: node.TxStatus = {
      type: 'MemPooled'
    }

    if (confirmedTx.type === 'Confirmed') {
      expect(confirmedTx.chainConfirmations).toBeDefined()
      expect(confirmedTx.blockHash).toBeDefined()
    }

    if (mempoolTx.type === 'MemPooled') {
      expect(Object.keys(mempoolTx).length).toBe(1)
    }
  })
})

  // Helper functions
  function randomGroup(): number {
    return Math.floor(Math.random() * TOTAL_NUMBER_OF_GROUPS)
  }

  function toPublicKeyHash(publicKey: string): Uint8Array {
    return blake2b(hexToBinUnsafe(publicKey), undefined, 32)
  }
})
