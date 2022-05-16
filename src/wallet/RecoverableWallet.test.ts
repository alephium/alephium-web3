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

const testPassword = 'testPassword'

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
    const actualEncryptedStoredState = actualWallet.encryptedSecretJson
    const actualStoredState = JSON.parse(decrypt(expectedPassword, actualEncryptedStoredState))

    expect(actualStoredState).toEqual(expectedStoredState)
  })

  it('should import wallet in a compatible manner', async () => {
    const randomAddress = '143jS8xaGNNRes4f1mxJWSpQcqj2xjsXUeu3xQqYgFm5h'
    const randomPubKey = '034817bc790123a551aa82453cc2ca1dd5ea7a9ffb85443a1a67936c3299d7a751'
    const randomPriKey = '695ac21c784d0d3f9f5441de0ee07f724d12be258f0ebdaef7ff5ee540f8e2d8'
    genesis.forEach(async (row: { mnemonic: string; address: string; pubKey: string; priKey: string }) => {
      const myWallet = await RecoverableWallet.FromMnemonic(testPassword, row.mnemonic)
      const recoverableState = JSON.parse(
        decrypt(testPassword, myWallet.encryptedSecretJson)
      ) as RecoverableWalletStoredState
      expect(row.address).toEqual(myWallet.accounts[0].p2pkhAddress)
      expect(row.address).not.toEqual(randomAddress)
      expect(row.pubKey).toEqual(myWallet.accounts[0].publicKey)
      expect(row.pubKey).not.toEqual(randomPubKey)
      expect(row.priKey).toEqual(recoverableState.accounts[0].privateKey)
      expect(row.priKey).not.toEqual(randomPriKey)
    })
  })

  it('generate mnemonic with 24 words', async () => {
    const myWallet = await RecoverableWallet.GenerateNew(testPassword)
    const myMnemonic = await myWallet.getMnemonic(testPassword)
    expect(myMnemonic.split(' ').length).toEqual(24)
  })

  it('should read wallet file', async () => {
    for (const row of wallets.wallets) {
      const imported = await RecoverableWallet.FromMnemonic(row.password, row.mnemonic)
      const importedRecoverableState = JSON.parse(
        decrypt(row.password, imported.encryptedSecretJson)
      ) as RecoverableWalletStoredState
      const opened = new RecoverableWallet(JSON.stringify(row.file), row.password)
      const openedRecoverableState = JSON.parse(
        decrypt(row.password, opened.encryptedSecretJson)
      ) as RecoverableWalletStoredState
      const importedMnemonic = await imported.getMnemonic(row.password)
      const openedMnemonic = await opened.getMnemonic(row.password)
      expect(importedRecoverableState.accounts[0].p2pkhAddress).toEqual(openedRecoverableState.accounts[0].p2pkhAddress)
      expect(importedRecoverableState.accounts[0].publicKey).toEqual(openedRecoverableState.accounts[0].publicKey)
      expect(importedRecoverableState.accounts[0].privateKey).toEqual(openedRecoverableState.accounts[0].privateKey)
      expect(importedMnemonic).toEqual(openedMnemonic)
    }
  })

  it('should throw error if mnemonic is invalid', async () => {
    const invalidMnemonic =
      'dog window beach above tiger attract barrel noodle autumn grain update either twelve security shoe teach quote flip reflect maple bike polar ivory gadget'
    await expect(() => RecoverableWallet.FromMnemonic(testPassword, invalidMnemonic)).rejects.toThrow(
      'Invalid seed phrase'
    )
  })
})
