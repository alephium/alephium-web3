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

import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { transactionSign, transactionVerifySignature } from './sign-verify'
import crypto from 'crypto'

// Helper function to generate random transaction IDs for testing
function generateRandomTxId(): string {
  return crypto.randomBytes(32).toString('hex')
}

describe('transaction', () => {
  const testWallet = PrivateKeyWallet.Random()
  const validTxHash = generateRandomTxId()
  const validSignature = transactionSign(validTxHash, testWallet.privateKey)

  it('should verify signature', () => {
    const testWallet = PrivateKeyWallet.Random()
    const testTxHash = generateRandomTxId()
    const validSignature = transactionSign(testTxHash, testWallet.privateKey)

    expect(transactionVerifySignature(testTxHash, testWallet.publicKey, validSignature)).toEqual(true)

    const unnormalizedSig = validSignature.slice(0, -2) + 'ff'
    const wrongSig = '1' + validSignature.slice(1)
    expect(transactionVerifySignature(testTxHash, testWallet.publicKey, unnormalizedSig)).toEqual(false)
    expect(transactionVerifySignature(testTxHash, testWallet.publicKey, wrongSig)).toEqual(false)
  })

  it('should sign and verify signature', () => {
    const testWallet = PrivateKeyWallet.Random()
    const testTxHash = generateRandomTxId()
    const testSignature = transactionSign(testTxHash, testWallet.privateKey)

    expect(transactionVerifySignature(testTxHash, testWallet.publicKey, testSignature)).toEqual(true)
  })

  it('should handle invalid public keys', () => {
    const invalidKeys = ['invalid-pubkey', '', '0123456789']
    invalidKeys.forEach((invalidKey) => {
      expect(transactionVerifySignature(validTxHash, invalidKey, validSignature)).toEqual(false)
    })
  })

  it('should handle invalid transaction hashes', () => {
    const invalidHashes = ['invalid-hash', '', '0123456789']
    invalidHashes.forEach((invalidHash) => {
      expect(transactionVerifySignature(invalidHash, testWallet.publicKey, validSignature)).toEqual(false)
    })
  })

  it('should handle invalid signatures', () => {
    const invalidSignatures = ['invalid-sig', '', '0123456789']
    invalidSignatures.forEach((invalidSig) => {
      expect(transactionVerifySignature(validTxHash, testWallet.publicKey, invalidSig)).toEqual(false)
    })
  })
})
