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
  addressFromContractId,
  addressFromPublicKey,
  contractIdFromAddress,
  groupOfAddress,
  groupOfPrivateKey,
  publicKeyFromPrivateKey,
  subContractId,
  tokenIdFromAddress,
  validateAddress,
  isAssetAddress,
  isContractAddress
} from './address'
import { binToHex } from './utils'

describe('address', function () {
  it('should validate address', () => {
    expect(validateAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toBeUndefined()
    expect(validateAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFy')).toBeUndefined()
    expect(() => validateAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGF')).toThrow('Invalid address:')
    expect(
      validateAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
    ).toBeUndefined()
    expect(() =>
      validateAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfA')
    ).toThrow('Invalid address:')
    expect(validateAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toBeUndefined()
    expect(() => validateAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX')).toThrow('Invalid address:')
    expect(validateAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toBeUndefined()
    expect(() => validateAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9k')).toThrow('Invalid address:')
  })

  it('should get address type', () => {
    expect(isAssetAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toEqual(true)
    expect(
      isAssetAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
    ).toEqual(true)
    expect(isAssetAddress('qeKk7r92Vn2Xjn4GcMEcJ2EwVfVs27kWUpptrWcWsUWC')).toEqual(true)
    expect(isAssetAddress('vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3')).toEqual(false)
    expect(isContractAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toEqual(false)
    expect(
      isContractAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
    ).toEqual(false)
    expect(isContractAddress('qeKk7r92Vn2Xjn4GcMEcJ2EwVfVs27kWUpptrWcWsUWC')).toEqual(false)
    expect(isContractAddress('vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3')).toEqual(true)
    expect(() => isAssetAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGF')).toThrow('Invalid address:')
    expect(() => isContractAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9k')).toThrow('Invalid address:')
  })

  it('should calculate the group of addresses', () => {
    expect(groupOfAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toBe(0),
      expect(groupOfAddress('1D59jXR9NpD9ZQqZTRVcVbKVh6ko5TUMt89WvkA8P9P7w')).toBe(1),
      expect(groupOfAddress('14tAT3nm7UqVP7gZ35icSdT3AEffv1kaUUMbWQK5PFygr')).toBe(2),
      expect(groupOfAddress('12F5aVQoQ7cNrgsVN2YPciwYvwmtJp4ohLa2x4R5KgLbG')).toBe(3),
      expect(
        groupOfAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
      ).toBe(0),
      expect(
        groupOfAddress('2jXboVD9p66wrAHkPHx2AQocAzYXUWeppmRT3PuVT3ccxX9u8puTnwLeQ2VbTd4sNkgSEgk1cLbyVGLFshGweJCk1Mr')
      ).toBe(1),
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

  it('should extract token id from addresses', () => {
    expect(binToHex(tokenIdFromAddress('wCTeteGBeSEC54GpkS8jWBzYiYNTBUuTW3WzxGd9yExT'))).toBe(
      '25469eb0d0d0a55deea832924547b7b166c70a3554fe321e81886d3c18f19d64'
    ),
      expect(binToHex(tokenIdFromAddress('xrY8dxgVm38QCQXhiUFcivFutLFUNMoo8qu8vYf7wJps'))).toBe(
        '3de370f893cb1383c828c0eb22c89aceb13fa56ddced1848db27ce7fa419c80c'
      ),
      expect(() => tokenIdFromAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toThrow(
        'Invalid contract address type: 2'
      ),
      expect(() => tokenIdFromAddress('..')).toThrow('Non-base58 character')
  })

  it('should calculate the group of private key', () => {
    expect(groupOfPrivateKey('a5c91afebe25e1644e9023e0d341ca713b59beca36e6635de37ef0c9c8689654')).toEqual(3)
    expect(groupOfPrivateKey('82e1f50a8e372933ab8afc6362934b693e5aaa4ca308b0aac27fbe8755e0a3fa')).toEqual(2)
    expect(groupOfPrivateKey('860ef6d3468e93aee997617e3595859fbab634111b88a79099a7e359f447cc2f')).toEqual(2)
    expect(groupOfPrivateKey('b3bda653c36f99ad5a88401ea99cbc2a3c25e74d3df652f1545439ec929bcf31')).toEqual(0)
  })

  it('should compute public key from private key', () => {
    expect(publicKeyFromPrivateKey('91411e484289ec7e8b3058697f53f9b26fa7305158b4ef1a81adfbabcf090e45')).toBe(
      '030f9f042a9410969f1886f85fa20f6e43176ae23fc5e64db15b3767c84c5db2dc'
    )
  })

  it('should compute address from public key', () => {
    expect(publicKeyFromPrivateKey('91411e484289ec7e8b3058697f53f9b26fa7305158b4ef1a81adfbabcf090e45')).toBe(
      '030f9f042a9410969f1886f85fa20f6e43176ae23fc5e64db15b3767c84c5db2dc'
    )
    expect(addressFromPublicKey('030f9f042a9410969f1886f85fa20f6e43176ae23fc5e64db15b3767c84c5db2dc')).toBe(
      '1ACCkgFfmTif46T3qK12znuWjb5Bk9jXpqaeWt2DXx8oc'
    )
  })

  it('should convert between contract id and address', () => {
    expect(addressFromContractId('1f6b937b935d7fac894fb22ffe2b974cae9c8c166501372f1b9155144e0ff4ae')).toBe(
      'vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3'
    )
    expect(binToHex(contractIdFromAddress('vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3'))).toBe(
      '1f6b937b935d7fac894fb22ffe2b974cae9c8c166501372f1b9155144e0ff4ae'
    )
  })

  it('should compute id of the sub contract', () => {
    const parentContractId = '0a38bc48fbb4300f1e305b201cd6129372d867122efb814d871d18c0bfe43b56'
    const pathInHex = '4f51cd1f0af97cf5ec9c7a3397eaeea549d55a93c216e54f2ab4a8cf29f6f865'
    expect(() => subContractId(parentContractId, pathInHex, -1)).toThrow('Invalid group -1')
    expect(() => subContractId(parentContractId, pathInHex, 4)).toThrow('Invalid group 4')
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
