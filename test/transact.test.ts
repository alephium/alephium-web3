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

import { ONE_ALPH } from '@alephium/web3'
import { getSigner } from '@alephium/web3-test'
import { Transact } from '../artifacts/ts'

describe('transact', function () {
  it('should use transact methods', async function () {
    const signer = await getSigner(ONE_ALPH * 10n)

    const deploy = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { totalDeposits: 0n }
    })
    const instance = deploy.contractInstance

    // The contract call requires preapproved assets but none are provided
    await expect(instance.transact.deposit({ signer })).rejects.toThrow(
      'The contract call requires preapproved assets but none are provided'
    )

    const depositResult = await instance.transact.deposit({ signer, attoAlphAmount: ONE_ALPH })
    expect(depositResult.txId.length).toBe(64)

    await instance.transact.deposit({ signer, attoAlphAmount: ONE_ALPH })
    expect((await instance.view.getTotalDeposits()).returns).toBe(ONE_ALPH * 2n)

    await instance.transact.withdraw({ signer })
    expect((await instance.view.getTotalDeposits()).returns).toBe(ONE_ALPH)

    // Approve assets for the contract even if it's not needed
    await instance.transact.withdraw({ signer, attoAlphAmount: ONE_ALPH })
    expect((await instance.view.getTotalDeposits()).returns).toBe(0n)

    await instance.transact.getTotalDeposits({ signer })
    await instance.transact.getTotalDeposits({ signer, attoAlphAmount: ONE_ALPH })
  })
})
