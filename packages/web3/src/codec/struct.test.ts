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

import { Struct } from './struct'
import { Int } from './int'
import { Vector } from './vector'
import { Bool } from './bool'

interface Point {
  x: number
  y: number
}

interface Transaction {
  unsigned: UnsignedTransaction
  scriptExecutionOk: boolean
  contractInputs: Array<ContractOutputRef>
  generatedOutputs: Array<TxOutput>
  inputSignatures: Array<Signature>
  scriptSignatures: Array<Signature>
  scriptExecutionFalse: boolean
}

interface UnsignedTransaction {
  count: number
}

interface ContractOutputRef {}

interface TxOutput {}

interface Signature {}

const Point = Struct({
  x: Int,
  y: Int
})
const UnsignedTransaction = Struct({
  count: Int
})
const ContractOutputRef = Struct({})
const TxOutput = Struct({})
const Signature = Struct({})
const TransactionCodec = Struct({
  unsigned: UnsignedTransaction,
  scriptExecutionOk: Bool,
  contractInputs: Vector<ContractOutputRef>(ContractOutputRef),
  generatedOutputs: Vector<TxOutput>(TxOutput),
  inputSignatures: Vector<Signature>(Signature),
  scriptSignatures: Vector<Signature>(Signature),
  scriptExecutionFalse: Bool
})

describe('struct', function () {
  it('struct', () => {
    const point = <Point>{
      x: 12,
      y: 12000
    }
    const encData = Point.enc(point)
    expect(point.x).toEqual(Point.dec(encData).x)
    expect(point.y).toEqual(Point.dec(encData).y)
    const tx = <Transaction>{
      unsigned: {
        count: 12
      },
      scriptExecutionOk: true,
      contractInputs: [],
      generatedOutputs: [],
      inputSignatures: [],
      scriptSignatures: [],
      scriptExecutionFalse: true
    }
    expect(TransactionCodec.enc(tx)).toEqual(Int8Array.from([12, 1, 0, 0, 0, 0, 1]))
  })
})
