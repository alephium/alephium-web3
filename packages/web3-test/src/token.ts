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

import { Contract, DUST_AMOUNT, NodeProvider, ONE_ALPH, Script, SignerProvider, stringToHex } from '@alephium/web3'

function createTokenContract(symbol: string, name: string): string {
  return `
    Contract Token(totalSupply: U256) implements IFungibleToken {
      pub fn getSymbol() -> ByteVec {
        return #${stringToHex(symbol)}
      }

      pub fn getName() -> ByteVec {
        return #${stringToHex(name)}
      }

      pub fn getDecimals() -> U256 {
        return 18
      }

      pub fn getTotalSupply() -> U256 {
        return totalSupply
      }
    }

    @std(id = #0001)
    Interface IFungibleToken {
      pub fn getSymbol() -> ByteVec

      pub fn getName() -> ByteVec

      pub fn getDecimals() -> U256

      pub fn getTotalSupply() -> U256
    }
  `
}

const contractCode = createTokenContract('TestToken', 'TestToken')

let _contract: Contract | undefined = undefined

async function getContractArtifact(nodeProvider: NodeProvider): Promise<Contract> {
  if (_contract !== undefined) return _contract
  const compileResult = await nodeProvider.contracts.postContractsCompileContract({ code: contractCode })
  _contract = Contract.fromCompileResult(compileResult)
  return _contract
}

async function getScriptArtifact(nodeProvider: NodeProvider): Promise<Script> {
  const contract = await getContractArtifact(nodeProvider)
  const scriptCode = `
    TxScript Main(address: Address, totalSupply: U256) {
      let (encodedImmFields, encodedMutFields) = Token.encodeFields!(totalSupply)
      createContractWithToken!{address -> ALPH: 1 alph}(
        #${contract.bytecode},
        encodedImmFields,
        encodedMutFields,
        totalSupply,
        address
      )
    }
    ${contractCode}
  `
  const scriptResult = await nodeProvider.contracts.postContractsCompileScript({ code: scriptCode })
  return Script.fromCompileResult(scriptResult)
}

export async function createAndTransferToken(nodeProvider: NodeProvider, signer: SignerProvider, amount: bigint) {
  const script = await getScriptArtifact(nodeProvider)
  const account = await signer.getSelectedAccount()
  const params = await script.txParamsForExecution(signer, {
    initialFields: { address: account.address, totalSupply: amount },
    attoAlphAmount: ONE_ALPH + DUST_AMOUNT
  })
  return await signer.signAndSubmitExecuteScriptTx(params)
}
