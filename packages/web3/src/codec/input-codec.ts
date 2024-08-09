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
import { AssetInput } from '../api/api-alephium'
import { binToHex, hexToBinUnsafe } from '../utils'
import { UnlockScript, unlockScriptCodec } from './unlock-script-codec'
import { byte32Codec, ObjectCodec } from './codec'
import { ArrayCodec } from './array-codec'
import { intAs4BytesCodec } from './int-as-4bytes-codec'

export interface Input {
  hint: number
  key: Uint8Array
  unlockScript: UnlockScript
}

export class InputCodec extends ObjectCodec<Input> {
  static toAssetInputs(inputs: Input[]): AssetInput[] {
    return inputs.map((input) => {
      const hint = input.hint
      const key = binToHex(input.key)
      const unlockScript = unlockScriptCodec.encode(input.unlockScript)
      return {
        outputRef: { hint, key },
        unlockScript: binToHex(unlockScript)
      }
    })
  }

  static fromAssetInputs(inputs: AssetInput[]): Input[] {
    return inputs.map((input) => {
      const hint = input.outputRef.hint
      const key = hexToBinUnsafe(input.outputRef.key)
      const unlockScript = unlockScriptCodec.decode(hexToBinUnsafe(input.unlockScript))
      return { hint, key, unlockScript }
    })
  }
}

export const inputCodec = new InputCodec({
  hint: intAs4BytesCodec,
  key: byte32Codec,
  unlockScript: unlockScriptCodec
})
export const inputsCodec = new ArrayCodec(inputCodec)
