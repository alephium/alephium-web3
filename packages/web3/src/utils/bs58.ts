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

/** This source is under MIT License and come originally from https://github.com/cryptocoinjs/bs58 **/
import basex from 'base-x'
import { TraceableError } from '../error'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export const bs58 = basex(ALPHABET)

export function isBase58(s: string): boolean {
  if (s === '' || s.trim() === '') {
    return false
  }
  try {
    return bs58.encode(bs58.decode(s)) === s
  } catch (err) {
    return false
  }
}

export function base58ToBytes(s: string): Uint8Array {
  try {
    return bs58.decode(s)
  } catch (e) {
    throw new TraceableError(`Invalid base58 string ${s}`, e)
  }
}

export default bs58
