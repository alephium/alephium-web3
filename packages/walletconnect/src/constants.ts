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
export const PROVIDER_NAMESPACE = 'alephium'

// Note:
// 1. the wallet client could potentially submit the signed transaction.
// 2. `alph_signUnsignedTx` can be used for complicated transactions (e.g. multisig).
export const RELAY_METHODS = [
  'alph_signAndSubmitTransferTx',
  'alph_signAndSubmitDeployContractTx',
  'alph_signAndSubmitExecuteScriptTx',
  'alph_signAndSubmitUnsignedTx',
  'alph_signUnsignedTx',
  'alph_signMessage',
  'alph_requestNodeApi',
  'alph_requestExplorerApi'
] as const

export const LOGGER = 'error'

export const RELAY_URL = 'wss://relay.walletconnect.com'
