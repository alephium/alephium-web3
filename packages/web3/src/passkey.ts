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

import { Account, Address, SignerProviderSimple } from './signer'
import * as elliptic from 'elliptic'
import { binToHex, bs58, concatBytes, HexString, hexToBinUnsafe, isHexString } from './utils'
import { ExplorerProvider, NodeProvider } from './api'
import { getCurrentExplorerProvider, getCurrentNodeProvider } from './global'
import { LockupScript, lockupScriptCodec } from './codec/lockup-script-codec'
import { TOTAL_NUMBER_OF_GROUPS } from './constants'
import { groupOfAddress } from './address'
import { AsnParser } from '@peculiar/asn1-schema'
import { ECDSASigValue } from '@peculiar/asn1-ecc'
import * as BN from 'bn.js'
import { byteStringCodec } from './codec'

const curve = new elliptic.ec('p256')
const publicKeyHexLength = 66

export class Passkey extends SignerProviderSimple {
  readonly publicKey: HexString
  readonly credentialId: HexString
  readonly address: Address
  readonly group: number
  private readonly _nodeProvider: NodeProvider | undefined
  private readonly _explorerProvider: ExplorerProvider | undefined

  constructor(params: {
    publicKey: HexString
    credentialId: HexString
    group: number | undefined
    nodeProvider: NodeProvider | undefined
    explorerProvider: ExplorerProvider | undefined
  }) {
    super()
    if (!isHexString(params.publicKey) || params.publicKey.length !== publicKeyHexLength) {
      throw new Error(`Invalid public key ${params.publicKey}, expected a hex string of length ${publicKeyHexLength}`)
    }
    if (!isHexString(params.credentialId)) {
      throw new Error(`Invalid credential id ${params.credentialId}, expected a hex string`)
    }
    if (params.group !== undefined && (params.group < 0 || params.group >= TOTAL_NUMBER_OF_GROUPS)) {
      throw new Error(`Invalid group index ${params.group}`)
    }
    this.publicKey = params.publicKey
    this.credentialId = params.credentialId
    const lockupScript: LockupScript = {
      kind: 'P2PK',
      value: { type: { kind: 'Passkey', value: hexToBinUnsafe(params.publicKey) } }
    }
    this.address = bs58.encode(lockupScriptCodec.encode(lockupScript))
    this.group = params.group ?? groupOfAddress(this.address)
    this._nodeProvider = params.nodeProvider
    this._explorerProvider = params.explorerProvider
  }

  static async create(params: {
    rp: string
    name: string
    displayName: string
    group: number | undefined
    nodeProvider: NodeProvider | undefined
    explorerProvider: ExplorerProvider | undefined
  }): Promise<Passkey> {
    const credential = (await navigator.credentials.create({
      publicKey: {
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: { userVerification: 'preferred' },
        attestation: 'direct',
        challenge: window.crypto.getRandomValues(new Uint8Array(16)),
        rp: { name: params.rp },
        user: {
          name: params.name,
          displayName: params.displayName,
          id: window.crypto.getRandomValues(new Uint8Array(16))
        }
      }
    })) as PublicKeyCredential
    const response = credential.response as AuthenticatorAttestationResponse
    if (response.attestationObject === undefined) {
      throw new Error(`Expected an attestation response, but got ${credential.response}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cbor2 = require('cbor2')
    const attestationObject = cbor2.decode(new Uint8Array(response.attestationObject)) as any
    const authData = attestationObject.authData as Uint8Array

    const dataView = new DataView(new ArrayBuffer(2))
    const idLenBytes = authData.slice(53, 55)
    idLenBytes.forEach((value, index) => dataView.setUint8(index, value))
    const credentialIdLength = dataView.getUint16(0)
    const publicKeyBytes = authData.slice(55 + credentialIdLength)
    const publicKeyObject = cbor2.decode(new Uint8Array(publicKeyBytes)) as any
    const x = new Uint8Array(publicKeyObject.get(-2))
    const y = new Uint8Array(publicKeyObject.get(-3))
    const key = curve.keyFromPublic({ x: binToHex(x), y: binToHex(y) }, 'hex')
    binToHex(new Uint8Array(credential.rawId))
    return new Passkey({
      publicKey: key.getPublic(true, 'hex'),
      credentialId: binToHex(new Uint8Array(credential.rawId)),
      group: params.group,
      nodeProvider: params.nodeProvider,
      explorerProvider: params.explorerProvider
    })
  }

  public get nodeProvider(): NodeProvider {
    return this._nodeProvider ?? getCurrentNodeProvider()
  }

  public get explorerProvider(): ExplorerProvider | undefined {
    return this._explorerProvider ?? getCurrentExplorerProvider()
  }

  protected getPublicKey(address: string): Promise<string> {
    if (address !== this.address) {
      throw Error('The signer address is invalid')
    }

    return Promise.resolve(this.publicKey)
  }

  protected unsafeGetSelectedAccount(): Promise<Account> {
    const account: Account = { keyType: 'passkey', address: this.address, publicKey: this.publicKey, group: this.group }
    return Promise.resolve(account)
  }

  override async signRaw(address: string, hexString: string): Promise<string> {
    if (address !== this.address) {
      throw Error('The signer address is invalid')
    }

    const bytes = hexToBinUnsafe(hexString)
    const credential = (await window.navigator.credentials.get({
      publicKey: {
        challenge: bytes,
        userVerification: 'preferred',
        allowCredentials: [{ id: hexToBinUnsafe(this.credentialId), type: 'public-key' }]
      }
    })) as PublicKeyCredential
    const response = credential.response as AuthenticatorAssertionResponse
    const signature = parseSignature(new Uint8Array(response.signature))

    const authenticatorData = new Uint8Array(response.authenticatorData)
    const clientDataJSON = new Uint8Array(response.clientDataJSON)

    return encodeWebauthnPayload(authenticatorData, clientDataJSON) + binToHex(signature)
  }
}

function parseSignature(signature: Uint8Array): Uint8Array {
  const parsedSignature = AsnParser.parse(signature, ECDSASigValue)
  let rBytes = new Uint8Array(parsedSignature.r)
  let sBytes = new Uint8Array(parsedSignature.s)

  if (shouldRemoveLeadingZero(rBytes)) {
    rBytes = rBytes.slice(1)
  }

  if (shouldRemoveLeadingZero(sBytes)) {
    sBytes = sBytes.slice(1)
  }

  // To prevent signature malleability, full nodes verify signatures by ensuring that `s` is less than or equal to `N/2`.
  // However, since WebAuthn signatures may have an `s` value greater than `N/2`, we need to convert `s` to a value less than `N/2`.
  // Coinbase Wallet uses a similar approach: https://github.com/base-org/webauthn-sol/blob/619f20ab0f074fef41066ee4ab24849a913263b2/test/Utils.sol#L35
  const halfCurveOrder = curve.n!.shrn(1)
  const s = new BN.BN(sBytes)
  if (s.gt(halfCurveOrder)) {
    sBytes = new Uint8Array(curve.n!.sub(s).toArray('be', 32))
  }
  return new Uint8Array([...rBytes, ...sBytes])
}

// https://crypto.stackexchange.com/questions/57731/ecdsa-signature-rs-to-asn1-der-encoding-question
function shouldRemoveLeadingZero(bytes: Uint8Array): boolean {
  return bytes[0] === 0x0 && (bytes[1] & (1 << 7)) !== 0
}

function encodeWebauthnPayload(authenticatorData: Uint8Array, clientDataJSON: Uint8Array) {
  const bytes1 = byteStringCodec.encode(authenticatorData)
  const bytes2 = byteStringCodec.encode(clientDataJSON)
  const length = bytes1.length + bytes2.length
  const totalLength = Math.ceil(length / 64) * 64
  const padding = new Uint8Array(totalLength - length).fill(0)
  const payload = concatBytes([bytes1, bytes2, padding])
  return binToHex(payload)
}
