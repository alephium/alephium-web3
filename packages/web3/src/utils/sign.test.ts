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

import EC from 'elliptic'

import { sign, verifySignature } from './sign'
import { publicKeyFromPrivateKey } from './address'

describe('Signing', function () {
  it('should sign and verify secp2561k1 signature', () => {
    const ec = new EC.ec('secp256k1')
    const key = ec.genKeyPair()
    const privateKey = key.getPrivate().toString('hex')
    const publicKey = key.getPublic().encode('hex', true)

    const hash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    const signature = sign(hash, privateKey, 'default')
    expect(verifySignature(hash, publicKey, signature, 'default')).toEqual(true)
  })

  it('should sign and verify schnorr signature', () => {
    const ec = new EC.ec('secp256k1')
    const key = ec.genKeyPair()
    const privateKey = key.getPrivate().toString('hex', 64)
    const publicKey = publicKeyFromPrivateKey(privateKey, 'bip340-schnorr')

    const hash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    const signature = sign(hash, privateKey, 'bip340-schnorr')
    expect(verifySignature(hash, publicKey, signature, 'bip340-schnorr')).toEqual(true)
  })

  it('should derive the right public keys', () => {
    const privateKey = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    expect(publicKeyFromPrivateKey(privateKey, 'default')).toBe(
      '039d5f34d2cb49a37db26b1f1568af51cc0d79f95e14057763187cfbe58782eab9'
    )
    expect(publicKeyFromPrivateKey(privateKey, 'bip340-schnorr')).toBe(
      '9d5f34d2cb49a37db26b1f1568af51cc0d79f95e14057763187cfbe58782eab9'
    )
  })
})
