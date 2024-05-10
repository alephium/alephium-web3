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
import { Buffer } from 'buffer/'

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
  return Buffer.from(hex, 'hex')
}

export function binToHex(bin: Uint8Array): string {
  return Buffer.from(bin).toString('hex')
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
  return Buffer.from(str, 'hex').toString()
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
  const mantissa =
    size <= 3
      ? BigInt.asIntN(32, target) << BigInt(8 * (3 - size))
      : BigInt.asIntN(32, target >> BigInt(8 * (size - 3)))
  const mantissaBytes = Buffer.alloc(4)
  mantissaBytes.writeInt32BE(Number(mantissa), 0)
  const bytes = new Uint8Array([size, ...mantissaBytes.slice(1)])
  return binToHex(bytes)
}

type _Eq<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false
export type Eq<X, Y> = _Eq<{ [P in keyof X]: X[P] }, { [P in keyof Y]: Y[P] }>
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function assertType<T extends true>(): void {}
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
