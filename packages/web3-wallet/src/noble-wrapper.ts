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

/*
 * This file is copied from: https://github.com/BitGo/BitGoJS/blob/bitcoinjs_lib_6_sync/modules/utxo-lib/src/noble_ecc.ts
 */

import * as necc from '@noble/secp256k1'
import { BIP32API, BIP32Factory, BIP32Interface } from 'bip32'
import { createHash, createHmac } from 'crypto'

necc.utils.sha256Sync = (...messages: Uint8Array[]): Uint8Array => {
  const sha256 = createHash('sha256')
  for (const message of messages) sha256.update(message)
  return sha256.digest()
}

necc.utils.hmacSha256Sync = (key: Uint8Array, ...messages: Uint8Array[]): Uint8Array => {
  const hash = createHmac('sha256', key)
  messages.forEach((m) => hash.update(m))
  return Uint8Array.from(hash.digest())
}

const normalizePrivateKey = necc.utils._normalizePrivateKey

const defaultTrue = (param?: boolean): boolean => param !== false

function throwToNull<Type>(fn: () => Type): Type | null {
  try {
    return fn()
  } catch (e) {
    return null
  }
}

function isPoint(p: Uint8Array, xOnly: boolean): boolean {
  if ((p.length === 32) !== xOnly) return false
  try {
    return !!necc.Point.fromHex(p)
  } catch (e) {
    return false
  }
}

function hexToNumber(hex) {
  if (typeof hex !== 'string') {
    throw new TypeError('hexToNumber: expected string, got ' + typeof hex)
  }
  return BigInt(`0x${hex}`)
}

function bytesToNumber(bytes) {
  return hexToNumber(necc.utils.bytesToHex(bytes))
}

function normalizeScalar(scalar) {
  let num
  if (typeof scalar === 'bigint') {
    num = scalar
  } else if (typeof scalar === 'number' && Number.isSafeInteger(scalar) && scalar >= 0) {
    num = BigInt(scalar)
  } else if (typeof scalar === 'string') {
    if (scalar.length !== 64) throw new Error('Expected 32 bytes of private scalar')
    num = hexToNumber(scalar)
  } else if (scalar instanceof Uint8Array) {
    if (scalar.length !== 32) throw new Error('Expected 32 bytes of private scalar')
    num = bytesToNumber(scalar)
  } else {
    throw new TypeError('Expected valid private scalar')
  }
  if (num < 0) throw new Error('Expected private scalar >= 0')
  return num
}

function pointAddScalar(p, tweak, isCompressed) {
  const P = necc.Point.fromHex(p)
  const t = normalizeScalar(tweak)
  const Q = necc.Point.BASE.multiplyAndAddUnsafe(P, t, BigInt(1))
  if (!Q) throw new Error('Tweaked point at infinity')
  return Q.toRawBytes(isCompressed)
}

function pointMultiply(p, tweak, isCompressed) {
  const P = necc.Point.fromHex(p)
  const h = typeof tweak === 'string' ? tweak : necc.utils.bytesToHex(tweak)
  const t = BigInt(`0x${h}`)
  return P.multiply(t).toRawBytes(isCompressed)
}

function privateAdd(privateKey, tweak) {
  const p = normalizePrivateKey(privateKey)
  const t = normalizeScalar(tweak)
  const add = necc.utils._bigintTo32Bytes(necc.utils.mod(p + t, necc.CURVE.n))
  if (necc.utils.isValidPrivateKey(add)) return add
  else return null
}

function privateNegate(privateKey) {
  const p = normalizePrivateKey(privateKey)
  const not = necc.utils._bigintTo32Bytes(necc.CURVE.n - p)
  if (necc.utils.isValidPrivateKey(not)) return not
  else return null
}

const ecc = {
  isPoint: (p: Uint8Array): boolean => isPoint(p, false),
  isPrivate: (d: Uint8Array): boolean => necc.utils.isValidPrivateKey(d),
  isXOnlyPoint: (p: Uint8Array): boolean => isPoint(p, true),

  xOnlyPointAddTweak: (p: Uint8Array, tweak: Uint8Array): { parity: 0 | 1; xOnlyPubkey: Uint8Array } | null =>
    throwToNull(() => {
      const P = pointAddScalar(p, tweak, true)
      const parity = P[0] % 2 === 1 ? 1 : 0
      return { parity, xOnlyPubkey: P.slice(1) }
    }),

  pointFromScalar: (sk: Uint8Array, compressed?: boolean): Uint8Array | null =>
    throwToNull(() => necc.getPublicKey(sk, defaultTrue(compressed))),

  pointCompress: (p: Uint8Array, compressed?: boolean): Uint8Array => {
    return necc.Point.fromHex(p).toRawBytes(defaultTrue(compressed))
  },

  pointMultiply: (a: Uint8Array, tweak: Uint8Array, compressed?: boolean): Uint8Array | null =>
    throwToNull(() => pointMultiply(a, tweak, defaultTrue(compressed))),

  pointAdd: (a: Uint8Array, b: Uint8Array, compressed?: boolean): Uint8Array | null =>
    throwToNull(() => {
      const A = necc.Point.fromHex(a)
      const B = necc.Point.fromHex(b)
      return A.add(B).toRawBytes(defaultTrue(compressed))
    }),

  pointAddScalar: (p: Uint8Array, tweak: Uint8Array, compressed?: boolean): Uint8Array | null =>
    throwToNull(() => pointAddScalar(p, tweak, defaultTrue(compressed))),

  privateAdd: (d: Uint8Array, tweak: Uint8Array): Uint8Array | null =>
    throwToNull(() => {
      const res = privateAdd(d, tweak)
      // tiny-secp256k1 returns null rather than allowing a 0 private key to be returned
      // ECPair.testEcc() requires that behavior.
      if (res?.every((i) => i === 0)) return null
      return res
    }),

  privateNegate: (d: Uint8Array): Uint8Array => privateNegate(d)!,

  sign: (h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array => {
    return necc.signSync(h, d, { der: false, extraEntropy: e })
  },

  signSchnorr: (h: Uint8Array, d: Uint8Array, e: Uint8Array = new Uint8Array(32).fill(0x00)): Uint8Array => {
    return necc.schnorr.signSync(h, d, e)
  },

  verify: (h: Uint8Array, Q: Uint8Array, signature: Uint8Array, strict?: boolean): boolean => {
    return necc.verify(signature, h, Q, { strict })
  },

  verifySchnorr: (h: Uint8Array, Q: Uint8Array, signature: Uint8Array): boolean => {
    return necc.schnorr.verifySync(signature, h, Q)
  }
}

const bip32: BIP32API = BIP32Factory(ecc)

export { ecc, bip32, BIP32API, BIP32Interface }
