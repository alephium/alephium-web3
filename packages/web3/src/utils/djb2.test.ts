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

import djb2 from './djb2'

describe('djb2', () => {
  function check(str: string, expected: number) {
    const bytes = new TextEncoder().encode(str)
    expect(djb2(bytes)).toEqual(expected)
  }

  it('should handle empty string', () => {
    check('', 5381)
  })

  it('should handle single characters', () => {
    check('a', 177670)
    check('z', 177695)
    check('A', 177633)
    check('Z', 177658)
    check('0', 177609)
    check('9', 177618)
  })

  it('should handle short strings', () => {
    check('foo', 193491849)
    check('bar', 193487034)
    check('baz', 193487114)
  })

  it('should handle longer strings', () => {
    check('hello world', 1794106052)
    check('The quick brown fox jumps over the lazy dog', 2090069583)
  })

  it('should handle strings with special characters', () => {
    check('!@#$%^&*()', -1811483099)
    check('áéíóú', -1670655746)
  })

  it('should handle strings with repeated characters', () => {
    check('aaaa', 193491849)
    check('1111', 193487034)
  })

  it('should handle strings with spaces', () => {
    check('   ', 193508387)
    check('a b c', 193494691)
  })

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000)
    const bytes = new TextEncoder().encode(longString)
    expect(djb2(bytes)).toBe(-1424385949)
  })

  it('should handle Uint8Array with non-ASCII values', () => {
    const bytes = new Uint8Array([0, 127, 128, 255])
    expect(djb2(bytes)).toBe(193490746)
  })
})


