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
import { DecodedMethod, methodsCodec, Method, MethodCodec } from './method-codec'
import { OptionCodec } from './option-codec'
import { compactUnsignedIntCodec } from './compact-int-codec'

export interface DecodedScript {
  methods: DecodedArray<DecodedMethod>
}

export interface Script {
  methods: Method[]
}

export class ScriptCodec implements Codec<DecodedScript> {
  parser = Parser.start().nest('methods', {
    type: methodsCodec.parser
  })

  encode(input: DecodedScript): Buffer {
    const script = methodsCodec.encode(input.methods.value)
    return Buffer.from(script)
  }

  decode(input: Buffer): DecodedScript {
    return this.parser.parse(input)
  }

  decodeScript(input: Buffer): Script {
    const decodedTxScript = this.decode(input)
    const methods = decodedTxScript.methods.value.map((decodedMethod) => MethodCodec.toMethod(decodedMethod))
    return { methods }
  }

  encodeScript(inputTxScript: Script): Buffer {
    const methodLength = compactUnsignedIntCodec.fromU32(inputTxScript.methods.length)
    const decodedMethods = inputTxScript.methods.map((method) => MethodCodec.fromMethod(method))
    return this.encode({ methods: { value: decodedMethods, length: methodLength } })
  }
}

export const scriptCodec = new ScriptCodec()
export const statefulScriptCodecOpt = new OptionCodec(scriptCodec)
