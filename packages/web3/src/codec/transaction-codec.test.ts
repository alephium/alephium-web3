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

import { web3, ONE_ALPH, buildScriptByteCode, buildContractByteCode, Fields, FieldsSig } from "@alephium/web3"
import { getSigners } from "@alephium/web3-test"
import { UnsignedTransactionCodec } from './transaction-codec'

describe('Encode & decode transactions', function() {

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should encode and decode normal transfer transactions', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [signer1, signer2] = await getSigners(2)
    const fromAccount = await signer1.getSelectedAccount()
    const toAccount = await signer2.getSelectedAccount()

    const tx = await signer1.buildTransferTx({
      signerAddress: fromAccount.address,
      destinations: [{ address: toAccount.address, attoAlphAmount: ONE_ALPH }]
    })

    const unsignedTx = tx.unsignedTx
    const serverParsedResult = await nodeProvider.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx: unsignedTx })
    const clientParsedResult = UnsignedTransactionCodec.parseToUnsignedTx(unsignedTx)
    expect(clientParsedResult).toEqual(serverParsedResult.unsignedTx)

    checkUnsignedTxCodec(unsignedTx)
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

    const serverToMultisigParsedResult = await nodeProvider.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx: toMultiSig.unsignedTx })
    const clientToMultisigParsedResult = UnsignedTransactionCodec.parseToUnsignedTx(toMultiSig.unsignedTx)
    expect(clientToMultisigParsedResult).toEqual(serverToMultisigParsedResult.unsignedTx)

    checkUnsignedTxCodec(toMultiSig.unsignedTx)

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

    const serverFromMultisigParsedResult = await nodeProvider.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx: fromMultiSig.unsignedTx })
    const clientFromMultisigParsedResult = UnsignedTransactionCodec.parseToUnsignedTx(fromMultiSig.unsignedTx)
    expect(clientFromMultisigParsedResult).toEqual(serverFromMultisigParsedResult.unsignedTx)

    checkUnsignedTxCodec(fromMultiSig.unsignedTx)
  })

  it('invoke contract method', async () => {
    const nodeProvider = web3.getCurrentNodeProvider()
    const [signer1, signer2, signer3] = await getSigners(3)
    const contractCode = `
      Contract Test() {
        pub fn test() -> U256 {
          return 1
        }
      }
    `
    const compileContractResult = await nodeProvider.contracts.postContractsCompileContract({ code: contractCode })
    const contractByteCode = buildContractByteCode(compileContractResult.bytecode, {}, { names: [], types: [], isMutable: [] })
    const deployContractResult = await signer1.signAndSubmitDeployContractTx({
      signerAddress: signer1.address,
      bytecode: contractByteCode
    })

    const scriptCode = `
       TxScript CallTest(testContract: Test) {
          testContract.test()
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

    const serverParsedResult = await nodeProvider.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx: buildExecuteScriptTxResult.unsignedTx })
    const clientParsedResult = UnsignedTransactionCodec.parseToUnsignedTx(buildExecuteScriptTxResult.unsignedTx)
    expect(clientParsedResult).toEqual(serverParsedResult.unsignedTx)

    checkUnsignedTxCodec(buildExecuteScriptTxResult.unsignedTx)
  })

  function checkUnsignedTxCodec(unsignedTx: string) {
    const decoded = UnsignedTransactionCodec.new().decode(Buffer.from(unsignedTx, 'hex'))
    const encoded = UnsignedTransactionCodec.new().encode(decoded).toString('hex')
    expect(unsignedTx).toEqual(encoded)
  }

  // Tokens, P2C, Script
})