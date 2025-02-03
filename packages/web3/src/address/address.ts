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
import bs58, { base58ToBytes } from '../utils/bs58'
import { binToHex, concatBytes, hexToBinUnsafe, isHexString, xorByte } from '../utils'
import { KeyType } from '../signer'
import { P2MPKH, lockupScriptCodec } from '../codec/lockup-script-codec'
import { i32Codec, intAs4BytesCodec } from '../codec'
import { LockupScript } from '../codec/lockup-script-codec'
import djb2 from '../utils/djb2'
import { TraceableError } from '../error'

const ec = new EC('secp256k1')
const PublicKeyHashSize = 32

export enum AddressType {
  P2PKH = 0x00,
  P2MPKH = 0x01,
  P2SH = 0x02,
  P2C = 0x03,
  P2PK = 0x04
}

export function validateAddress(address: string) {
  decodeAndValidateAddress(address)
}

export function isValidAddress(address: string): boolean {
  try {
    validateAddress(address)
    return true
  } catch {
    return false
  }
}

function decodeAndValidateAddress(address: string): Uint8Array {
  // TODO: Need to consider groupless address with @group
  const decoded = base58ToBytes(address)
  if (decoded.length === 0) throw new Error('Address is empty')
  const addressType = decoded[0]
  if (addressType === AddressType.P2MPKH) {
    let multisig: P2MPKH
    try {
      multisig = lockupScriptCodec.decode(decoded).value as P2MPKH
    } catch (error) {
      throw new TraceableError(`Invalid multisig address: ${address}`, error)
    }
    const n = multisig.publicKeyHashes.length
    const m = multisig.m
    if (n < m || m <= 0) {
      throw new Error(`Invalid multisig address, n: ${n}, m: ${m}`)
    }
    const encodedNSize = i32Codec.encode(n).length
    const encodedMSize = i32Codec.encode(m).length
    const size = encodedNSize + PublicKeyHashSize * n + encodedMSize + 1 // 1 for the P2MPKH prefix
    if (decoded.length === size) return decoded
  } else if (addressType === AddressType.P2PKH || addressType === AddressType.P2SH || addressType === AddressType.P2C) {
    // [type, ...hash]
    if (decoded.length === 33) return decoded
  } else if (addressType === AddressType.P2PK) {
    // [type, keyType, ...publicKey, ...checkSum]
    if (decoded.length === 39) {
      const publicKeyLikeBytes = decoded.slice(1, 35) // Include the keyType byte
      const checksum = binToHex(decoded.slice(35, 39))
      const expectedChecksum = binToHex(intAs4BytesCodec.encode(djb2(publicKeyLikeBytes)))
      if (checksum !== expectedChecksum) {
        throw new Error(`Invalid checksum for P2PK address: ${address}`)
      }
      return decoded
    }
  }

  throw new Error(`Invalid address: ${address}`)
}

export function isAssetAddress(address: string) {
  const addressType = decodeAndValidateAddress(address)[0]
  return addressType === AddressType.P2PKH || addressType === AddressType.P2MPKH || addressType === AddressType.P2SH || addressType === AddressType.P2PK
}

export function isGrouplessAddress(address: string) {
  const addressType = decodeAndValidateAddress(address)[0]
  return addressType === AddressType.P2PK
}

export function isContractAddress(address: string) {
  const addressType = decodeAndValidateAddress(address)[0]
  return addressType === AddressType.P2C
}

export function groupOfAddress(address: string): number {
  const decoded = decodeAndValidateAddress(address)
  const addressType = decoded[0]
  const addressBody = decoded.slice(1)

  if (addressType == AddressType.P2PKH) {
    return groupOfP2pkhAddress(addressBody)
  } else if (addressType == AddressType.P2MPKH) {
    return groupOfP2mpkhAddress(addressBody)
  } else if (addressType == AddressType.P2SH) {
    return groupOfP2shAddress(addressBody)
  } else if (addressType == AddressType.P2PK) {
    return groupOfP2pkAddress(addressBody)
  } else {
    // Contract Address
    const id = contractIdFromAddress(address)
    return id[`${id.length - 1}`]
  }
}

// Pay to public key hash address
function groupOfP2pkhAddress(address: Uint8Array): number {
  return groupFromBytes(address)
}

// Pay to multiple public key hash address
function groupOfP2mpkhAddress(address: Uint8Array): number {
  return groupFromBytes(address.slice(1, 33))
}

function groupOfP2pkAddress(address: Uint8Array): number {
  return groupFromBytes(address.slice(1, 34))
}

// Pay to script hash address
function groupOfP2shAddress(address: Uint8Array): number {
  return groupFromBytes(address)
}

export function contractIdFromAddress(address: string): Uint8Array {
  return idFromAddress(address)
}

export function tokenIdFromAddress(address: string): Uint8Array {
  return idFromAddress(address)
}

function idFromAddress(address: string): Uint8Array {
  const decoded = base58ToBytes(address)
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

  if (keyType === 'default' || keyType === 'groupless') {
    const key = ec.keyFromPrivate(privateKey)
    return key.getPublic(true, 'hex')
  } else {
    return ec.g.mul(new BN(privateKey, 16)).encode('hex', true).slice(2)
  }
}

export function addressFromPublicKey(publicKey: string, _keyType?: KeyType): string {
  const keyType = _keyType ?? 'default'

  if (keyType === 'default') {
    const hash = blake.blake2b(hexToBinUnsafe(publicKey), undefined, 32)
    const bytes = new Uint8Array([AddressType.P2PKH, ...hash])
    return bs58.encode(bytes)
  } else if (keyType === 'groupless') {
    const publicKeyBytes = new Uint8Array([0x00, ...hexToBinUnsafe(publicKey)])
    const hashBytes = intAs4BytesCodec.encode(djb2(publicKeyBytes))
    const bytes = new Uint8Array([0x04, ...publicKeyBytes, ...hashBytes])
    return bs58.encode(bytes)
  } else {
    const lockupScript = hexToBinUnsafe(`0101000000000458144020${publicKey}8685`)
    return addressFromScript(lockupScript)
  }
}

export function addressFromScript(script: Uint8Array): string {
  const scriptHash = blake.blake2b(script, undefined, 32)
  return bs58.encode(new Uint8Array([AddressType.P2SH, ...scriptHash]))
}

export function addressFromContractId(contractId: string): string {
  const hash = hexToBinUnsafe(contractId)
  const bytes = new Uint8Array([AddressType.P2C, ...hash])
  return bs58.encode(bytes)
}

export function addressFromTokenId(tokenId: string): string {
  const contractId = tokenId // contract ID is the same as token ID
  return addressFromContractId(contractId)
}

export function contractIdFromTx(txId: string, outputIndex: number): string {
  const txIdBin = hexToBinUnsafe(txId)
  const data = new Uint8Array([...txIdBin, outputIndex])
  const hash = blake.blake2b(data, undefined, 32)
  return binToHex(hash)
}

export function subContractId(parentContractId: string, pathInHex: string, group: number): string {
  if (group < 0 || group >= TOTAL_NUMBER_OF_GROUPS) {
    throw new Error(`Invalid group ${group}`)
  }
  if (!isHexString(parentContractId)) {
    throw new Error(`Invalid parent contract ID: ${parentContractId}, expected hex string`)
  }
  if (!isHexString(pathInHex)) {
    throw new Error(`Invalid path: ${pathInHex}, expected hex string`)
  }
  const data = concatBytes([hexToBinUnsafe(parentContractId), hexToBinUnsafe(pathInHex)])
  const bytes = new Uint8Array([
    ...blake.blake2b(blake.blake2b(data, undefined, 32), undefined, 32).slice(0, -1),
    group
  ])
  return binToHex(bytes)
}

export function groupOfLockupScript(lockupScript: LockupScript): number {
  if (lockupScript.kind === 'P2PKH') {
    return groupFromBytes(lockupScript.value)
  } else if (lockupScript.kind === 'P2MPKH') {
    return groupFromBytes(lockupScript.value.publicKeyHashes[0])
  } else if (lockupScript.kind === 'P2SH') {
    return groupFromBytes(lockupScript.value)
  } else if (lockupScript.kind === 'P2PK') {
    // FIXME: support @group for groupless address
    return groupFromBytes(lockupScript.value.publicKey)
  } else {
    // P2C
    const contractId = lockupScript.value
    return contractId[`${contractId.length - 1}`]
  }
}

export function groupFromBytes(bytes: Uint8Array): number {
  const hint = djb2(bytes) | 1
  const hash = xorByte(hint)
  return hash % TOTAL_NUMBER_OF_GROUPS
}
