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

const BN_N1 = BigInt(-1)
const BN_0 = BigInt(0)

// Constant to pull zeros from for multipliers
let Zeros = '0000'
while (Zeros.length < 80) {
  Zeros += Zeros
}

export function toFixedNumber(val: bigint, decimals: number): string {
  let negative = ''
  if (val < BN_0) {
    negative = '-'
    val *= BN_N1
  }
  let str = val.toString()
  // No decimal point for whole values
  if (decimals === 0) {
    return negative + str
  }
  // Pad out to the whole component (including a whole digit)
  while (str.length <= decimals) {
    str = Zeros + str
  }
  // Insert the decimal point
  const index = str.length - decimals
  str = str.substring(0, index) + '.' + str.substring(index)
  // Trim the whole component (leaving at least one 0)
  while (str[0] === '0' && str[1] !== '.') {
    str = str.substring(1)
  }
  // Trim the decimal component (leaving at least one 0)
  while (str[str.length - 1] === '0' && str[str.length - 2] !== '.') {
    str = str.substring(0, str.length - 1)
  }
  return negative + str
}

export const isNumeric = (numToCheck: any): boolean => !isNaN(parseFloat(numToCheck)) && isFinite(numToCheck)

export interface IPrettifyNumberConfig {
  minDecimalPlaces: number
  maxDecimalPlaces: number
  /** significants digits to show in decimals while respecting decimal places */
  minDecimalSignificanDigits: number
  /** special case for zero, e.g. we may want to display $0.00 or 0.0 ALPH */
  decimalPlacesWhenZero: number
}

export const prettifyNumberConfig: Record<string, IPrettifyNumberConfig> = {
  ALPH: {
    minDecimalPlaces: 2,
    maxDecimalPlaces: 10,
    minDecimalSignificanDigits: 2,
    decimalPlacesWhenZero: 2
  }
}

export const prettifyAlphAmount = (number: BigNumber.Value) => {
  return prettifyNumber(number)
}

export const prettifyNumber = (
  number: BigNumber.Value,
  {
    minDecimalPlaces,
    maxDecimalPlaces,
    minDecimalSignificanDigits,
    decimalPlacesWhenZero
  }: IPrettifyNumberConfig = prettifyNumberConfig.ALPH
) => {
  if (!isNumeric(number)) {
    return null
  }
  const numberBN = new BigNumber(number)

  let untrimmed
  if (numberBN.gte(1)) {
    /** simplest case, formatting to minDecimalPlaces will look good */
    untrimmed = numberBN.toFormat(minDecimalPlaces)
  } else {
    /** now need to interrogate the appearance of decimal number < 1 */
    /** longest case - max decimal places e.g. 0.0008923088123 -> 0.0008923088 */
    const maxDecimalPlacesString = numberBN.toFormat(maxDecimalPlaces)
    /** count the zeros, which will then allow us to know the final length with desired significant digits */
    const decimalPart = maxDecimalPlacesString.split('.')[1]
    const zeroMatches = decimalPart.match(/^0+/)
    const leadingZerosInDecimalPart = zeroMatches && zeroMatches.length ? zeroMatches[0].length : 0
    /** now we can re-format with leadingZerosInDecimalPart + maxDecimalSignificanDigits to give us the pretty version */
    /** e.g. 0.0008923088123 -> 0.00089 */
    const prettyDecimalPlaces = Math.max(leadingZerosInDecimalPart + minDecimalSignificanDigits, minDecimalPlaces)
    untrimmed = numberBN.toFormat(prettyDecimalPlaces)
  }
  /** the untrimmed string may have trailing zeros, e.g. 0.0890 */
  /** trim to a minimum specified by the config, e.g. we may want to display $0.00 or 0.0 ETH */
  let trimmed = untrimmed.replace(/0+$/, '')
  const minLength = 1 + untrimmed.indexOf('.') + decimalPlacesWhenZero
  if (trimmed.length < minLength) {
    trimmed = untrimmed.substring(0, minLength)
  }
  return trimmed
}
