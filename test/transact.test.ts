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

import { ONE_ALPH, ScriptSimulator } from '@alephium/web3'
import { getSigner } from '@alephium/web3-test'
import { Transact } from '../artifacts/ts'
import exp from 'constants'

describe('transact', function () {
  it('should use transact methods', async function () {
    const signer = await getSigner(ONE_ALPH * 10n)

    const deploy = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { totalDeposits: 0n }
    })
    const deployCalls = ScriptSimulator.extractContractCallsWithErrors(deploy.unsignedTx)
    expect(deployCalls.length).toBe(0)
    const instance = deploy.contractInstance

    // The contract call requires preapproved assets but none are provided
    await expect(instance.transact.deposit({ signer })).rejects.toThrow(
      'The contract call requires preapproved assets but none are provided'
    )

    const depositTx0 = await instance.transact.deposit({ signer, attoAlphAmount: ONE_ALPH })
    expect(depositTx0.txId.length).toBe(64)
    const depositCalls0 = ScriptSimulator.extractContractCallsWithErrors(depositTx0.unsignedTx)
    expect(depositCalls0.length).toBe(1)
    expect(depositCalls0[0].contractAddress).toBe(instance.address)
    expect(depositCalls0[0].approvedAttoAlphAmount).toBe(ONE_ALPH)
    expect(depositCalls0[0].approvedTokens).toBe(undefined)

    const depositTx1 = await instance.transact.deposit({ signer, attoAlphAmount: ONE_ALPH })
    expect((await instance.view.getTotalDeposits()).returns).toBe(ONE_ALPH * 2n)
    const depositCalls1 = ScriptSimulator.extractContractCallsWithErrors(depositTx1.unsignedTx)
    expect(depositCalls1.length).toBe(1)
    expect(depositCalls1[0].contractAddress).toBe(instance.address)
    expect(depositCalls1[0].approvedAttoAlphAmount).toBe(ONE_ALPH)
    expect(depositCalls1[0].approvedTokens).toBe(undefined)

    const withdrawTx0 = await instance.transact.withdraw({ signer })
    expect((await instance.view.getTotalDeposits()).returns).toBe(ONE_ALPH)
    const withdrawCalls0 = ScriptSimulator.extractContractCallsWithErrors(withdrawTx0.unsignedTx)
    expect(withdrawCalls0.length).toBe(1)
    expect(withdrawCalls0[0].contractAddress).toBe(instance.address)
    expect(withdrawCalls0[0].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawCalls0[0].approvedTokens).toBe(undefined)

    // Approve assets for the contract even if it's not needed
    const withdrawTx1 = await instance.transact.withdraw({ signer, attoAlphAmount: ONE_ALPH })
    expect((await instance.view.getTotalDeposits()).returns).toBe(0n)
    const withdrawCalls1 = ScriptSimulator.extractContractCallsWithErrors(withdrawTx1.unsignedTx)
    expect(withdrawCalls1.length).toBe(1)
    expect(withdrawCalls1[0].contractAddress).toBe(instance.address)
    expect(withdrawCalls1[0].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawCalls1[0].approvedTokens).toBe(undefined)

    const getTx0 = await instance.transact.getTotalDeposits({ signer })
    const getCalls0 = ScriptSimulator.extractContractCallsWithErrors(getTx0.unsignedTx)
    expect(getCalls0.length).toBe(1)
    expect(getCalls0[0].contractAddress).toBe(instance.address)
    expect(getCalls0[0].approvedAttoAlphAmount).toBe(undefined)
    expect(getCalls0[0].approvedTokens).toBe(undefined)
    const getTx1 = await instance.transact.getTotalDeposits({ signer, attoAlphAmount: ONE_ALPH })
    const getCalls1 = ScriptSimulator.extractContractCallsWithErrors(getTx1.unsignedTx)
    expect(getCalls1.length).toBe(1)
    expect(getCalls1[0].contractAddress).toBe(instance.address)
    expect(getCalls1[0].approvedAttoAlphAmount).toBe(undefined)
    expect(getCalls1[0].approvedTokens).toBe(undefined)
  })

  it('should test different deploy options', async function () {
    const signer = await getSigner(ONE_ALPH * 10n)

    const deploy0 = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { totalDeposits: 0n }
    })
    const deployCalls0 = ScriptSimulator.extractContractCallsWithErrors(deploy0.unsignedTx)
    expect(deployCalls0.length).toBe(0)

    const deploy1 = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { totalDeposits: 0n },
      issueTokenAmount: 10n ** 18n
    })
    const deployCalls1 = ScriptSimulator.extractContractCallsWithErrors(deploy1.unsignedTx)
    expect(deployCalls1.length).toBe(0)

    const deploy2 = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { totalDeposits: 0n },
      issueTokenAmount: 10n ** 18n,
      issueTokenTo: signer.address
    })
    const deployCalls2 = ScriptSimulator.extractContractCallsWithErrors(deploy2.unsignedTx)
    expect(deployCalls2.length).toBe(0)
  })
})
