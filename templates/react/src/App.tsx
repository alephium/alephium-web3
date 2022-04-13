import React from 'react'
import './App.css'

import { explorer, Contract, Script } from 'alephium-web3'
import contractJson from './artifacts/greeter.ral.json'
import scriptJson from './artifacts/greeter_main.ral.json'

class Block extends React.Component<Record<string, never>, { blocks: string; contract: string; script: string }> {
  readonly api = new explorer.Api<null>({ baseUrl: 'https://mainnet-backend.alephium.org' })
  state = { blocks: '', contract: '', script: '' }

  async componentDidMount() {
    this.setState({ contract: Contract.fromJson(contractJson).toString() })
    this.setState({ script: Script.fromJson(scriptJson).toString() })
    const blocks = (await this.api.blocks.getBlocks({ page: 1 })).data.total
    this.setState({ blocks: JSON.stringify(blocks) })
  }

  render() {
    return (
      <div>
        <p>blocks: {this.state.blocks}</p>
        <p>contract: {this.state.contract}</p>
        <p>script: {this.state.script}</p>
      </div>
    )
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Block />
      </header>
    </div>
  )
}

export default App
