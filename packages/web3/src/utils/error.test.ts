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

import { parseError } from './error'

describe('error utils', function () {
  it('parse and reformat error', () => {
    function test(original: string, line: number, file: string, expected: string) {
      const error = parseError(original)
      if (error) {
        expect(error.reformat(line, file)).toEqual(expected)
      } else {
        throw new Error(`cannoot parse error ${original}`)
      }
    }

    const error = `-- error (256:3): Syntax error
256 |  event add(a: u256, b: u256)
    |  ^^^^^^^^^^
    |  expected "}"
    |-------------------------------------------------------------------------------------
    |trace log: expected multicontract:1:1 / rawtxscript:2:1 / "}":3:3, found "event add("`

    const expected = `nft/nft.ral (3:3): Syntax error
3 |  event add(a: u256, b: u256)
  |  ^^^^^^^^^^
  |  expected "}"
  |-------------------------------------------------------------------------------------
  |trace log: expected multicontract:1:1 / rawtxscript:2:1 / "}":3:3, found "event add("`

    const error2 = `-- error (7:3): Compilation error
7 |  event Add1(b: U256, a: U256)
  |  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  |  These events are defined multiple times: Add1, Add2`

    const expected2 = `foo.ral (123456:3): Compilation error
123456 |  event Add1(b: U256, a: U256)
       |  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       |  These events are defined multiple times: Add1, Add2`

    test(error, 3, 'nft/nft.ral', expected)
    test(error2, 123456, 'foo.ral', expected2)
  })
})
