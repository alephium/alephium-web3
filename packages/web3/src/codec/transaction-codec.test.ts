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

import { UnsignedTransactionCodec } from '.'
import { compactSignedIntCodec } from './compact-int-codec'
import { transactionCodec } from './transaction-codec'

describe('Encode & decode transactions', function () {
  it('should encode and decode coinbase transactions', () => {
    const txId = 'c1b316227dd32b666d03e12d4fefa3726e590fb482c38adbc5394e8bce33fd0a'
    const encoded =
      '00000080004e20bb9aca000001c422b1c8c1227a0000001676f69331afd08536b2878b639f56c268871863817e7a774d8745614d9e28230000018bdfafc0eb000a00020000018bdde5fd6b0100000000'
    const decoded = transactionCodec.decode(Buffer.from(encoded, 'hex'))
    const unsignedTx = UnsignedTransactionCodec.convertToUnsignedTx(decoded.unsigned, txId)
    expect(unsignedTx.inputs).toEqual([])
    expect(unsignedTx.gasAmount).toEqual(20000)
    expect(unsignedTx.gasPrice).toEqual('1000000000')
    expect(unsignedTx.scriptOpt).toBeUndefined()
    expect(unsignedTx.fixedOutputs).toEqual([
      {
        hint: -140898739,
        key: 'a739ddff0dc02d9b49623a70baf4392b25478ddcc463b7873fbb7d54ec253e9e',
        attoAlphAmount: '2500000000000000000',
        address: '12WhBVry3PXzTyCm389eSZMVsDSQZjGh5csv6CPrNfgtz',
        tokens: [],
        lockTime: 1700264919275,
        message: '00020000018bdde5fd6b'
      }
    ])
    expect(compactSignedIntCodec.toI32(decoded.inputSignatures.length)).toEqual(0)
    expect(compactSignedIntCodec.toI32(decoded.generatedOutputs.length)).toEqual(0)
    expect(compactSignedIntCodec.toI32(decoded.scriptSignatures.length)).toEqual(0)
  })
})
