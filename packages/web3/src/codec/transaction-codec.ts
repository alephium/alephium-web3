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

import { UnsignedTxCodec, UnsignedTx, unsignedTxCodec } from './unsigned-tx-codec'
import { Signature, signaturesCodec } from './signature-codec'
import { ContractOutputRef, contractOutputRefsCodec } from './contract-output-ref-codec'
import { Either } from './either-codec'
import { AssetOutput, AssetOutputCodec } from './asset-output-codec'
import { ContractOutput, ContractOutputCodec } from './contract-output-codec'
import { FixedAssetOutput, Transaction as ApiTransaction } from '../api/api-alephium'
import { binToHex, hexToBinUnsafe } from '../utils'
import { ContractOutput as ApiContractOutput } from '../api/api-alephium'
import { byteCodec, ObjectCodec } from './codec'
import { Output, outputsCodec } from './output-codec'

export interface Transaction {
  unsigned: UnsignedTx
  scriptExecutionOk: number
  contractInputs: ContractOutputRef[]
  generatedOutputs: Output[]
  inputSignatures: Signature[]
  scriptSignatures: Signature[]
}

export class TransactionCodec extends ObjectCodec<Transaction> {
  encodeApiTransaction(input: ApiTransaction): Uint8Array {
    const decodedTx = TransactionCodec.fromApiTransaction(input)
    return this.encode(decodedTx)
  }

  decodeApiTransaction(input: Uint8Array): ApiTransaction {
    const decodedTx = this.decode(input)
    return TransactionCodec.toApiTransaction(decodedTx)
  }

  static toApiTransaction(transaction: Transaction): ApiTransaction {
    const txId = UnsignedTxCodec.txId(transaction.unsigned)
    const unsigned = UnsignedTxCodec.toApiUnsignedTx(transaction.unsigned)
    const scriptExecutionOk = !!transaction.scriptExecutionOk
    const contractInputs = transaction.contractInputs.map((contractInput) => {
      const hint = contractInput.hint
      const key = binToHex(contractInput.key)
      return { hint, key }
    })
    const txIdBytes = hexToBinUnsafe(txId)
    const generatedOutputs = transaction.generatedOutputs.map((output, index) => {
      if (output.kind === 'Left') {
        const fixedAssetOutput = AssetOutputCodec.toFixedAssetOutput(txIdBytes, output.value as AssetOutput, index)
        return { ...fixedAssetOutput, type: 'AssetOutput' }
      } else {
        return ContractOutputCodec.convertToApiContractOutput(txIdBytes, output.value as ContractOutput, index)
      }
    })

    const inputSignatures = transaction.inputSignatures.map((signature) => binToHex(signature))
    const scriptSignatures = transaction.scriptSignatures.map((signature) => binToHex(signature))

    return { unsigned, scriptExecutionOk, contractInputs, generatedOutputs, inputSignatures, scriptSignatures }
  }

  static fromApiTransaction(tx: ApiTransaction): Transaction {
    const unsigned = UnsignedTxCodec.fromApiUnsignedTx(tx.unsigned)
    const scriptExecutionOk = tx.scriptExecutionOk ? 1 : 0
    const contractInputs: ContractOutputRef[] = tx.contractInputs.map((contractInput) => {
      return { hint: contractInput.hint, key: hexToBinUnsafe(contractInput.key) }
    })
    const generatedOutputs: Either<AssetOutput, ContractOutput>[] = tx.generatedOutputs.map((output) => {
      if (output.type === 'AssetOutput') {
        return { kind: 'Left', value: AssetOutputCodec.fromFixedAssetOutput(output as FixedAssetOutput) }
      } else if (output.type === 'ContractOutput') {
        return { kind: 'Right', value: ContractOutputCodec.convertToOutput(output as ApiContractOutput) }
      } else {
        throw new Error('Invalid output type')
      }
    })

    const inputSignatures: Signature[] = tx.inputSignatures.map((signature) => {
      return hexToBinUnsafe(signature)
    })
    const scriptSignatures: Signature[] = tx.scriptSignatures.map((signature) => {
      return hexToBinUnsafe(signature)
    })

    return {
      unsigned,
      scriptExecutionOk,
      contractInputs: contractInputs,
      generatedOutputs: generatedOutputs,
      inputSignatures: inputSignatures,
      scriptSignatures: scriptSignatures
    }
  }
}

export const transactionCodec = new TransactionCodec({
  unsigned: unsignedTxCodec,
  scriptExecutionOk: byteCodec,
  contractInputs: contractOutputRefsCodec,
  generatedOutputs: outputsCodec,
  inputSignatures: signaturesCodec,
  scriptSignatures: signaturesCodec
})
