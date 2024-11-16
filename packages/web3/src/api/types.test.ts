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

import { NULL_CONTRACT_ADDRESS } from '../constants'
import { getDefaultPrimitiveValue, toApiAddress, toApiByteVec, toApiNumber256 } from './index'

describe('ralph types', function () {
  it('should check u256/i256', () => {
    expect(toApiNumber256('1')).toEqual('1')
    expect(toApiNumber256(1n)).toEqual('1')

    expect(() => toApiNumber256(true)).toThrowError('Invalid value: true, expected a 256 bit number')
    expect(() => toApiNumber256('a')).toThrowError('Invalid value: a, expected a 256 bit number')
  })

  it('should check bytevec', () => {
    expect(toApiByteVec('0123456789abcdef')).toEqual('0123456789abcdef')
    expect(toApiByteVec('uMxNyhacadzUvRYbnje1ZgxLEoQScGUzEnLxd7UJjvGf')).toEqual(
      '09fdf4189d4b5d70dc02d6e3d05b6e603f9ee78ea76af61b5b0638f88333fd00'
    )

    expect(() => toApiByteVec('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')).toThrowError(
      'Invalid hex-string: 1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
    )
    expect(() => toApiByteVec(true)).toThrowError('Invalid value: true, expected a hex-string')
    expect(() => toApiByteVec(1n)).toThrowError('Invalid value: 1, expected a hex-string')
    expect(() => toApiByteVec('111')).toThrowError('Invalid hex-string: 111')
    expect(() => toApiByteVec('gggg')).toThrowError('Invalid hex-string: gggg')
  })

  it('should check address', () => {
    expect(toApiAddress('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')).toEqual(
      '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
    )
    expect(toApiAddress('uMxNyhacadzUvRYbnje1ZgxLEoQScGUzEnLxd7UJjvGf')).toEqual(
      'uMxNyhacadzUvRYbnje1ZgxLEoQScGUzEnLxd7UJjvGf'
    )

    expect(() => toApiAddress(true)).toThrowError('Invalid value: true, expected a base58 string')
    expect(() => toApiAddress(1n)).toThrowError('Invalid value: 1, expected a base58 string')
    expect(() => toApiAddress('ilLI')).toThrowError('Invalid base58 string: ilLI')
  })

  it('should get default value by type', () => {
    expect(getDefaultPrimitiveValue('I256')).toEqual(0n)
    expect(getDefaultPrimitiveValue('U256')).toEqual(0n)
    expect(getDefaultPrimitiveValue('Bool')).toEqual(false)
    expect(getDefaultPrimitiveValue('Address')).toEqual(NULL_CONTRACT_ADDRESS)
    expect(getDefaultPrimitiveValue('ByteVec')).toEqual('')

    expect(() => getDefaultPrimitiveValue('[Bool;4]')).toThrowError('Expected primitive type, got [Bool;4]')
  })
})
