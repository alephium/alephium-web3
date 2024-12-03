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
import { groupIndexOfTransaction } from './utils'
import { ONE_ALPH, TOTAL_NUMBER_OF_GROUPS } from '../constants'
import { bs58, hexToBinUnsafe } from '../utils'
import { unsignedTxCodec } from '../codec'
import { groupOfAddress } from '../address'
import { blake2b } from 'blakejs'
import { web3 } from '../'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { node } from '../api'
import { waitForTxConfirmation } from './utils'

describe('transaction utils', () => {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should calculate the group of transfer transaction', async () => {
    const signer1 = await getSigner(undefined, randomGroup())
    const signer2 = await getSigner(undefined, randomGroup())
    const fromAccount = await signer1.getSelectedAccount()
    const toAccount = await signer2.getSelectedAccount()

    const tx = await signer1.buildTransferTx({
      signerAddress: fromAccount.address,
      destinations: [{ address: toAccount.address, attoAlphAmount: ONE_ALPH }]
    })

    const unsignedTx = unsignedTxCodec.decode(hexToBinUnsafe(tx.unsignedTx))
    const [fromGroup, toGroup] = groupIndexOfTransaction(unsignedTx)

    expect(fromGroup).toEqual(groupOfAddress(fromAccount.address))
    expect(toGroup).toEqual(groupOfAddress(toAccount.address))
  })

  it('should calculate the group of multisig transaction', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [signer1, signer2, signer3] = await getSigners(3, undefined, randomGroup())
    const pkh1 = toPublicKeyHash(signer1.publicKey)
    const pkh2 = toPublicKeyHash(signer2.publicKey)
    const pkh3 = toPublicKeyHash(signer3.publicKey)
    const multisigAddress = bs58.encode(new Uint8Array([0x01, 0x03, ...pkh1, ...pkh2, ...pkh3, 0x02]))
    const fromAccount = await signer1.getSelectedAccount()

    {
      // Transfer to multisig address
      const toMultiSig = await signer1.signAndSubmitTransferTx({
        signerAddress: fromAccount.address,
        destinations: [{ address: multisigAddress, attoAlphAmount: ONE_ALPH * 10n }]
      })
      const unsignedTx = unsignedTxCodec.decode(hexToBinUnsafe(toMultiSig.unsignedTx))
      const [fromGroup, toGroup] = groupIndexOfTransaction(unsignedTx)
      expect(fromGroup).toEqual(groupOfAddress(fromAccount.address))
      expect(toGroup).toEqual(groupOfAddress(multisigAddress))
    }

    {
      // Transfer from multisig address
      const fromMultiSig = await nodeProvider.multisig.postMultisigBuild({
        fromAddress: multisigAddress,
        fromPublicKeys: [signer1.publicKey, signer2.publicKey],
        destinations: [{ address: signer1.address, attoAlphAmount: ONE_ALPH.toString() }]
      })
      const unsignedTx = unsignedTxCodec.decode(hexToBinUnsafe(fromMultiSig.unsignedTx))
      const [fromGroup, toGroup] = groupIndexOfTransaction(unsignedTx)

      expect(fromGroup).toEqual(groupOfAddress(multisigAddress))
      expect(toGroup).toEqual(groupOfAddress(signer1.address))
    }
  })

  it('should calculate the group of p2sh transaction', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const signer1 = await getSigner(undefined, randomGroup())
    const schnorrSigner = PrivateKeyWallet.Random(randomGroup(), nodeProvider, 'bip340-schnorr')
    const fromAccount = await signer1.getSelectedAccount()

    {
      // Transfer to schnorr address
      const toSchnorrAddressResult = await signer1.signAndSubmitTransferTx({
        signerAddress: fromAccount.address,
        destinations: [{ address: schnorrSigner.address, attoAlphAmount: ONE_ALPH }]
      })

      const unsignedTx = unsignedTxCodec.decode(hexToBinUnsafe(toSchnorrAddressResult.unsignedTx))
      const [fromGroup, toGroup] = groupIndexOfTransaction(unsignedTx)

      expect(fromGroup).toEqual(groupOfAddress(fromAccount.address))
      expect(toGroup).toEqual(groupOfAddress(schnorrSigner.address))
    }

    {
      // Transfer from schnorr address
      const fromSchnorrAddressResult = await schnorrSigner.signAndSubmitTransferTx({
        signerAddress: schnorrSigner.address,
        signerKeyType: 'bip340-schnorr',
        destinations: [{ address: fromAccount.address, attoAlphAmount: ONE_ALPH / 2n }]
      })

      const unsignedTx = unsignedTxCodec.decode(hexToBinUnsafe(fromSchnorrAddressResult.unsignedTx))
      const [fromGroup, toGroup] = groupIndexOfTransaction(unsignedTx)

      expect(fromGroup).toEqual(groupOfAddress(schnorrSigner.address))
      expect(toGroup).toEqual(groupOfAddress(fromAccount.address))
    }
  })

  describe('transaction confirmation', () => {
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
          getTransactionsStatus: jest.fn().mockResolvedValueOnce(mockMempool).mockResolvedValueOnce(mockConfirmed)
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
          getTransactionsStatus: jest
            .fn()
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
      const mockProvider = {
        transactions: {
          getTransactionsStatus: jest.fn().mockRejectedValue(new Error('Network error'))
        }
      }
      web3.setCurrentNodeProvider(mockProvider as any)

      await expect(waitForTxConfirmation('test-tx-id', 1, 10)).rejects.toThrowError('Network error')

      expect(mockProvider.transactions.getTransactionsStatus).toHaveBeenCalled()
    })
  })

  describe('waitForTxConfirmation', () => {
    it('should poll until required confirmations are reached', async () => {
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
          getTransactionsStatus: jest
            .fn()
            .mockResolvedValueOnce(mockSequence[0])
            .mockResolvedValueOnce(mockSequence[1])
            .mockResolvedValueOnce(mockSequence[2])
        }
      }
      web3.setCurrentNodeProvider(mockProvider as any)

      const result = await waitForTxConfirmation('test-tx-id', 3, 10)
      expect(result.chainConfirmations).toBe(3)
      expect(mockProvider.transactions.getTransactionsStatus).toHaveBeenCalledTimes(3)
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

  //Helper functions
  function toPublicKeyHash(publicKey: string): Uint8Array {
    return blake2b(hexToBinUnsafe(publicKey), undefined, 32)
  }

  function randomGroup(): number {
    return Math.floor(Math.random() * TOTAL_NUMBER_OF_GROUPS)
  }
})
