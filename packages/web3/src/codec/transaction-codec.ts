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

import { Buffer } from 'buffer/'
import { Parser } from 'binary-parser'
import { DecodedArray } from './array-codec'

import { UnsignedTxCodec, UnsignedTx, unsignedTxCodec } from './unsigned-tx-codec'
import { Signature, signaturesCodec } from './signature-codec'
import { ContractOutputRef, contractOutputRefsCodec } from './contract-output-ref-codec'
import { Either } from './either-codec'
import { AssetOutput, AssetOutputCodec } from './asset-output-codec'
import { ContractOutput, ContractOutputCodec } from './contract-output-codec'
import { FixedAssetOutput, Transaction as ApiTransaction } from '../api/api-alephium'
import { hexToBinUnsafe } from '../utils'
import { ContractOutput as ApiContractOutput } from '../api/api-alephium'
import { Codec } from './codec'
import { Output, outputCodec, outputsCodec } from './output-codec'

export interface Transaction {
  unsigned: UnsignedTx
  scriptExecutionOk: number
  contractInputs: DecodedArray<ContractOutputRef>
  generatedOutputs: DecodedArray<Output>
  inputSignatures: DecodedArray<Signature>
  scriptSignatures: DecodedArray<Signature>
}

export class TransactionCodec implements Codec<Transaction> {
  parser = new Parser()
    .nest('unsigned', {
      type: unsignedTxCodec.parser
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

  encode(decodedTx: Transaction): Buffer {
    return Buffer.concat([
      unsignedTxCodec.encode(decodedTx.unsigned),
      Buffer.from([decodedTx.scriptExecutionOk]),
      Buffer.from([...contractOutputRefsCodec.encode(decodedTx.contractInputs.value)]),
      Buffer.from([...outputsCodec.encode(decodedTx.generatedOutputs.value)]),
      Buffer.from([...signaturesCodec.encode(decodedTx.inputSignatures.value)]),
      Buffer.from([...signaturesCodec.encode(decodedTx.scriptSignatures.value)])
    ])
  }

  decode(input: Buffer): Transaction {
    return this.parser.parse(input)
  }

  encodeApiTransaction(input: ApiTransaction): Buffer {
    const decodedTx = TransactionCodec.fromApiTransaction(input)
    return this.encode(decodedTx)
  }

  decodeApiTransaction(input: Buffer): ApiTransaction {
    const decodedTx = this.parser.parse(input)
    return TransactionCodec.toApiTransaction(decodedTx)
  }

  static toApiTransaction(transaction: Transaction): ApiTransaction {
    const txId = UnsignedTxCodec.txId(transaction.unsigned)
    const unsigned = UnsignedTxCodec.toApiUnsignedTx(transaction.unsigned)
    const scriptExecutionOk = !!transaction.scriptExecutionOk
    const contractInputs = transaction.contractInputs.value.map((contractInput) => {
      const hint = contractInput.hint
      const key = contractInput.key.toString('hex')
      return { hint, key }
    })
    const txIdBytes = hexToBinUnsafe(txId)
    const generatedOutputs = transaction.generatedOutputs.value.map((output, index) => {
      if (output.either === 0) {
        const fixedAssetOutput = AssetOutputCodec.toFixedAssetOutput(txIdBytes, output.value as AssetOutput, index)
        return { ...fixedAssetOutput, type: 'AssetOutput' }
      } else {
        return ContractOutputCodec.convertToApiContractOutput(txIdBytes, output.value as ContractOutput, index)
      }
    })

    const inputSignatures = transaction.inputSignatures.value.map((signature) => signature.value.toString('hex'))
    const scriptSignatures = transaction.scriptSignatures.value.map((signature) => signature.value.toString('hex'))

    return { unsigned, scriptExecutionOk, contractInputs, generatedOutputs, inputSignatures, scriptSignatures }
  }

  static fromApiTransaction(tx: ApiTransaction): Transaction {
    const unsigned = UnsignedTxCodec.fromApiUnsignedTx(tx.unsigned)
    const scriptExecutionOk = tx.scriptExecutionOk ? 1 : 0
    const contractInputs: ContractOutputRef[] = tx.contractInputs.map((contractInput) => {
      return { hint: contractInput.hint, key: Buffer.from(contractInput.key, 'hex') }
    })
    const generatedOutputs: Either<AssetOutput, ContractOutput>[] = tx.generatedOutputs.map((output) => {
      if (output.type === 'AssetOutput') {
        return outputCodec.fromLeft(AssetOutputCodec.fromFixedAssetOutput(output as FixedAssetOutput))
      } else if (output.type === 'ContractOutput') {
        return outputCodec.fromRight(ContractOutputCodec.convertToOutput(output as ApiContractOutput))
      } else {
        throw new Error('Invalid output type')
      }
    })

    const inputSignatures: Signature[] = tx.inputSignatures.map((signature) => {
      return { value: Buffer.from(signature, 'hex') }
    })
    const scriptSignatures: Signature[] = tx.scriptSignatures.map((signature) => {
      return { value: Buffer.from(signature, 'hex') }
    })

    return {
      unsigned,
      scriptExecutionOk,
      contractInputs: contractOutputRefsCodec.fromArray(contractInputs),
      generatedOutputs: outputsCodec.fromArray(generatedOutputs),
      inputSignatures: signaturesCodec.fromArray(inputSignatures),
      scriptSignatures: signaturesCodec.fromArray(scriptSignatures)
    }
  }
}

export const transactionCodec = new TransactionCodec()
