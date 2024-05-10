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
import { DecodedMethod, methodsCodec } from './method-codec'
import { OptionCodec } from './option-codec'

export interface Script {
  methods: DecodedArray<DecodedMethod>
}

export class ScriptCodec implements Codec<Script> {
  parser = Parser.start().nest('methods', {
    type: methodsCodec.parser
  })

  encode(input: Script): Buffer {
    const script = methodsCodec.encode(input.methods.value)
    return Buffer.from(script)
  }

  decode(input: Buffer): Script {
    return this.parser.parse(input)
  }
}

export const scriptCodec = new ScriptCodec()
export const statefulScriptCodecOpt = new OptionCodec(scriptCodec)
