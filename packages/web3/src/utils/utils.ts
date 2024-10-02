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

import { ec as EC, SignatureInput } from 'elliptic'
import BN from 'bn.js'
import { TOTAL_NUMBER_OF_GROUPS, TOTAL_NUMBER_OF_CHAINS } from '../constants'

export const networkIds = ['mainnet', 'testnet', 'devnet'] as const
export type NetworkId = (typeof networkIds)[number]
export type HexString = string

const ec = new EC('secp256k1')

export function encodeSignature(signature: EC.Signature | { r: BN; s: BN }): string {
  let sNormalized = signature.s
  if (ec.n && signature.s.cmp(ec.nh) === 1) {
    sNormalized = ec.n.sub(signature.s)
  }

  const r = signature.r.toString('hex', 66).slice(2)
  const s = sNormalized.toString('hex', 66).slice(2)
  return r + s
}

export function encodeHexSignature(rHex: string, sHex: string): string {
  return encodeSignature({ r: new BN(rHex, 'hex'), s: new BN(sHex, 'hex') })
}

// the signature should be in hex string format for 64 bytes
export function signatureDecode(ec: EC, signature: string): SignatureInput {
  if (signature.length !== 128) {
    throw new Error('Invalid signature length')
  }

  const sHex = signature.slice(64, 128)
  const s = new BN(sHex, 'hex')
  if (ec.n && s.cmp(ec.nh) < 1) {
    const decoded = { r: signature.slice(0, 64), s: sHex }
    return decoded
  } else {
    throw new Error('The signature is not normalized')
  }
}

export function isHexString(input: string): boolean {
  return input.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(input)
}

export function toNonNegativeBigInt(input: string): bigint | undefined {
  try {
    const bigIntValue = BigInt(input)
    return bigIntValue < 0n ? undefined : bigIntValue
  } catch {
    return undefined
  }
}

export function hexToBinUnsafe(hex: string): Uint8Array {
  const bytes: number[] = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16))
  }
  return new Uint8Array(bytes)
}

export function binToHex(bin: Uint8Array): string {
  return Array.from(bin)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function blockChainIndex(blockHash: HexString): { fromGroup: number; toGroup: number } {
  if (blockHash.length != 64) {
    throw Error(`Invalid block hash: ${blockHash}`)
  }

  const rawIndex = Number('0x' + blockHash.slice(-4)) % TOTAL_NUMBER_OF_CHAINS
  return { fromGroup: Math.floor(rawIndex / TOTAL_NUMBER_OF_GROUPS), toGroup: rawIndex % TOTAL_NUMBER_OF_GROUPS }
}

export function stringToHex(str: string): string {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16)
  }
  return hex
}

export function hexToString(str: string): string {
  if (!isHexString(str)) {
    throw new Error(`Invalid hex string: ${str}`)
  }
  const bytes = hexToBinUnsafe(str)
  return new TextDecoder().decode(bytes)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isDevnet(networkId?: number): boolean {
  return networkId !== 0 && networkId !== 1
}

export function targetToDifficulty(compactedTarget: HexString): bigint {
  if (!isHexString(compactedTarget) || compactedTarget.length !== 8) {
    throw Error(`Invalid target ${compactedTarget}, expected a hex string of length 8`)
  }
  const size = hexToBinUnsafe(compactedTarget.slice(0, 2))[0]
  const mantissa = BigInt('0x' + compactedTarget.slice(2))
  const maxBigInt = 1n << 256n
  const target = size <= 3 ? mantissa >> BigInt(8 * (3 - size)) : mantissa << BigInt(8 * (size - 3))
  return maxBigInt / target
}

export function difficultyToTarget(diff: bigint): HexString {
  const maxBigInt = 1n << 256n
  const target = diff === 1n ? maxBigInt - 1n : maxBigInt / diff
  const size = Math.floor((target.toString(2).length + 7) / 8)
  const mantissa = Number(
    size <= 3
      ? BigInt.asIntN(32, target) << BigInt(8 * (3 - size))
      : BigInt.asIntN(32, target >> BigInt(8 * (size - 3)))
  )
  const mantissaBytes = new Uint8Array(4)
  mantissaBytes[0] = size
  mantissaBytes[1] = (mantissa >> 16) & 0xff
  mantissaBytes[2] = (mantissa >> 8) & 0xff
  mantissaBytes[3] = mantissa & 0xff
  return binToHex(mantissaBytes)
}

export function concatBytes(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const array of arrays) {
    result.set(array, offset)
    offset += array.length
  }
  return result
}

export function xorByte(intValue: number): number {
  const byte0 = (intValue >> 24) & 0xff
  const byte1 = (intValue >> 16) & 0xff
  const byte2 = (intValue >> 8) & 0xff
  const byte3 = intValue & 0xff
  return (byte0 ^ byte1 ^ byte2 ^ byte3) & 0xff
}

type _Eq<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false
export type Eq<X, Y> = _Eq<{ [P in keyof X]: X[P] }, { [P in keyof Y]: Y[P] }>
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function assertType<T extends true>(): void {}
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type Narrow<type> =
  | (unknown extends type ? unknown : never)
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (type extends Function ? type : never)
  | (type extends bigint | boolean | number | string ? type : never)
  | (type extends [] ? [] : never)
  | { [K in keyof type]: Narrow<type[K]> }
