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
  web3,
  verifySignedMessage,
  publicKeyFromPrivateKey,
  TOTAL_NUMBER_OF_GROUPS,
  addressFromPublicKey,
  groupOfAddress,
  MessageHasher
} from '@alephium/web3'
import {
  deriveSchnorrPrivateKey,
  deriveSchnorrPrivateKeyForGroup,
  deriveSecp256K1PrivateKey,
  deriveSecp256K1PrivateKeyForGroup,
  generateMnemonic,
  HDWallet
} from './hd-wallet'

describe('HD wallet', () => {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  })

  const testMnemonic =
    'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'

  it('should gerate mnemonic', () => {
    expect(generateMnemonic().split(' ').length).toBe(24)
    expect(generateMnemonic(12).split(' ').length).toBe(12)
    expect(generateMnemonic(24).split(' ').length).toBe(24)
  })

  it('should derive private key based on index for secp256k1', () => {
    expect(deriveSecp256K1PrivateKey(testMnemonic, 0)).toEqual(
      'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'
    )
    expect(deriveSecp256K1PrivateKey(testMnemonic, 1)).toEqual(
      'bd7dd0c4abd3cf8ba2d169c8320a2cc8bc8ab583b0db9a32d4352d6f5b15d037'
    )
    expect(deriveSecp256K1PrivateKey(testMnemonic, 2)).toEqual(
      '93ae1392f36a592aca154ea14e51b791c248beaea1b63117c57cc46d56e5f482'
    )
    expect(deriveSecp256K1PrivateKey(testMnemonic, 3)).toEqual(
      'ec8c4e863e4027d5217c382bfc67bd2638f21d6f956653505229f1d242123a9a'
    )
    expect(deriveSecp256K1PrivateKey(testMnemonic, 0, 'Alephium')).toEqual(
      '62814353f0fac259b448441898f294b17eff73ab1fd6a7fc4b8216f7e039bdce'
    )
    expect(deriveSecp256K1PrivateKey(testMnemonic, 1, 'Alephium')).toEqual(
      'ff8efb234d82f49ece8b34fa9a7250e16879a7a8a222463390159e2e51a1a117'
    )
    expect(deriveSecp256K1PrivateKey(testMnemonic, 2, 'Alephium')).toEqual(
      '9fce4cb835651c8d2aeed1daead8bd04ab314d586e9b8423ee0d7a264cb8608e'
    )
    expect(deriveSecp256K1PrivateKey(testMnemonic, 3, 'Alephium')).toEqual(
      'd8da830fe81dc6be8b2d0cc60dff79412f7b58445ab5463c63d1791b08ec1110'
    )
  })

  it('should derive private key for groups and secp256k1', () => {
    expect(deriveSecp256K1PrivateKeyForGroup(testMnemonic, 0, 0, 'Alephium')[0]).toEqual(
      '62814353f0fac259b448441898f294b17eff73ab1fd6a7fc4b8216f7e039bdce'
    )
    expect(deriveSecp256K1PrivateKeyForGroup(testMnemonic, 1, 0, 'Alephium')[0]).toEqual(
      'f62df0157aec61806d51480425e1f7a4950e13fa9a2de87988ae1d861e09d2ae'
    )
    expect(deriveSecp256K1PrivateKeyForGroup(testMnemonic, 2, 0, 'Alephium')[0]).toEqual(
      'cae87098274ff447f785bc408a71b3416d6140bd824e623375959cbf43d2a2d5'
    )
    expect(deriveSecp256K1PrivateKeyForGroup(testMnemonic, 3, 0, 'Alephium')[0]).toEqual(
      '9fce4cb835651c8d2aeed1daead8bd04ab314d586e9b8423ee0d7a264cb8608e'
    )
    expect(deriveSecp256K1PrivateKeyForGroup(testMnemonic, 0, 100, 'Alephium')[0]).toEqual(
      'c047f716a03c4961d98427d3cf494fe3d5f3fd0b48fe3107699d90a453f2dce6'
    )
    expect(deriveSecp256K1PrivateKeyForGroup(testMnemonic, 1, 100, 'Alephium')[0]).toEqual(
      '800fc78e24c87c04a76f23b8ab54179ef190f640d9346d3e89cbc3036ee69c9b'
    )
    expect(deriveSecp256K1PrivateKeyForGroup(testMnemonic, 2, 100, 'Alephium')[0]).toEqual(
      '51df72c50e1b392805c3f530d2dece7e0c1842f827a579f7cd24907a6c4ff533'
    )
    expect(deriveSecp256K1PrivateKeyForGroup(testMnemonic, 3, 100, 'Alephium')[0]).toEqual(
      '04528b7736eab20cbde90f0d2f0cb3a99481dfe92664757646077ae7851e4314'
    )
  })

  function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

  it('should derive private key for groups and schnorr', () => {
    const startIndex = getRandomInt(1024)
    Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys()).forEach((group) => {
      const [privateKey, index] = deriveSchnorrPrivateKeyForGroup(testMnemonic, group, startIndex)
      expect(deriveSchnorrPrivateKey(testMnemonic, index)).toBe(privateKey)
      const address = addressFromPublicKey(publicKeyFromPrivateKey(privateKey, 'bip340-schnorr'), 'bip340-schnorr')
      expect(groupOfAddress(address)).toBe(group)
    })
  })

  it('should derive account', async () => {
    const wallet = new HDWallet({ mnemonic: testMnemonic, passphrase: 'Alephium' })
    const account0 = wallet.deriveAndAddNewAccount(0)
    const account1 = wallet.deriveAndAddNewAccount(1)
    const account2 = wallet.deriveAndAddNewAccount(2)
    const account3 = wallet.deriveAndAddNewAccount(3)
    expect(account0.group).toBe(0)
    expect(account1.group).toBe(1)
    expect(account2.group).toBe(2)
    expect(account3.group).toBe(3)
    expect(account0.publicKey).toEqual(
      publicKeyFromPrivateKey('62814353f0fac259b448441898f294b17eff73ab1fd6a7fc4b8216f7e039bdce')
    )
    expect(account1.publicKey).toEqual(
      publicKeyFromPrivateKey('f62df0157aec61806d51480425e1f7a4950e13fa9a2de87988ae1d861e09d2ae')
    )
    expect(account2.publicKey).toEqual(
      publicKeyFromPrivateKey('cae87098274ff447f785bc408a71b3416d6140bd824e623375959cbf43d2a2d5')
    )
    expect(account3.publicKey).toEqual(
      publicKeyFromPrivateKey('9fce4cb835651c8d2aeed1daead8bd04ab314d586e9b8423ee0d7a264cb8608e')
    )
    expect(await wallet.getAccount(account0.address)).toStrictEqual(account0)
    expect(await wallet.getAccount(account1.address)).toStrictEqual(account1)
    expect(await wallet.getAccount(account2.address)).toStrictEqual(account2)
    expect(await wallet.getAccount(account3.address)).toStrictEqual(account3)

    const newAccount0 = wallet.deriveAndAddNewAccount(0)
    const newAccount1 = wallet.deriveAndAddNewAccount(1)
    const newAccount2 = wallet.deriveAndAddNewAccount(2)
    const newAccount3 = wallet.deriveAndAddNewAccount(3)
    expect(newAccount0.group).toBe(0)
    expect(newAccount1.group).toBe(1)
    expect(newAccount2.group).toBe(2)
    expect(newAccount3.group).toBe(3)
    expect(newAccount0.addressIndex).toBeGreaterThan(account0.addressIndex)
    expect(newAccount1.addressIndex).toBeGreaterThan(account1.addressIndex)
    expect(newAccount2.addressIndex).toBeGreaterThan(account2.addressIndex)
    expect(newAccount3.addressIndex).toBeGreaterThan(account3.addressIndex)
  })

  const message = '09282cae7d2a81d8e6a5d436dc64bd2eaefeaaef1d086739bf6be4d37be0ad3a'
  const test = async (wallet: HDWallet, messageHasher: MessageHasher) => {
    const account = wallet.deriveAndAddNewAccount()
    const result = await wallet.signMessage({
      signerAddress: account.address,
      message: message,
      messageHasher
    })
    const signature = result.signature
    expect(verifySignedMessage(message, messageHasher, account.publicKey, signature, wallet.keyType)).toBe(true)
  }

  it('should sign with secp256k1', async () => {
    const wallet = new HDWallet({ mnemonic: testMnemonic })
    const account = wallet.deriveAndAddNewAccount()
    expect(account.keyType).toBe('default')

    await test(wallet, 'alephium')
    await test(wallet, 'blake2b')
    await test(wallet, 'sha256')
    await test(wallet, 'identity')
  })

  it('should sign with schnorr', async () => {
    const wallet = new HDWallet({ mnemonic: testMnemonic, keyType: 'bip340-schnorr' })
    const account = wallet.deriveAndAddNewAccount()
    expect(account.keyType).toBe('bip340-schnorr')

    await test(wallet, 'alephium')
    await test(wallet, 'blake2b')
    await test(wallet, 'sha256')
    await test(wallet, 'identity')
  })
})
