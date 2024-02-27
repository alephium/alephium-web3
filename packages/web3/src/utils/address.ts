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

import { ec as EC } from 'elliptic'
import BN from 'bn.js'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'
import blake from 'blakejs'
import bs58 from './bs58'
import djb2 from './djb2'
import { binToHex, hexToBinUnsafe } from './utils'
import { KeyType } from '../signer'

const ec = new EC('secp256k1')

export enum AddressType {
  P2PKH = 0x00,
  P2MPKH = 0x01,
  P2SH = 0x02,
  P2C = 0x03
}

export function validateAddress(address: string) {
  let decoded: Uint8Array
  try {
    decoded = bs58.decode(address)
  } catch (_) {
    throw new Error('Invalid base58 string')
  }

  if (decoded.length === 0) throw new Error('Address is empty')
  const addressType = decoded[0]
  if (addressType === AddressType.P2MPKH) {
    // [1, n, ...hashes, m]
    if ((decoded.length - 3) % 32 === 0) return
  } else if (addressType === AddressType.P2PKH || addressType === AddressType.P2SH || addressType === AddressType.P2C) {
    // [type, ...hash]
    if (decoded.length === 33) return
  }

  throw new Error(`Invalid address: ${address}`)
}

export function groupOfAddress(address: string): number {
  validateAddress(address)

  const decoded = bs58.decode(address)
  const addressType = decoded[0]
  const addressBody = decoded.slice(1)

  if (addressType == AddressType.P2PKH) {
    return groupOfP2pkhAddress(addressBody)
  } else if (addressType == AddressType.P2MPKH) {
    return groupOfP2mpkhAddress(addressBody)
  } else if (addressType == AddressType.P2SH) {
    return groupOfP2shAddress(addressBody)
  } else {
    // Contract Address
    const id = contractIdFromAddress(address)
    return id[`${id.length - 1}`]
  }
}

function groupOfAddressBytes(bytes: Uint8Array): number {
  const hint = djb2(bytes) | 1
  const hash = xorByte(hint)
  const group = hash % TOTAL_NUMBER_OF_GROUPS
  return group
}

// Pay to public key hash address
function groupOfP2pkhAddress(address: Uint8Array): number {
  return groupOfAddressBytes(address)
}

// Pay to multiple public key hash address
function groupOfP2mpkhAddress(address: Uint8Array): number {
  return groupOfAddressBytes(address.slice(1, 33))
}

// Pay to script hash address
function groupOfP2shAddress(address: Uint8Array): number {
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

export function groupOfPrivateKey(privateKey: string, keyType?: KeyType): number {
  return groupOfAddress(addressFromPublicKey(publicKeyFromPrivateKey(privateKey, keyType), keyType))
}

export function publicKeyFromPrivateKey(privateKey: string, _keyType?: KeyType): string {
  const keyType = _keyType ?? 'default'

  if (keyType === 'default') {
    const key = ec.keyFromPrivate(privateKey)
    return key.getPublic(true, 'hex')
  } else {
    return ec.g.mul(new BN(privateKey, 16)).encode('hex', true).slice(2)
  }
}

export function addressFromPublicKey(publicKey: string, _keyType?: KeyType): string {
  const keyType = _keyType ?? 'default'

  if (keyType === 'default') {
    const addressType = Buffer.from([AddressType.P2PKH])
    const hash = Buffer.from(blake.blake2b(Buffer.from(publicKey, 'hex'), undefined, 32))
    const bytes = Buffer.concat([addressType, hash])
    return bs58.encode(bytes)
  } else {
    const lockupScript = Buffer.from(`0101000000000458144020${publicKey}8685`, 'hex')
    return addressFromScript(lockupScript)
  }
}

export function addressFromScript(script: Uint8Array): string {
  const scriptHash = blake.blake2b(script, undefined, 32)
  const addressType = Buffer.from([AddressType.P2SH])
  return bs58.encode(Buffer.concat([addressType, scriptHash]))
}

export function addressFromContractId(contractId: string): string {
  const addressType = Buffer.from([AddressType.P2C])
  const hash = Buffer.from(hexToBinUnsafe(contractId))
  const bytes = Buffer.concat([addressType, hash])
  return bs58.encode(bytes)
}

export function addressFromTokenId(tokenId: string): string {
  const contractId = tokenId // contract ID is the same as token ID
  return addressFromContractId(contractId)
}

export function contractIdFromTx(txId: string, outputIndex: number): string {
  const txIdBin = hexToBinUnsafe(txId)
  const data = Buffer.concat([txIdBin, Buffer.from([outputIndex])])
  const hash = blake.blake2b(data, undefined, 32)
  return binToHex(hash)
}

export function subContractId(parentContractId: string, pathInHex: string, group: number): string {
  if (group < 0 || group >= TOTAL_NUMBER_OF_GROUPS) {
    throw new Error(`Invalid group ${group}`)
  }
  const data = Buffer.concat([hexToBinUnsafe(parentContractId), hexToBinUnsafe(pathInHex)])
  const bytes = Buffer.concat([
    blake.blake2b(blake.blake2b(data, undefined, 32), undefined, 32).slice(0, -1),
    Buffer.from([group])
  ])
  return binToHex(bytes)
}

export function xorByte(intValue: number): number {
  const byte0 = (intValue >> 24) & 0xff
  const byte1 = (intValue >> 16) & 0xff
  const byte2 = (intValue >> 8) & 0xff
  const byte3 = intValue & 0xff
  return (byte0 ^ byte1 ^ byte2 ^ byte3) & 0xff
}
