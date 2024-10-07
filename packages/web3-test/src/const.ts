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

import { NodeProvider, web3 } from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

export const testPrivateKeys = [
  'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5',
  'ec8c4e863e4027d5217c382bfc67bd2638f21d6f956653505229f1d242123a9a',
  'bd7dd0c4abd3cf8ba2d169c8320a2cc8bc8ab583b0db9a32d4352d6f5b15d037',
  '93ae1392f36a592aca154ea14e51b791c248beaea1b63117c57cc46d56e5f482'
]

export const testMnemonic =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
export const testWalletName = 'alephium-web3-test-only-wallet'
export const testAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
export const testPrivateKey = testPrivateKeys[0]
export const testPassword = 'alph'
export const testPrivateKeyWallet = new PrivateKeyWallet({ privateKey: testPrivateKey })

export async function tryGetDevnetNodeProvider(): Promise<NodeProvider> {
  const currentNodeProvider = (() => {
    try {
      return web3.getCurrentNodeProvider()
    } catch (err) {
      return undefined
    }
  })()

  if (currentNodeProvider === undefined) {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    web3.setCurrentNodeProvider(nodeProvider)
    return nodeProvider
  }

  const chainParams = await currentNodeProvider.infos.getInfosChainParams()
  if (chainParams.networkId === 0 || chainParams.networkId === 1) {
    throw new Error('Invalid network, expect devnet')
  }
  return currentNodeProvider
}
