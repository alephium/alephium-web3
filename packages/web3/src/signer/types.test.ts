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
import { describe, it, expect } from 'vitest'
import {
  Destination,
  Account,
  SignTransferTxParams,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignMessageParams,
  MessageHasher,
  KeyType,
  SignerAddress,
  EnableOptionsBase
} from '../src/signer/types'
import { NetworkId } from '../utils'

describe('Signer Types', () => {
  describe('Destination', () => {
    it('should create a valid Destination object', () => {
      const destination: Destination = {
        address: '0x123',
        attoAlphAmount: '1000000000000000000',
        tokens: [{ id: 'token1', amount: '100' }],
        lockTime: 123456,
        message: 'Test transfer'
      }

      expect(destination.address).toBe('0x123')
      expect(destination.attoAlphAmount).toBe('1000000000000000000')
      expect(destination.tokens).toHaveLength(1)
      expect(destination.lockTime).toBe(123456)
      expect(destination.message).toBe('Test transfer')
    })

    it('should allow optional fields', () => {
      const destination: Destination = {
        address: '0x456',
        attoAlphAmount: '500000000000000000'
      }

      expect(destination.address).toBe('0x456')
      expect(destination.attoAlphAmount).toBe('500000000000000000')
      expect(destination.tokens).toBeUndefined()
      expect(destination.lockTime).toBeUndefined()
      expect(destination.message).toBeUndefined()
    })
  })

  describe('Account', () => {
    it('should create a valid Account object', () => {
      const account: Account = {
        keyType: 'default',
        address: '0x789',
        group: 1,
        publicKey: 'pubkey123'
      }

      expect(account.keyType).toBe('default')
      expect(account.address).toBe('0x789')
      expect(account.group).toBe(1)
      expect(account.publicKey).toBe('pubkey123')
    })

    it('should support different key types', () => {
      const account: Account = {
        keyType: 'bip340-schnorr',
        address: '0xabc',
        group: 2,
        publicKey: 'pubkey456'
      }

      expect(account.keyType).toBe('bip340-schnorr')
    })
  })

  describe('SignerAddress', () => {
    it('should create a valid SignerAddress object', () => {
      const signerAddress: SignerAddress = {
        signerAddress: '0x123',
        signerKeyType: 'default'
      }

      expect(signerAddress.signerAddress).toBe('0x123')
      expect(signerAddress.signerKeyType).toBe('default')
    })

    it('should allow optional signerKeyType', () => {
      const signerAddress: SignerAddress = {
        signerAddress: '0x456'
      }

      expect(signerAddress.signerAddress).toBe('0x456')
      expect(signerAddress.signerKeyType).toBeUndefined()
    })
  })

  describe('Transaction Params', () => {
    describe('SignTransferTxParams', () => {
      it('should create a valid SignTransferTxParams object', () => {
        const params: SignTransferTxParams = {
          signerAddress: '0x123',
          destinations: [
            {
              address: '0x456',
              attoAlphAmount: '1000000000000000000'
            }
          ],
          signerKeyType: 'default',
          gasAmount: 100,
          gasPrice: '1000000000000000'
        }

        expect(params.signerAddress).toBe('0x123')
        expect(params.destinations).toHaveLength(1)
        expect(params.signerKeyType).toBe('default')
        expect(params.gasAmount).toBe(100)
        expect(params.gasPrice).toBe('1000000000000000')
      })
    })

    describe('SignDeployContractTxParams', () => {
      it('should create a valid SignDeployContractTxParams object', () => {
        const params: SignDeployContractTxParams = {
          signerAddress: '0x123',
          bytecode: '0xabcdef',
          signerKeyType: 'bip340-schnorr',
          initialAttoAlphAmount: '1000000000000000000',
          initialTokenAmounts: [{ id: 'token1', amount: '100' }],
          issueTokenAmount: '500',
          issueTokenTo: '0x456',
          gasAmount: 200,
          gasPrice: '2000000000000000'
        }

        expect(params.signerAddress).toBe('0x123')
        expect(params.bytecode).toBe('0xabcdef')
        expect(params.signerKeyType).toBe('bip340-schnorr')
        expect(params.initialAttoAlphAmount).toBe('1000000000000000000')
        expect(params.initialTokenAmounts).toHaveLength(1)
        expect(params.issueTokenAmount).toBe('500')
        expect(params.issueTokenTo).toBe('0x456')
        expect(params.gasAmount).toBe(200)
        expect(params.gasPrice).toBe('2000000000000000')
      })
    })

    describe('SignExecuteScriptTxParams', () => {
      it('should create a valid SignExecuteScriptTxParams object', () => {
        const params: SignExecuteScriptTxParams = {
          signerAddress: '0x123',
          bytecode: '0xabcdef',
          signerKeyType: 'default',
          attoAlphAmount: '1000000000000000000',
          tokens: [{ id: 'token1', amount: '100' }],
          gasAmount: 150,
          gasPrice: '1500000000000000',
          gasEstimationMultiplier: 1.5
        }

        expect(params.signerAddress).toBe('0x123')
        expect(params.bytecode).toBe('0xabcdef')
        expect(params.signerKeyType).toBe('default')
        expect(params.attoAlphAmount).toBe('1000000000000000000')
        expect(params.tokens).toHaveLength(1)
        expect(params.gasAmount).toBe(150)
        expect(params.gasPrice).toBe('1500000000000000')
        expect(params.gasEstimationMultiplier).toBe(1.5)
      })
    })
  })

  describe('SignMessage', () => {
    it('should create a valid SignMessageParams object', () => {
      const messageHashers: MessageHasher[] = ['alephium', 'sha256', 'blake2b', 'identity']

      messageHashers.forEach((hasher) => {
        const params: SignMessageParams = {
          signerAddress: '0x123',
          message: 'Hello, World!',
          messageHasher: hasher,
          signerKeyType: 'default'
        }

        expect(params.signerAddress).toBe('0x123')
        expect(params.message).toBe('Hello, World!')
        expect(params.messageHasher).toBe(hasher)
        expect(params.signerKeyType).toBe('default')
      })
    })
  })

  describe('KeyType', () => {
    it('should only allow specific key types', () => {
      const validKeyTypes: KeyType[] = ['default', 'bip340-schnorr']

      validKeyTypes.forEach((keyType) => {
        const account: Account = {
          keyType,
          address: '0x123',
          group: 0,
          publicKey: 'pubkey'
        }

        expect(account.keyType).toBe(keyType)
      })
    })
  })

  describe('EnableOptionsBase', () => {
    it('should create a valid EnableOptionsBase object', () => {
      const validNetworkIds: NetworkId[] = ['mainnet', 'testnet', 'devnet']

      validNetworkIds.forEach((networkId) => {
        const options: EnableOptionsBase = {
          addressGroup: 1,
          keyType: 'default',
          networkId,
          onDisconnected: () => {}
        }

        expect(options.addressGroup).toBe(1)
        expect(options.keyType).toBe('default')
        expect(options.networkId).toBe(networkId)
        expect(typeof options.onDisconnected).toBe('function')
      })

      const minimalOptions: EnableOptionsBase = {
        onDisconnected: () => {}
      }

      expect(minimalOptions.addressGroup).toBeUndefined()
      expect(minimalOptions.keyType).toBeUndefined()
      expect(minimalOptions.networkId).toBeUndefined()
    })
  })
})
