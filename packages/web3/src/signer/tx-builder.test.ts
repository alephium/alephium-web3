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
import { TransactionBuilder } from './tx-builder'
import { NodeProvider } from '../api'
import { addressFromPublicKey } from '../address'
import { SignTransferTxParams, SignDeployContractTxParams, SignExecuteScriptTxParams } from './types'

describe('TransactionBuilder', () => {
  let nodeProvider: jest.Mocked<NodeProvider>
  let transactionBuilder: TransactionBuilder

  beforeEach(() => {
    // Create a mock NodeProvider
    nodeProvider = {
      transactions: {
        postTransactionsBuild: jest.fn(),
        postTransactionsBuildChained: jest.fn()
      },
      contracts: {
        postContractsUnsignedTxDeployContract: jest.fn(),
        postContractsUnsignedTxExecuteScript: jest.fn()
      }
    } as any

    // Create a transaction builder using the mock node provider
    transactionBuilder = TransactionBuilder.from(nodeProvider)
  })

  describe('static from method', () => {
    it('should create a TransactionBuilder from NodeProvider', () => {
      const builder = TransactionBuilder.from(nodeProvider)
      expect(builder).toBeDefined()
      expect(builder.nodeProvider).toBe(nodeProvider)
    })

    it('should create a TransactionBuilder from URL', () => {
      const builder = TransactionBuilder.from('http://test-url', 'test-api-key')
      expect(builder).toBeDefined()
      expect(builder.nodeProvider).toBeDefined()
    })
  })

  describe('buildTransferTx', () => {
    const mockPublicKey = 'test-public-key'
    const mockSignerAddress = addressFromPublicKey(mockPublicKey)

    const mockTransferParams: SignTransferTxParams = {
      signerAddress: mockSignerAddress,
      signerKeyType: 'default',
      destinations: [
        {
          address: 'recipient-address',
          attoAlphAmount: '1000000000000000000'
        }
      ],
      gasPrice: '1000000000'
    }

    it('should build transfer transaction', async () => {
      const mockBuildResponse = {
        txId: 'test-tx-id',
        fromGroup: 0,
        toGroup: 1,
        gasPrice: '1000000000'
      }

      // Mock the node provider's build method
      ;(nodeProvider.transactions.postTransactionsBuild as jest.Mock).mockResolvedValue(mockBuildResponse)

      const result = await transactionBuilder.buildTransferTx(mockTransferParams, mockPublicKey)

      // Verify method call
      expect(nodeProvider.transactions.postTransactionsBuild).toHaveBeenCalledWith({
        fromPublicKey: mockPublicKey,
        fromPublicKeyType: 'default',
        destinations: mockTransferParams.destinations,
        gasPrice: mockTransferParams.gasPrice,
        signerAddress: mockSignerAddress
      })

      // Verify result
      expect(result).toEqual({
        ...mockBuildResponse,
        gasPrice: mockBuildResponse.gasPrice
      })
    })

    it('should throw error for mismatched public key', async () => {
      const invalidPublicKey = 'invalid-public-key'

      await expect(transactionBuilder.buildTransferTx(mockTransferParams, invalidPublicKey)).rejects.toThrow(
        'Unmatched public key'
      )
    })
  })

  describe('buildDeployContractTx', () => {
    const mockPublicKey = 'test-public-key'
    const mockSignerAddress = addressFromPublicKey(mockPublicKey)

    const mockDeployParams: SignDeployContractTxParams = {
      signerAddress: mockSignerAddress,
      signerKeyType: 'default',
      bytecode: 'contract-bytecode',
      initialAttoAlphAmount: '1000000000000000000',
      initialTokenAmounts: [],
      gasPrice: '1000000000'
    }

    it('should build deploy contract transaction', async () => {
      const mockBuildResponse = {
        txId: 'test-tx-id',
        fromGroup: 0,
        contractAddress: '0x1234567890',
        gasPrice: '1000000000'
      }

      // Mock the node provider's deploy contract method
      ;(nodeProvider.contracts.postContractsUnsignedTxDeployContract as jest.Mock).mockResolvedValue(mockBuildResponse)

      const result = await transactionBuilder.buildDeployContractTx(mockDeployParams, mockPublicKey)

      // Verify method call
      expect(nodeProvider.contracts.postContractsUnsignedTxDeployContract).toHaveBeenCalledWith({
        fromPublicKey: mockPublicKey,
        fromPublicKeyType: 'default',
        bytecode: mockDeployParams.bytecode,
        initialAttoAlphAmount: mockDeployParams.initialAttoAlphAmount,
        initialTokenAmounts: [],
        gasPrice: mockDeployParams.gasPrice,
        signerAddress: mockSignerAddress
      })

      // Verify result
      expect(result).toEqual(
        expect.objectContaining({
          txId: 'test-tx-id',
          fromGroup: 0,
          contractId: expect.any(String),
          gasPrice: mockBuildResponse.gasPrice
        })
      )
    })
  })

  describe('buildExecuteScriptTx', () => {
    const mockPublicKey = 'test-public-key'
    const mockSignerAddress = addressFromPublicKey(mockPublicKey)

    const mockExecuteScriptParams: SignExecuteScriptTxParams = {
      signerAddress: mockSignerAddress,
      signerKeyType: 'default',
      script: 'script-bytecode',
      attoAlphAmount: '1000000000000000000',
      tokens: [],
      gasPrice: '1000000000',
      bytecode: ''
    }

    it('should build execute script transaction', async () => {
      const mockBuildResponse = {
        txId: 'test-tx-id',
        fromGroup: 0,
        gasPrice: '1000000000'
      }

      // Mock the node provider's execute script method
      ;(nodeProvider.contracts.postContractsUnsignedTxExecuteScript as jest.Mock).mockResolvedValue(mockBuildResponse)

      const result = await transactionBuilder.buildExecuteScriptTx(mockExecuteScriptParams, mockPublicKey)

      // Verify method call
      expect(nodeProvider.contracts.postContractsUnsignedTxExecuteScript).toHaveBeenCalledWith({
        fromPublicKey: mockPublicKey,
        fromPublicKeyType: 'default',
        script: mockExecuteScriptParams.script,
        attoAlphAmount: mockExecuteScriptParams.attoAlphAmount,
        tokens: [],
        gasPrice: mockExecuteScriptParams.gasPrice,
        signerAddress: mockSignerAddress
      })

      // Verify result
      expect(result).toEqual({
        ...mockBuildResponse,
        groupIndex: 0,
        gasPrice: mockBuildResponse.gasPrice
      })
    })
  })

  describe('buildChainedTx', () => {
    const mockPublicKey1 = 'test-public-key-1'
    const mockPublicKey2 = 'test-public-key-2'
    const mockSignerAddress1 = addressFromPublicKey(mockPublicKey1)
    const mockSignerAddress2 = addressFromPublicKey(mockPublicKey2)

    it('should build chained transactions', async () => {
      const mockTransferParams: SignTransferTxParams = {
        type: 'Transfer',
        signerAddress: mockSignerAddress1,
        signerKeyType: 'default',
        destinations: [
          {
            address: 'recipient-address-1',
            attoAlphAmount: '1000000000000000000'
          }
        ],
        gasPrice: '1000000000'
      }

      const mockDeployParams: SignDeployContractTxParams = {
        type: 'DeployContract',
        signerAddress: mockSignerAddress2,
        signerKeyType: 'default',
        bytecode: 'contract-bytecode',
        initialAttoAlphAmount: '1000000000000000000',
        initialTokenAmounts: [],
        gasPrice: '1000000000'
      }

      const mockBuildChainedResponse = [
        {
          type: 'Transfer',
          value: {
            txId: 'transfer-tx-id',
            fromGroup: 0,
            toGroup: 1,
            gasPrice: '1000000000'
          }
        },
        {
          type: 'DeployContract',
          value: {
            txId: 'deploy-tx-id',
            fromGroup: 0,
            contractAddress: '0x1234567890',
            gasPrice: '1000000000'
          }
        }
      ]

      // Mock the node provider's build chained transactions method
      ;(nodeProvider.transactions.postTransactionsBuildChained as jest.Mock).mockResolvedValue(mockBuildChainedResponse)

      const result = await transactionBuilder.buildChainedTx(
        [mockTransferParams, mockDeployParams],
        [mockPublicKey1, mockPublicKey2]
      )

      // Verify method call
      expect(nodeProvider.transactions.postTransactionsBuildChained).toHaveBeenCalledWith([
        {
          type: 'Transfer',
          value: {
            fromPublicKey: mockPublicKey1,
            fromPublicKeyType: 'default',
            destinations: mockTransferParams.destinations,
            gasPrice: mockTransferParams.gasPrice,
            signerAddress: mockSignerAddress1
          }
        },
        {
          type: 'DeployContract',
          value: {
            fromPublicKey: mockPublicKey2,
            fromPublicKeyType: 'default',
            bytecode: mockDeployParams.bytecode,
            initialAttoAlphAmount: mockDeployParams.initialAttoAlphAmount,
            initialTokenAmounts: [],
            gasPrice: mockDeployParams.gasPrice,
            signerAddress: mockSignerAddress2
          }
        }
      ])

      // Verify result
      expect(result).toEqual([
        {
          type: 'Transfer',
          txId: 'transfer-tx-id',
          fromGroup: 0,
          toGroup: 1,
          gasPrice: '1000000000'
        },
        expect.objectContaining({
          type: 'DeployContract',
          txId: 'deploy-tx-id',
          fromGroup: 0,
          contractId: expect.any(String),
          gasPrice: '1000000000'
        })
      ])
    })

    it('should throw error when number of params and public keys do not match', async () => {
      await expect(
        transactionBuilder.buildChainedTx([mockTransferParams], [mockPublicKey1, mockPublicKey2])
      ).rejects.toThrow(
        'The number of build chained transaction parameters must match the number of public keys provided'
      )
    })

    it('should throw error for unsupported transaction type', async () => {
      const invalidParams = [
        {
          type: 'InvalidType',
          signerAddress: mockSignerAddress1
        }
      ]

      await expect(transactionBuilder.buildChainedTx(invalidParams as any, [mockPublicKey1])).rejects.toThrow(
        'Unsupported transaction type: InvalidType'
      )
    })
  })

  describe('buildUnsignedTx', () => {
    it('should build unsigned transaction', () => {
      // Mock hex-encoded unsigned transaction
      const unsignedTxHex = '0123456789abcdef'

      const result = TransactionBuilder.buildUnsignedTx({
        unsignedTx: unsignedTxHex,
        signerAddress: ''
      })

      // Verify result contains expected properties
      expect(result).toEqual(
        expect.objectContaining({
          unsignedTx: unsignedTxHex,
          txId: expect.any(String),
          fromGroup: expect.any(Number),
          toGroup: expect.any(Number),
          gasAmount: expect.any(Number),
          gasPrice: expect.any(Number)
        })
      )
    })
  })
})
