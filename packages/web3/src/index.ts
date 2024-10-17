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

BigInt.prototype['toJSON'] = function () {
  return this.toString()
}

export * from './api'
export * from './contract'
export * from './signer'
export * from './utils'
export * from './transaction'
export * from './token'

export * from './constants'
export * as web3 from './global'
export * as codec from './codec'
export * as utils from './utils'
export * from './debug'
export * from './block'
export * from './address'
export * from './exchange'
export * from './error'
