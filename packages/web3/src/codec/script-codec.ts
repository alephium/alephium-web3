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
import { ArrayCodec } from './array-codec'
import { compactUnsignedIntCodec } from './compact-int-codec'
import { Codec } from './codec'
import { methodCodec } from './method-codec'

export class StatefulScriptCodec implements Codec<any> {
  parser = Parser.start().nest('methods', {
    type: new ArrayCodec(methodCodec).parser
  })

  static new(): StatefulScriptCodec {
    return new StatefulScriptCodec()
  }

  encode(input: any): Buffer {
    const script = [...compactUnsignedIntCodec.encode(input.methods.length)]
    for (const method of input.methods.value) {
      script.push(...methodCodec.encode(method))
    }

    return Buffer.from(script)
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }
}

export const statefulScriptCodec = StatefulScriptCodec.new()
