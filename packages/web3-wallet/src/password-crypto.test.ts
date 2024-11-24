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

import { encrypt, decrypt } from './password-crypto' // Replace with the correct file path

describe('Encryption and Decryption', () => {
  const password = 'secure-password'
  const testMessage = 'This is a test message'

  describe('encrypt', () => {
    it('should return a valid JSON string containing salt, iv, encrypted data, and version', () => {
      const encryptedPayload = encrypt(password, testMessage)
      const parsedPayload = JSON.parse(encryptedPayload)

      expect(parsedPayload).toHaveProperty('salt')
      expect(parsedPayload).toHaveProperty('iv')
      expect(parsedPayload).toHaveProperty('encrypted')
      expect(parsedPayload).toHaveProperty('version', 1)

      expect(typeof parsedPayload.salt).toBe('string')
      expect(typeof parsedPayload.iv).toBe('string')
      expect(typeof parsedPayload.encrypted).toBe('string')
    })

    it('should produce unique salt and IV for each encryption', () => {
      const payload1 = JSON.parse(encrypt(password, testMessage))
      const payload2 = JSON.parse(encrypt(password, testMessage))

      expect(payload1.salt).not.toBe(payload2.salt)
      expect(payload1.iv).not.toBe(payload2.iv)
      expect(payload1.encrypted).not.toBe(payload2.encrypted)
    })
  })

  describe('decrypt', () => {
    it('should correctly decrypt an encrypted message using the same password', () => {
      const encryptedPayload = encrypt(password, testMessage)
      const decryptedMessage = decrypt(password, encryptedPayload)

      expect(decryptedMessage).toBe(testMessage)
    })

    it('should throw an error when the password is incorrect', () => {
      const encryptedPayload = encrypt(password, testMessage)
      const wrongPassword = 'wrong-password'

      expect(() => decrypt(wrongPassword, encryptedPayload)).toThrow(/Unsupported state or unable to authenticate data/)
    })

    it('should throw an error if the version is not 1', () => {
      const encryptedPayload = encrypt(password, testMessage)
      const parsedPayload = JSON.parse(encryptedPayload)
      parsedPayload.version = 2

      expect(() => decrypt(password, JSON.stringify(parsedPayload))).toThrow(/Invalid version: got 2, expected: 1/)
    })

    it('should throw an error if the salt or IV is missing', () => {
      const encryptedPayload = encrypt(password, testMessage)
      const parsedPayload = JSON.parse(encryptedPayload)

      delete parsedPayload.salt

      expect(() => decrypt(password, JSON.stringify(parsedPayload))).toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle an empty message for encryption and decryption', () => {
      const emptyMessage = ''
      const encryptedPayload = encrypt(password, emptyMessage)
      const decryptedMessage = decrypt(password, encryptedPayload)

      expect(decryptedMessage).toBe(emptyMessage)
    })

    it('should handle large messages for encryption and decryption', () => {
      const largeMessage = 'A'.repeat(1_000_000) // 1 MB of data
      const encryptedPayload = encrypt(password, largeMessage)
      const decryptedMessage = decrypt(password, encryptedPayload)

      expect(decryptedMessage).toBe(largeMessage)
    })

    it('should handle messages with special characters and emojis', () => {
      const specialMessage = 'Special characters: 🚀✨🎉!@#$%^&*()_+'
      const encryptedPayload = encrypt(password, specialMessage)
      const decryptedMessage = decrypt(password, encryptedPayload)

      expect(decryptedMessage).toBe(specialMessage)
    })
  })
})
