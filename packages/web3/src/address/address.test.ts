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
  validateAddress,
  isValidAddress,
  isAssetAddress,
  isContractAddress,
  groupOfAddress,
  contractIdFromAddress,
  tokenIdFromAddress,
  groupOfPrivateKey,
  publicKeyFromPrivateKey,
  addressFromPublicKey,
  addressFromScript,
  addressFromContractId,
  subContractId,
  groupOfLockupScript
} from './address'
import { binToHex, bs58 } from '../utils'
import { randomBytes } from 'crypto'
import { LockupScript, lockupScriptCodec } from '../codec/lockup-script-codec'

describe('address', () => {
  describe('validateAddress', () => {
    it('should validate valid P2PKH addresses', () => {
      expect(() => validateAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).not.toThrow()
      expect(() => validateAddress('1D59jXR9NpD9ZQqZTRVcVbKVh6ko5TUMt89WvkA8P9P7w')).not.toThrow()
    })

    it('should validate valid P2MPKH addresses', () => {
      expect(() =>
        validateAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
      ).not.toThrow()
    })

    it('should validate valid P2SH addresses', () => {
      expect(() => validateAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).not.toThrow()
    })

    it('should validate valid P2C addresses', () => {
      expect(() => validateAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).not.toThrow()
    })

    it('should throw error for empty address', () => {
      expect(() => validateAddress('')).toThrow('Address is empty')
    })

    it('should throw error for invalid base58 string', () => {
      expect(() => validateAddress('InvalidBase58!!')).toThrow('Non-base58 character')
    })

    it('should throw error for invalid address type', () => {
      const invalidAddressType = 0x04
      const hash = randomBytes(32)
      const bytes = Buffer.concat([Buffer.from([invalidAddressType]), hash])
      const address = bs58.encode(bytes)
      expect(() => validateAddress(address)).toThrow(`Invalid address: ${address}`)
    })

    it('should throw error for invalid multisig address', () => {
      const AddressType = 0x01
      const invalidData = Buffer.from('1234567890abcdef', 'hex')
      const bytes = Buffer.concat([Buffer.from([AddressType]), invalidData])
      const address = bs58.encode(bytes)
      expect(() => validateAddress(address)).toThrow(`Invalid multisig address: ${address}`)
    })

    it('should throw error for invalid P2PKH address length', () => {
      const addressType = 0x00
      const invalidHashLength = 31
      const hash = randomBytes(invalidHashLength)
      const bytes = Buffer.concat([Buffer.from([addressType]), hash])
      const address = bs58.encode(bytes)
      expect(() => validateAddress(address)).toThrow(`Invalid address: ${address}`)
    })

    it('should throw error for invalid P2C address length', () => {
      const addressType = 0x03
      const invalidHashLength = 31
      const hash = randomBytes(invalidHashLength)
      const bytes = Buffer.concat([Buffer.from([addressType]), hash])
      const address = bs58.encode(bytes)
      expect(() => validateAddress(address)).toThrow(`Invalid address: ${address}`)
    })

    it('should throw error for invalid P2MPKH address with m <= 0', () => {
      const n = 2
      const mZero = 0
      const bytesZero = lockupScriptCodec.encode({
        kind: 'P2MPKH',
        value: {
          publicKeyHashes: [randomBytes(32), randomBytes(32)],
          m: mZero
        }
      })
      const addressZero = bs58.encode(bytesZero)
      expect(() => validateAddress(addressZero)).toThrow(`Invalid multisig address, n: ${n}, m: ${mZero}`)

      const mNegative = -1
      const bytesNegative = lockupScriptCodec.encode({
        kind: 'P2MPKH',
        value: {
          publicKeyHashes: [randomBytes(32), randomBytes(32)],
          m: mNegative
        }
      })
      const addressNegative = bs58.encode(bytesNegative)
      expect(() => validateAddress(addressNegative)).toThrow(`Invalid multisig address, n: ${n}, m: ${mNegative}`)
    })

    it('should throw error for invalid P2MPKH address where n < m', () => {
      const addressType = 0x01
      const n = 2
      const m = 3
      const encodedN = Buffer.from([n])
      const encodedM = Buffer.from([m])
      const publicKeyHashes = Buffer.concat([randomBytes(32), randomBytes(32)])
      const bytes = Buffer.concat([Buffer.from([addressType]), encodedN, publicKeyHashes, encodedM])
      const address = bs58.encode(bytes)
      expect(() => validateAddress(address)).toThrow(`Invalid multisig address, n: ${n}, m: ${m}`)
    })
  })

  it('should return if an address is valid', () => {
    expect(isValidAddress('')).toEqual(false)
    expect(isValidAddress('asdasdf')).toEqual(false)
    expect(
      isValidAddress('2jVWAcAPphJ8ueZNG1BPwbfPFjjbvorprceuqzgmJQ1ZRyELRpWgARvdB3T9trqpiJs7f4GkudPt6rQLnGbQYqq2NCi')
    ).toEqual(false)
    expect(isValidAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toEqual(true)
    expect(isValidAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toEqual(true)
    expect(
      isValidAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
    ).toEqual(true)
  })

  describe('isValidAddress', () => {
    it('should return true for valid addresses', () => {
      expect(isValidAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toBe(true)
      expect(
        isValidAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
      ).toBe(true)
      expect(isValidAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toBe(true)
      expect(isValidAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toBe(true)
    })

    it('should return false for invalid addresses', () => {
      expect(isValidAddress('')).toBe(false)
      expect(isValidAddress('InvalidBase58!!')).toBe(false)
      expect(isValidAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGF')).toBe(false)
      expect(isValidAddress('asdasdf')).toBe(false)
    })
  })

  describe('isAssetAddress', () => {
    it('should return true for valid asset addresses', () => {
      expect(isAssetAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toBe(true)
      expect(
        isAssetAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
      ).toBe(true)
      expect(isAssetAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toBe(true)
    })

    it('should return false for contract addresses', () => {
      expect(isAssetAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toBe(false)
    })

    it('should throw error for invalid addresses', () => {
      expect(() => isAssetAddress('InvalidBase58!!')).toThrow()
    })
  })

  describe('isContractAddress', () => {
    it('should return true for valid contract addresses', () => {
      expect(isContractAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toBe(true)
    })

    it('should return false for asset addresses', () => {
      expect(isContractAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toBe(false)
    })

    it('should throw error for invalid addresses', () => {
      expect(() => isContractAddress('InvalidBase58!!')).toThrow()
    })
  })

  describe('groupOfAddress', () => {
    it('should return correct group for P2PKH addresses', () => {
      expect(groupOfAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toBe(0)
      expect(groupOfAddress('1D59jXR9NpD9ZQqZTRVcVbKVh6ko5TUMt89WvkA8P9P7w')).toBe(1)
      expect(groupOfAddress('14tAT3nm7UqVP7gZ35icSdT3AEffv1kaUUMbWQK5PFygr')).toBe(2)
      expect(groupOfAddress('12F5aVQoQ7cNrgsVN2YPciwYvwmtJp4ohLa2x4R5KgLbG')).toBe(3)
    })

    it('should return correct group for P2MPKH addresses', () => {
      expect(
        groupOfAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
      ).toBe(0)
      expect(
        groupOfAddress('2jXboVD9p66wrAHkPHx2AQocAzYXUWeppmRT3PuVT3ccxX9u8puTnwLeQ2VbTd4sNkgSEgk1cLbyVGLFshGweJCk1Mr')
      ).toBe(1)
      expect(
        groupOfAddress('2je1yvQHpg8bKCDmvr1koELSNbty5DHrHYRkXomiRNvP5VcsZTK3WisBco2sCtCULM2YbxRxPd7QwhdP2hz9PEQwB1S')
      ).toBe(2),
        expect(
          groupOfAddress('2jWukVCejM4Zifz9LvMG4dfR6SEecHLX8VqbswhGwnu61d28B861UhLu3ZmTHu4N14m1kk9rbxreBYzcxta1WPawKzG')
        ).toBe(3),
        expect(groupOfAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toBe(0),
        expect(groupOfAddress('euWxyF55nGTxavL6mgGeMrFdvSRzHor8AmhgPXm8Lm9D')).toBe(1),
        expect(groupOfAddress('n2pYTzmA27tkp7UNFPhMJpjz3jr5vgessxqJ7kwomBMF')).toBe(2),
        expect(groupOfAddress('tLf6hDfrUugmxZhKxGoZMpAUBt3NcZ2hrTspTCmZ6JdQ')).toBe(3),
        expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toBe(0),
        expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kk')).toBe(1),
        expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9km')).toBe(2),
        expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kn')).toBe(3)
    })

    it('should return correct group for P2SH addresses', () => {
      expect(groupOfAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toBe(0)
    })

    it('should return correct group for P2C addresses', () => {
      expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toBe(0)
    })

    it('should throw error for invalid addresses', () => {
      expect(() => groupOfAddress('InvalidBase58!!')).toThrow()
    })
  })

  describe('groupOfLockupScript', () => {
    it('should calculate the group of lockup script', () => {
      const bytes0 = new Uint8Array(randomBytes(32))
      const bytes1 = new Uint8Array(randomBytes(32))
      const bytes2 = new Uint8Array(randomBytes(32))

      const p2pkh: LockupScript = { kind: 'P2PKH', value: new Uint8Array(bytes0) }
      const p2pkhAddress = bs58.encode(new Uint8Array([0x00, ...bytes0]))
      expect(groupOfAddress(p2pkhAddress)).toBe(groupOfLockupScript(p2pkh))

      const p2mpkh: LockupScript = {
        kind: 'P2MPKH',
        value: { publicKeyHashes: [bytes0, bytes1, bytes2], m: 2 }
      }
      const p2mpkhAddress = bs58.encode(new Uint8Array([0x01, 0x03, ...bytes0, ...bytes1, ...bytes2, 0x02]))
      expect(groupOfAddress(p2mpkhAddress)).toBe(groupOfLockupScript(p2mpkh))

      const p2sh: LockupScript = { kind: 'P2SH', value: bytes0 }
      const p2shAddress = bs58.encode(new Uint8Array([0x02, ...bytes0]))
      expect(groupOfAddress(p2shAddress)).toBe(groupOfLockupScript(p2sh))

      const p2c: LockupScript = { kind: 'P2C', value: bytes0 }
      const p2cAddress = bs58.encode(new Uint8Array([0x03, ...bytes0]))
      expect(groupOfAddress(p2cAddress)).toBe(groupOfLockupScript(p2c))
    })
  })

  describe('groupOfPrivateKey', () => {
    it('should calculate the group of private key', () => {
      expect(groupOfPrivateKey('91411e404289ec0e8b3058697f53f9b26fa7305158b4ef1a81adfbabcf094e49')).toEqual(0)
      expect(groupOfPrivateKey('8b63d2f60d74d9d74b9132bd1e4d1656d4ab1e8c2efc1a56e7d9142bf2fa2c12')).toEqual(1)
      expect(groupOfPrivateKey('82e1f50a8e372933ab8afc6362934b693e5aaa4ca308b0aac27fbe8755e0a3fa')).toEqual(2)
      expect(groupOfPrivateKey('a5c91afebe25e1644e9023e0d341ca713b59beca36e6635de37ef0c9c8689654')).toEqual(3)
    })
  })

  describe('publicKeyFromPrivateKey', () => {
    it('should compute public key from private key', () => {
      expect(publicKeyFromPrivateKey('91411e484289ec7e8b3058697f53f9b26fa7305158b4ef1a81adfbabcf090e45')).toBe(
        '030f9f042a9410969f1886f85fa20f6e43176ae23fc5e64db15b3767c84c5db2dc'
      )
    })
  })

  describe('publicKeyFromPrivateKey', () => {
    it('should compute public key from private key', () => {
      expect(publicKeyFromPrivateKey('91411e484289ec7e8b3058697f53f9b26fa7305158b4ef1a81adfbabcf090e45')).toBe(
        '030f9f042a9410969f1886f85fa20f6e43176ae23fc5e64db15b3767c84c5db2dc'
      )
    })
  })
  describe('addressFromPublicKey', () => {
    it('should compute address from public key', () => {
      expect(addressFromPublicKey('030f9f042a9410969f1886f85fa20f6e43176ae23fc5e64db15b3767c84c5db2dc')).toBe(
        '1ACCkgFfmTif46T3qK12znuWjb5Bk9jXpqaeWt2DXx8oc'
      )
    })

    it('should throw error for invalid public key', () => {
      expect(() => tokenIdFromAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toThrow(
        'Invalid contract address type: 2'
      )
    })
  })

  describe('addressFromScript', () => {
    it('should compute address from script', () => {
      const script = randomBytes(20)
      const address = addressFromScript(script)
      expect(address).toBeTruthy()
    })
  })

  describe('contractIdFromAddress', () => {
    it('should convert between contract id and address', () => {
      expect(addressFromContractId('1f6b937b935d7fac894fb22ffe2b974cae9c8c166501372f1b9155144e0ff4ae')).toBe(
        'vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3'
      )
      expect(binToHex(contractIdFromAddress('vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3'))).toBe(
        '1f6b937b935d7fac894fb22ffe2b974cae9c8c166501372f1b9155144e0ff4ae'
      )
    })

    it('should throw error for non-contract addresses', () => {
      expect(() => contractIdFromAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toThrow(
        'Invalid contract address type: 0'
      )
    })
  })

  describe('tokenIdFromAddress', () => {
    it('should extract token id from addresses', () => {
      expect(binToHex(tokenIdFromAddress('wCTeteGBeSEC54GpkS8jWBzYiYNTBUuTW3WzxGd9yExT'))).toBe(
        '25469eb0d0d0a55deea832924547b7b166c70a3554fe321e81886d3c18f19d64'
      )
      expect(binToHex(tokenIdFromAddress('xrY8dxgVm38QCQXhiUFcivFutLFUNMoo8qu8vYf7wJps'))).toBe(
        '3de370f893cb1383c828c0eb22c89aceb13fa56ddced1848db27ce7fa419c80c'
      )
    })

    it('should throw error for non-contract addresses', () => {
      expect(() => tokenIdFromAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toThrow(
        'Invalid contract address type: 2'
      )
      expect(() => tokenIdFromAddress('..')).toThrow('Non-base58 character')
    })
  })

  describe('contractIdFromTx', () => {
    it('should throw error for invalid tx', () => {
      expect(() => tokenIdFromAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toThrow(
        'Invalid contract address type: 2'
      )
      expect(() => tokenIdFromAddress('..')).toThrow('Non-base58 character')
    })
  })

  describe('subContractId', () => {
    it('should compute id of the sub contract', () => {
      const parentContractId = '0a38bc48fbb4300f1e305b201cd6129372d867122efb814d871d18c0bfe43b56'
      const pathInHex = '4f51cd1f0af97cf5ec9c7a3397eaeea549d55a93c216e54f2ab4a8cf29f6f865'
      expect(() => subContractId(parentContractId, pathInHex, -1)).toThrow('Invalid group -1')
      expect(() => subContractId(parentContractId, pathInHex, 4)).toThrow('Invalid group 4')
      expect(() => subContractId('&&', pathInHex, 0)).toThrow(`Invalid parent contract ID: &&, expected hex string`)
      expect(() => subContractId(parentContractId, '&&', 0)).toThrow(`Invalid path: &&, expected hex string`)
      expect(subContractId(parentContractId, pathInHex, 0)).toBe(
        '0e28f15ca290002c31d691aa008aa56ac12356b0380efb6c88fff929b6a26800'
      )
      expect(subContractId(parentContractId, pathInHex, 1)).toBe(
        '0e28f15ca290002c31d691aa008aa56ac12356b0380efb6c88fff929b6a26801'
      )
      expect(subContractId(parentContractId, pathInHex, 2)).toBe(
        '0e28f15ca290002c31d691aa008aa56ac12356b0380efb6c88fff929b6a26802'
      )
      expect(subContractId(parentContractId, pathInHex, 3)).toBe(
        '0e28f15ca290002c31d691aa008aa56ac12356b0380efb6c88fff929b6a26803'
      )
    })
  })
})
