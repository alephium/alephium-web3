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

import { ZERO_ADDRESS } from '../constants'
import { isDebugModeEnabled } from '../debug'
import { assertType, bs58, Eq, isBase58, isHexString } from '../utils'
import * as node from './api-alephium'

export type Number256 = bigint | string
export type Val = Number256 | boolean | string | Val[]
export type NamedVals = Record<string, Val>

export interface Token {
  id: string
  amount: Number256
}
assertType<Eq<keyof Token, keyof node.Token>>

export function toApiToken(token: Token): node.Token {
  return { id: token.id, amount: toApiNumber256(token.amount) }
}

export function toApiTokens(tokens?: Token[]): node.Token[] | undefined {
  return tokens?.map(toApiToken)
}

export function fromApiToken(token: node.Token): Token {
  return { id: token.id, amount: fromApiNumber256(token.amount) }
}

export function fromApiTokens(tokens?: node.Token[]): Token[] | undefined {
  return tokens?.map(fromApiToken)
}

export function toApiBoolean(v: Val): boolean {
  if (typeof v === 'boolean') {
    return v
  } else {
    throw new Error(`Invalid boolean value: ${v}`)
  }
}

// TODO: check integer bounds
export function toApiNumber256(v: Val): string {
  if ((typeof v === 'number' && Number.isInteger(v)) || typeof v === 'bigint') {
    return v.toString()
  } else if (typeof v === 'string') {
    try {
      if (BigInt(v).toString() === v) {
        return v
      }
    } catch (_) {
      throw new Error(`Invalid value: ${v}, expected a 256 bit number`)
    }
  }
  throw new Error(`Invalid value: ${v}, expected a 256 bit number`)
}

export function toApiNumber256Optional(v?: Val): string | undefined {
  return v === undefined ? undefined : toApiNumber256(v)
}

export function fromApiNumber256(n: string): bigint {
  return BigInt(n)
}

export function toApiByteVec(v: Val): string {
  if (typeof v !== 'string') {
    throw new Error(`Invalid value: ${v}, expected a hex-string`)
  }
  if (isHexString(v)) return v
  if (isBase58(v)) {
    // try to convert from address to contract id
    try {
      const address = bs58.decode(v)
      if (address.length == 33 && address[0] == 3) {
        return Buffer.from(address.slice(1)).toString('hex')
      }
    } catch (_) {
      throw new Error(`Invalid hex-string: ${v}`)
    }
  }
  throw new Error(`Invalid hex-string: ${v}`)
}

export function toApiAddress(v: Val): string {
  if (typeof v === 'string') {
    try {
      bs58.decode(v)
      return v as string
    } catch (error) {
      throw new Error(`Invalid base58 string: ${v}`)
    }
  } else {
    throw new Error(`Invalid value: ${v}, expected a base58 string`)
  }
}

export function toApiArray(tpe: string, v: Val): node.Val {
  if (!Array.isArray(v)) {
    throw new Error(`Expected array, got ${v}`)
  }

  const semiColonIndex = tpe.lastIndexOf(';')
  if (semiColonIndex == -1) {
    throw new Error(`Invalid Val type: ${tpe}`)
  }

  const subType = tpe.slice(1, semiColonIndex)
  const dim = parseInt(tpe.slice(semiColonIndex + 1, -1))
  if ((v as Val[]).length != dim) {
    throw new Error(`Invalid val dimension: ${v}`)
  } else {
    return { value: (v as Val[]).map((v) => toApiVal(v, subType)), type: 'Array' }
  }
}

export function toApiVal(v: Val, tpe: string): node.Val {
  if (tpe === 'Bool') {
    return { value: toApiBoolean(v), type: tpe }
  } else if (tpe === 'U256' || tpe === 'I256') {
    return { value: toApiNumber256(v), type: tpe }
  } else if (tpe === 'ByteVec') {
    return { value: toApiByteVec(v), type: tpe }
  } else if (tpe === 'Address') {
    return { value: toApiAddress(v), type: tpe }
  } else {
    return toApiArray(tpe, v)
  }
}

function _fromApiVal(
  vals: node.Val[],
  valIndex: number,
  tpe: string,
  systemEvent = false
): [result: Val, nextIndex: number] {
  if (vals.length === 0) {
    throw new Error('Not enough Vals')
  }

  const firstVal = vals[`${valIndex}`]
  if (tpe === 'Bool' && firstVal.type === tpe) {
    return [firstVal.value as boolean, valIndex + 1]
  } else if ((tpe === 'U256' || tpe === 'I256') && firstVal.type === tpe) {
    return [fromApiNumber256(firstVal.value as string), valIndex + 1]
  } else if ((tpe === 'ByteVec' || tpe === 'Address') && (firstVal.type === tpe || systemEvent)) {
    return [firstVal.value as string, valIndex + 1]
  } else {
    const [baseType, dims] = decodeArrayType(tpe)
    const arraySize = dims.reduce((a, b) => a * b)
    const nextIndex = valIndex + arraySize
    const valsToUse = vals.slice(valIndex, nextIndex)
    if (valsToUse.length == arraySize && valsToUse.every((val) => val.type === baseType)) {
      const localVals = valsToUse.map((val) => fromApiVal(val, baseType))
      return [foldVals(localVals, dims), nextIndex]
    } else {
      throw new Error(`Invalid array Val type: ${valsToUse}, ${tpe}`)
    }
  }
}

export function fromApiVals(vals: node.Val[], names: string[], types: string[], systemEvent = false): NamedVals {
  let valIndex = 0
  const result: NamedVals = {}
  types.forEach((currentType, index) => {
    const currentName = names[`${index}`]
    const [val, nextIndex] = _fromApiVal(vals, valIndex, currentType, systemEvent)
    valIndex = nextIndex
    result[`${currentName}`] = val
  })
  return result
}

export function fromApiArray(vals: node.Val[], types: string[]): Val[] {
  let valIndex = 0
  const result: Val[] = []
  for (const currentType of types) {
    const [val, nextIndex] = _fromApiVal(vals, valIndex, currentType)
    result.push(val)
    valIndex = nextIndex
  }
  return result
}

export function fromApiVal(v: node.Val, tpe: string): Val {
  if (v.type === 'Bool' && v.type === tpe) {
    return v.value as boolean
  } else if ((v.type === 'U256' || v.type === 'I256') && v.type === tpe) {
    return fromApiNumber256(v.value as string)
  } else if ((v.type === 'ByteVec' || v.type === 'Address') && v.type === tpe) {
    return v.value as string
  } else {
    throw new Error(`Invalid node.Val type: ${v}`)
  }
}

function decodeArrayType(tpe: string): [baseType: string, dims: number[]] {
  const semiColonIndex = tpe.lastIndexOf(';')
  if (semiColonIndex === -1) {
    throw new Error(`Invalid Val type: ${tpe}`)
  }

  const subType = tpe.slice(1, semiColonIndex)
  const dim = parseInt(tpe.slice(semiColonIndex + 1, -1))
  if (subType[0] == '[') {
    const [baseType, subDim] = decodeArrayType(subType)
    return [baseType, (subDim.unshift(dim), subDim)]
  } else {
    return [subType, [dim]]
  }
}

export function getDefaultValue(tpe: string): Val {
  if (tpe === 'U256' || tpe === 'I256') return 0n
  if (tpe === 'Bool') return false
  if (tpe === 'ByteVec') return ''
  if (tpe === 'Address') return ZERO_ADDRESS

  // array type
  const [baseType, dims] = decodeArrayType(tpe)
  const defaultBaseValue = getDefaultValue(baseType)
  return dims.reduceRight((acc, length) => Array(length).fill(acc), defaultBaseValue)
}

function foldVals(vals: Val[], dims: number[]): Val {
  if (dims.length == 1) {
    return vals
  } else {
    const result: Val[] = []
    const chunkSize = vals.length / dims[0]
    const chunkDims = dims.slice(1)
    for (let i = 0; i < vals.length; i += chunkSize) {
      const chunk = vals.slice(i, i + chunkSize)
      result.push(foldVals(chunk, chunkDims))
    }
    return result
  }
}

export function typeLength(tpe: string): number {
  if (tpe === 'U256' || tpe === 'I256' || tpe === 'Bool' || tpe === 'ByteVec' || tpe === 'Address') {
    return 1
  }
  const [, dims] = decodeArrayType(tpe)
  return dims.reduce((a, b) => a * b)
}

export interface ApiRequestArguments {
  path: string
  method: string
  params: any[]
}
export type ApiRequestHandler = (args: ApiRequestArguments) => Promise<any>

async function call(args: ApiRequestArguments, handler: ApiRequestHandler): Promise<any> {
  const debugModeEnabled = isDebugModeEnabled()
  const { path, method, params } = args
  if (debugModeEnabled) {
    console.log(`[REQUEST] ${path} ${method} ${JSON.stringify(params)}`)
  }
  try {
    const response = await handler(args)
    if (debugModeEnabled) {
      console.log(`[RESPONSE] ${path} ${method} ${JSON.stringify(response)}`)
    }
    return response
  } catch (error) {
    if (debugModeEnabled) {
      console.error(`[ERROR] ${path} ${method} `, error)
    }
    throw error
  }
}

export function forwardRequests(api: Record<string, any>, handler: ApiRequestHandler): void {
  // Update class properties to forward requests
  for (const [path, pathObject] of Object.entries(api)) {
    for (const method of Object.keys(pathObject)) {
      pathObject[`${method}`] = async (...params: any): Promise<any> => {
        return call({ path, method, params }, handler)
      }
    }
  }
}

export function requestWithLog(api: Record<string, any>) {
  for (const [path, pathObject] of Object.entries(api)) {
    for (const [method, handler] of Object.entries(pathObject)) {
      pathObject[`${method}`] = async (...params: any): Promise<any> => {
        return call({ path, method, params }, () => (handler as (...any) => Promise<any>)(...params))
      }
    }
  }
}

export async function request(provider: Record<string, any>, args: ApiRequestArguments): Promise<any> {
  const call = provider[`${args.path}`][`${args.method}`] as (...any) => Promise<any>
  return call(...args.params)
}

export enum StdInterfaceIds {
  FungibleToken = '0001',
  NFTCollection = '0002',
  NFT = '0003',
  NFTCollectionWithRoyalty = '000201'
}

export interface FungibleTokenMetaData {
  symbol: string
  name: string
  decimals: number
  totalSupply: Number256
}

export interface NFTMetaData {
  tokenUri: string
  collectionId: string
  nftIndex: Number256
}

export interface NFTCollectionMetaData {
  collectionUri: string
  totalSupply: Number256
}

export interface NFTTokenUriMetaData {
  name: string
  description?: string
  image: string
  attributes?: {
    trait_type: string
    value: string | number | boolean
  }[]
}

export interface NFTCollectionUriMetaData {
  name: string
  description: string
  image: string
}
