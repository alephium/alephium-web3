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

import { verifySignature, web3 } from '@alephium/web3'
import { PrivateKeyWallet } from './privatekey-wallet'

describe('PrivateKeyWallet', () => {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  })

  it('should generate a private key of correct length', () => {
    for (let i = 0; i < 100; i++) {
      const wallet = PrivateKeyWallet.Random()
      expect(wallet.privateKey.length).toEqual(64)
    }
  })

  it('should generate unique private keys', () => {
    const wallets = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const wallet = PrivateKeyWallet.Random()
      wallets.add(wallet.privateKey)
    }
    expect(wallets.size).toEqual(100)
  })

  it('should generate a wallet with valid address and public key', () => {
    const wallet = PrivateKeyWallet.Random()
    expect(wallet.address).toBeDefined()
    expect(wallet.publicKey).toBeDefined()
    expect(wallet.address.length).toBe(45)
    expect(wallet.publicKey.length).toBe(66)
  })

  it('should correctly sign raw data', async () => {
    const wallet = PrivateKeyWallet.Random()
    const hexString = 'deadbeef'
    const signature = await wallet.signRaw(wallet.address, hexString)

    expect(signature).toBeDefined()
    expect(typeof signature).toBe('string')
    expect(verifySignature(hexString, wallet.publicKey, signature)).toBe(true)
  })

  it('should throw an error if signing with an incorrect address', async () => {
    const wallet = PrivateKeyWallet.Random()
    const hexString = 'deadbeef'

    await expect(wallet.signRaw('invalid-address', hexString)).rejects.toThrow('Unmatched signer address')
  })

  it('should create a wallet from a mnemonic', () => {
    const mnemonic = 'test test test test test test test test test test test junk'
    const wallet = PrivateKeyWallet.FromMnemonic({ mnemonic })

    expect(wallet.privateKey).toBeDefined()
    expect(wallet.publicKey).toBeDefined()
    expect(wallet.address).toBeDefined()
  })

  it('should create a wallet with a specific group from a mnemonic', () => {
    const mnemonic = 'test test test test test test test test test test test junk'
    const targetGroup = 1
    const wallet = PrivateKeyWallet.FromMnemonicWithGroup(mnemonic, targetGroup)

    expect(wallet.group).toEqual(targetGroup)
    expect(wallet.privateKey).toBeDefined()
    expect(wallet.publicKey).toBeDefined()
    expect(wallet.address).toBeDefined()
  })

  it('should generate a wallet with the correct target group', () => {
    const targetGroup = 3
    const wallet = PrivateKeyWallet.Random(targetGroup)

    expect(wallet.group).toEqual(targetGroup)
  })
})
