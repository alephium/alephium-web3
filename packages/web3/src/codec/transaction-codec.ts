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
import { Parser } from 'binary-parser'
import { ArrayCodec, DecodedArray } from './array-codec'
import { Codec } from './codec'
import { UnsignedTransactionCodec, UnsignedTransaction, unsignedTransactionCodec } from './unsigned-transaction-codec'
import { Signature, signatureCodec } from './signature-codec'
import { ContractOutputRef, contractOutputRefCodec } from './contract-output-ref-codec'
import { Either, EitherCodec } from './either-codec'
import { AssetOutput, AssetOutputCodec, assetOutputCodec } from './asset-output-codec'
import { ContractOutput, ContractOutputCodec, contractOutputCodec } from './contract-output-codec'
import { Transaction as Tx } from '../api/api-alephium'
import { hexToBinUnsafe } from '..'

type Output = Either<AssetOutput, ContractOutput>
const outputCodec = new EitherCodec<AssetOutput, ContractOutput>(assetOutputCodec, contractOutputCodec)
const outputsCodec = new ArrayCodec(outputCodec)
export const signaturesCodec = new ArrayCodec(signatureCodec)
const contractOutputRefsCodec = new ArrayCodec(contractOutputRefCodec)

export interface Transaction {
  unsigned: UnsignedTransaction
  scriptExecutionOk: number
  contractInputs: DecodedArray<ContractOutputRef>
  generatedOutputs: DecodedArray<Output>
  inputSignatures: DecodedArray<Signature>
  scriptSignatures: DecodedArray<Signature>
}

export class TransactionCodec implements Codec<Transaction> {
  parser = new Parser()
    .nest('unsigned', {
      type: unsignedTransactionCodec.parser
    })
    .uint8('scriptExecutionOk')
    .nest('contractInputs', {
      type: contractOutputRefsCodec.parser
    })
    .nest('generatedOutputs', {
      type: outputsCodec.parser
    })
    .nest('inputSignatures', {
      type: signaturesCodec.parser
    })
    .nest('scriptSignatures', {
      type: signaturesCodec.parser
    })

  encode(input: Transaction): Buffer {
    return Buffer.concat([
      unsignedTransactionCodec.encode(input.unsigned),
      Buffer.from([input.scriptExecutionOk]),
      Buffer.from([...contractOutputRefsCodec.encode(input.contractInputs.value)]),
      Buffer.from([...outputsCodec.encode(input.generatedOutputs.value)]),
      Buffer.from([...signaturesCodec.encode(input.inputSignatures.value)]),
      Buffer.from([...signaturesCodec.encode(input.scriptSignatures.value)])
    ])
  }

  decode(input: Buffer): Transaction {
    return this.parser.parse(input)
  }

  static convertToTx(transaction: Transaction, txId: string): Tx {
    const unsigned = UnsignedTransactionCodec.convertToUnsignedTx(transaction.unsigned, txId)
    const scriptExecutionOk = !!transaction.scriptExecutionOk
    const contractInputs = transaction.contractInputs.value.map((contractInput) => {
      const hint = contractInput.hint
      const key = contractInput.key.toString('hex')
      return { hint, key }
    })
    const txIdBytes = hexToBinUnsafe(txId)
    const generatedOutputs = transaction.generatedOutputs.value.map((output, index) => {
      if (output.either === 0) {
        const fixedAssetOutput = AssetOutputCodec.convertToFixedAssetOutput(
          txIdBytes,
          output.value as AssetOutput,
          index
        )
        return { ...fixedAssetOutput, type: 'AssetOutput' }
      } else {
        return ContractOutputCodec.convertToApiContractOutput(txIdBytes, output.value as ContractOutput, index)
      }
    })

    const inputSignatures = transaction.inputSignatures.value.map((signature) => signature.value.toString('hex'))
    const scriptSignatures = transaction.scriptSignatures.value.map((signature) => signature.value.toString('hex'))

    return { unsigned, scriptExecutionOk, contractInputs, generatedOutputs, inputSignatures, scriptSignatures }
  }
}

export const transactionCodec = new TransactionCodec()
