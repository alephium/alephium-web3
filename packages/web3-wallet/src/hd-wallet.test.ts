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

import { deriveHDWalletPrivateKey, deriveHDWalletPrivateKeyForGroup } from './hd-wallet'

describe('HD wallet', () => {
  const testMnemonic =
    'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'

  it('should derive private key based on index', () => {
    expect(deriveHDWalletPrivateKey(testMnemonic, 0)).toEqual(
      'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'
    )
    expect(deriveHDWalletPrivateKey(testMnemonic, 1)).toEqual(
      'bd7dd0c4abd3cf8ba2d169c8320a2cc8bc8ab583b0db9a32d4352d6f5b15d037'
    )
    expect(deriveHDWalletPrivateKey(testMnemonic, 2)).toEqual(
      '93ae1392f36a592aca154ea14e51b791c248beaea1b63117c57cc46d56e5f482'
    )
    expect(deriveHDWalletPrivateKey(testMnemonic, 3)).toEqual(
      'ec8c4e863e4027d5217c382bfc67bd2638f21d6f956653505229f1d242123a9a'
    )
    expect(deriveHDWalletPrivateKey(testMnemonic, 0, 'Alephium')).toEqual(
      '62814353f0fac259b448441898f294b17eff73ab1fd6a7fc4b8216f7e039bdce'
    )
    expect(deriveHDWalletPrivateKey(testMnemonic, 1, 'Alephium')).toEqual(
      'ff8efb234d82f49ece8b34fa9a7250e16879a7a8a222463390159e2e51a1a117'
    )
    expect(deriveHDWalletPrivateKey(testMnemonic, 2, 'Alephium')).toEqual(
      '9fce4cb835651c8d2aeed1daead8bd04ab314d586e9b8423ee0d7a264cb8608e'
    )
    expect(deriveHDWalletPrivateKey(testMnemonic, 3, 'Alephium')).toEqual(
      'd8da830fe81dc6be8b2d0cc60dff79412f7b58445ab5463c63d1791b08ec1110'
    )
  })

  it('should derive private key for groups', () => {
    expect(deriveHDWalletPrivateKeyForGroup(testMnemonic, 0, 0, 'Alephium')).toEqual(
      '62814353f0fac259b448441898f294b17eff73ab1fd6a7fc4b8216f7e039bdce'
    )
    expect(deriveHDWalletPrivateKeyForGroup(testMnemonic, 1, 0, 'Alephium')).toEqual(
      'f62df0157aec61806d51480425e1f7a4950e13fa9a2de87988ae1d861e09d2ae'
    )
    expect(deriveHDWalletPrivateKeyForGroup(testMnemonic, 2, 0, 'Alephium')).toEqual(
      'cae87098274ff447f785bc408a71b3416d6140bd824e623375959cbf43d2a2d5'
    )
    expect(deriveHDWalletPrivateKeyForGroup(testMnemonic, 3, 0, 'Alephium')).toEqual(
      '9fce4cb835651c8d2aeed1daead8bd04ab314d586e9b8423ee0d7a264cb8608e'
    )
    expect(deriveHDWalletPrivateKeyForGroup(testMnemonic, 0, 100, 'Alephium')).toEqual(
      'c047f716a03c4961d98427d3cf494fe3d5f3fd0b48fe3107699d90a453f2dce6'
    )
    expect(deriveHDWalletPrivateKeyForGroup(testMnemonic, 1, 100, 'Alephium')).toEqual(
      '800fc78e24c87c04a76f23b8ab54179ef190f640d9346d3e89cbc3036ee69c9b'
    )
    expect(deriveHDWalletPrivateKeyForGroup(testMnemonic, 2, 100, 'Alephium')).toEqual(
      '51df72c50e1b392805c3f530d2dece7e0c1842f827a579f7cd24907a6c4ff533'
    )
    expect(deriveHDWalletPrivateKeyForGroup(testMnemonic, 3, 100, 'Alephium')).toEqual(
      '04528b7736eab20cbde90f0d2f0cb3a99481dfe92664757646077ae7851e4314'
    )
  })
})
