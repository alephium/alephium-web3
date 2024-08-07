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
import { ArrayCodec } from './array-codec'
import { i32Codec } from './compact-int-codec'
import { boolCodec, byteCodec, Codec } from './codec'
import { instrsCodec, Instr } from './instr-codec'
import { Reader } from './reader'
import { concatBytes } from '../utils'

export interface Method {
  isPublic: boolean
  usePreapprovedAssets: boolean
  useContractAssets: boolean
  usePayToContractOnly: boolean
  argsLength: number
  localsLength: number
  returnLength: number
  instrs: Instr[]
}

function decodeAssetModifier(encoded: number): {
  usePreapprovedAssets: boolean
  useContractAssets: boolean
  usePayToContractOnly: boolean
} {
  const usePayToContractOnly = (encoded & 4) !== 0
  switch (encoded & 3) {
    case 0:
      return { usePayToContractOnly, usePreapprovedAssets: false, useContractAssets: false }
    case 1:
      return { usePayToContractOnly, usePreapprovedAssets: true, useContractAssets: true }
    case 2:
      return { usePayToContractOnly, usePreapprovedAssets: false, useContractAssets: true }
    case 3:
      return { usePayToContractOnly, usePreapprovedAssets: true, useContractAssets: false }
    default:
      throw new Error(`Invalid asset modifier: ${encoded}`)
  }
}

function encodeAssetModifier(arg: {
  usePreapprovedAssets: boolean
  useContractAssets: boolean
  usePayToContractOnly: boolean
}): number {
  const encoded =
    !arg.usePreapprovedAssets && !arg.useContractAssets
      ? 0
      : arg.usePreapprovedAssets && arg.useContractAssets
      ? 1
      : !arg.usePreapprovedAssets && arg.useContractAssets
      ? 2
      : 3
  return encoded | (arg.usePayToContractOnly ? 4 : 0)
}

export class MethodCodec extends Codec<Method> {
  encode(method: Method): Uint8Array {
    const bytes: Uint8Array[] = []
    bytes.push(boolCodec.encode(method.isPublic))
    bytes.push(new Uint8Array([encodeAssetModifier(method)]))
    bytes.push(i32Codec.encode(method.argsLength))
    bytes.push(i32Codec.encode(method.localsLength))
    bytes.push(i32Codec.encode(method.returnLength))
    bytes.push(instrsCodec.encode(method.instrs))
    return concatBytes(bytes)
  }

  _decode(input: Reader): Method {
    const isPublic = boolCodec._decode(input)
    const assetModifier = decodeAssetModifier(byteCodec._decode(input))
    const argsLength = i32Codec._decode(input)
    const localsLength = i32Codec._decode(input)
    const returnLength = i32Codec._decode(input)
    const instrs = instrsCodec._decode(input)
    return { ...assetModifier, isPublic, argsLength, localsLength, returnLength, instrs }
  }
}

export const methodCodec = new MethodCodec()
export const methodsCodec = new ArrayCodec(methodCodec)
