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

import { Buffer } from 'buffer/'
import { HDKey } from '@scure/bip32'

import * as walletUtils from './walletUtils'
import bs58 from '../bs58'
import { encrypt, decrypt } from '../password-crypto'
import { RecoverableWalletStoredState } from './StoredState'
import { RecoverableWallet } from './RecoverableWallet'

import { addressToGroup } from '../address'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'

import wallets from './fixtures/wallets.json'
import genesis from './fixtures/genesis.json'

describe('RecoverableWallet', function () {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should encrypt using password', async () => {
    const expectedStoredState = new RecoverableWalletStoredState({
      accounts: [
        {
          privateKey: '540c4d79218cd57e719169e165c4e86c58165339e01b8d7e11521b24f235ea92',
          p2pkhAddress: '196CqbT1PiVWrKbXWx5VtgW4vceXUmkeP4juQ4XYwqbk9',
          publicKey: '03f9374f435718c9c93626e38c3c4901705b96c852fef52000913f972e665f4fff'
        }
      ],
      seed: Buffer.from(
        bs58.decode('2TEbXt3xRhovw9kVFdQ6yV2G4y4grwFBRZ9W2ruawJU4o6BT6SckdqvXcK8U9d5C9EcnVFt5bj2ygYLnTDCjFtpT')
      ),
      mnemonic:
        'afraid climb enough indicate sibling mansion ranch river drum brand tooth electric legal million middle ticket defense math miracle advice sadness account alpha inspire'
    })
    const expectedPassword = 'alephium'

    const actualWallet = await RecoverableWallet.FromMnemonic(expectedPassword, expectedStoredState.mnemonic)

    // const actualMnemonic = await actualWallet.getMnemonic(expectedPassword)
    const actualEncryptedStoredState = actualWallet.encryptedSecretJson
    const actualStoredState = JSON.parse(decrypt(expectedPassword, actualEncryptedStoredState))

    expect(actualStoredState).toEqual(expectedStoredState)

    // const myPassword = 'alephium'
    // const readWallet = new RecoverableWallet(myPassword, myWallet.encrypt(myPassword))
    // readWallet.encryptedSecretJson
    // expect(JSON.stringify(myWallet)).toEqual(JSON.stringify(readWallet))

    // const wrongPassword = 'utopia'
    // await expect(() => {
    //   walletUtils.walletOpen(wrongPassword, myWallet.encrypt(myPassword))
    // }).toThrow('Unsupported state or unable to authenticate data')
  })

  // it('should import wallet in a compatible manner', () => {
  //   const randomAddress = '143jS8xaGNNRes4f1mxJWSpQcqj2xjsXUeu3xQqYgFm5h'
  //   const randomPubKey = '034817bc790123a551aa82453cc2ca1dd5ea7a9ffb85443a1a67936c3299d7a751'
  //   const randomPriKey = '695ac21c784d0d3f9f5441de0ee07f724d12be258f0ebdaef7ff5ee540f8e2d8'
  //   genesis.forEach(function (row: { mnemonic: string; address: string; pubKey: string; priKey: string }) {
  //     const myWallet = walletUtils.walletImport(row.mnemonic)
  //     expect(row.address).toEqual(myWallet.address)
  //     expect(row.address).not.toEqual(randomAddress)
  //     expect(row.pubKey).toEqual(myWallet.publicKey)
  //     expect(row.pubKey).not.toEqual(randomPubKey)
  //     expect(row.priKey).toEqual(myWallet.privateKey)
  //     expect(row.priKey).not.toEqual(randomPriKey)
  //   })
  // })

  // it('generate mnemonic with 24 words', () => {
  //   const myWallet = walletUtils.walletGenerate()
  //   expect(myWallet.mnemonic.split(' ').length).toEqual(24)
  // })

  // it('should read wallet file', async () => {
  //   for (const row of wallets.wallets) {
  //     const imported = walletUtils.walletImport(row.mnemonic)
  //     const opened = await walletUtils.walletOpen(row.password, JSON.stringify(row.file))

  //     expect(imported.address).toEqual(opened.address)
  //     expect(imported.publicKey).toEqual(opened.publicKey)
  //     expect(imported.privateKey).toEqual(opened.privateKey)
  //     expect(imported.seed).toEqual(opened.seed)
  //     expect(imported.mnemonic).toEqual(opened.mnemonic)
  //   }
  // })

  // it('should throw error if mnemonic is invalid', () => {
  //   const invalidMnemonic =
  //     'dog window beach above tiger attract barrel noodle autumn grain update either twelve security shoe teach quote flip reflect maple bike polar ivory gadget'
  //   expect(() => walletUtils.walletImport(invalidMnemonic)).toThrow('Invalid seed phrase')
  // })

  // it('should throw error if private key is missing', () => {
  //   const importedWallet = wallets.wallets[0]
  //   const seed = Buffer.from(importedWallet.seed, 'hex')
  //   const hdKey = HDKey.fromMasterSeed(seed)
  //   const mockedDerivePath = jest.fn()
  //   hdKey.derive = mockedDerivePath
  //   mockedDerivePath.mockReturnValue({ privateKey: null })

  //   jest.spyOn(HDKey, 'fromMasterSeed').mockImplementationOnce(() => hdKey)

  //   expect(() => walletUtils.walletImport(importedWallet.mnemonic)).toThrow('Empty key pair')
  // })

  // describe('should derive a new address', () => {
  //   const importedWallet = wallets.wallets[0]
  //   const seed = Buffer.from(importedWallet.seed, 'hex')
  //   const { address: existingAddress, addressIndex: existingAddressIndex } = walletUtils.deriveNewAddressData(seed)

  //   it('in a random group', () => {
  //     let newAddressData = walletUtils.deriveNewAddressData(seed)
  //     expect(newAddressData.address).toEqual(existingAddress)
  //     newAddressData = walletUtils.deriveNewAddressData(seed, undefined, undefined, [existingAddressIndex])
  //     expect(newAddressData.address).not.toEqual(existingAddress)
  //   })

  //   it('in a specific group', () => {
  //     const validGroups = Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys()) // [0, 1, 2, ..., TOTAL_NUMBER_OF_GROUPS - 1]
  //     validGroups.forEach((validGroup) => {
  //       const newAddressData = walletUtils.deriveNewAddressData(seed, validGroup, undefined, [existingAddressIndex])
  //       const groupOfNewAddress = addressToGroup(newAddressData.address, TOTAL_NUMBER_OF_GROUPS)
  //       expect(groupOfNewAddress).toEqual(validGroup)
  //       expect(newAddressData.address).not.toEqual(existingAddress)
  //     })

  //     const invalidGroups = [-1, TOTAL_NUMBER_OF_GROUPS, TOTAL_NUMBER_OF_GROUPS + 1, -0.1, 0.1, 1e18, -1e18]
  //     invalidGroups.forEach((invalidGroup) => {
  //       expect(() =>
  //         walletUtils.deriveNewAddressData(seed, invalidGroup, undefined, [existingAddressIndex])
  //       ).toThrowError('Invalid group number')
  //     })
  //   })

  //   it('of a specific path index', () => {
  //     expect(walletUtils.getPath()).toEqual("m/44'/1234'/0'/0/0")
  //     expect(walletUtils.getPath(0)).toEqual("m/44'/1234'/0'/0/0")
  //     expect(walletUtils.getPath(1)).toEqual("m/44'/1234'/0'/0/1")
  //     expect(walletUtils.getPath(2)).toEqual("m/44'/1234'/0'/0/2")
  //     expect(walletUtils.getPath(3)).toEqual("m/44'/1234'/0'/0/3")
  //     expect(walletUtils.getPath(3)).toEqual("m/44'/1234'/0'/0/3")
  //     expect(walletUtils.getPath(4)).toEqual("m/44'/1234'/0'/0/4")
  //     expect(walletUtils.getPath(9999)).toEqual("m/44'/1234'/0'/0/9999")
  //     expect(walletUtils.getPath(1e18)).toEqual("m/44'/1234'/0'/0/1000000000000000000")
  //     expect(() => walletUtils.getPath(-1)).toThrowError('Invalid address index path level')
  //     expect(() => walletUtils.getPath(0.1)).toThrowError('Invalid address index path level')
  //     expect(() => walletUtils.getPath(-0.1)).toThrowError('Invalid address index path level')
  //     expect(() => walletUtils.getPath(1e21)).toThrowError('Invalid address index path level')
  //     expect(() => walletUtils.getPath(1e-21)).toThrowError('Invalid address index path level')
  //     expect(() => walletUtils.getPath(1e-18)).toThrowError('Invalid address index path level')
  //   })
  //  })
})
