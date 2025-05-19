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

import { ec as EC, eddsa as EdDSA } from 'elliptic'
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
import { byteCodec } from '../codec/codec'

const secp256k1 = new EC('secp256k1')
const secp256r1 = new EC('p256')
const ed25519 = new EdDSA('ed25519')
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
  const decoded = addressToBytes(address)
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
  } else if (isGrouplessAddressWithGroup(decoded)) {
    // [type, keyType, ...publicKey, ...checkSum, ...groupByte]
    const publicKeyToIndex = decoded.length - 1 - 4
    const publicKeyLikeBytes = decoded.slice(1, publicKeyToIndex)
    const checksum = binToHex(decoded.slice(publicKeyToIndex, publicKeyToIndex + 4))
    const expectedChecksum = binToHex(intAs4BytesCodec.encode(djb2(publicKeyLikeBytes)))
    if (checksum !== expectedChecksum) {
      throw new Error(`Invalid checksum for P2PK address: ${address}`)
    }
    const group = byteCodec.decode(decoded.slice(decoded.length - 1, decoded.length))
    validateGroupIndex(group)

    return decoded
  }

  throw new Error(`Invalid address: ${address}`)
}

function isGrouplessAddressWithoutGroup(decoded: Uint8Array): boolean {
  // An ED25519 public key is 32 bytes; other public keys are 33 bytes.
  // Format: AddressType(1 byte) + KeyType(1 byte) + PublicKey(32/33 bytes) + Checksum(4 bytes)
  return decoded[0] === AddressType.P2PK && (decoded.length === 38 || decoded.length === 39)
}

function isGrouplessAddressWithGroup(decoded: Uint8Array): boolean {
  // An ED25519 public key is 32 bytes; other public keys are 33 bytes.
  // Format: AddressType(1 byte) + KeyType(1 byte) + PublicKey(32/33 bytes) + Checksum(4 bytes) + GroupIndex(1 byte)
  return decoded[0] === AddressType.P2PK && (decoded.length === 39 || decoded.length === 40)
}

export function addressToBytes(address: string): Uint8Array {
  if (hasExplicitGroupIndex(address)) {
    const groupIndex = parseGroupIndex(address[address.length - 1])
    const decoded = base58ToBytes(address.slice(0, address.length - 2))
    if (isGrouplessAddressWithoutGroup(decoded)) {
      const groupByte = byteCodec.encode(groupIndex)
      return new Uint8Array([...decoded, ...groupByte])
    }
    throw new Error(`Invalid groupless address: ${address}`)
  } else {
    const decoded = base58ToBytes(address)
    if (isGrouplessAddressWithoutGroup(decoded)) {
      const group = defaultGroupOfGrouplessAddress(decoded.slice(2, decoded.length - 4))
      const groupByte = byteCodec.encode(group)
      return new Uint8Array([...decoded, ...groupByte])
    }
    return decoded
  }
}

export function isAssetAddress(address: string) {
  const addressType = decodeAndValidateAddress(address)[0]
  return (
    addressType === AddressType.P2PKH ||
    addressType === AddressType.P2MPKH ||
    addressType === AddressType.P2SH ||
    addressType === AddressType.P2PK
  )
}

export function isGrouplessAddress(address: string) {
  const addressType = decodeAndValidateAddress(address)[0]
  return addressType === AddressType.P2PK
}

export function isGrouplessAddressWithoutGroupIndex(address: string) {
  return !hasExplicitGroupIndex(address) && isGrouplessAddress(address)
}

export function isGrouplessAddressWithGroupIndex(address: string) {
  return hasExplicitGroupIndex(address) && isGrouplessAddress(address)
}

export function defaultGroupOfGrouplessAddress(pubKey: Uint8Array): number {
  return pubKey[pubKey.length - 1] & 0xff % TOTAL_NUMBER_OF_GROUPS
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
  return byteCodec.decode(address.slice(38, 39)) % TOTAL_NUMBER_OF_GROUPS
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

  switch (keyType) {
    case 'default':
    case 'gl-secp256k1':
      return secp256k1.keyFromPrivate(privateKey).getPublic(true, 'hex')
    case 'gl-secp256r1':
    case 'gl-webauthn':
      return secp256r1.keyFromPrivate(privateKey).getPublic(true, 'hex')
    case 'gl-ed25519':
      return ed25519.keyFromSecret(privateKey).getPublic('hex')
    case 'bip340-schnorr':
      return secp256k1.g.mul(new BN(privateKey, 16)).encode('hex', true).slice(2)
  }
}

function p2pkAddressFromPublicKey(
  publicKey: string,
  keyType: 'gl-secp256k1' | 'gl-secp256r1' | 'gl-ed25519' | 'gl-webauthn'
): string {
  const keyTypeByte =
    keyType === 'gl-secp256k1' ? 0x00 : keyType === 'gl-secp256r1' ? 0x01 : keyType === 'gl-ed25519' ? 0x02 : 0x03
  const publicKeyBytes = new Uint8Array([keyTypeByte, ...hexToBinUnsafe(publicKey)])
  const checksum = intAs4BytesCodec.encode(djb2(publicKeyBytes))
  const bytes = new Uint8Array([AddressType.P2PK, ...publicKeyBytes, ...checksum])
  return bs58.encode(bytes)
}

export function addressFromPublicKey(publicKey: string, _keyType?: KeyType): string {
  const keyType = _keyType ?? 'default'

  switch (keyType) {
    case 'default': {
      const hash = blake.blake2b(hexToBinUnsafe(publicKey), undefined, 32)
      const bytes = new Uint8Array([AddressType.P2PKH, ...hash])
      return bs58.encode(bytes)
    }
    case 'bip340-schnorr': {
      const lockupScript = hexToBinUnsafe(`0101000000000458144020${publicKey}8685`)
      return addressFromScript(lockupScript)
    }
    default:
      return p2pkAddressFromPublicKey(publicKey, keyType)
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
    return lockupScript.value.group % TOTAL_NUMBER_OF_GROUPS
  } else {
    // P2C
    const contractId = lockupScript.value
    return contractId[`${contractId.length - 1}`]
  }
}

export function groupFromBytes(bytes: Uint8Array): number {
  const hint = djb2(bytes) | 1
  return groupFromHint(hint)
}

export function groupFromHint(hint: number): number {
  const hash = xorByte(hint)
  return hash % TOTAL_NUMBER_OF_GROUPS
}

export function hasExplicitGroupIndex(address: string): boolean {
  return address.length > 2 && address[address.length - 2] === ':'
}

export function addressWithoutExplicitGroupIndex(address: string): string {
  if (hasExplicitGroupIndex(address)) {
    return address.slice(0, address.length - 2)
  }
  return address
}

export function addressFromLockupScript(lockupScript: LockupScript): string {
  if (lockupScript.kind === 'P2PK') {
    const groupByte = lockupScriptCodec.encode(lockupScript).slice(-1)
    const address = bs58.encode(lockupScriptCodec.encode(lockupScript).slice(0, -1))
    return `${address}:${groupByte}`
  } else {
    return bs58.encode(lockupScriptCodec.encode(lockupScript))
  }
}

function parseGroupIndex(groupIndexStr: string): number {
  return validateGroupIndex(parseInt(groupIndexStr), groupIndexStr)
}

function validateGroupIndex(groupIndex: number, groupIndexStr?: string): number {
  if (isNaN(groupIndex) || groupIndex < 0 || groupIndex >= TOTAL_NUMBER_OF_GROUPS) {
    throw new Error(`Invalid group index: ${groupIndexStr ?? groupIndex}`)
  }

  return groupIndex
}
