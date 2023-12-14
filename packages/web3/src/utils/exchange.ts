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

export function validateExchangeAddress(address: string) {
  let decoded: Uint8Array
  try {
    decoded = bs58.decode(address)
  } catch (_) {
    throw new Error('Invalid base58 string')
  }
  if (decoded.length === 0) throw new Error('Address is empty')
  const addressType = decoded[0]
  if (addressType !== AddressType.P2PKH && addressType !== AddressType.P2SH) {
    throw new Error('Invalid address type')
  }
  if (decoded.length !== 33) {
    throw new Error('Invalid address length')
  }
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

export function isSimpleTransferALPHTx(tx: Transaction): boolean {
  return isSimpleTransferTx(tx) && checkALPHOutput(tx)
}

export function isSimpleTransferTokenTx(tx: Transaction): boolean {
  const isTransferTx = isSimpleTransferTx(tx)
  if (isTransferTx) {
    const targetAddress = getSimpleTransferTxTargetAddress(tx)
    return checkTokenOutput(tx, targetAddress)
  }
  return false
}

// we assume that the tx is a simple transfer tx
export function getSimpleTransferTxTargetAddress(tx: Transaction): Address {
  const from = getAddressFromUnlockScript(tx.unsigned.inputs[0].unlockScript)
  return tx.unsigned.fixedOutputs.find((output) => output.address !== from)!.address
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

function getTransferTxFromAddress(tx: Transaction): Address | undefined {
  try {
    if (
      tx.contractInputs.length !== 0 ||
      tx.generatedOutputs.length !== 0 ||
      tx.unsigned.inputs.length === 0 ||
      tx.unsigned.scriptOpt !== undefined
    ) {
      return undefined
    }
    const inputAddresses = tx.unsigned.inputs.map((i) => getAddressFromUnlockScript(i.unlockScript))
    // we have checked that the inputs is not empty
    const from = inputAddresses[0]
    return inputAddresses.slice(1).every((addr) => addr === from) ? from : undefined
  } catch (_) {
    return undefined
  }
}

function getGroupedOutputs(tx: Transaction): { address: Address; count: number }[] {
  const result: { address: Address; count: number }[] = []
  tx.unsigned.fixedOutputs.forEach((o) => {
    const index = result.findIndex((r) => r.address === o.address)
    if (index === -1) {
      result.push({ address: o.address, count: 1 })
    } else {
      const currentCount = result[`${index}`].count
      result[`${index}`] = { address: o.address, count: currentCount + 1 }
    }
  })
  return result
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
  const from = getTransferTxFromAddress(tx)
  if (from === undefined || from === exchangeAddress) {
    return false
  }
  const txOutputs = getGroupedOutputs(tx)
  const hasChangeOutput = txOutputs.find((o) => o.address === from) !== undefined
  const exchangeAddressOutput = txOutputs.find((o) => o.address === exchangeAddress)
  return (
    txOutputs.length === 2 &&
    hasChangeOutput &&
    exchangeAddressOutput !== undefined &&
    exchangeAddressOutput.count === 1
  )
}

function isSimpleTransferTx(tx: Transaction): boolean {
  const from = getTransferTxFromAddress(tx)
  if (from === undefined) {
    return false
  }
  const txOutputs = getGroupedOutputs(tx)
  if (txOutputs.length > 2 || txOutputs.length === 0) {
    return false
  }
  if (txOutputs.length === 2) {
    const hasChangeOutput = txOutputs.find((o) => o.address === from) !== undefined
    const targetOutput = txOutputs.find((o) => o.address !== from)
    return hasChangeOutput && targetOutput !== undefined && targetOutput.count === 1
  }
  return false
}
