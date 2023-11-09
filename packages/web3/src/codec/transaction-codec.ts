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
import { UnsignedTx } from '../api/api-alephium'
import { binToHex, hexToBinUnsafe } from '@alephium/web3'
import { statefulScriptCodec } from './script-codec'
import { compactUnsignedIntCodec } from './compact-int-codec'
import { InputCodec, inputCodec } from './input-codec'
import { OutputCodec, outputCodec } from './output-codec'
import { ArrayCodec } from './array-codec'
import { blakeHash } from './hash'
import { Codec } from './codec'
import { OptionCodec } from './option-codec'

const optionalStatefulScriptCodec = new OptionCodec(statefulScriptCodec)
const inputsCodec = new ArrayCodec(inputCodec)
const outputsCodec = new ArrayCodec(outputCodec)

export const unsignedTransactionParser = new Parser()
  .uint8('version')
  .uint8('networkId')
  .nest('statefulScript', {
    type: optionalStatefulScriptCodec.parser
  })
  .nest('gasAmount', {
    type: compactUnsignedIntCodec.parser
  })
  .nest('gasPrice', {
    type: compactUnsignedIntCodec.parser
  })
  .nest('inputs', {
    type: inputsCodec.parser
  })
  .nest('fixedOutputs', {
    type: outputsCodec.parser
  })

export class UnsignedTransactionCodec implements Codec<any> {
  parser = unsignedTransactionParser

  static new(): UnsignedTransactionCodec {
    return new UnsignedTransactionCodec()
  }

  encode(input: any): Buffer {
    return Buffer.concat([
      Buffer.from([input.version, input.networkId]),
      optionalStatefulScriptCodec.encode(input.statefulScript),
      compactUnsignedIntCodec.encode(input.gasAmount),
      compactUnsignedIntCodec.encode(input.gasPrice),
      inputsCodec.encode(input.inputs),
      outputsCodec.encode(input.fixedOutputs)
    ])
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }

  static parseToUnsignedTx(rawUnsignedTx: string): UnsignedTx {
    const parsedResult = unsignedTransactionParser.parse(Buffer.from(rawUnsignedTx, 'hex'))
    const txIdBytes = blakeHash(hexToBinUnsafe(rawUnsignedTx))
    const txId = binToHex(txIdBytes)
    const version = parsedResult.version
    const networkId = parsedResult.networkId
    const gasAmount = compactUnsignedIntCodec.toU32(parsedResult.gasAmount)
    const gasPrice = compactUnsignedIntCodec.toU256(parsedResult.gasPrice).toString()
    const inputs = InputCodec.convertToAssetInputs(parsedResult.inputs.value)
    const fixedOutputs = OutputCodec.convertToFixedAssetOutputs(txIdBytes, parsedResult.fixedOutputs.value)
    let scriptOpt: string | undefined = undefined
    if (parsedResult.statefulScript.option === 1) {
      scriptOpt = statefulScriptCodec.encode(parsedResult.statefulScript.value).toString('hex')
    }

    return { txId, version, networkId, gasAmount, scriptOpt, gasPrice, inputs, fixedOutputs }
  }
}
