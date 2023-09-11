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

import { sortByName } from './codegen'

describe('codegen', () => {
  it('sort artifacts by name', () => {
    const artifact = (name: string) => ({ artifact: { name } })

    expect(
      sortByName(
        ['Main', 'DestroyAdd', 'GreeterMain', 'MintNFTTest', 'WithdrawNFTCollectionTest'].map((name) => artifact(name))
      )
    ).toEqual(
      ['DestroyAdd', 'GreeterMain', 'Main', 'MintNFTTest', 'WithdrawNFTCollectionTest'].map((name) => artifact(name))
    )

    expect(
      sortByName(
        ['Add', 'Greeter', 'NFTTest', 'NFTCollectionTest', 'NFTCollectionWithRoyaltyTest', 'Assert', 'Debug'].map(
          (name) => artifact(name)
        )
      )
    ).toEqual(
      ['Add', 'Assert', 'Debug', 'Greeter', 'NFTCollectionTest', 'NFTCollectionWithRoyaltyTest', 'NFTTest'].map(
        (name) => artifact(name)
      )
    )
  })
})
