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

import { SignTransferChainedTxParams, subscribeToTxStatus } from '../packages/web3'
import { node, ONE_ALPH } from '../packages/web3'
import { SubscribeOptions, sleep } from '../packages/web3'
import { web3 } from '../packages/web3'
import { TxStatus } from '../packages/web3'
import { HDWallet, HDWalletAccount, PrivateKeyWallet, generateMnemonic } from '@alephium/web3-wallet'
import { Add, Sub, AddMain, Transact, Deposit } from '../artifacts/ts'
import { getSigner, mintToken, testPrivateKeyWallet } from '../packages/web3-test'
import { TransactionBuilder } from '../packages/web3'
import { ALPH_TOKEN_ID } from '../packages/web3'

describe('transactions', function () {
  let signer: PrivateKeyWallet

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    signer = await getSigner()
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

  async function prepareChainedTxTest(): Promise<[HDWallet, HDWalletAccount, HDWalletAccount, HDWalletAccount]> {
    const mnemonic = generateMnemonic()
    const wallet = new HDWallet({ mnemonic })
    const address1 = wallet.deriveAndAddNewAccount(1)
    const address2 = wallet.deriveAndAddNewAccount(2)
    const address3 = wallet.deriveAndAddNewAccount(3)

    await testPrivateKeyWallet.signAndSubmitTransferTx({
      signerAddress: testPrivateKeyWallet.address,
      destinations: [{ address: address1.address, attoAlphAmount: 100n * ONE_ALPH }]
    })

    return [wallet, address1, address2, address3]
  }

  it('should build chained transfer txs across groups', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [wallet, address1, address2, address3] = await prepareChainedTxTest()

    const transferFrom1To2: SignTransferChainedTxParams = {
      signerAddress: address1.address,
      destinations: [{ address: address2.address, attoAlphAmount: 10n * ONE_ALPH }],
      type: 'Transfer'
    }

    const transferFrom2To3: SignTransferChainedTxParams = {
      signerAddress: address2.address,
      destinations: [{ address: address3.address, attoAlphAmount: 5n * ONE_ALPH }],
      type: 'Transfer'
    }

    await expect(wallet.signAndSubmitTransferTx(transferFrom2To3)).rejects.toThrow(
      `[API Error] - Not enough balance: got 0, expected 5001000000000000000 - Status code: 500`
    )

    const [signedTransferFrom1To2, signedTransferFrom2To3] = await wallet.signAndSubmitChainedTx([
      transferFrom1To2,
      transferFrom2To3
    ])

    const signer1Balance = await nodeProvider.addresses.getAddressesAddressBalance(address1.address)
    const signer2Balance = await nodeProvider.addresses.getAddressesAddressBalance(address2.address)
    const signer3Balance = await nodeProvider.addresses.getAddressesAddressBalance(address3.address)

    const gasCostTransferFrom1To2 = BigInt(signedTransferFrom1To2.gasAmount) * BigInt(signedTransferFrom1To2.gasPrice)
    const gasCostTransferFrom2To3 = BigInt(signedTransferFrom2To3.gasAmount) * BigInt(signedTransferFrom2To3.gasPrice)
    const expectedSigner1Balance = 100n * ONE_ALPH - 10n * ONE_ALPH - gasCostTransferFrom1To2
    const expectedSigner2Balance = 10n * ONE_ALPH - 5n * ONE_ALPH - gasCostTransferFrom2To3
    const expectedSigner3Balance = 5n * ONE_ALPH

    expect(BigInt(signer1Balance.balance)).toBe(expectedSigner1Balance)
    expect(BigInt(signer2Balance.balance)).toBe(expectedSigner2Balance)
    expect(BigInt(signer3Balance.balance)).toBe(expectedSigner3Balance)
  })

  it('should build chain txs that deploy contract in another group', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [wallet, address1, address2] = await prepareChainedTxTest()

    await wallet.setSelectedAccount(address2.address)
    const deployTxParams = await Transact.contract.txParamsForDeployment(wallet, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId: ALPH_TOKEN_ID, totalALPH: 0n, totalTokens: 0n }
    })
    expect(deployTxParams.signerAddress).toBe(address2.address)

    await expect(wallet.signAndSubmitDeployContractTx(deployTxParams)).rejects.toThrow(
      `[API Error] - Insufficient funds for gas`
    )

    const transferTxParams: SignTransferChainedTxParams = {
      signerAddress: address1.address,
      destinations: [{ address: address2.address, attoAlphAmount: 10n * ONE_ALPH }],
      type: 'Transfer'
    }

    const [transferResult, deployResult] = await wallet.buildChainedTx([
      transferTxParams,
      { ...deployTxParams, type: 'DeployContract' }
    ])

    const signer1Balance = await nodeProvider.addresses.getAddressesAddressBalance(address1.address)
    const signer2Balance = await nodeProvider.addresses.getAddressesAddressBalance(address2.address)

    const transferTxGasCost = BigInt(transferResult.gasAmount) * BigInt(transferResult.gasPrice)
    const deployTxGasCost = BigInt(deployResult.gasAmount) * BigInt(deployResult.gasPrice)
    const expectedSigner1Balance = 100n * ONE_ALPH - 10n * ONE_ALPH - transferTxGasCost
    const expectedSigner2Balance = 10n * ONE_ALPH - deployTxGasCost - ONE_ALPH

    expect(BigInt(signer1Balance.balance)).toBe(expectedSigner1Balance)
    expect(BigInt(signer2Balance.balance)).toBe(expectedSigner2Balance)

    const deployTransaction = await nodeProvider.transactions.getTransactionsDetailsTxid(deployResult.txId)
    const contractAddress = deployTransaction.generatedOutputs[0].address
    const contractBalance = await nodeProvider.addresses.getAddressesAddressBalance(contractAddress)
    expect(BigInt(contractBalance.balance)).toBe(ONE_ALPH)
  })

  it('should build chain txs that interact with dApp in another group', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [wallet, address1, address2] = await prepareChainedTxTest()

    // Deploy contract in group 2
    const deployer = await getSigner(100n * ONE_ALPH, 2)
    const { tokenId } = await mintToken(deployer.address, 10n * 10n ** 18n)
    const deploy = await Transact.deploy(deployer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n }
    })
    const transactInstance = deploy.contractInstance
    expect(transactInstance.groupIndex).toBe(2)

    await wallet.setSelectedAccount(address2.address)
    const depositTxParams = await Deposit.script.txParamsForExecution(wallet, {
      initialFields: { c: transactInstance.contractId },
      attoAlphAmount: ONE_ALPH
    })
    expect(depositTxParams.signerAddress).toBe(address2.address)

    await expect(wallet.signAndSubmitExecuteScriptTx(depositTxParams)).rejects.toThrow(
      `[API Error] - Insufficient funds for gas`
    )

    const transferTxParams: SignTransferChainedTxParams = {
      signerAddress: address1.address,
      destinations: [{ address: address2.address, attoAlphAmount: 10n * ONE_ALPH }],
      type: 'Transfer'
    }

    const [transferResult, depositResult] = await wallet.buildChainedTx([
      transferTxParams,
      { ...depositTxParams, type: 'ExecuteScript' }
    ])

    const signer1Balance = await nodeProvider.addresses.getAddressesAddressBalance(address1.address)
    const signer2Balance = await nodeProvider.addresses.getAddressesAddressBalance(address2.address)
    const contractBalance = await nodeProvider.addresses.getAddressesAddressBalance(transactInstance.address)

    const transferTxGasCost = BigInt(transferResult.gasAmount) * BigInt(transferResult.gasPrice)
    const depositTxGasCost = BigInt(depositResult.gasAmount) * BigInt(depositResult.gasPrice)
    const expectedSigner1Balance = 100n * ONE_ALPH - 10n * ONE_ALPH - transferTxGasCost
    const expectedSigner2Balance = 10n * ONE_ALPH - depositTxGasCost - ONE_ALPH
    const expectedContractBalance = ONE_ALPH * 2n

    expect(BigInt(signer1Balance.balance)).toBe(expectedSigner1Balance)
    expect(BigInt(signer2Balance.balance)).toBe(expectedSigner2Balance)
    expect(BigInt(contractBalance.balance)).toBe(expectedContractBalance)

    const contractState = await transactInstance.fetchState()
    expect(contractState.fields.totalALPH).toEqual(ONE_ALPH)
  })

  it('should fail when public keys do not match the build chained transactions parameters', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const signer1 = await getSigner(100n * ONE_ALPH, 1)
    const signer2 = await getSigner(0n, 2)
    const signer3 = await getSigner(0n, 3)

    const transferFrom1To2: SignTransferChainedTxParams = {
      signerAddress: signer1.address,
      destinations: [{ address: signer2.address, attoAlphAmount: 10n * ONE_ALPH }],
      type: 'Transfer'
    }

    const transferFrom2To3: SignTransferChainedTxParams = {
      signerAddress: signer2.address,
      destinations: [{ address: signer3.address, attoAlphAmount: 5n * ONE_ALPH }],
      type: 'Transfer'
    }

    await expect(
      TransactionBuilder.from(nodeProvider).buildChainedTx([transferFrom1To2, transferFrom2To3], [signer1.publicKey])
    ).rejects.toThrow(
      'The number of build chained transaction parameters must match the number of public keys provided'
    )

    await expect(
      TransactionBuilder.from(nodeProvider).buildChainedTx(
        [transferFrom1To2, transferFrom2To3],
        [signer1.publicKey, signer2.publicKey, signer1.publicKey]
      )
    ).rejects.toThrow(
      'The number of build chained transaction parameters must match the number of public keys provided'
    )

    await expect(
      TransactionBuilder.from(nodeProvider).buildChainedTx(
        [transferFrom1To2, transferFrom2To3],
        [signer2.publicKey, signer1.publicKey]
      )
    ).rejects.toThrow('Unmatched public key')
  })
})
