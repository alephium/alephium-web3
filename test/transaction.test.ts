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

import { SignTransferTxResult, SignUnsignedTxResult, subscribeToTxStatus, TransactionBuilder } from '../packages/web3'
import { node } from '../packages/web3'
import { SubscribeOptions, sleep } from '../packages/web3'
import { web3 } from '../packages/web3'
import { TxStatus } from '../packages/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { ONE_ALPH } from '../packages/web3/src'
import { Add, Sub, AddMain } from '../artifacts/ts'
import { getSigner } from '@alephium/web3-test'

jest.setTimeout(10_000)

async function signAndSubmitTransactions(
  transactions: Omit<SignTransferTxResult, "signature">[],
  signer: PrivateKeyWallet
): Promise<SignUnsignedTxResult[]> {
  const signedResults: SignTransferTxResult[] = [];

  for (const tx of transactions) {
    const result = await signer.signAndSubmitUnsignedTx({
      signerAddress: signer.address,
      unsignedTx: tx.unsignedTx
    });
    signedResults.push(result);
  }

  return signedResults;
}

describe('transactions', function () {
  let signer: PrivateKeyWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    signer = await getSigner()
  })

  it('should build multi-group transfer', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const signer0 = await getSigner(100n * ONE_ALPH, 1)
    const signer1 = await getSigner(0n, 2)
    const signer2 = await getSigner(0n, 3)
    const signer3 = await getSigner(0n, 3)
    const signer4 = await getSigner(0n, 0)

    const signer0Balance = await nodeProvider.addresses.getAddressesAddressBalance(signer0.address)
    expect(BigInt(signer0Balance.balance)).toBe(100n * ONE_ALPH)

    const transferFrom0to1and2 = await TransactionBuilder.from(nodeProvider).buildMultiGroupTransferTx(
      {
        signerAddress: signer0.address,
        destinations: [signer1, signer2].map((signer) => ({
          address: signer.address,
          attoAlphAmount: 10n * ONE_ALPH
        }))
      },
      await signer0.getPublicKey(signer0.address)
    )

    const transferFrom0to1and2Result = await signAndSubmitTransactions(transferFrom0to1and2, signer0)

    const signer1Balance = await nodeProvider.addresses.getAddressesAddressBalance(signer1.address)
    expect(BigInt(signer1Balance.balance)).toBe(10n * ONE_ALPH)
    const signer2Balance = await nodeProvider.addresses.getAddressesAddressBalance(signer2.address)
    expect(BigInt(signer2Balance.balance)).toBe(10n * ONE_ALPH)

    const transferFrom1to3and4 = await TransactionBuilder.from(nodeProvider).buildMultiGroupTransferTx(
      {
        signerAddress: signer1.address,
        destinations: [signer3, signer4].map((signer) => ({
          address: signer.address,
          attoAlphAmount: ONE_ALPH
        }))
      },
      signer1.publicKey
    )

    const transferFrom1to3and4Result = await signAndSubmitTransactions(transferFrom1to3and4, signer1)

    const transferFrom2to3and4 = await TransactionBuilder.from(nodeProvider).buildMultiGroupTransferTx(
      {
        signerAddress: signer2.address,
        destinations: [signer3, signer4].map((signer) => ({
          address: signer.address,
          attoAlphAmount: ONE_ALPH
        }))
      },
      signer2.publicKey
    )


    const transferFrom2to3and4Result = await signAndSubmitTransactions(transferFrom2to3and4, signer2)

    const signer0FinalBalance = await nodeProvider.addresses.getAddressesAddressBalance(signer0.address)
    const signer1FinalBalance = await nodeProvider.addresses.getAddressesAddressBalance(signer1.address)
    const signer2FinalBalance = await nodeProvider.addresses.getAddressesAddressBalance(signer2.address)
    const signer3FinalBalance = await nodeProvider.addresses.getAddressesAddressBalance(signer3.address)
    const signer4FinalBalance = await nodeProvider.addresses.getAddressesAddressBalance(signer4.address)

    const gasCostTransferFrom0to1and2 = transferFrom0to1and2Result.reduce((sum, item) => sum + BigInt(item.gasAmount) * BigInt(item.gasPrice), BigInt(0))
    const gasCostTransferFrom1to3and4 = transferFrom1to3and4Result.reduce((sum, item) => sum + BigInt(item.gasAmount) * BigInt(item.gasPrice), BigInt(0))
    const gasCostTransferFrom2to3and4 = transferFrom2to3and4Result.reduce((sum, item) => sum + BigInt(item.gasAmount) * BigInt(item.gasPrice), BigInt(0))
    const expectedSigner0Balance = 100n * ONE_ALPH - 20n * ONE_ALPH - gasCostTransferFrom0to1and2
    const expectedSigner1Balance = 10n * ONE_ALPH - 2n * ONE_ALPH - gasCostTransferFrom1to3and4
    const expectedSigner2Balance = 10n * ONE_ALPH - 2n * ONE_ALPH - gasCostTransferFrom2to3and4

    expect(BigInt(signer0FinalBalance.balance)).toBe(expectedSigner0Balance)
    expect(BigInt(signer1FinalBalance.balance)).toBe(expectedSigner1Balance)
    expect(BigInt(signer2FinalBalance.balance)).toBe(expectedSigner2Balance)
    expect(BigInt(signer3FinalBalance.balance)).toBe(2n * ONE_ALPH)
    expect(BigInt(signer4FinalBalance.balance)).toBe(2n * ONE_ALPH)
  })

  it('should subscribe transaction status', async () => {
    const sub = Sub.contract
    const txParams = await sub.txParamsForDeployment(signer, {
      initialFields: { result: 0n },
      initialTokenAmounts: []
    })
    const subDeployTx = await signer.buildDeployContractTx(txParams)

    let txStatus: TxStatus | undefined = undefined
    let counter = 0
    const subscriptOptions: SubscribeOptions<node.TxStatus> = {
      pollingInterval: 500,
      messageCallback: (status: TxStatus): Promise<void> => {
        txStatus = status
        counter = counter + 1
        return Promise.resolve()
      },
      errorCallback: (error: any, subscription): Promise<void> => {
        console.log(error)
        subscription.unsubscribe()
        return Promise.resolve()
      }
    }

    const counterBeforeSubscribe = counter

    const subscription = subscribeToTxStatus(subscriptOptions, subDeployTx.txId)
    await sleep(1500)
    expect(txStatus).toMatchObject({ type: 'TxNotFound' })

    await signer.signAndSubmitUnsignedTx({
      unsignedTx: subDeployTx.unsignedTx,
      signerAddress: (await signer.getSelectedAccount()).address
    })
    await sleep(1500)
    expect(txStatus).toMatchObject({ type: 'Confirmed' })

    expect(counterBeforeSubscribe).toBeLessThan(counter)
    expect(subscription.isCancelled()).toEqual(true)
    const counterAfterConfirmed = counter

    await sleep(1500)
    expect(counter).toEqual(counterAfterConfirmed)
  }, 10000)

  it('should use Schnorr address', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const schnorrSigner = PrivateKeyWallet.Random(undefined, nodeProvider, 'bip340-schnorr')

    const genesisAccount = await signer.getSelectedAccount()
    await signer.signAndSubmitTransferTx({
      signerAddress: genesisAccount.address,
      signerKeyType: genesisAccount.keyType,
      destinations: [{ address: schnorrSigner.address, attoAlphAmount: 10n * ONE_ALPH }]
    })

    const subInstance = (await Sub.deploy(schnorrSigner, { initialFields: { result: 0n } })).contractInstance
    const subState = await subInstance.fetchState()
    expect(subState.fields.result).toBe(0n)

    const addInstance = (
      await Add.deploy(schnorrSigner, { initialFields: { sub: subInstance.contractId, result: 0n } })
    ).contractInstance
    expect((await addInstance.fetchState()).fields.result).toBe(0n)

    await AddMain.execute(schnorrSigner, { initialFields: { add: addInstance.contractId, array: [2n, 1n] } })
    expect((await addInstance.fetchState()).fields.result).toBe(3n)
  })
})
