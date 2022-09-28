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

import { isDevnetLive } from '../src'

const fs = require('fs')
const fsExtra = require('fs-extra')
const process = require('process')
const path = require('path')
const fetch = require('cross-fetch')
const spawn = require('child_process').spawn
const os = require('os')

export const devDir = path.join(os.homedir(), '.alephium-dev')

async function _downloadFullNode(tag, fileName) {
  const url = `https://github.com/alephium/alephium/releases/download/v${tag}/alephium-${tag}.jar`
  const res0 = await fetch(url)
  const fileUrl = res0.url
  const res1 = await fetch(fileUrl)
  await new Promise((resolve) => {
    console.log(`Downloading jar file to: ${fileName}`)
    const file = fs.createWriteStream(fileName)
    res1.body.pipe(file)
    file.on('finish', function () {
      resolve()
    })
  })
}

async function downloadFullNode(tag, devDir, jarFile) {
  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir)
  }
  const jarExisted = fs.existsSync(jarFile)
  if (!jarExisted) {
    await _downloadFullNode(tag, jarFile)
  }
}

function launchDevnet(devDir, jarFile) {
  const pidFile = devDir + path.sep + 'alephium.pid'
  try {
    const pid = parseInt(fs.readFileSync(pidFile).toString())
    if (pid) {
      console.log(`Clearing the running Devnet (PID: ${pid})`)
      process.kill(pid)
    }
  } catch (e) {}
  fs.rmSync(devDir + path.sep + 'logs', { recursive: true, force: true })
  fs.rmSync(devDir + path.sep + 'network-4', { recursive: true, force: true })
  fs.rmSync(devDir + path.sep + '.alephium-wallets', { recursive: true, force: true })

  const p = spawn('java', ['-jar', jarFile], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, ALEPHIUM_HOME: devDir, ALEPHIUM_FILE_LOG_LEVEL: 'DEBUG', ALEPHIUM_WALLET_HOME: devDir }
  })
  p.unref()
  console.log(`Launching Devnet (PID: ${p.pid})`)
  fs.writeFileSync(devDir + path.sep + 'alephium.pid', p.pid.toString(), { falg: 'w' })
}

const testWallet = 'alephium-web3-test-only-wallet'
const testWalletPwd = 'alph'
const mnemonic =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'

async function prepareWallet() {
  const wallets = await fetch('http://127.0.0.1:22973/wallets', { method: 'Get' }).then((res) => res.json())
  if (wallets.find((wallet) => wallet.walletName === testWallet)) {
    unlockWallet()
  } else {
    createWallet()
  }
}

async function createWallet() {
  console.log('Creating the test wallet')
  await fetch('http://127.0.0.1:22973/wallets', {
    method: 'Put',
    body: `{"password":"${testWalletPwd}","mnemonic":"${mnemonic}","walletName":"${testWallet}","isMiner": true}`
  })
  await fetch('http://127.0.0.1:22973/wallets/alephium-web3-test-only-wallet/change-active-address', {
    method: 'Post',
    body: `{"address": "1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH"}`
  })
}

async function unlockWallet() {
  console.log('Unlocking the test wallet')
  await fetch('http://127.0.0.1:22973/wallets/alephium-web3-test-only-wallet/unlock', {
    method: 'POST',
    body: '{ "password": "alph" }'
  })
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function wait() {
  try {
    const isReady = await isDevnetLive()
    if (!isReady) {
      await timeout(1000)
      await wait()
    } else {
      await timeout(1000)
      new Promise((resolve) => {
        resolve()
      })
    }
  } catch (err) {
    await timeout(1000)
    await wait()
  }
}

export async function startDevnet(tag, configPath) {
  console.log(`Full node version: ${tag}`)
  const jarFile = `${devDir}${path.sep}alephium-${tag}.jar`

  await downloadFullNode(tag, devDir, jarFile)
  await fsExtra.copy(configPath, path.join(devDir, 'user.conf'))

  if (await isDevnetLive()) {
    console.log('Devnet is running already, please stop it to restart a new one')
    process.exit()
  }

  launchDevnet(devDir, jarFile)
  await wait()
  await prepareWallet()
  console.log('✅ Devnet is ready!')
}
