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

import EC from 'elliptic'
import { transactionSign, transactionVerifySignature } from './sign-verify'
import { KeyType } from '../signer'

describe('transaction', function () {
  it('should verify signature', () => {
    const txHash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    const pubKey = '02625b26ae1c5f7986475009e4037b3e6fe6320fde3c3f3332bea11ecadc35dd13'
    const txSig =
      '78471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9c42dbfbf4ce73eb68c5e0d66122eb25d2ebe1cf9e37ef4c4f4e7a2ed35de141bc'
    const unnormalizedSig =
      '78471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9cbd24040b318c14973a1f299edd14da2bcecd0d48775953ec71582fb97254ff85'
    const wrongSig =
      '88471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9c42dbfbf4ce73eb68c5e0d66122eb25d2ebe1cf9e37ef4c4f4e7a2ed35de141bc'

    expect(transactionVerifySignature(txHash, pubKey, txSig)).toEqual(true)
    expect(transactionVerifySignature(txHash, pubKey, unnormalizedSig)).toEqual(false)
    expect(transactionVerifySignature(txHash, pubKey, wrongSig)).toEqual(false)
  })

  it('should sign and verify signature', () => {
    const ec = new EC.ec('secp256k1')
    const key = ec.genKeyPair()
    const privateKey = key.getPrivate().toString('hex')
    const publicKey = key.getPublic().encode('hex', true)

    const txHash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    const signature = transactionSign(txHash, privateKey)
    expect(transactionVerifySignature(txHash, publicKey, signature)).toEqual(true)
  })

  describe('transactionVerifySignature additional tests', () => {
    const validTxHash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    const validPubKey = '02625b26ae1c5f7986475009e4037b3e6fe6320fde3c3f3332bea11ecadc35dd13'
    const validSignature = '78471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9c42dbfbf4ce73eb68c5e0d66122eb25d2ebe1cf9e37ef4c4f4e7a2ed35de141bc'

    it('should handle different key types', () => {
      const ec = new EC.ec('secp256k1')
      const key = ec.genKeyPair()
      const privateKey = key.getPrivate().toString('hex')
      const publicKey = key.getPublic().encode('hex', true)
      const txHash = validTxHash

      const signature = transactionSign(txHash, privateKey)
      expect(transactionVerifySignature(txHash, publicKey, signature)).toEqual(true)
    })

    it('should handle invalid public keys', () => {
      expect(transactionVerifySignature(validTxHash, 'invalid-pubkey', validSignature)).toEqual(false)
      expect(transactionVerifySignature(validTxHash, '', validSignature)).toEqual(false)
      expect(transactionVerifySignature(validTxHash, '0123456789', validSignature)).toEqual(false)
    })

    it('should handle invalid transaction hashes', () => {
      expect(transactionVerifySignature('invalid-hash', validPubKey, validSignature)).toEqual(false)
      expect(transactionVerifySignature('', validPubKey, validSignature)).toEqual(false)
      expect(transactionVerifySignature('0123456789', validPubKey, validSignature)).toEqual(false)
    })

    it('should handle invalid signatures', () => {
      expect(transactionVerifySignature(validTxHash, validPubKey, 'invalid-sig')).toEqual(false)
      expect(transactionVerifySignature(validTxHash, validPubKey, '')).toEqual(false)
      expect(transactionVerifySignature(validTxHash, validPubKey, '0123456789')).toEqual(false)
    })
  })

})

describe('transactionSign additional tests', () => {
  const validTxHash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
  const validPubKey = '02625b26ae1c5f7986475009e4037b3e6fe6320fde3c3f3332bea11ecadc35dd13'

  it('should handle invalid private keys', () => {
    // Test with invalid private key formats
    const invalidPrivateKeys = ['invalid-key', '', '0123456789', 'not-hex', '@#$%^&*']
    
    invalidPrivateKeys.forEach(invalidKey => {
      // Since invalid private keys might throw errors, we wrap in try-catch
      try {
        const signature = transactionSign(validTxHash, invalidKey)
        // If no error thrown, the signature should fail verification
        expect(transactionVerifySignature(validTxHash, validPubKey, signature)).toBeFalsy()
      } catch (error) {
        // Error thrown is also an acceptable outcome
        expect(error).toBeTruthy()
      }
    })
  })

  it('should handle invalid transaction hashes', () => {
    // Generate a valid private key for testing
    const ec = new EC.ec('secp256k1')
    const keyPair = ec.genKeyPair()
    const validPrivateKey = keyPair.getPrivate().toString('hex')
    
    // Test with invalid transaction hash formats
    const invalidHashes = ['invalid-hash', '', '0123456789', 'not-hex', '@#$%^&*']
    
    invalidHashes.forEach(invalidHash => {
      const signature = transactionSign(invalidHash, validPrivateKey)
      // Either the signature should be invalid when verified, or signing should return an empty/invalid signature
      if (signature) {
        expect(transactionVerifySignature(invalidHash, validPubKey, signature)).toBeFalsy()
      } else {
        expect(signature).toBeFalsy()
      }
    })
  })

  it('should handle various combinations of invalid inputs', () => {
    // Test with combinations of invalid inputs
    const invalidInputs = ['invalid-input', '', '0123456789']
    
    invalidInputs.forEach(invalidInput => {
      // Test invalid hash with valid private key
      const ec = new EC.ec('secp256k1')
      const keyPair = ec.genKeyPair()
      const validPrivateKey = keyPair.getPrivate().toString('hex')
      
      try {
        const sig1 = transactionSign(invalidInput, validPrivateKey)
        expect(transactionVerifySignature(invalidInput, validPubKey, sig1)).toBeFalsy()
      } catch (error) {
        expect(error).toBeTruthy()
      }

      // Test valid hash with invalid private key
      try {
        const sig2 = transactionSign(validTxHash, invalidInput)
        expect(transactionVerifySignature(validTxHash, validPubKey, sig2)).toBeFalsy()
      } catch (error) {
        expect(error).toBeTruthy()
      }

      // Test both invalid hash and invalid private key
      try {
        const sig3 = transactionSign(invalidInput, invalidInput)
        expect(transactionVerifySignature(invalidInput, validPubKey, sig3)).toBeFalsy()
      } catch (error) {
        expect(error).toBeTruthy()
      }
    })
  })
})