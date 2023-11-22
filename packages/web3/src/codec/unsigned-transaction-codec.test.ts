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

import { web3, ONE_ALPH, buildScriptByteCode, buildContractByteCode } from '@alephium/web3'
import { getSigners } from '@alephium/web3-test'
import { unsignedTransactionCodec, UnsignedTransaction, UnsignedTransactionCodec } from './unsigned-transaction-codec'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { DUST_AMOUNT } from '../../dist/src/constants'
import { UnsignedTx } from '../api/api-alephium'

describe('Encode & decode unsigned transactions', function () {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should encode and decode normal transfer transactions', async () => {
    const [signer1, signer2] = await getSigners(2)
    const fromAccount = await signer1.getSelectedAccount()
    const toAccount = await signer2.getSelectedAccount()

    const tx = await signer1.buildTransferTx({
      signerAddress: fromAccount.address,
      destinations: [{ address: toAccount.address, attoAlphAmount: ONE_ALPH }]
    })

    await checkUnsignedTxCodec(tx.unsignedTx)
  })

  it('should encode and decode multisig transfer transactions', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [signer1, signer2, signer3] = await getSigners(3)
    const fromAccount = await signer1.getSelectedAccount()

    // Build Multisig address
    const multisigAddressResult = await nodeProvider.multisig.postMultisigAddress({
      keys: [signer1.publicKey, signer2.publicKey, signer3.publicKey],
      mrequired: 2
    })
    const multisigAddress = multisigAddressResult.address

    // Transfer to multisig address
    const toMultiSig = await signer1.buildTransferTx({
      signerAddress: fromAccount.address,
      destinations: [{ address: multisigAddress, attoAlphAmount: ONE_ALPH * 10n }]
    })

    await checkUnsignedTxCodec(toMultiSig.unsignedTx)

    // Finish the transfer so multisig address has some balance
    await signer1.signAndSubmitTransferTx({
      signerAddress: fromAccount.address,
      destinations: [{ address: multisigAddress, attoAlphAmount: ONE_ALPH * 10n }]
    })

    // Transfer from multisig address
    const fromMultiSig = await nodeProvider.multisig.postMultisigBuild({
      fromAddress: multisigAddress,
      fromPublicKeys: [signer1.publicKey, signer2.publicKey],
      destinations: [{ address: signer1.address, attoAlphAmount: ONE_ALPH.toString() }]
    })

    await checkUnsignedTxCodec(fromMultiSig.unsignedTx)
  }, 100000)

  it('should encode and decode transactions that invoke contract method', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [signer1] = await getSigners(1)
    const contractCode = `
      Contract Test() {
        @using(preapprovedAssets = true, assetsInContract = true)
        pub fn test() -> () {
          transferTokenToSelf!(callerAddress!(), ALPH, 3 alph)
        }
      }
    `
    const compileContractResult = await nodeProvider.contracts.postContractsCompileContract({ code: contractCode })
    const contractByteCode = buildContractByteCode(
      compileContractResult.bytecode,
      {},
      { names: [], types: [], isMutable: [] }
    )
    const deployContractResult = await signer1.signAndSubmitDeployContractTx({
      signerAddress: signer1.address,
      bytecode: contractByteCode
    })

    const scriptCode = `
       TxScript CallTest(testContract: Test) {
          testContract.test{callerAddress!() -> ALPH: 3 alph}()
       }

       ${contractCode}
    `
    const compileScriptResult = await nodeProvider.contracts.postContractsCompileScript({ code: scriptCode })
    const scriptBytecode = buildScriptByteCode(
      compileScriptResult.bytecodeTemplate,
      { testContract: deployContractResult.contractId },
      { names: ['testContract'], types: ['ByteVec'], isMutable: [false] }
    )

    const buildExecuteScriptTxResult = await signer1.buildExecuteScriptTx({
      signerAddress: signer1.address,
      bytecode: scriptBytecode
    })

    await checkUnsignedTxCodec(buildExecuteScriptTxResult.unsignedTx)
  })

  it('should encode and decode p2sh transactions (schnorr address)', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [signer1] = await getSigners(2)
    const schnorrSigner = PrivateKeyWallet.Random(undefined, nodeProvider, 'bip340-schnorr')
    const fromAccount = await signer1.getSelectedAccount()

    const toSchnorrAddressResult = await signer1.signAndSubmitTransferTx({
      signerAddress: fromAccount.address,
      destinations: [{ address: schnorrSigner.address, attoAlphAmount: ONE_ALPH }]
    })

    await checkUnsignedTxCodec(toSchnorrAddressResult.unsignedTx)

    const fromSchnorrAddressResult = await schnorrSigner.signAndSubmitTransferTx({
      signerAddress: schnorrSigner.address,
      signerKeyType: 'bip340-schnorr',
      destinations: [{ address: signer1.address, attoAlphAmount: ONE_ALPH / 2n }]
    })

    await checkUnsignedTxCodec(fromSchnorrAddressResult.unsignedTx)
  }, 100000)

  it('should encode and decode transactions that transfer tokens', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [signer1, signer2] = await getSigners(2)
    const contractCode = `
      Contract Faucet() {
        @using(assetsInContract = true)
        pub fn withdraw() -> () {
          transferTokenFromSelf!(callerAddress!(), ALPH, dustAmount!())
          transferTokenFromSelf!(callerAddress!(), selfTokenId!(), 10)
        }
      }
    `
    const compileContractResult = await nodeProvider.contracts.postContractsCompileContract({ code: contractCode })
    const contractByteCode = buildContractByteCode(
      compileContractResult.bytecode,
      {},
      { names: [], types: [], isMutable: [] }
    )
    const deployContractResult = await signer1.signAndSubmitDeployContractTx({
      signerAddress: signer1.address,
      bytecode: contractByteCode,
      issueTokenAmount: 10000n,
      initialAttoAlphAmount: ONE_ALPH * 10n
    })

    const scriptCode = `
       TxScript Withdraw(faucetContract: Faucet) {
          faucetContract.withdraw()
       }

       ${contractCode}
    `
    const compileScriptResult = await nodeProvider.contracts.postContractsCompileScript({ code: scriptCode })
    const scriptBytecode = buildScriptByteCode(
      compileScriptResult.bytecodeTemplate,
      { faucetContract: deployContractResult.contractId },
      { names: ['faucetContract'], types: ['ByteVec'], isMutable: [false] }
    )

    // Get the token to signer1
    await signer1.signAndSubmitExecuteScriptTx({
      signerAddress: signer1.address,
      bytecode: scriptBytecode
    })

    // Transfer token from signer1 to signer2
    const transferTokenResult = await signer1.buildTransferTx({
      signerAddress: signer1.address,
      destinations: [
        {
          address: signer2.address,
          attoAlphAmount: DUST_AMOUNT,
          tokens: [{ id: deployContractResult.contractId, amount: 1n }]
        }
      ]
    })

    await checkUnsignedTxCodec(transferTokenResult.unsignedTx)
  }, 100000)

  async function checkUnsignedTxCodec(unsignedTx: string) {
    checkUnsignedTransactionCodecRoundtrip(unsignedTx)

    const nodeProvider = web3.getCurrentNodeProvider()
    const { unsignedTx: serverDecodedUnsignedTx } = await nodeProvider.transactions.postTransactionsDecodeUnsignedTx({
      unsignedTx
    })
    const clientEncodedUnsignedTx = UnsignedTransactionCodec.encodeUnsignedTx(serverDecodedUnsignedTx)
    expect(unsignedTx).toEqual(clientEncodedUnsignedTx)
    const clientDecodedUnsignedTx: UnsignedTx = UnsignedTransactionCodec.decodeToUnsignedTx(unsignedTx)
    expect(clientDecodedUnsignedTx).toEqual(serverDecodedUnsignedTx)
  }

  function checkUnsignedTransactionCodecRoundtrip(unsignedTx: string) {
    const decoded: UnsignedTransaction = unsignedTransactionCodec.decode(Buffer.from(unsignedTx, 'hex'))
    const encoded: string = unsignedTransactionCodec.encode(decoded).toString('hex')
    expect(unsignedTx).toEqual(encoded)
  }
})
