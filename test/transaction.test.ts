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

import {
  DappTransactionBuilder,
  SignDeployContractTxResult,
  SignExecuteScriptTxResult,
  SignTransferChainedTxParams,
  subscribeToTxStatus
} from '../packages/web3'
import { node, ONE_ALPH, DUST_AMOUNT, MINIMAL_CONTRACT_DEPOSIT } from '../packages/web3'
import { SubscribeOptions, sleep } from '../packages/web3'
import { web3 } from '../packages/web3'
import { TxStatus } from '../packages/web3'
import { HDWallet, HDWalletAccount, PrivateKeyWallet, generateMnemonic } from '@alephium/web3-wallet'
import { Add, Sub, AddMain, Transact, Deposit, DepositToken, Withdraw } from '../artifacts/ts'
import { getSigner, mintToken, testPrivateKeyWallet } from '../packages/web3-test'
import { TransactionBuilder } from '../packages/web3'
import { ALPH_TOKEN_ID } from '../packages/web3'
import { Balance } from '@alephium/web3/src/api/api-alephium'

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
    const subDeployTx = (await signer.buildDeployContractTx(txParams)) as SignDeployContractTxResult

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

  async function prepareChainedTxTest(
    account1Balance: bigint = 100n * ONE_ALPH
  ): Promise<[HDWallet, HDWalletAccount, HDWalletAccount, HDWalletAccount]> {
    const mnemonic = generateMnemonic()
    const wallet = new HDWallet({ mnemonic })
    const account1 = wallet.deriveAndAddNewAccount(1)
    const account2 = wallet.deriveAndAddNewAccount(2)
    const account3 = wallet.deriveAndAddNewAccount(3)

    await testPrivateKeyWallet.signAndSubmitTransferTx({
      signerAddress: testPrivateKeyWallet.address,
      destinations: [{ address: account1.address, attoAlphAmount: account1Balance }]
    })

    return [wallet, account1, account2, account3]
  }

  it('should build chained transfer txs across groups', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [wallet, account1, account2, account3] = await prepareChainedTxTest()

    const { tokenId } = await mintToken(account1.address, 10n)

    const transferFrom1To2: SignTransferChainedTxParams = {
      signerAddress: account1.address,
      destinations: [
        { address: account2.address, attoAlphAmount: 10n * ONE_ALPH, tokens: [{ id: tokenId, amount: 10n }] }
      ],
      type: 'Transfer'
    }

    const transferFrom2To3: SignTransferChainedTxParams = {
      signerAddress: account2.address,
      destinations: [
        { address: account3.address, attoAlphAmount: 5n * ONE_ALPH, tokens: [{ id: tokenId, amount: 5n }] }
      ],
      type: 'Transfer'
    }

    await expect(wallet.signAndSubmitTransferTx(transferFrom2To3)).rejects.toThrow(
      `[API Error] - Not enough balance: got 0, expected 5 - Status code: 500`
    )

    const [signedTransferFrom1To2, signedTransferFrom2To3] = await wallet.signAndSubmitChainedTx([
      transferFrom1To2,
      transferFrom2To3
    ])

    const account1Balance = await nodeProvider.addresses.getAddressesAddressBalance(account1.address)
    const account2Balance = await nodeProvider.addresses.getAddressesAddressBalance(account2.address)
    const account3Balance = await nodeProvider.addresses.getAddressesAddressBalance(account3.address)

    const gasCostTransferFrom1To2 = BigInt(signedTransferFrom1To2.gasAmount) * BigInt(signedTransferFrom1To2.gasPrice)
    const gasCostTransferFrom2To3 = BigInt(signedTransferFrom2To3.gasAmount) * BigInt(signedTransferFrom2To3.gasPrice)
    const expectedAccount1AlphBalance = 100n * ONE_ALPH - 10n * ONE_ALPH - gasCostTransferFrom1To2 + DUST_AMOUNT
    const expectedAccount2AlphBalance = 10n * ONE_ALPH - 5n * ONE_ALPH - gasCostTransferFrom2To3
    const expectedAccount3AlphBalance = 5n * ONE_ALPH

    expect(BigInt(account1Balance.balance)).toBe(expectedAccount1AlphBalance)
    expect(BigInt(account2Balance.balance)).toBe(expectedAccount2AlphBalance)
    expect(BigInt(account3Balance.balance)).toBe(expectedAccount3AlphBalance)
    expect(tokenBalance(account1Balance, tokenId)).toBeUndefined()
    expect(tokenBalance(account2Balance, tokenId)).toBe('5')
    expect(tokenBalance(account3Balance, tokenId)).toBe('5')
  })

  it('should build chain txs that deploy contract in another group', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [wallet, account1, account2] = await prepareChainedTxTest()

    await wallet.setSelectedAccount(account2.address)
    const deployTxParams = await Transact.contract.txParamsForDeployment(wallet, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId: ALPH_TOKEN_ID, totalALPH: 0n, totalTokens: 0n }
    })
    expect(deployTxParams.signerAddress).toBe(account2.address)

    await expect(wallet.signAndSubmitDeployContractTx(deployTxParams)).rejects.toThrow(
      `[API Error] - Insufficient funds for gas`
    )

    const transferTxParams: SignTransferChainedTxParams = {
      signerAddress: account1.address,
      destinations: [{ address: account2.address, attoAlphAmount: 10n * ONE_ALPH }],
      type: 'Transfer'
    }

    const [transferResult, deployResult] = await wallet.signAndSubmitChainedTx([
      transferTxParams,
      { ...deployTxParams, type: 'DeployContract' }
    ])

    const account1Balance = await nodeProvider.addresses.getAddressesAddressBalance(account1.address)
    const account2Balance = await nodeProvider.addresses.getAddressesAddressBalance(account2.address)

    const transferTxGasCost = BigInt(transferResult.gasAmount) * BigInt(transferResult.gasPrice)
    const deployTxGasCost = BigInt(deployResult.gasAmount) * BigInt(deployResult.gasPrice)
    const expectedAccount1Balance = 100n * ONE_ALPH - 10n * ONE_ALPH - transferTxGasCost
    const expectedAccount2Balance = 10n * ONE_ALPH - deployTxGasCost - ONE_ALPH

    expect(BigInt(account1Balance.balance)).toBe(expectedAccount1Balance)
    expect(BigInt(account2Balance.balance)).toBe(expectedAccount2Balance)

    const deployTransaction = await nodeProvider.transactions.getTransactionsDetailsTxid(deployResult.txId)
    const contractAddress = deployTransaction.generatedOutputs[0].address
    const contractBalance = await nodeProvider.addresses.getAddressesAddressBalance(contractAddress)
    expect(BigInt(contractBalance.balance)).toBe(ONE_ALPH)
  })

  it('should build chain txs that interact with dApp in another group', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [wallet, account1, account2] = await prepareChainedTxTest()

    // Deploy contract in group 2
    const deployer = await getSigner(100n * ONE_ALPH, 2)
    const { tokenId } = await mintToken(account1.address, 10n)
    const deploy = await Transact.deploy(deployer, {
      initialAttoAlphAmount: ONE_ALPH,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n }
    })
    const transactInstance = deploy.contractInstance
    expect(transactInstance.groupIndex).toBe(2)

    await wallet.setSelectedAccount(account2.address)
    const depositAlphTxParams = await Deposit.script.txParamsForExecution(wallet, {
      initialFields: { c: transactInstance.contractId },
      attoAlphAmount: ONE_ALPH
    })
    expect(depositAlphTxParams.signerAddress).toBe(account2.address)
    await expect(wallet.signAndSubmitExecuteScriptTx(depositAlphTxParams)).rejects.toThrow(
      `[API Error] - Insufficient funds for gas`
    )

    const depositTokenTxParams = await DepositToken.script.txParamsForExecution(wallet, {
      initialFields: { c: transactInstance.contractId, tokenId, amount: 5n },
      attoAlphAmount: DUST_AMOUNT,
      tokens: [{ id: tokenId, amount: 5n }]
    })
    expect(depositTokenTxParams.signerAddress).toBe(account2.address)
    await expect(wallet.signAndSubmitExecuteScriptTx(depositTokenTxParams)).rejects.toThrow(
      `[API Error] - Insufficient funds for gas`
    )

    const transferTxParams: SignTransferChainedTxParams = {
      signerAddress: account1.address,
      destinations: [
        { address: account2.address, attoAlphAmount: 10n * ONE_ALPH, tokens: [{ id: tokenId, amount: 5n }] }
      ],
      type: 'Transfer'
    }

    const [transferResult, depositAlphResult, depositTokenResult] = await wallet.signAndSubmitChainedTx([
      transferTxParams,
      { ...depositAlphTxParams, type: 'ExecuteScript' },
      { ...depositTokenTxParams, type: 'ExecuteScript' }
    ])

    const account1Balance = await nodeProvider.addresses.getAddressesAddressBalance(account1.address)
    const account2Balance = await nodeProvider.addresses.getAddressesAddressBalance(account2.address)
    const contractBalance = await nodeProvider.addresses.getAddressesAddressBalance(transactInstance.address)

    const transferTxGasCost = BigInt(transferResult.gasAmount) * BigInt(transferResult.gasPrice)
    const depositAlphTxGasCost = BigInt(depositAlphResult.gasAmount) * BigInt(depositAlphResult.gasPrice)
    const depositTokenTxGasCost = BigInt(depositTokenResult.gasAmount) * BigInt(depositTokenResult.gasPrice)
    const expectedAccount1AlphBalance = 100n * ONE_ALPH - 10n * ONE_ALPH - transferTxGasCost + DUST_AMOUNT
    const expectedAccount2AlphBalance = 10n * ONE_ALPH - depositAlphTxGasCost - depositTokenTxGasCost - ONE_ALPH
    const expectedContractBalance = ONE_ALPH * 2n

    expect(BigInt(account1Balance.balance)).toBe(expectedAccount1AlphBalance)
    expect(BigInt(account2Balance.balance)).toBe(expectedAccount2AlphBalance)
    expect(BigInt(contractBalance.balance)).toBe(expectedContractBalance)
    expect(tokenBalance(account1Balance, tokenId)).toBe('5')
    expect(tokenBalance(account2Balance, tokenId)).toBeUndefined()

    const contractState = await transactInstance.fetchState()
    expect(contractState.fields.totalALPH).toEqual(ONE_ALPH)
  })

  it('should build chained dApp transactions', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [wallet, account1] = await prepareChainedTxTest(ONE_ALPH / 2n)

    const deployer = await getSigner(100n * ONE_ALPH, 1)
    const { tokenId } = await mintToken(deployer.address, 10n)
    const deploy = await Transact.deploy(deployer, {
      initialAttoAlphAmount: 10n * ONE_ALPH,
      initialFields: { tokenId, totalALPH: 10n * ONE_ALPH, totalTokens: 0n }
    })
    const transactInstance = deploy.contractInstance
    expect(transactInstance.groupIndex).toBe(1)

    const account1BalanceBefore = await nodeProvider.addresses.getAddressesAddressBalance(account1.address)
    expect(BigInt(account1BalanceBefore.balance)).toBe(ONE_ALPH / 2n)

    await wallet.setSelectedAccount(account1.address)
    const depositTxParams = await Deposit.script.txParamsForExecution(wallet, {
      initialFields: { c: transactInstance.contractId },
      attoAlphAmount: ONE_ALPH + DUST_AMOUNT * 3n
    })
    expect(depositTxParams.signerAddress).toBe(account1.address)
    await expect(wallet.signAndSubmitExecuteScriptTx(depositTxParams)).rejects.toThrow(
      `Failed to request postContractsUnsignedTxExecuteScript, error: [API Error] - Execution error when emulating tx script or contract: Not enough approved balance for address ${account1.address}, tokenId: ALPH, expected: 1000000000000000000, got: 498000000000000000 - Status code: 400`
    )

    const withdrawTxParams = await Withdraw.script.txParamsForExecution(wallet, {
      initialFields: { c: transactInstance.contractId }
    })

    const [withdrawTxResult, depositTxResult] = await wallet.signAndSubmitChainedTx([
      { ...withdrawTxParams, type: 'ExecuteScript' },
      { ...depositTxParams, type: 'ExecuteScript' }
    ])

    const withdrawTxGasCost = BigInt(withdrawTxResult.gasAmount) * BigInt(withdrawTxResult.gasPrice)
    const depositTxGasCost = BigInt(depositTxResult.gasAmount) * BigInt(depositTxResult.gasPrice)
    const account1BalanceAfter = await nodeProvider.addresses.getAddressesAddressBalance(account1.address)
    expect(BigInt(account1BalanceAfter.balance)).toBe(ONE_ALPH / 2n - withdrawTxGasCost - depositTxGasCost)
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

  it('should build dapp transactions', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const { tokenId } = await mintToken(signer.address, 10n * 10n ** 18n)
    const initBalance = await nodeProvider.addresses.getAddressesAddressBalance(signer.address)
    let alphBalance = BigInt(initBalance.balance)
    const result0 = await Transact.deploy(signer, {
      initialAttoAlphAmount: MINIMAL_CONTRACT_DEPOSIT,
      initialFields: { tokenId, totalALPH: 0n, totalTokens: 0n }
    })
    const contractAddress0 = result0.contractInstance.address
    const builder = new DappTransactionBuilder(signer.address)
    const unsignedTx0 = builder
      .callContract({
        contractAddress: contractAddress0,
        methodIndex: 0, // Transact.depositAlph
        args: [],
        attoAlphAmount: ONE_ALPH
      })
      .getResult()
    const tx0 = (await signer.signAndSubmitExecuteScriptTx(unsignedTx0)) as SignExecuteScriptTxResult
    const balance0 = await nodeProvider.addresses.getAddressesAddressBalance(signer.address)
    expect(BigInt(tokenBalance(balance0, tokenId)!)).toEqual(ONE_ALPH * 10n)
    expect(BigInt(balance0.balance)).toEqual(
      alphBalance -
        MINIMAL_CONTRACT_DEPOSIT -
        BigInt(result0.gasAmount) * BigInt(result0.gasPrice) -
        ONE_ALPH -
        BigInt(tx0.gasAmount) * BigInt(tx0.gasPrice)
    )
    alphBalance = BigInt(balance0.balance)

    const result1 = await Sub.deploy(signer, {
      initialAttoAlphAmount: MINIMAL_CONTRACT_DEPOSIT,
      initialFields: { result: 0n }
    })
    const contractAddress1 = result1.contractInstance.address
    const unsignedTx1 = builder
      .callContract({
        contractAddress: contractAddress0,
        methodIndex: 0, // Transact.depositAlph
        args: [],
        attoAlphAmount: ONE_ALPH
      })
      .callContract({
        contractAddress: contractAddress0,
        methodIndex: 2, // Transact.depositToken
        args: [ONE_ALPH],
        tokens: [{ id: tokenId, amount: ONE_ALPH }]
      })
      .callContract({
        contractAddress: contractAddress1,
        methodIndex: 0, // Sub.sub
        args: [5n, 1n],
        retLength: 1
      })
      .getResult()
    const tx1 = (await signer.signAndSubmitExecuteScriptTx(unsignedTx1)) as SignExecuteScriptTxResult
    const balance1 = await nodeProvider.addresses.getAddressesAddressBalance(signer.address)
    expect(BigInt(tokenBalance(balance1, tokenId)!)).toEqual(ONE_ALPH * 9n)
    expect(BigInt(balance1.balance)).toEqual(
      alphBalance -
        MINIMAL_CONTRACT_DEPOSIT -
        BigInt(result1.gasAmount) * BigInt(result1.gasPrice) -
        ONE_ALPH -
        BigInt(tx1.gasAmount) * BigInt(tx1.gasPrice)
    )

    const subContractState = await result1.contractInstance.fetchState()
    expect(subContractState.fields.result).toEqual(4n)
  })

  function tokenBalance(balance: Balance, tokenId: string): string | undefined {
    return balance.tokenBalances?.find((t) => t.id === tokenId)?.amount
  }
})
