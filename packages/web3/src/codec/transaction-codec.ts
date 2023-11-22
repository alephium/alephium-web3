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
import { AssetOutput, assetOutputCodec } from './asset-output-codec'
import { ContractOutput, contractOutputCodec } from './contract-output-codec'

type Output = Either<AssetOutput, ContractOutput>
const outputCodec = new EitherCodec<AssetOutput, ContractOutput>(assetOutputCodec, contractOutputCodec)
const outputsCodec = new ArrayCodec(outputCodec)
const signaturesCodec = new ArrayCodec(signatureCodec)
const contractOutputRefsCodec = new ArrayCodec(contractOutputRefCodec)

export interface Transaction {
  unsigned: UnsignedTransaction
  scriptExecutionOk: number
  contratInputs: DecodedArray<ContractOutputRef>
  generatedOutputs: DecodedArray<Output>
  inputSignatures: DecodedArray<Signature>
  scriptSignatures: DecodedArray<Signature>
}

export class TransactionCodec implements Codec<Transaction> {
  static parser = new Parser()
    .nest('unsigned', {
      type: UnsignedTransactionCodec.parser
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

  parser = TransactionCodec.parser

  encode(input: Transaction): Buffer {
    return Buffer.concat([
      unsignedTransactionCodec.encode(input.unsigned),
      Buffer.from([input.scriptExecutionOk]),
      Buffer.from([...contractOutputRefsCodec.encode(input.contratInputs.value)]),
      Buffer.from([...outputsCodec.encode(input.generatedOutputs.value)]),
      Buffer.from([...signaturesCodec.encode(input.inputSignatures.value)]),
      Buffer.from([...signaturesCodec.encode(input.scriptSignatures.value)])
    ])
  }

  decode(input: Buffer): Transaction {
    return this.parser.parse(input)
  }
}

export const transactionCodec = new TransactionCodec()
