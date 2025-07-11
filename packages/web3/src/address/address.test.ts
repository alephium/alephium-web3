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
  isContractAddress,
  isValidAddress,
  groupOfLockupScript,
  isGrouplessAddress,
  isGrouplessAddressWithGroupIndex,
  isGrouplessAddressWithoutGroupIndex,
  addressToBytes,
  addressFromLockupScript,
  hasExplicitGroupIndex,
  addressWithoutExplicitGroupIndex
} from './address'
import { binToHex } from '../utils'
import { randomBytes } from 'crypto'
import { LockupScript, lockupScriptCodec } from '../codec/lockup-script-codec'
import { PublicKeyLike } from '../codec/public-key-like-codec'

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
    ).toThrow('Invalid encoded public key like kind:')
    expect(validateAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toBeUndefined()
    expect(() => validateAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX')).toThrow('Invalid address:')
    expect(validateAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toBeUndefined()
    expect(() => validateAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9k')).toThrow('Invalid address:')
    expect(() => validateAddress('asd')).toThrow('Invalid multisig address: asd')
    expect(() => validateAddress('asdasdf')).toThrow('Invalid multisig address')
    expect(() =>
      validateAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY1')
    ).toThrow('Invalid address:')
    // both n and m are 0
    expect(() => validateAddress('LUw')).toThrow('Invalid multisig address')
    expect(() =>
      validateAddress('2jVWAcAPphJ8ueZNG1BPwbfPFjjbvorprceuqzgmJQ1ZRyELRpWgARvdB3T9trqpiJs7f4GkudPt6rQLnGbQYqq2NCi')
    ).toThrow('Invalid multisig address, n: 2, m: 3')
    expect(() => validateAddress('thebear')).toThrow('Invalid multisig address')
    expect(validateAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK')).toBeUndefined()
    expect(validateAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:0')).toBeUndefined()
    expect(validateAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:1')).toBeUndefined()
    expect(validateAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:2')).toBeUndefined()
    expect(validateAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:3')).toBeUndefined()
    expect(() => validateAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8Bdjfv')).toThrow(
      'Invalid checksum: expected 1251424950, but got 1251424985'
    )
    expect(() => validateAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:4')).toThrow(
      'Invalid group index: 4'
    )
    expect(() => validateAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:j')).toThrow(
      'Invalid group index: j'
    )
    expect(validateAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh')).toBeUndefined()
    expect(validateAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:0')).toBeUndefined()
    expect(validateAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:1')).toBeUndefined()
    expect(validateAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:2')).toBeUndefined()
    expect(validateAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:3')).toBeUndefined()
    expect(() => validateAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufv')).toThrow('Invalid checksum')
    expect(() => validateAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:4')).toThrow('Invalid group index')
    expect(() => validateAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:j')).toThrow('Invalid group index')
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
    expect(isValidAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK')).toEqual(true)
    expect(isValidAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:1')).toEqual(true)
    expect(isValidAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:2')).toEqual(true)
    expect(isValidAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:3')).toEqual(true)
    expect(isValidAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:j')).toEqual(false)
    expect(isValidAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:4')).toEqual(false)
    expect(isValidAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:3')).toEqual(true)
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
    expect(isGrouplessAddress('bQzqBqFx88QitLeX7oCJh1Xvpr9tKUAFoSo9rhAZukfj6SvTYXh')).toEqual(true)
    expect(binToHex(addressToBytes('bQzqBqFx88QitLeX7oCJh1Xvpr9tKUAFoSo9rhAZukfj6SvTYXh'))).toEqual(
      '0402d105a6c69a0be5fb5d45df8a2bd7f442d45fe31a1dac842b8eb5753672d65d446d8b539000'
    )
    expect(binToHex(addressToBytes('bQzqBqFx88QitLeX7oCJh1Xvpr9tKUAFoSo9rhAZukfj6SvTYXh:2'))).toEqual(
      '0402d105a6c69a0be5fb5d45df8a2bd7f442d45fe31a1dac842b8eb5753672d65d446d8b539002'
    )
    expect(isGrouplessAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK')).toEqual(true)
    expect(isGrouplessAddress('vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3')).toEqual(false)
    expect(isGrouplessAddress('qeKk7r92Vn2Xjn4GcMEcJ2EwVfVs27kWUpptrWcWsUWC')).toEqual(false)
    expect(() => isGrouplessAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9k')).toThrow('Invalid address:')
    expect(isGrouplessAddressWithoutGroupIndex('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK')).toEqual(true)
    expect(isGrouplessAddressWithoutGroupIndex('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:1')).toEqual(
      false
    )
    expect(isGrouplessAddressWithoutGroupIndex('vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3')).toEqual(false)
    expect(isGrouplessAddressWithGroupIndex('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:1')).toEqual(true)
    expect(isGrouplessAddressWithGroupIndex('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK')).toEqual(false)
    expect(isGrouplessAddressWithGroupIndex('vobthYg1e9tPKhmF96rpkv3akCj7vhvgPpsP4qwZqDw3')).toEqual(false)
  })

  it('should calculate the group of addresses', () => {
    expect(groupOfAddress('15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu')).toBe(0)
    expect(groupOfAddress('1D59jXR9NpD9ZQqZTRVcVbKVh6ko5TUMt89WvkA8P9P7w')).toBe(1)
    expect(groupOfAddress('14tAT3nm7UqVP7gZ35icSdT3AEffv1kaUUMbWQK5PFygr')).toBe(2)
    expect(groupOfAddress('12F5aVQoQ7cNrgsVN2YPciwYvwmtJp4ohLa2x4R5KgLbG')).toBe(3)
    expect(
      groupOfAddress('2jW1n2icPtc55Cdm8TF9FjGH681cWthsaZW3gaUFekFZepJoeyY3ZbY7y5SCtAjyCjLL24c4L2Vnfv3KDdAypCddfAY')
    ).toBe(0)
    expect(
      groupOfAddress('2jXboVD9p66wrAHkPHx2AQocAzYXUWeppmRT3PuVT3ccxX9u8puTnwLeQ2VbTd4sNkgSEgk1cLbyVGLFshGweJCk1Mr')
    ).toBe(1)
    expect(
      groupOfAddress('2je1yvQHpg8bKCDmvr1koELSNbty5DHrHYRkXomiRNvP5VcsZTK3WisBco2sCtCULM2YbxRxPd7QwhdP2hz9PEQwB1S')
    ).toBe(2)
    expect(
      groupOfAddress('2jWukVCejM4Zifz9LvMG4dfR6SEecHLX8VqbswhGwnu61d28B861UhLu3ZmTHu4N14m1kk9rbxreBYzcxta1WPawKzG')
    ).toBe(3)
    expect(groupOfAddress('eBrjfQNeyUCuxE4zpbfMZcbS3PuvbMJDQBCyk4HRHtX4')).toBe(0)
    expect(groupOfAddress('euWxyF55nGTxavL6mgGeMrFdvSRzHor8AmhgPXm8Lm9D')).toBe(1)
    expect(groupOfAddress('n2pYTzmA27tkp7UNFPhMJpjz3jr5vgessxqJ7kwomBMF')).toBe(2)
    expect(groupOfAddress('tLf6hDfrUugmxZhKxGoZMpAUBt3NcZ2hrTspTCmZ6JdQ')).toBe(3)
    expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kj')).toBe(0)
    expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kk')).toBe(1)
    expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9km')).toBe(2)
    expect(groupOfAddress('yya86C6UemCeLs5Ztwjcf2Mp2Kkt4mwzzRpBiG6qQ9kn')).toBe(3)
    expect(groupOfAddress('3cUs6NYx4yS3n3t4ukgDcvHxvoer4i1tag2sJvEaadUjRottEiujx')).toBe(1)
    expect(groupOfAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK')).toBe(2)
    expect(groupOfAddress('3cUrFgcoKdfWTqXEX32JsJyJ5y7rufetcUjo7bemo5kcS9zQghv5K')).toBe(3)
    expect(groupOfAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:0')).toBe(0)
    expect(groupOfAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:1')).toBe(1)
    expect(groupOfAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:2')).toBe(2)
    expect(groupOfAddress('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK:3')).toBe(3)
    expect(groupOfAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh')).toBe(0)
    expect(groupOfAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:0')).toBe(0)
    expect(groupOfAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:1')).toBe(1)
    expect(groupOfAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:2')).toBe(2)
    expect(groupOfAddress('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:3')).toBe(3)
  })

  it('should calculate the group of lockup script', () => {
    const bytes0 = new Uint8Array(randomBytes(32))
    const bytes1 = new Uint8Array(randomBytes(32))
    const bytes2 = new Uint8Array(randomBytes(32))
    const bytes4 = new Uint8Array(randomBytes(33))

    const p2pkh: LockupScript = { kind: 'P2PKH', value: new Uint8Array(bytes0) }
    const p2pkhAddress = addressFromLockupScript(p2pkh)
    expect(groupOfAddress(p2pkhAddress)).toBe(groupOfLockupScript(p2pkh))

    const p2mpkh: LockupScript = { kind: 'P2MPKH', value: { publicKeyHashes: [bytes0, bytes1, bytes2], m: 2 } }
    const p2mpkhAddress = addressFromLockupScript(p2mpkh)
    expect(groupOfAddress(p2mpkhAddress)).toBe(groupOfLockupScript(p2mpkh))

    const p2sh: LockupScript = { kind: 'P2SH', value: bytes0 }
    const p2shAddress = addressFromLockupScript(p2sh)
    expect(groupOfAddress(p2shAddress)).toBe(groupOfLockupScript(p2sh))

    const p2c: LockupScript = { kind: 'P2C', value: bytes0 }
    const p2cAddress = addressFromLockupScript(p2c)
    expect(groupOfAddress(p2cAddress)).toBe(groupOfLockupScript(p2c))

    const publicKeyLike: PublicKeyLike = { kind: 'SecP256K1', value: bytes4 }
    const p2pk: LockupScript = { kind: 'P2PK', value: { publicKeyLike, group: 0 } }
    const p2pkAddress = addressFromLockupScript(p2pk)
    expect(groupOfAddress(p2pkAddress)).toBe(groupOfLockupScript(p2pk))

    const grouplessAddresses = [
      '3cUrKAb5KWuf61XkPorWJyNBicXG5gYTf7ZHZDKYudB4nkpD9Uu9U',
      '3cUrKAb5KWuf61XkPorWJyNBicXG5gYTf7ZHZDKYudB4nkpD9Uu9U:0',
      '3cUrKAb5KWuf61XkPorWJyNBicXG5gYTf7ZHZDKYudB4nkpD9Uu9U:1',
      '3cUrKAb5KWuf61XkPorWJyNBicXG5gYTf7ZHZDKYudB4nkpD9Uu9U:2',
      '3cUrKAb5KWuf61XkPorWJyNBicXG5gYTf7ZHZDKYudB4nkpD9Uu9U:3',
      'AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh',
      'AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:0',
      'AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:1',
      'AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:2',
      'AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh:3'
    ]

    grouplessAddresses.forEach((address) => {
      const decoded = lockupScriptCodec.decode(addressToBytes(address))
      const encoded = addressFromLockupScript(decoded)
      if (hasExplicitGroupIndex(address)) {
        expect(encoded).toBe(address)
      } else {
        expect(encoded).toBe(`${address}:${groupOfAddress(address)}`)
      }
    })
  })

  it('should remove explicit group index from addresses', () => {
    let address = 'tLf6hDfrUugmxZhKxGoZMpAUBt3NcZ2hrTspTCmZ6JdQ'
    expect(addressWithoutExplicitGroupIndex(address)).toBe(address)

    address = '3cUrKAb5KWuf61XkPorWJyNBicXG5gYTf7ZHZDKYudB4nkpD9Uu9U'
    expect(addressWithoutExplicitGroupIndex(address)).toBe(address)
    expect(addressWithoutExplicitGroupIndex(`${address}:0`)).toBe(address)
    expect(addressWithoutExplicitGroupIndex(`${address}:1`)).toBe(address)
    expect(addressWithoutExplicitGroupIndex(`${address}:2`)).toBe(address)
    expect(addressWithoutExplicitGroupIndex(`${address}:3`)).toBe(address)
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
    expect(
      publicKeyFromPrivateKey('91411e484289ec7e8b3058697f53f9b26fa7305158b4ef1a81adfbabcf090e45', 'gl-secp256k1')
    ).toBe('030f9f042a9410969f1886f85fa20f6e43176ae23fc5e64db15b3767c84c5db2dc')
    expect(
      publicKeyFromPrivateKey('31311f0cd6c75eb625c718dd810a084537bbee3bf57cc03add0570e9fa907dde', 'gl-secp256r1')
    ).toBe('031b2ce5f97c227271064705af14fc551bd62faac3f1950b19806f410bda216d96')
    expect(
      publicKeyFromPrivateKey('2faf6f6ad8fc5dc7429149d0a2cbf724c138faac0ac95baed57c5a2c0147ef31', 'gl-ed25519')
    ).toBe('1294599c73fbf283d21f459d726fcd7f1a6db5e17c4fa27f4741930a6a516db9')
    expect(
      publicKeyFromPrivateKey('31311f0cd6c75eb625c718dd810a084537bbee3bf57cc03add0570e9fa907dde', 'gl-webauthn')
    ).toBe('031b2ce5f97c227271064705af14fc551bd62faac3f1950b19806f410bda216d96')
  })

  it('should compute address from public key', () => {
    expect(addressFromPublicKey('030f9f042a9410969f1886f85fa20f6e43176ae23fc5e64db15b3767c84c5db2dc')).toBe(
      '1ACCkgFfmTif46T3qK12znuWjb5Bk9jXpqaeWt2DXx8oc'
    )
    expect(
      addressFromPublicKey('029592852f5d289785904b89a073ff80ee6155c894b1d13ecb16bcf3ac02473e1a', 'gl-secp256k1')
    ).toBe('3cUqhqEgt8qFAokkD7qRsy9Q2Q9S1LEiSdogbBmaq7CnshB8BdjfK')
    expect(
      addressFromPublicKey('031b2ce5f97c227271064705af14fc551bd62faac3f1950b19806f410bda216d96', 'gl-secp256r1')
    ).toBe('3cdSMF7FKdfGQ969vcvHMqSW14xJLN8u9Yucoy6uzHYk2N7VSgBFi')
    expect(addressFromPublicKey('1294599c73fbf283d21f459d726fcd7f1a6db5e17c4fa27f4741930a6a516db9', 'gl-ed25519')).toBe(
      'bPYxb2BrXEJnq8FSsbhvh4yaYNi7RsZH86CoZydESu2PLeGCWuH'
    )
    expect(
      addressFromPublicKey('031b2ce5f97c227271064705af14fc551bd62faac3f1950b19806f410bda216d96', 'gl-webauthn')
    ).toBe('3cvbcPRy7yy6g68BTj559RngyZphe2ySbsns561cBGWFSvmpr5BYi')
    expect(
      addressFromPublicKey('aecfc38a48f5fe7e050fca59de9f8d77fa7a7d9e63af608a95f8839de397f48a', 'bip340-schnorr')
    ).toBe('qvegNNcKFBtkMcZTLj42pki2YDYTvHaGyBxBaWrPaHwj')
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
