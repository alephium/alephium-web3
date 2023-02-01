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

import { Account, web3, Project, addressFromContractId, Address, node } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'
import { NodeWallet } from '@alephium/web3-wallet'

describe('contract', function () {
  let signer: NodeWallet
  let signerAccount: Account
  let signerGroup: number

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973')
    signer = await testNodeWallet()
    signerAccount = await signer.getSelectedAccount()
    signerGroup = signerAccount.group
    await Project.build({ errorOnWarnings: false })
  })

  async function deployContract(
    signer: NodeWallet,
    symbol: string,
    name: string,
    decimals: number,
    totalSupply: bigint
  ): Promise<string> {
    const token = Project.contract('TokenTest')
    const tokenDeployTx = await token.deploy(signer, {
      initialFields: {
        symbol: symbol,
        name: name,
        decimals: BigInt(decimals),
        totalSupply: totalSupply
      },
      issueTokenAmount: totalSupply
    })
    return tokenDeployTx.contractId
  }

  async function callContract(contractAddress: Address, methodIndex: number, expected: node.Val) {
    const result = await web3.getCurrentNodeProvider().contracts.postContractsCallContract({
      group: signerGroup,
      address: contractAddress,
      methodIndex: methodIndex
    })
    expect(result.returns.length).toEqual(1)
    expect(result.returns[0].type).toEqual(expected.type)
    expect(result.returns[0].value).toEqual(expected.value)
  }

  it('should get token infos', async () => {
    const symbol = Buffer.from('TT', 'utf8').toString('hex')
    const name = Buffer.from('TestToken', 'utf8').toString('hex')
    const decimals = 18
    const totalSupply = 1n << 128n
    const tokenContractId = await deployContract(signer, symbol, name, decimals, totalSupply)
    const tokenContractAddress = addressFromContractId(tokenContractId)

    const symbolVal: node.Val = {
      type: 'ByteVec',
      value: symbol
    }
    await callContract(tokenContractAddress, 0, symbolVal)

    const nameVal: node.Val = {
      type: 'ByteVec',
      value: name
    }
    await callContract(tokenContractAddress, 1, nameVal)

    const decimalsVal: node.Val = {
      type: 'U256',
      value: decimals.toString()
    }
    await callContract(tokenContractAddress, 2, decimalsVal)

    const totalSupplyVal: node.Val = {
      type: 'U256',
      value: totalSupply.toString()
    }
    await callContract(tokenContractAddress, 3, totalSupplyVal)
  })
})
