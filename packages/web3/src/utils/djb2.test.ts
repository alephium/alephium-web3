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

describe('djb2 Hashing Algorithm', function () {
  function check(str: string, expected: number) {
    const bytes = new TextEncoder().encode(str);
    expect(djb2(bytes)).toEqual(expected);
  }

  it('should handle empty string', () => check('', 5381));
  it('should handle single characters', () => {
    check('a', 177670);
    check('z', 177695);
  });
  it('should handle short strings', () => {
    check('foo', 193491849);
    check('bar', 193487034);
  });
});