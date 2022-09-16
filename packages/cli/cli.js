#!/usr/bin/env node
const execSync = require('child_process').execSync
const path = require('path')
const { exit } = require('process')

// remove the `npx cli` prefix
const index = process.argv.findIndex(arg => arg.includes("@alephium/cli"))
if (index === -1) {
  console.log('please run "npx @alephium/cli <command>"')
  exit(-1)
}
const argString = process.argv.slice(index + 1).join(" ")
const cliRootPath = path.resolve(__dirname)
const cliInternalPath = path.join(cliRootPath, 'cli_internal.ts')
const command = `ts-node --transpile-only ${cliInternalPath} ${argString}`
console.log(`Run command: "${command}"`)
execSync(command, {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
})
