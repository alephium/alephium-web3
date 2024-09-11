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

import { groupOfLockupScript } from '../address'
import { node } from '../api'
import { UnsignedTx } from '../codec'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'
import { getCurrentNodeProvider } from '../global'
import { xorByte } from '../utils'

function isConfirmed(txStatus: node.TxStatus): txStatus is node.Confirmed {
  return txStatus.type === 'Confirmed'
}

export async function waitForTxConfirmation(
  txId: string,
  confirmations: number,
  requestInterval: number
): Promise<node.Confirmed> {
  const provider = getCurrentNodeProvider()
  const status = await provider.transactions.getTransactionsStatus({ txId: txId })
  if (isConfirmed(status) && status.chainConfirmations >= confirmations) {
    return status
  }
  await new Promise((r) => setTimeout(r, requestInterval))
  return waitForTxConfirmation(txId, confirmations, requestInterval)
}

export function groupIndexOfTransaction(unsignedTx: UnsignedTx): [number, number] {
  if (unsignedTx.inputs.length === 0) throw new Error('Empty inputs for unsignedTx')

  const fromGroup = groupFromHint(unsignedTx.inputs[0].hint)

  let toGroup = fromGroup
  for (const output of unsignedTx.fixedOutputs) {
    const outputGroup = groupOfLockupScript(output.lockupScript)
    if (outputGroup !== fromGroup) {
      toGroup = outputGroup
      break
    }
  }

  return [fromGroup, toGroup]
}

function groupFromHint(hint: number): number {
  const hash = xorByte(hint)
  return hash % TOTAL_NUMBER_OF_GROUPS
}
