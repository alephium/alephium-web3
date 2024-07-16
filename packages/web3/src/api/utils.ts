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

import 'cross-fetch/polyfill'
import * as node from '../api/api-alephium'

export function convertHttpResponse<T>(response: { status: number; data: T; error?: { detail: string } }): T {
  if (response.error) {
    const errorMessage = response.error.detail ?? `Unknown error`
    throw new Error(`[API Error] - ${errorMessage} - Status code: ${response.status}`)
  } else {
    return response.data
  }
}

export function isBalanceEqual(b0: node.Balance, b1: node.Balance): boolean {
  const isTokenBalanceEqual = (tokens0?: node.Token[], tokens1?: node.Token[]): boolean => {
    const tokens0Size = tokens0?.length ?? 0
    const tokens1Size = tokens1?.length ?? 0
    if (tokens0Size !== tokens1Size) return false
    if (tokens0Size === 0) return true
    const _tokens1 = tokens1!.map((t) => ({ ...t, used: false }))
    return tokens0!.every((t0) => {
      const t1 = _tokens1.find((t) => !t.used && t0.id === t.id && t0.amount === t.amount)
      if (t1 === undefined) return false
      t1.used = true
      return true
    })
  }

  const isAlphBalanceEqual = b0.balance === b1.balance && b0.lockedBalance === b1.lockedBalance
  return (
    b0.utxoNum === b1.utxoNum &&
    isAlphBalanceEqual &&
    isTokenBalanceEqual(b0.tokenBalances, b1.tokenBalances) &&
    isTokenBalanceEqual(b0.lockedTokenBalances, b1.lockedTokenBalances)
  )
}
