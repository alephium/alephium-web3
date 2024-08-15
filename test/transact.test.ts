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

import { DUST_AMOUNT, ONE_ALPH, ScriptSimulator } from '@alephium/web3'
import { getSigner, mintToken } from '@alephium/web3-test'
import { MultiDeposit, MultiWithdraw, Transact } from '../artifacts/ts'

describe('transact', function () {
  it('should use transact methods for ALPH', async function () {
    const signer = await getSigner(ONE_ALPH * 10n)
    const { tokenId } = await mintToken(signer.address, 10n * 10n ** 18n)

    const deploy = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n }
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
    expect((await instance.view.getTotalALPH()).returns).toBe(ONE_ALPH * 2n)
    const depositCalls1 = ScriptSimulator.extractContractCallsWithErrors(depositTx1.unsignedTx)
    expect(depositCalls1.length).toBe(1)
    expect(depositCalls1[0].contractAddress).toBe(instance.address)
    expect(depositCalls1[0].approvedAttoAlphAmount).toBe(ONE_ALPH)
    expect(depositCalls1[0].approvedTokens).toBe(undefined)

    const withdrawTx0 = await instance.transact.withdraw({ signer })
    expect((await instance.view.getTotalALPH()).returns).toBe(ONE_ALPH)
    const withdrawCalls0 = ScriptSimulator.extractContractCallsWithErrors(withdrawTx0.unsignedTx)
    expect(withdrawCalls0.length).toBe(1)
    expect(withdrawCalls0[0].contractAddress).toBe(instance.address)
    expect(withdrawCalls0[0].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawCalls0[0].approvedTokens).toBe(undefined)

    // Approve assets for the contract even if it's not needed
    const withdrawTx1 = await instance.transact.withdraw({ signer, attoAlphAmount: ONE_ALPH })
    expect((await instance.view.getTotalALPH()).returns).toBe(0n)
    const withdrawCalls1 = ScriptSimulator.extractContractCallsWithErrors(withdrawTx1.unsignedTx)
    expect(withdrawCalls1.length).toBe(1)
    expect(withdrawCalls1[0].contractAddress).toBe(instance.address)
    expect(withdrawCalls1[0].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawCalls1[0].approvedTokens).toBe(undefined)

    const getTx0 = await instance.transact.getTotalALPH({ signer })
    const getCalls0 = ScriptSimulator.extractContractCallsWithErrors(getTx0.unsignedTx)
    expect(getCalls0.length).toBe(1)
    expect(getCalls0[0].contractAddress).toBe(instance.address)
    expect(getCalls0[0].approvedAttoAlphAmount).toBe(undefined)
    expect(getCalls0[0].approvedTokens).toBe(undefined)
    const getTx1 = await instance.transact.getTotalALPH({ signer, attoAlphAmount: ONE_ALPH })
    const getCalls1 = ScriptSimulator.extractContractCallsWithErrors(getTx1.unsignedTx)
    expect(getCalls1.length).toBe(1)
    expect(getCalls1[0].contractAddress).toBe(instance.address)
    expect(getCalls1[0].approvedAttoAlphAmount).toBe(undefined)
    expect(getCalls1[0].approvedTokens).toBe(undefined)
  })

  it('should use transact methods for token', async function () {
    const signer = await getSigner(ONE_ALPH * 10n)
    const { tokenId } = await mintToken(signer.address, 10n * 10n ** 18n)

    const deploy = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n }
    })
    const deployCalls = ScriptSimulator.extractContractCallsWithErrors(deploy.unsignedTx)
    expect(deployCalls.length).toBe(0)
    const instance = deploy.contractInstance

    // The contract call requires preapproved assets but none are provided
    await expect(instance.transact.deposit({ signer })).rejects.toThrow(
      'The contract call requires preapproved assets but none are provided'
    )

    const depositTx0 = await instance.transact.depositToken({
      signer,
      tokens: [{ id: tokenId, amount: 10n ** 18n }],
      args: { amount: 10n ** 18n }
    })
    expect(depositTx0.txId.length).toBe(64)
    const depositCalls0 = ScriptSimulator.extractContractCallsWithErrors(depositTx0.unsignedTx)
    expect(depositCalls0.length).toBe(1)
    expect(depositCalls0[0].contractAddress).toBe(instance.address)
    expect(depositCalls0[0].approvedAttoAlphAmount).toBe(undefined)
    expect(JSON.stringify(depositCalls0[0].approvedTokens)).toBe(JSON.stringify([{ id: tokenId, amount: 10n ** 18n }]))

    const depositTx1 = await instance.transact.depositToken({
      signer,
      tokens: [{ id: tokenId, amount: 10n ** 18n }],
      args: { amount: 10n ** 18n }
    })
    expect((await instance.view.getTotalTokens()).returns).toBe(2n * 10n ** 18n)
    const depositCalls1 = ScriptSimulator.extractContractCallsWithErrors(depositTx1.unsignedTx)
    expect(depositCalls1.length).toBe(1)
    expect(depositCalls1[0].contractAddress).toBe(instance.address)
    expect(depositCalls1[0].approvedAttoAlphAmount).toBe(undefined)
    expect(JSON.stringify(depositCalls1[0].approvedTokens)).toBe(JSON.stringify([{ id: tokenId, amount: 10n ** 18n }]))

    const withdrawTx0 = await instance.transact.withdrawToken({
      signer,
      attoAlphAmount: DUST_AMOUNT,
      args: { amount: 10n ** 18n }
    })
    expect((await instance.view.getTotalTokens()).returns).toBe(10n ** 18n)
    const withdrawCalls0 = ScriptSimulator.extractContractCallsWithErrors(withdrawTx0.unsignedTx)
    expect(withdrawCalls0.length).toBe(1)
    expect(withdrawCalls0[0].contractAddress).toBe(instance.address)
    expect(withdrawCalls0[0].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawCalls0[0].approvedTokens).toBe(undefined)

    // Approve assets for the contract even if it's not needed
    const withdrawTx1 = await instance.transact.withdrawToken({
      signer,
      attoAlphAmount: ONE_ALPH,
      args: { amount: 10n ** 18n }
    })
    expect((await instance.view.getTotalTokens()).returns).toBe(0n)
    const withdrawCalls1 = ScriptSimulator.extractContractCallsWithErrors(withdrawTx1.unsignedTx)
    expect(withdrawCalls1.length).toBe(1)
    expect(withdrawCalls1[0].contractAddress).toBe(instance.address)
    expect(withdrawCalls1[0].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawCalls1[0].approvedTokens).toBe(undefined)

    const getTx0 = await instance.transact.getTotalTokens({ signer })
    const getCalls0 = ScriptSimulator.extractContractCallsWithErrors(getTx0.unsignedTx)
    expect(getCalls0.length).toBe(1)
    expect(getCalls0[0].contractAddress).toBe(instance.address)
    expect(getCalls0[0].approvedAttoAlphAmount).toBe(undefined)
    expect(getCalls0[0].approvedTokens).toBe(undefined)
    const getTx1 = await instance.transact.getTotalTokens({ signer, attoAlphAmount: ONE_ALPH })
    const getCalls1 = ScriptSimulator.extractContractCallsWithErrors(getTx1.unsignedTx)
    expect(getCalls1.length).toBe(1)
    expect(getCalls1[0].contractAddress).toBe(instance.address)
    expect(getCalls1[0].approvedAttoAlphAmount).toBe(undefined)
    expect(getCalls1[0].approvedTokens).toBe(undefined)
  })

  it('should test different deploy options', async function () {
    const signer = await getSigner(ONE_ALPH * 10n)
    const { tokenId } = await mintToken(signer.address, 10n * 10n ** 18n)

    const deploy0 = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n }
    })
    const deployCalls0 = ScriptSimulator.extractContractCallsWithErrors(deploy0.unsignedTx)
    expect(deployCalls0.length).toBe(0)

    const deploy1 = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n },
      issueTokenAmount: 10n ** 18n
    })
    const deployCalls1 = ScriptSimulator.extractContractCallsWithErrors(deploy1.unsignedTx)
    expect(deployCalls1.length).toBe(0)

    const deploy2 = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n },
      issueTokenAmount: 10n ** 18n,
      issueTokenTo: signer.address
    })
    const deployCalls2 = ScriptSimulator.extractContractCallsWithErrors(deploy2.unsignedTx)
    expect(deployCalls2.length).toBe(0)
  })

  it('should test multicall', async function () {
    const signer = await getSigner(ONE_ALPH * 10n)
    const { tokenId } = await mintToken(signer.address, 10n * 10n ** 18n)

    const deploy0 = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n }
    })
    const instance0 = deploy0.contractInstance

    const deploy1 = await Transact.deploy(signer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n }
    })
    const instance1 = deploy1.contractInstance

    const deposits = await MultiDeposit.execute(signer, {
      attoAlphAmount: ONE_ALPH * 2n,
      tokens: [{ id: tokenId, amount: 10n ** 18n * 2n }],
      initialFields: { c0: instance0.address, c1: instance1.address, tokenId }
    })
    const depositsCalls = ScriptSimulator.extractContractCallsWithErrors(deposits.unsignedTx)
    expect(depositsCalls.length).toBe(4)
    expect(depositsCalls[0].contractAddress).toBe(instance0.address)
    expect(depositsCalls[0].approvedAttoAlphAmount).toBe(ONE_ALPH)
    expect(depositsCalls[0].approvedTokens).toBe(undefined)
    expect(depositsCalls[1].contractAddress).toBe(instance1.address)
    expect(depositsCalls[1].approvedAttoAlphAmount).toBe(ONE_ALPH)
    expect(depositsCalls[1].approvedTokens).toBe(undefined)
    expect(depositsCalls[2].contractAddress).toBe(instance0.address)
    expect(depositsCalls[2].approvedAttoAlphAmount).toBe(undefined)
    expect(JSON.stringify(depositsCalls[2].approvedTokens)).toBe(JSON.stringify([{ id: tokenId, amount: 10n ** 18n }]))
    expect(depositsCalls[3].contractAddress).toBe(instance1.address)
    expect(depositsCalls[3].approvedAttoAlphAmount).toBe(undefined)
    expect(JSON.stringify(depositsCalls[3].approvedTokens)).toBe(JSON.stringify([{ id: tokenId, amount: 10n ** 18n }]))

    expect((await instance0.view.getTotalALPH()).returns).toBe(ONE_ALPH)
    expect((await instance1.view.getTotalALPH()).returns).toBe(ONE_ALPH)
    expect((await instance0.view.getTotalTokens()).returns).toBe(10n ** 18n)
    expect((await instance1.view.getTotalTokens()).returns).toBe(10n ** 18n)

    const withdraws = await MultiWithdraw.execute(signer, {
      attoAlphAmount: DUST_AMOUNT * 2n,
      initialFields: { c0: instance0.address, c1: instance1.address }
    })
    const withdrawsCalls = ScriptSimulator.extractContractCallsWithErrors(withdraws.unsignedTx)
    expect(withdrawsCalls.length).toBe(4)
    expect(withdrawsCalls[0].contractAddress).toBe(instance0.address)
    expect(withdrawsCalls[0].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawsCalls[0].approvedTokens).toBe(undefined)
    expect(withdrawsCalls[1].contractAddress).toBe(instance1.address)
    expect(withdrawsCalls[1].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawsCalls[1].approvedTokens).toBe(undefined)
    expect(withdrawsCalls[2].contractAddress).toBe(instance0.address)
    expect(withdrawsCalls[2].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawsCalls[2].approvedTokens).toBe(undefined)
    expect(withdrawsCalls[3].contractAddress).toBe(instance1.address)
    expect(withdrawsCalls[3].approvedAttoAlphAmount).toBe(undefined)
    expect(withdrawsCalls[3].approvedTokens).toBe(undefined)
  })
})
