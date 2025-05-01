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
    it('should validate bs58 string', () => {
      expect(isBase58('32UWxgjUHwH7P1J61tb12')).toEqual(true)
      expect(isBase58('32U.WxgjUHwH7P1J61tb12')).toEqual(false)
      expect(isBase58('')).toEqual(false)
    })
  })

  describe('base58ToBytes', () => {
    it('should convert valid base58 strings to bytes', () => {
      const input = '32UWxgjUHwH7P1J61tb12'
      const result = base58ToBytes(input)
      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBeGreaterThan(0)
      expect(bs58.encode(result)).toBe(input)
    })

    it('should handle empty string', () => {
      const result = base58ToBytes('')
      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBe(0)
    })

    it('should throw TraceableError for invalid base58 strings', () => {
      expect(() => base58ToBytes('Invalid!Base58')).toThrow(TraceableError)
    })
  })
})