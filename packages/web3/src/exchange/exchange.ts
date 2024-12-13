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

import { AddressType, addressFromPublicKey, addressFromScript } from '../address'
import { base58ToBytes, binToHex, HexString, hexToBinUnsafe, isHexString } from '../utils'
import { Transaction } from '../api/api-alephium'
import { Address } from '../signer'
import { encodedSameAsPrevious, P2SH, unlockScriptCodec } from '../codec/unlock-script-codec'
import { scriptCodec } from '../codec/script-codec'
import { TraceableError } from '../error'

export function validateExchangeAddress(address: string) {
  const decoded = base58ToBytes(address)
  if (decoded.length === 0) throw new Error('Address is empty')
  const addressType = decoded[0]
  if (addressType !== AddressType.P2PKH && addressType !== AddressType.P2SH) {
    throw new Error('Invalid address type')
  }
  if (decoded.length !== 33) {
    throw new Error('Invalid address length')
  }
}

export function isALPHTransferTx(tx: Transaction): boolean {
  return isTransferTx(tx) && checkALPHOutput(tx)
}

export interface BaseDepositInfo {
  targetAddress: Address
  depositAmount: bigint
}

export function getALPHDepositInfo(tx: Transaction): BaseDepositInfo[] {
  if (!isALPHTransferTx(tx)) return []

  const inputAddresses = getInputAddresses(tx)
  const result = new Map<Address, bigint>()
  tx.unsigned.fixedOutputs.forEach((o) => {
    if (!inputAddresses.includes(o.address)) {
      const amount = result.get(o.address)
      if (amount === undefined) {
        result.set(o.address, BigInt(o.attoAlphAmount))
      } else {
        result.set(o.address, BigInt(o.attoAlphAmount) + amount)
      }
    }
  })
  return Array.from(result.entries()).map(([key, value]) => ({ targetAddress: key, depositAmount: value }))
}

function getInputAddresses(tx: Transaction): Address[] {
  const inputAddresses: Address[] = []
  for (const input of tx.unsigned.inputs) {
    try {
      if (input.unlockScript === binToHex(encodedSameAsPrevious)) continue
      const address = getAddressFromUnlockScript(input.unlockScript)
      if (!inputAddresses.includes(address)) {
        inputAddresses.push(address)
      }
    } catch (error) {
      throw new TraceableError(`Failed to decode address from unlock script`, error)
    }
  }
  return inputAddresses
}

export interface TokenDepositInfo extends BaseDepositInfo {
  tokenId: HexString
}

export interface DepositInfo {
  alph: BaseDepositInfo[]
  tokens: TokenDepositInfo[]
}

export function getDepositInfo(tx: Transaction): DepositInfo {
  if (!isTransferTx(tx)) return { alph: [], tokens: [] }

  const inputAddresses = getInputAddresses(tx)
  const alphDepositInfos = new Map<Address, bigint>()
  const tokenDepositInfos = new Map<HexString, Map<Address, bigint>>()
  tx.unsigned.fixedOutputs.forEach((o) => {
    if (!inputAddresses.includes(o.address)) {
      const alphAmount = alphDepositInfos.get(o.address) ?? 0n
      alphDepositInfos.set(o.address, alphAmount + BigInt(o.attoAlphAmount))

      o.tokens.forEach((token) => {
        const depositPerToken = tokenDepositInfos.get(token.id) ?? new Map<Address, bigint>()
        const currentAmount = depositPerToken.get(o.address) ?? 0n
        depositPerToken.set(o.address, currentAmount + BigInt(token.amount))
        tokenDepositInfos.set(token.id, depositPerToken)
      })
    }
  })
  return {
    alph: Array.from(alphDepositInfos.entries()).map(([key, value]) => ({ targetAddress: key, depositAmount: value })),
    tokens: Array.from(tokenDepositInfos.entries()).flatMap(([tokenId, depositPerToken]) => {
      return Array.from(depositPerToken.entries()).map(([targetAddress, depositAmount]) => ({
        tokenId,
        targetAddress,
        depositAmount
      }))
    })
  }
}

// we assume that the tx is a simple transfer tx, i.e. isALPHTransferTx(tx) || isTokenTransferTx(tx)
export function getSenderAddress(tx: Transaction): Address {
  return getAddressFromUnlockScript(tx.unsigned.inputs[0].unlockScript)
}

enum UnlockScriptType {
  P2PKH = 0x00,
  P2MPKH = 0x01,
  P2SH = 0x02
}

export function getAddressFromUnlockScript(unlockScript: string): Address {
  if (!isHexString(unlockScript)) {
    throw new Error(`Invalid unlock script ${unlockScript}, expected a hex string`)
  }
  const decoded = hexToBinUnsafe(unlockScript)
  if (decoded.length === 0) throw new Error('UnlockScript is empty')
  const unlockScriptType = decoded[0]
  const unlockScriptBody = decoded.slice(1)

  if (unlockScriptType === UnlockScriptType.P2PKH) {
    if (unlockScriptBody.length !== 33) {
      throw new Error(`Invalid p2pkh unlock script: ${unlockScript}`)
    }
    return addressFromPublicKey(binToHex(unlockScriptBody))
  }

  if (unlockScriptType === UnlockScriptType.P2MPKH) {
    throw new Error('Naive multi-sig address is not supported for exchanges as it will be replaced by P2SH')
  }

  if (unlockScriptType === UnlockScriptType.P2SH) {
    let p2sh: P2SH
    try {
      p2sh = unlockScriptCodec.decode(decoded).value as P2SH
    } catch (e) {
      throw new TraceableError(`Invalid p2sh unlock script: ${unlockScript}`, e)
    }
    return addressFromScript(scriptCodec.encode(p2sh.script))
  }
  throw new Error('Invalid unlock script type')
}

function checkALPHOutput(tx: Transaction): boolean {
  const outputs = tx.unsigned.fixedOutputs
  return outputs.every((o) => o.tokens.length === 0)
}

export function isTransferTx(tx: Transaction): boolean {
  if (
    tx.contractInputs.length !== 0 ||
    tx.generatedOutputs.length !== 0 ||
    tx.unsigned.inputs.length === 0 ||
    tx.unsigned.scriptOpt !== undefined
  ) {
    return false
  }
  return true
}
