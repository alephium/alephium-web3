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

import { AddressType, DUST_AMOUNT, addressFromPublicKey, addressFromScript, binToHex, bs58, hexToBinUnsafe } from '..'
import { Transaction } from '../api/api-alephium'
import { Address } from '../signer'

export function isExchangeAddress(address: string): boolean {
  const decoded = bs58.decode(address)
  if (decoded.length === 0) throw new Error('Address is empty')
  const addressType = decoded[0]
  return (addressType === AddressType.P2PKH || addressType === AddressType.P2SH) && decoded.length === 33
}

export function isDepositALPHTransaction(tx: Transaction, exchangeAddress: string): boolean {
  return isDepositTransaction(tx, exchangeAddress) && checkALPHOutput(tx)
}

export function isDepositTokenTransaction(tx: Transaction, exchangeAddress: string): boolean {
  return isDepositTransaction(tx, exchangeAddress) && checkTokenOutput(tx, exchangeAddress)
}

// we assume that the tx is deposit transaction
export function getDepositAddress(tx: Transaction): Address {
  return getAddressFromUnlockScript(tx.unsigned.inputs[0].unlockScript)
}

enum UnlockScriptType {
  P2PKH = 0x00,
  P2MPKH = 0x01,
  P2SH = 0x02
}

export function getAddressFromUnlockScript(unlockScript: string): Address {
  const decoded = hexToBinUnsafe(unlockScript)
  if (decoded.length === 0) throw new Error('UnlockScript is empty')
  const unlockScriptType = decoded[0]
  const unlockScriptBody = decoded.slice(1)

  if (unlockScriptType === UnlockScriptType.P2PKH) {
    return addressFromPublicKey(binToHex(unlockScriptBody))
  } else if (unlockScriptType === UnlockScriptType.P2MPKH) {
    throw new Error('Naive multi-sig address is not supported for exchanges as it will be replaced by P2SH')
  } else if (unlockScriptType === UnlockScriptType.P2SH) {
    // FIXEME: for now we assume that the params is empty, so we need to
    // remove the last byte from the `unlockScriptBody`, we can decode
    // the unlock script once the codec PR is merged
    const script = unlockScriptBody.slice(0, -1)
    return addressFromScript(script)
  } else {
    throw new Error('Invalid unlock script type')
  }
}

function getFromAddress(tx: Transaction): Address | undefined {
  try {
    const inputAddresses = tx.unsigned.inputs.map((i) => getAddressFromUnlockScript(i.unlockScript))
    // we have checked that the inputs is not empty
    const from = inputAddresses[0]
    return inputAddresses.slice(1).every((addr) => addr === from) ? from : undefined
  } catch (_) {
    return undefined
  }
}

function checkOutputAddress(tx: Transaction, from: Address, to: Address): boolean {
  let fromCount = 0
  let toCount = 0
  tx.unsigned.fixedOutputs.forEach((o) => {
    if (o.address === from) {
      fromCount += 1
    } else if (o.address === to) {
      toCount += 1
    }
  })
  const outputCount = tx.unsigned.fixedOutputs.length
  return toCount === 1 && fromCount === outputCount - 1
}

function checkALPHOutput(tx: Transaction): boolean {
  const outputs = tx.unsigned.fixedOutputs
  return outputs.every((o) => o.tokens.length === 0)
}

function checkTokenOutput(tx: Transaction, to: Address): boolean {
  // we have checked the output address
  const output = tx.unsigned.fixedOutputs.find((o) => o.address === to)!
  return output.attoAlphAmount === DUST_AMOUNT.toString() && output.tokens.length === 1
}

function isDepositTransaction(tx: Transaction, exchangeAddress: string): boolean {
  if (
    tx.contractInputs.length !== 0 ||
    tx.generatedOutputs.length !== 0 ||
    tx.unsigned.inputs.length === 0 ||
    tx.unsigned.scriptOpt !== undefined
  ) {
    return false
  }
  const from = getFromAddress(tx)
  if (from === undefined) {
    return false
  }
  return checkOutputAddress(tx, from, exchangeAddress)
}
