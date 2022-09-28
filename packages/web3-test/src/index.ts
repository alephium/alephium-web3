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

import { addressFromContractId, isBase58 } from '@alephium/web3'
import { NodeWallet, PrivateKeyWallet } from '@alephium/web3-wallet'
import { randomBytes } from 'crypto'

export const testMnemonic =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
export const testWalletName = 'alephium-web3-test-only-wallet'
export const testAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
export const testPassword = 'alph'

export async function testNodeWallet(): Promise<NodeWallet> {
  const wallet = new NodeWallet(testWalletName)
  await wallet.unlock(testPassword)
  return wallet
}

export async function expectAssertionError(p: Promise<unknown>, address: string, errorCode: number): Promise<void> {
  expect(isBase58(address)).toEqual(true)
  await expect(p).rejects.toThrowError(new RegExp(`AssertionFailedWithErrorCode\\\(${address},${errorCode}\\\)`, 'mg'))
}

export function randomContractId(): string {
  return randomBytes(32).toString('hex')
}

export function randomContractAddress(): string {
  return addressFromContractId(randomContractId())
}

export function randomPrivateKeyWallet(targetGroup?: number, alwaysSubmitTx = true): PrivateKeyWallet {
  const wallet = PrivateKeyWallet.Random(alwaysSubmitTx)
  if (targetGroup === undefined || wallet.group === targetGroup) {
    return wallet
  } else {
    return randomPrivateKeyWallet(targetGroup, alwaysSubmitTx)
  }
}
