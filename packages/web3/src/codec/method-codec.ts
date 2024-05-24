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
import { ArrayCodec, DecodedArray } from './array-codec'
import { DecodedCompactInt, compactUnsignedIntCodec } from './compact-int-codec'
import { Codec } from './codec'
import { instrsCodec, Instr } from './instr-codec'

export interface DecodedMethod {
  isPublic: number
  assetModifier: number
  argsLength: DecodedCompactInt
  localsLength: DecodedCompactInt
  returnLength: DecodedCompactInt
  instrs: DecodedArray<Instr>
}

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

export class MethodCodec implements Codec<DecodedMethod> {
  parser = Parser.start()
    .uint8('isPublic')
    .uint8('assetModifier')
    .nest('argsLength', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('localsLength', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('returnLength', {
      type: compactUnsignedIntCodec.parser
    })
    .nest('instrs', {
      type: instrsCodec.parser
    })

  encode(input: DecodedMethod): Buffer {
    const result = [input.isPublic, input.assetModifier]
    result.push(...compactUnsignedIntCodec.encode(input.argsLength))
    result.push(...compactUnsignedIntCodec.encode(input.localsLength))
    result.push(...compactUnsignedIntCodec.encode(input.returnLength))
    result.push(...instrsCodec.encode(input.instrs.value))
    return Buffer.from(result)
  }

  decode(input: Buffer): DecodedMethod {
    return this.parser.parse(input)
  }

  static toMethod(decodedMethod: DecodedMethod): Method {
    return {
      isPublic: decodedMethod.isPublic === 1,
      ...decodeAssetModifier(decodedMethod.assetModifier),
      argsLength: compactUnsignedIntCodec.toU32(decodedMethod.argsLength),
      localsLength: compactUnsignedIntCodec.toU32(decodedMethod.localsLength),
      returnLength: compactUnsignedIntCodec.toU32(decodedMethod.returnLength),
      instrs: decodedMethod.instrs.value
    }
  }

  static fromMethod(method: Method): DecodedMethod {
    return {
      isPublic: method.isPublic ? 1 : 0,
      assetModifier: encodeAssetModifier(method),
      argsLength: compactUnsignedIntCodec.fromU32(method.argsLength),
      localsLength: compactUnsignedIntCodec.fromU32(method.localsLength),
      returnLength: compactUnsignedIntCodec.fromU32(method.returnLength),
      instrs: instrsCodec.fromArray(method.instrs)
    }
  }
}

export const methodCodec = new MethodCodec()
export const methodsCodec = new ArrayCodec(methodCodec)
