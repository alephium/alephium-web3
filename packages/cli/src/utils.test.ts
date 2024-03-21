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

import { checkFullNodeVersion } from './utils'

describe('utils', () => {
  it('should check full node version', () => {
    expect(() => checkFullNodeVersion('2.9.0', '2.9.0')).not.toThrow()
    expect(() => checkFullNodeVersion('2.9.0', '2.9.1')).not.toThrow()
    expect(() => checkFullNodeVersion('2.9.1', '2.9.0')).not.toThrow()
    expect(() => checkFullNodeVersion('3.0.0', '2.9.0')).not.toThrow()

    expect(() => checkFullNodeVersion('1.8.0', '2.9.0')).toThrow(
      'Connected full node version is 1.8.0, the minimum required version is 2.9.0'
    )
    expect(() => checkFullNodeVersion('1.9.0', '2.9.0')).toThrow(
      'Connected full node version is 1.9.0, the minimum required version is 2.9.0'
    )
    expect(() => checkFullNodeVersion('1.9.1', '2.9.1')).toThrow(
      'Connected full node version is 1.9.1, the minimum required version is 2.9.0'
    )

    expect(() => checkFullNodeVersion('2.8.0', '2.9.0')).toThrow(
      'Connected full node version is 2.8.0, the minimum required version is 2.9.0'
    )
    expect(() => checkFullNodeVersion('2.8.1', '2.9.1')).toThrow(
      'Connected full node version is 2.8.1, the minimum required version is 2.9.0'
    )
  })
})
