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

import { encrypt, decrypt } from '../password-crypto'
import * as walletUtils from './walletUtils'
import { addressToGroup } from '../address'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'

import wallets from './fixtures/wallets.json'
import genesis from './fixtures/genesis.json'
import { RecoverableWalletStoredState } from './StoredState'

describe('Wallet', function () {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should encrypt and decrypt using password', async () => {
    const myPassword = 'alephium'
    const myWallet = await walletUtils.walletGenerate(myPassword)
    const readWallet = JSON.parse(decrypt(myPassword, myWallet.encryptedSecretJson)) as RecoverableWalletStoredState
    expect(await myWallet.getMnemonic(myPassword)).toEqual(readWallet.mnemonic)
    expect(myWallet.accounts).toEqual(readWallet.accounts)
  })

  it('should import wallet in a compatible manner', async () => {
    const randomAddress = '143jS8xaGNNRes4f1mxJWSpQcqj2xjsXUeu3xQqYgFm5h'
    const randomPubKey = '034817bc790123a551aa82453cc2ca1dd5ea7a9ffb85443a1a67936c3299d7a751'
    const randomPriKey = '695ac21c784d0d3f9f5441de0ee07f724d12be258f0ebdaef7ff5ee540f8e2d8'
    genesis.forEach(async (row: { mnemonic: string; address: string; pubKey: string; priKey: string }) => {
      const myWallet = await walletUtils.walletImport('somePassword', row.mnemonic)
      const myWalletStoredState = JSON.parse(
        decrypt('somePassword', myWallet.encryptedSecretJson)
      ) as RecoverableWalletStoredState
      expect(row.address).toEqual(myWalletStoredState.accounts[0].p2pkhAddress)
      expect(row.address).not.toEqual(randomAddress)
      expect(row.pubKey).toEqual(myWallet.accounts[0].publicKey)
      expect(row.pubKey).not.toEqual(randomPubKey)
      expect(row.priKey).toEqual(myWalletStoredState.accounts[0].privateKey)
      expect(row.priKey).not.toEqual(randomPriKey)
    })
  })

  it('generate mnemonic with 24 words', async () => {
    const myPassword = 'alephium'
    const myWallet = await walletUtils.walletGenerate(myPassword)
    expect((await myWallet.getMnemonic(myPassword)).split(' ').length).toEqual(24)
  })

  it('should read wallet file', async () => {
    for (const row of wallets.wallets) {
      const imported = await walletUtils.walletImport(row.password, row.mnemonic)
      const myWalletStoredState = JSON.parse(
        decrypt(row.password, imported.encryptedSecretJson)
      ) as RecoverableWalletStoredState
      const opened = await walletUtils.walletOpen(row.password, JSON.stringify(row.file))
      const openedWalletStoredState = JSON.parse(
        decrypt(row.password, opened.encryptedSecretJson)
      ) as RecoverableWalletStoredState
      expect(myWalletStoredState.accounts[0].p2pkhAddress).toEqual(openedWalletStoredState.accounts[0].p2pkhAddress)
      expect(myWalletStoredState.accounts[0].publicKey).toEqual(openedWalletStoredState.accounts[0].publicKey)
      expect(myWalletStoredState.accounts[0].privateKey).toEqual(openedWalletStoredState.accounts[0].privateKey)
      expect(myWalletStoredState.mnemonic).toEqual(openedWalletStoredState.mnemonic)
    }
  })

  it('should throw error if mnemonic is invalid', async () => {
    const invalidMnemonic =
      'dog window beach above tiger attract barrel noodle autumn grain update either twelve security shoe teach quote flip reflect maple bike polar ivory gadget'
    await expect(async () => walletUtils.walletImport('alephium', invalidMnemonic)).rejects.toThrow(
      'Invalid seed phrase'
    )
  })

  it('should throw error if private key is missing', async () => {
    const importedWallet = wallets.wallets[0]
    const seed = Buffer.from(importedWallet.seed, 'hex')
    const hdKey = HDKey.fromMasterSeed(seed)
    const mockedDerivePath = jest.fn()
    hdKey.derive = mockedDerivePath
    mockedDerivePath.mockReturnValue({ privateKey: null })

    jest.spyOn(HDKey, 'fromMasterSeed').mockImplementationOnce(() => hdKey)

    await expect(() => walletUtils.walletImport('alephium', importedWallet.mnemonic)).rejects.toThrow('Empty key pair')
  })

  describe('should derive a new address', () => {
    const importedWallet = wallets.wallets[0]
    const seed = Buffer.from(importedWallet.seed, 'hex')
    const { address: existingAddress, addressIndex: existingAddressIndex } = walletUtils.deriveNewAddressData(seed)

    it('in a random group', () => {
      let newAddressData = walletUtils.deriveNewAddressData(seed)
      expect(newAddressData.address).toEqual(existingAddress)
      newAddressData = walletUtils.deriveNewAddressData(seed, undefined, undefined, [existingAddressIndex])
      expect(newAddressData.address).not.toEqual(existingAddress)
    })

    it('in a specific group', () => {
      const validGroups = Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys()) // [0, 1, 2, ..., TOTAL_NUMBER_OF_GROUPS - 1]
      validGroups.forEach((validGroup) => {
        const newAddressData = walletUtils.deriveNewAddressData(seed, validGroup, undefined, [existingAddressIndex])
        const groupOfNewAddress = addressToGroup(newAddressData.address, TOTAL_NUMBER_OF_GROUPS)
        expect(groupOfNewAddress).toEqual(validGroup)
        expect(newAddressData.address).not.toEqual(existingAddress)
      })

      const invalidGroups = [-1, TOTAL_NUMBER_OF_GROUPS, TOTAL_NUMBER_OF_GROUPS + 1, -0.1, 0.1, 1e18, -1e18]
      invalidGroups.forEach((invalidGroup) => {
        expect(() =>
          walletUtils.deriveNewAddressData(seed, invalidGroup, undefined, [existingAddressIndex])
        ).toThrowError('Invalid group number')
      })
    })

    it('of a specific path index', () => {
      expect(walletUtils.getPath()).toEqual("m/44'/1234'/0'/0/0")
      expect(walletUtils.getPath(0)).toEqual("m/44'/1234'/0'/0/0")
      expect(walletUtils.getPath(1)).toEqual("m/44'/1234'/0'/0/1")
      expect(walletUtils.getPath(2)).toEqual("m/44'/1234'/0'/0/2")
      expect(walletUtils.getPath(3)).toEqual("m/44'/1234'/0'/0/3")
      expect(walletUtils.getPath(3)).toEqual("m/44'/1234'/0'/0/3")
      expect(walletUtils.getPath(4)).toEqual("m/44'/1234'/0'/0/4")
      expect(walletUtils.getPath(9999)).toEqual("m/44'/1234'/0'/0/9999")
      expect(walletUtils.getPath(1e18)).toEqual("m/44'/1234'/0'/0/1000000000000000000")
      expect(() => walletUtils.getPath(-1)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(0.1)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(-0.1)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(1e21)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(1e-21)).toThrowError('Invalid address index path level')
      expect(() => walletUtils.getPath(1e-18)).toThrowError('Invalid address index path level')
    })
  })
})
