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
  SignerProvider,
  extendMessage,
  hashMessage,
  verifySignedMessage,
  toApiDestination,
  toApiDestinations,
  fromApiDestination
} from './signer'
import * as utils from '../utils'
import {
  Account,
  MessageHasher,
  SignTransferTxParams,
  SignTransferTxResult,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
  SignChainedTxParams,
  SignChainedTxResult,
  SignMessageParams,
  SignMessageResult
} from './types'
import { NodeProvider } from '../api'

describe('SignerModule', () => {
  // SignerProvider tests
  describe('SignerProvider', () => {
    class MockSignerProvider extends SignerProvider {
      nodeProvider: NodeProvider | undefined = undefined
      explorerProvider = undefined

      async unsafeGetSelectedAccount(): Promise<Account> {
        return {
          address: 'test-address',
          publicKey: 'test-public-key',
          keyType: 'secp256k1',
          group: 0
        }
      }

      async signAndSubmitTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult> {
        return {
          txId: 'mock-tx-id',
          unsignedTx: 'mock-unsigned-tx',
          signature: 'mock-signature'
        }
      }

      async signAndSubmitDeployContractTx(params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> {
        return {
          txId: 'mock-tx-id',
          unsignedTx: 'mock-unsigned-tx',
          signature: 'mock-signature'
        }
      }

      async signAndSubmitExecuteScriptTx(params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> {
        return {
          txId: 'mock-tx-id',
          unsignedTx: 'mock-unsigned-tx',
          signature: 'mock-signature'
        }
      }

      async signAndSubmitUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
        return {
          txId: 'mock-tx-id',
          unsignedTx: 'mock-unsigned-tx',
          signature: 'mock-signature'
        }
      }

      async signAndSubmitChainedTx(params: SignChainedTxParams[]): Promise<SignChainedTxResult[]> {
        return params.map(() => ({
          txId: 'mock-tx-id',
          unsignedTx: 'mock-unsigned-tx',
          signature: 'mock-signature'
        }))
      }

      async signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> {
        return {
          txId: 'mock-tx-id',
          unsignedTx: 'mock-unsigned-tx',
          signature: 'mock-signature'
        }
      }

      async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
        return {
          signature: 'mock-signature'
        }
      }
    }

    describe('validateAccount', () => {
      it('should validate a correct account', () => {
        const account: Account = {
          address: 'test-address',
          publicKey: 'test-public-key',
          keyType: 'secp256k1',
          group: 0
        }
        expect(() => SignerProvider.validateAccount(account)).not.toThrow()
      })

      it('should throw error for invalid account', () => {
        const account: Account = {
          address: 'wrong-address',
          publicKey: 'test-public-key',
          keyType: 'secp256k1',
          group: 0
        }
        expect(() => SignerProvider.validateAccount(account)).toThrow('Invalid accounot data')
      })
    })

    describe('getSelectedAccount', () => {
      it('should return validated account', async () => {
        const mockProvider = new MockSignerProvider()
        const account = await mockProvider.getSelectedAccount()
        expect(account.address).toBe('test-address')
      })
    })
  })

  // Utility Functions Tests
  describe('Utility Functions', () => {
    describe('extendMessage', () => {
      it('should prefix message with Alephium Signed Message', () => {
        const message = 'hello'
        expect(extendMessage(message)).toBe('Alephium Signed Message: hello')
      })
    })

    describe('hashMessage', () => {
      const message = 'test'
      const hashers: MessageHasher[] = ['alephium', 'sha256', 'blake2b', 'identity']

      hashers.forEach((hasher) => {
        it(`should hash message with ${hasher} hasher`, () => {
          const hash = hashMessage(message, hasher)
          expect(hash).toBeTruthy()
          expect(hash.length).toBeGreaterThan(0)
        })
      })

      it('should throw error for invalid hasher', () => {
        expect(() => hashMessage(message, 'invalid' as MessageHasher)).toThrow('Invalid message hasher')
      })
    })

    describe('verifySignedMessage', () => {
      const mockPublicKey = 'mock-public-key'
      const mockSignature = 'mock-signature'
      const message = 'test message'
      const hashers: MessageHasher[] = ['alephium', 'sha256', 'blake2b', 'identity']

      it('should verify signature with different hashers', () => {
        hashers.forEach((hasher) => {
          // Mock the utility verification
          jest.spyOn(utils, 'verifySignature').mockReturnValue(true)

          const result = verifySignedMessage(message, hasher, mockPublicKey, mockSignature)
          expect(result).toBe(true)
        })
      })
    })

    describe('API Destination Helpers', () => {
      const mockDestination = {
        address: 'test-address',
        attoAlphAmount: '100',
        tokens: [
          {
            id: 'token-id',
            amount: '50'
          }
        ]
      }

      it('should convert destination to API format', () => {
        const apiDestination = toApiDestination(mockDestination)
        expect(apiDestination.attoAlphAmount).toBeTruthy()
        expect(apiDestination.tokens).toBeTruthy()
      })

      it('should convert multiple destinations to API format', () => {
        const destinations = [mockDestination, mockDestination]
        const apiDestinations = toApiDestinations(destinations)
        expect(apiDestinations.length).toBe(2)
      })

      it('should convert API destination back to original format', () => {
        const apiDestination = toApiDestination(mockDestination)
        const convertedBack = fromApiDestination(apiDestination)
        expect(convertedBack).toEqual(mockDestination)
      })
    })
  })
})
