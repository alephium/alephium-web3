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
import { UnsignedTx as ApiUnsignedTx } from '../api/api-alephium'
import { binToHex, hexToBinUnsafe } from '../utils'
import { DecodedScript, scriptCodec, statefulScriptCodecOpt } from './script-codec'
import { Option } from './option-codec'
import { DecodedCompactInt, compactSignedIntCodec, compactUnsignedIntCodec } from './compact-int-codec'
import { Input, InputCodec, inputsCodec } from './input-codec'
import { AssetOutput, AssetOutputCodec, assetOutputsCodec } from './asset-output-codec'
import { DecodedArray } from './array-codec'
import { blakeHash } from './hash'
import { Codec } from './codec'

export interface UnsignedTx {
  version: number
  networkId: number
  statefulScript: Option<DecodedScript>
  gasAmount: DecodedCompactInt
  gasPrice: DecodedCompactInt
  inputs: DecodedArray<Input>
  fixedOutputs: DecodedArray<AssetOutput>
}

export class UnsignedTxCodec implements Codec<UnsignedTx> {
  parser = new Parser()
    .uint8('version')
    .uint8('networkId')
    .nest('statefulScript', {
      type: statefulScriptCodecOpt.parser
    })
    .nest('gasAmount', {
      type: compactSignedIntCodec.parser
    })
    .nest('gasPrice', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('inputs', {
      type: inputsCodec.parser
    })
    .nest('fixedOutputs', {
      type: assetOutputsCodec.parser
    })

  encode(decodedUnsignedTx: UnsignedTx): Buffer {
    return Buffer.concat([
      Buffer.from([decodedUnsignedTx.version, decodedUnsignedTx.networkId]),
      statefulScriptCodecOpt.encode(decodedUnsignedTx.statefulScript),
      compactSignedIntCodec.encode(decodedUnsignedTx.gasAmount),
      compactUnsignedIntCodec.encode(decodedUnsignedTx.gasPrice),
      inputsCodec.encode(decodedUnsignedTx.inputs.value),
      assetOutputsCodec.encode(decodedUnsignedTx.fixedOutputs.value)
    ])
  }

  decode(input: Buffer): UnsignedTx {
    return this.parser.parse(input)
  }

  encodeApiUnsignedTx(input: ApiUnsignedTx): Buffer {
    const decoded = UnsignedTxCodec.fromApiUnsignedTx(input)
    return this.encode(decoded)
  }

  decodeApiUnsignedTx(input: Buffer): ApiUnsignedTx {
    const decoded = this.parser.parse(input)
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
    const gasAmount = compactSignedIntCodec.toI32(unsigned.gasAmount)
    const gasPrice = compactUnsignedIntCodec.toU256(unsigned.gasPrice).toString()
    const inputs = InputCodec.toAssetInputs(unsigned.inputs.value)
    const fixedOutputs = AssetOutputCodec.toFixedAssetOutputs(txIdBytes, unsigned.fixedOutputs.value)
    let scriptOpt: string | undefined = undefined
    if (unsigned.statefulScript.option === 1) {
      scriptOpt = scriptCodec.encode(unsigned.statefulScript.value!).toString('hex')
    }

    return { txId, version, networkId, gasAmount, scriptOpt, gasPrice, inputs, fixedOutputs }
  }

  static fromApiUnsignedTx(unsignedTx: ApiUnsignedTx): UnsignedTx {
    const version = unsignedTx.version
    const networkId = unsignedTx.networkId
    const gasAmount = compactSignedIntCodec.fromI32(unsignedTx.gasAmount)
    const gasPrice = compactUnsignedIntCodec.fromU256(BigInt(unsignedTx.gasPrice))
    const inputsValue = InputCodec.fromAssetInputs(unsignedTx.inputs)
    const inputs = inputsCodec.fromArray(inputsValue)
    const fixedOutputsValue = AssetOutputCodec.fromFixedAssetOutputs(unsignedTx.fixedOutputs)
    const fixedOutputs = assetOutputsCodec.fromArray(fixedOutputsValue)
    const statefulScript = statefulScriptCodecOpt.fromBuffer(
      unsignedTx.scriptOpt ? Buffer.from(unsignedTx.scriptOpt, 'hex') : undefined
    )

    return { version, networkId, gasAmount, gasPrice, inputs, fixedOutputs, statefulScript }
  }
}

export const unsignedTxCodec = new UnsignedTxCodec()
