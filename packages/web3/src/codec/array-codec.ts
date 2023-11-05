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
import { compactIntCodec, DecodedInt } from './compact-int-codec'
import { Codec } from './codec'

export class ArrayCodec implements Codec<any> {
  parser = Parser.start()

  constructor(private childCodec: Codec<any>) {
    this.parser = ArrayCodec.arrayParser(childCodec.parser)
  }

  encode(input: any): Buffer {
    const result = [...compactIntCodec.encode(input.length)]
    for (const value of input.value) {
      result.push(...Array.from(this.childCodec.encode(value)))
    }
    return Buffer.from(result)
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }

  static arrayParser(parser: Parser) {
    return new Parser()
      .nest('length', {
        type: compactIntCodec.parser
      })
      .array('value', {
        length: function (ctx) {
          return compactIntCodec.toInt(this['length']! as any as DecodedInt)
        },
        type: parser
      })
  }
}
