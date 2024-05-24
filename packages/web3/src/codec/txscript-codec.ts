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
import { Codec } from './codec'
import { DecodedMethod, Method, MethodCodec, methodsCodec } from './method-codec'
import { compactUnsignedIntCodec } from './compact-int-codec'

export interface DecodedTxScript {
  methods: DecodedArray<DecodedMethod>
}

export interface TxScript {
  methods: Method[]
}

export class TxScriptCodec implements Codec<DecodedTxScript> {
  parser = Parser.start().nest('methods', {
    type: methodsCodec.parser
  })

  encode(input: DecodedTxScript): Buffer {
    return methodsCodec.encode(input.methods.value)
  }

  decode(input: Buffer): DecodedTxScript {
    return this.parser.parse(input)
  }

  decodeTxScript(input: Buffer): TxScript {
    const decodedTxScript = this.decode(input)
    const methods = decodedTxScript.methods.value.map((decodedMethod) => MethodCodec.toMethod(decodedMethod))
    return { methods }
  }

  encodeTxScript(inputTxScript: TxScript): Buffer {
    const methodLength = compactUnsignedIntCodec.fromU32(inputTxScript.methods.length)
    const decodedMethods = inputTxScript.methods.map((method) => MethodCodec.fromMethod(method))
    return this.encode({ methods: { value: decodedMethods, length: methodLength } })
  }
}

export const txScriptCodec = new TxScriptCodec()
