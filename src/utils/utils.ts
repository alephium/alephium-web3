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
import blake from 'blakejs'
import bs58 from './bs58'
import { Buffer } from 'buffer/'

import { TOTAL_NUMBER_OF_GROUPS } from '../constants'
import djb2 from './djb2'
import * as node from '../api/api-alephium'
import * as explorer from '../api/api-explorer'

const ec = new EC('secp256k1')

export function convertHttpResponse<T>(
  response: node.HttpResponse<T, { detail: string }> | explorer.HttpResponse<T, { detail: string }>
): T {
  if (response.error) {
    throw new Error(response.error.detail)
  } else {
    return response.data
  }
}

export function signatureEncode(signature: EC.Signature): string {
  let sNormalized = signature.s
  if (ec.n && signature.s.cmp(ec.nh) === 1) {
    sNormalized = ec.n.sub(signature.s)
  }

  const r = signature.r.toString('hex', 66).slice(2)
  const s = sNormalized.toString('hex', 66).slice(2)
  return r + s
}

// the signature should be in hex string format for 64 bytes
export const signatureDecode = (ec: EC, signature: string): SignatureInput => {
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

const xorByte = (intValue: number) => {
  const byte0 = (intValue >> 24) & 0xff
  const byte1 = (intValue >> 16) & 0xff
  const byte2 = (intValue >> 8) & 0xff
  const byte3 = intValue & 0xff
  return (byte0 ^ byte1 ^ byte2 ^ byte3) & 0xff
}

export function isHexString(input: string): boolean {
  return input.length % 2 === 0 && /[0-9a-f]*$/.test(input)
}

enum AddressType {
  P2PKH = 0x00,
  P2MPKH = 0x01,
  P2SH = 0x02,
  P2C = 0x03
}

export const groupOfAddress = (address: string): number => {
  const decoded = bs58.decode(address)

  if (decoded.length == 0) throw new Error('Address string is empty')
  const addressType = decoded[0]
  const addressBody = decoded.slice(1)

  if (addressType == AddressType.P2PKH) {
    return groupOfP2pkhAddress(addressBody)
  } else if (addressType == AddressType.P2MPKH) {
    return groupOfP2mpkhAddress(addressBody)
  } else if (addressType == AddressType.P2SH) {
    return groupOfP2shAddress(addressBody)
  } else {
    throw new Error(`Invalid asset address type: ${addressType}`)
  }
}

const groupOfAddressBytes = (bytes: Uint8Array): number => {
  const hint = djb2(bytes) | 1
  const hash = xorByte(hint)
  const group = hash % TOTAL_NUMBER_OF_GROUPS
  return group
}

// Pay to public key hash address
const groupOfP2pkhAddress = (address: Uint8Array): number => {
  if (address.length != 32) {
    throw new Error(`Invalid p2pkh address length: ${address.length}`)
  }

  return groupOfAddressBytes(address)
}

// Pay to multiple public key hash address
const groupOfP2mpkhAddress = (address: Uint8Array): number => {
  if ((address.length - 2) % 32 != 0) {
    throw new Error(`Invalid p2mpkh address length: ${address.length}`)
  }

  return groupOfAddressBytes(address.slice(1, 33))
}

// Pay to script hash address
const groupOfP2shAddress = (address: Uint8Array): number => {
  return groupOfAddressBytes(address)
}

export function contractIdFromAddress(address: string): Uint8Array {
  return idFromAddress(address)
}

export function tokenIdFromAddress(address: string): Uint8Array {
  return idFromAddress(address)
}

function idFromAddress(address: string): Uint8Array {
  const decoded = bs58.decode(address)

  if (decoded.length == 0) throw new Error('Address string is empty')
  const addressType = decoded[0]
  const addressBody = decoded.slice(1)

  if (addressType == AddressType.P2C) {
    return addressBody
  } else {
    throw new Error(`Invalid contract address type: ${addressType}`)
  }
}

export function hexToBinUnsafe(hex: string): Uint8Array {
  return Buffer.from(hex, 'hex')
}

export function binToHex(bin: Uint8Array): string {
  return Buffer.from(bin).toString('hex')
}

export function publicKeyFromPrivateKey(privateKey: string): string {
  const key = ec.keyFromPrivate(privateKey)
  return key.getPublic(true, 'hex')
}

export function addressFromPublicKey(publicKey: string): string {
  const addressType = Buffer.from([AddressType.P2PKH])
  const hash = Buffer.from(blake.blake2b(Buffer.from(publicKey, 'hex'), undefined, 32))
  const bytes = Buffer.concat([addressType, hash])
  return bs58.encode(bytes)
}

export function addressFromContractId(contractId: string): string {
  const addressType = Buffer.from([AddressType.P2C])
  const hash = Buffer.from(hexToBinUnsafe(contractId))
  const bytes = Buffer.concat([addressType, hash])
  return bs58.encode(bytes)
}

export function contractIdFromTx(txId: string, outputIndex: number): string {
  const txIdBin = hexToBinUnsafe(txId)
  const data = Buffer.concat([txIdBin, Buffer.from([outputIndex])])
  const hash = blake.blake2b(data, undefined, 32)
  return binToHex(hash)
}

export function subContractId(parentContractId: string, pathInHex: string): string {
  const data = Buffer.concat([hexToBinUnsafe(pathInHex), hexToBinUnsafe(parentContractId)])

  return binToHex(blake.blake2b(blake.blake2b(data, undefined, 32), undefined, 32))
}

export function stringToHex(str: string): string {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16)
  }
  return hex
}

type _Eq<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false
export type Eq<X, Y> = _Eq<{ [P in keyof X]: X[P] }, { [P in keyof Y]: Y[P] }>
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function assertType<T extends true>(): void {}
