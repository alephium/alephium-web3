import { AlephiumWalletProvider } from '@alephium/web3-react'

import Home from './components/Home'
import { tokenFaucetConfig } from './services/utils'

function App() {
  return (
    <AlephiumWalletProvider
      theme='web95'
      network={tokenFaucetConfig.network}
      addressGroup={tokenFaucetConfig.groupIndex}
    >
      <Home />
    </AlephiumWalletProvider>
  )
}

export default App
