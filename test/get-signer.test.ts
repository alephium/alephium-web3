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

import { ONE_ALPH, web3 } from '@alephium/web3'
import { getSigner, getSigners } from '@alephium/web3-test'

describe('get signers', () => {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('get signer with group', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const signer0 = await getSigner(9n * ONE_ALPH)
    expect(signer0.group).toEqual(0)
    const balance0 = await nodeProvider.addresses.getAddressesAddressBalance(signer0.address)
    expect(BigInt(balance0.balance)).toEqual(9n * ONE_ALPH)

    const signer1 = await getSigner(10n * ONE_ALPH, 1)
    expect(signer1.group).toEqual(1)
    const balance1 = await nodeProvider.addresses.getAddressesAddressBalance(signer1.address)
    expect(BigInt(balance1.balance)).toEqual(10n * ONE_ALPH)
  })

  it('get signers with group', async () => {
    const signers0 = await getSigners(2, ONE_ALPH)
    expect(signers0.length).toEqual(2)
    signers0.forEach((signer) => expect(signer.group).toEqual(0))

    const signers1 = await getSigners(3, ONE_ALPH, 1)
    expect(signers1.length).toEqual(3)
    signers1.forEach((signer) => expect(signer.group).toEqual(1))
  })
})
