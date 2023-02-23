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
import BigNumber from 'bignumber.js'

import {
  convertAlphAmount,
  convertAmountWithDecimals,
  isNumeric,
  prettifyAttoAlphAmount,
  prettifyExactAmount,
  prettifyNumber,
  prettifyNumberConfig,
  prettifyTokenAmount
} from './number'

import { tests } from './number.fixture'

describe('prettify number', () => {
  describe('when valid', () => {
    test('should prettify number', () => {
      for (const test of tests) {
        expect(prettifyExactAmount(test.raw, test.decimal)).toEqual(test.exact)
        expect(prettifyNumber(test.raw, test.decimal, prettifyNumberConfig.ALPH)).toEqual(test.alphFormat)
        expect(prettifyTokenAmount(test.raw, test.decimal)).toEqual(test.tokenFormat)

        if (test.decimal === 18) {
          expect(prettifyAttoAlphAmount(test.raw)).toEqual(test.alphFormat)
        }
      }
    })
  })
})

describe('isNumeric()', () => {
  describe('when valid', () => {
    test('should return true', () => {
      expect(isNumeric(0)).toBeTruthy()
      expect(isNumeric('123')).toBeTruthy()
      expect(isNumeric(new BigNumber('1.23'))).toBeTruthy()
    })
  })
  describe('when invalid', () => {
    test('should return false', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(isNumeric()).toBeFalsy()
      expect(isNumeric('')).toBeFalsy()
      expect(isNumeric({})).toBeFalsy()
      expect(isNumeric(null)).toBeFalsy()
      expect(isNumeric(true)).toBeFalsy()
      expect(isNumeric(false)).toBeFalsy()
      expect(isNumeric(NaN)).toBeFalsy()
    })
  })
})

describe('convertAmountWithDecimals()', () => {
  describe('when valid', () => {
    test('should convert token unit amount', () => {
      expect(convertAmountWithDecimals('0', 18)).toEqual(0n)
      expect(convertAmountWithDecimals('1.23', 2)).toEqual(123n)
      expect(convertAmountWithDecimals('1.23456', 2)).toEqual(123n)
      expect(convertAmountWithDecimals('1', 5)).toEqual(100000n)
      expect(convertAmountWithDecimals('1', 18)).toEqual(1000000000000000000n)
      expect(convertAmountWithDecimals('1.23456789', 18)).toEqual(1234567890000000000n)
    })
    test('should convert token unit amount', () => {
      expect(convertAlphAmount('0')).toEqual(0n)
      expect(convertAlphAmount('1')).toEqual(1000000000000000000n)
      expect(convertAlphAmount('1.23456789')).toEqual(1234567890000000000n)
    })
  })
  describe('when invalid', () => {
    test('should return undefined', () => {
      expect(convertAmountWithDecimals('foo', 18)).toBeUndefined()
    })
  })
})
