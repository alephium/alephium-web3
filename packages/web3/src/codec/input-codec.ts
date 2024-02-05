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
import { AssetInput } from '../api/api-alephium'
import { binToHex } from '../utils'
import { UnlockScript, unlockScriptCodec } from './unlock-script-codec'
import { Codec } from './codec'
import { signedIntCodec } from './signed-int-codec'
import { ArrayCodec } from './array-codec'

export interface Input {
  outputRef: {
    hint: number
    key: Buffer
  }
  unlockScript: UnlockScript
}

export class InputCodec implements Codec<Input> {
  parser = Parser.start()
    .nest('outputRef', {
      type: Parser.start().int32('hint').buffer('key', { length: 32 })
    })
    .nest('unlockScript', {
      type: unlockScriptCodec.parser
    })

  encode(input: Input): Buffer {
    return Buffer.concat([
      Buffer.from([...signedIntCodec.encode(input.outputRef.hint), ...input.outputRef.key]),
      unlockScriptCodec.encode(input.unlockScript)
    ])
  }

  decode(input: Buffer): Input {
    return this.parser.parse(input)
  }

  static toAssetInputs(inputs: Input[]): AssetInput[] {
    return inputs.map((input) => {
      const hint = input.outputRef.hint
      const key = binToHex(input.outputRef.key)
      const unlockScript = unlockScriptCodec.encode(input.unlockScript)
      return {
        outputRef: { hint, key },
        unlockScript: unlockScript.toString('hex')
      }
    })
  }

  static fromAssetInputs(inputs: AssetInput[]): Input[] {
    return inputs.map((input) => {
      const hint = input.outputRef.hint
      const key = Buffer.from(input.outputRef.key, 'hex')
      const unlockScript = unlockScriptCodec.decode(Buffer.from(input.unlockScript, 'hex'))
      return {
        outputRef: { hint, key },
        unlockScript
      }
    })
  }
}

export const inputCodec = new InputCodec()
export const inputsCodec = new ArrayCodec(inputCodec)
