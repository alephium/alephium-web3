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
import { UnsignedTx as ApiUnsignedTx } from '../api/api-alephium'
import { binToHex, hexToBinUnsafe } from '../utils'
import { Script, scriptCodec, statefulScriptCodecOpt } from './script-codec'
import { Option } from './option-codec'
import { i32Codec, u256Codec } from './compact-int-codec'
import { Input, InputCodec, inputsCodec } from './input-codec'
import { AssetOutput, AssetOutputCodec, assetOutputsCodec } from './asset-output-codec'
import { blakeHash } from './hash'
import { byteCodec, ObjectCodec } from './codec'

export interface UnsignedTx {
  version: number
  networkId: number
  statefulScript: Option<Script>
  gasAmount: number
  gasPrice: bigint
  inputs: Input[]
  fixedOutputs: AssetOutput[]
}

export class UnsignedTxCodec extends ObjectCodec<UnsignedTx> {
  encodeApiUnsignedTx(input: ApiUnsignedTx): Uint8Array {
    const decoded = UnsignedTxCodec.fromApiUnsignedTx(input)
    return this.encode(decoded)
  }

  decodeApiUnsignedTx(input: Uint8Array): ApiUnsignedTx {
    const decoded = this.decode(input)
    return UnsignedTxCodec.toApiUnsignedTx(decoded)
  }

  static txId(unsignedTx: UnsignedTx): string {
    return binToHex(blakeHash(unsignedTxCodec.encode(unsignedTx)))
  }

  static toApiUnsignedTx(unsigned: UnsignedTx): ApiUnsignedTx {
    const txId = UnsignedTxCodec.txId(unsigned)
    const txIdBytes = hexToBinUnsafe(txId)
    const version = unsigned.version
    const networkId = unsigned.networkId
    const gasAmount = unsigned.gasAmount
    const gasPrice = unsigned.gasPrice.toString()
    const inputs = InputCodec.toAssetInputs(unsigned.inputs)
    const fixedOutputs = AssetOutputCodec.toFixedAssetOutputs(txIdBytes, unsigned.fixedOutputs)
    let scriptOpt: string | undefined = undefined
    if (unsigned.statefulScript.kind === 'Some') {
      scriptOpt = binToHex(scriptCodec.encode(unsigned.statefulScript.value))
    }

    return { txId, version, networkId, gasAmount, scriptOpt, gasPrice, inputs, fixedOutputs }
  }

  static fromApiUnsignedTx(unsignedTx: ApiUnsignedTx): UnsignedTx {
    const version = unsignedTx.version
    const networkId = unsignedTx.networkId
    const gasAmount = unsignedTx.gasAmount
    const gasPrice = BigInt(unsignedTx.gasPrice)
    const inputs = InputCodec.fromAssetInputs(unsignedTx.inputs)
    const fixedOutputs = AssetOutputCodec.fromFixedAssetOutputs(unsignedTx.fixedOutputs)
    const statefulScript: Option<Script> =
      unsignedTx.scriptOpt !== undefined
        ? { kind: 'Some', value: scriptCodec.decode(hexToBinUnsafe(unsignedTx.scriptOpt)) }
        : { kind: 'None', value: undefined }

    return { version, networkId, gasAmount, gasPrice, inputs, fixedOutputs, statefulScript }
  }
}

export const unsignedTxCodec = new UnsignedTxCodec({
  version: byteCodec,
  networkId: byteCodec,
  statefulScript: statefulScriptCodecOpt,
  gasAmount: i32Codec,
  gasPrice: u256Codec,
  inputs: inputsCodec,
  fixedOutputs: assetOutputsCodec
})
