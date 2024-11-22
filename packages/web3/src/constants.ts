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

export const TOTAL_NUMBER_OF_GROUPS = 4
export const TOTAL_NUMBER_OF_CHAINS = TOTAL_NUMBER_OF_GROUPS * TOTAL_NUMBER_OF_GROUPS
export const MIN_UTXO_SET_AMOUNT = BigInt(1000000000000)
export const ALPH_TOKEN_ID = ''.padStart(64, '0')
export const ONE_ALPH = 10n ** 18n
export const DUST_AMOUNT = 10n ** 15n
/**
 * @deprecated `ZERO_ADDRESS` is deprecated. Use `NULL_CONTRACT_ADDRESS` instead.
 */
export const ZERO_ADDRESS = 'tgx7VNFoP9DJiFMFgXXtafQZkUvyEdDHT9ryamHJYrjq'
export const NULL_CONTRACT_ADDRESS = 'tgx7VNFoP9DJiFMFgXXtafQZkUvyEdDHT9ryamHJYrjq'
export const DEFAULT_GAS_AMOUNT = 20000
export const DEFAULT_GAS_PRICE = 10n ** 11n
export const DEFAULT_GAS_ATTOALPH_AMOUNT = BigInt(DEFAULT_GAS_AMOUNT) * DEFAULT_GAS_PRICE
export const DEFAULT_GAS_ALPH_AMOUNT = 0.002
export const MINIMAL_CONTRACT_DEPOSIT = ONE_ALPH / 10n
export const MAP_ENTRY_DEPOSIT = ONE_ALPH / 10n
