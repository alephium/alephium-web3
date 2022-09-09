import React, { useEffect, useState } from 'react'
import './App.css'

import { ExplorerProvider, Contract, Script } from '@alephium/web3'
import contractJson from './artifacts/greeter.ral.json'
import scriptJson from './artifacts/greeter_main.ral.json'

function Dashboard() {
  const api = new ExplorerProvider('https://mainnet-backend.alephium.org')
  const contract = Contract.fromJson(contractJson).toString()
  const script = Script.fromJson(scriptJson).toString()
  const [blocks, setBlocks] = useState('')

  useEffect(() => {
    async function fetchBlocks() {
      const blocks = (await api.blocks.getBlocks({ page: 1 })).total
      setBlocks(JSON.stringify(blocks))
    }

    fetchBlocks()
  })

  return (
    <div>
      <p>blocks: {blocks}</p>
      <p>contract: {contract}</p>
      <p>script: {script}</p>
    </div>
  )
}

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <Dashboard />
      </header>
    </div>
  )
}

export default App
