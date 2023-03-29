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
  'alph_requestExplorerApi',
] as const

export const LOGGER = 'error'

export const RELAY_URL = 'wss://relay.walletconnect.com'
