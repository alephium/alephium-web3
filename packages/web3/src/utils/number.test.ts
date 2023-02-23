/*
Copyright 2018 - 2023 The Alephium Authors
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

import { IPrettifyNumberConfig, isNumeric, prettifyAlphAmount, prettifyNumber, toFixedNumber } from './number'

import { tests } from './number.fixture'

const TEST_TOKEN_CONIFG: IPrettifyNumberConfig = {
  minDecimalPlaces: 4,
  maxDecimalPlaces: 16,
  minDecimalSignificanDigits: 2,
  decimalPlacesWhenZero: 0
}

export const prettifyTokenAmount = (number: BigNumber.Value) => {
  return prettifyNumber(number, TEST_TOKEN_CONIFG)
}

describe('prettify number', () => {
  describe('when valid', () => {
    test('should prettify number', () => {
      for (const test of tests) {
        const fixedNumber = toFixedNumber(test.raw, test.decimal)
        expect(fixedNumber).toEqual(test.fixed)
        expect(prettifyAlphAmount(fixedNumber)).toEqual(test.currencyFormat)
        expect(prettifyTokenAmount(fixedNumber)).toEqual(test.tokenFormat)
      }
    })
  })
  describe('when invalid', () => {
    test('should return null', () => {
      /** allow us to pass invalid arguments for testing purposes */
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(prettifyNumber()).toBeNull()
      expect(prettifyNumber('foo')).toBeNull()
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
