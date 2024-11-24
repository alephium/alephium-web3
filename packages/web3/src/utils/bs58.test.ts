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

import { isBase58, base58ToBytes, bs58 } from './bs58'
import { TraceableError } from '../error'

describe('bs58', () => {
  describe('isBase58', () => {
    it('should validate valid bs58 strings', () => {
      expect(isBase58('32UWxgjUHwH7P1J61tb12')).toBe(true)
      expect(isBase58('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true)
    })

    it('should invalidate strings with non-base58 characters', () => {
      expect(isBase58('32U.WxgjUHwH7P1J61tb12')).toBe(false)
      expect(isBase58('Invalid_Base58')).toBe(false)
    })

    it('should handle empty strings', () => {
      expect(isBase58('')).toBe(false)
    })

    it('should handle whitespace strings', () => {
      expect(isBase58('   ')).toBe(false)
      expect(isBase58('\n\t')).toBe(false)
    })
  })

  describe('base58ToBytes', () => {
    it('should convert valid base58 strings to bytes', () => {
      const result = base58ToBytes('32UWxgjUHwH7P1J61tb12')
      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should throw TraceableError for invalid base58 strings', () => {
      expect(() => base58ToBytes('Invalid_Base58')).toThrow(TraceableError)
    })

    it('should throw TraceableError for empty strings', () => {
      expect(() => base58ToBytes('')).toThrow(TraceableError)
    })
  })

  describe('bs58', () => {
    it('should encode and decode correctly', () => {
      const original = 'Hello, Base58!'
      const encoded = bs58.encode(Buffer.from(original))
      const decoded = Buffer.from(bs58.decode(encoded)).toString()
      expect(decoded).toBe(original)
    })

    it('should handle empty input', () => {
      const encoded = bs58.encode(new Uint8Array(0))
      expect(encoded).toBe('')
      expect(bs58.decode(encoded)).toEqual(new Uint8Array(0))
    })
  })
})

