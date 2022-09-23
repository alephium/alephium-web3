const web3 = require("@alephium/web3")

async function runScript(deployer, network) {
  console.log(`network id: ${network.networkId}, btc price: ${network.settings.btcPrice}`)
  const script = web3.Project.script("GreeterMain")
  const greeterContractId = deployer.getDeployContractResult("Greeter").contractId
  const result = await deployer.runScript(script, {initialFields: {
    'greeterContractId': greeterContractId
  }})
  console.log("Script execution TX id: " + result.txId)
}

module.exports.default = runScript
