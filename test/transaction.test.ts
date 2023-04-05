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

import { subscribeToTxStatus } from '../packages/web3'
import { Project } from '../packages/web3'
import { node } from '../packages/web3'
import { testNodeWallet } from '../packages/web3-test'
import { SubscribeOptions, sleep } from '../packages/web3'
import { web3 } from '../packages/web3'
import { TxStatus } from '../packages/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { ONE_ALPH } from '../packages/web3/src'
import { Add, Sub, Main } from '../artifacts/ts'

describe('transactions', function () {
  it('should subscribe transaction status', async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    await Project.build({ errorOnWarnings: false })
    const sub = Project.contract('Sub')
    const signer = await testNodeWallet()
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

    subscription.unsubscribe()

    const counterAfterUnsubscribe = counter
    await sleep(1500)
    expect(txStatus).toMatchObject({ type: 'Confirmed' })
    // There maybe a pending request when we unsubscribe
    expect([counter, counter - 1]).toContain(counterAfterUnsubscribe)
  }, 10000)

  it('should use Schnorr address', async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    const nodeProvider = web3.getCurrentNodeProvider()

    await Project.build({ errorOnWarnings: false })
    const genesisSigner = await testNodeWallet()
    const signer = PrivateKeyWallet.Random(undefined, nodeProvider, 'bip340-schnorr')

    const genesisAccount = await genesisSigner.getSelectedAccount()
    await genesisSigner.signAndSubmitTransferTx({
      signerAddress: genesisAccount.address,
      signerKeyType: genesisAccount.keyType,
      destinations: [{ address: signer.address, attoAlphAmount: 10n * ONE_ALPH }]
    })

    const subInstance = (await Sub.deploy(signer, { initialFields: { result: 0n } })).contractInstance
    const subState = await subInstance.fetchState()
    expect(subState.fields.result).toBe(0n)

    const addInstance = (await Add.deploy(signer, { initialFields: { sub: subInstance.contractId, result: 0n } }))
      .contractInstance
    expect((await addInstance.fetchState()).fields.result).toBe(0n)

    await Main.execute(signer, { initialFields: { addContractId: addInstance.contractId } })
    expect((await addInstance.fetchState()).fields.result).toBe(3n)
  })
})
