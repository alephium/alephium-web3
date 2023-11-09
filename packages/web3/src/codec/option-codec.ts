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
import { Codec } from './codec'

export class OptionCodec implements Codec<any> {
  parser = Parser.start()

  constructor(private childCodec: Codec<any>) {
    this.parser = OptionCodec.optionParser(childCodec.parser)
  }

  encode(input: any): Buffer {
    const result = [input.option]
    if (input.option === 1) {
      result.push(...Array.from(this.childCodec.encode(input.value)))
    }
    return Buffer.from(result)
  }

  decode(input: Buffer): any {
    const result = this.parser.parse(input)
    return {
      ...result,
      value: result.option ? this.childCodec.decode(result.value.value) : result.value
    }
  }

  static optionParser(parser: Parser) {
    return new Parser().uint8('option').choice('value', {
      tag: 'option',
      choices: {
        0: new Parser(),
        1: parser
      }
    })
  }
}
