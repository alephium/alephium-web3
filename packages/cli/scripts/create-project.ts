#!/usr/bin/env node
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

import fsExtra from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'

function prepareNextJs(_packageRoot: string, projectRoot: string) {
  console.log('Creating the Nextjs app')
  execSync(`npx create-next-app ${projectRoot} --example https://github.com/alephium/nextjs-template --typescript`)
  execSync('npm install && npm run prettier', { cwd: projectRoot })
  console.log()
}

function gitClone(url: string, projectRoot: string) {
  execSync(`git clone ${url} ${projectRoot}`)
}

export function createProject(templateType: string, packageRoot: string, projectRoot: string): void {
  if (!fsExtra.existsSync(projectRoot)) {
    fsExtra.mkdirSync(projectRoot, { recursive: true })
  } else {
    console.log(`Project folder <${projectRoot}> already exists!`)
    console.log()
    process.exit(1)
  }
  switch (templateType) {
    case 'base':
      gitClone('https://github.com/alephium/nodejs-dapp-template.git', projectRoot)
      break
    case 'react':
      gitClone('https://github.com/alephium/react-dapp-template.git', projectRoot)
      break
    case 'nextjs':
      prepareNextJs(packageRoot, projectRoot)
      break
    default:
      console.error(`Invalid template type ${templateType}, expect one of base, react, nextjs`)
      process.exit(1)
  }

  console.log('✅ Done.')
  console.log()
  console.log('✨ Project is initialized!')
  console.log()
  console.log(`Next step: checkout the readme under <${projectRoot}>`)
  console.log()
}

export function genRalph(packageRoot: string, projectRoot: string) {
  console.log('Creating the Ralph Template for the existing project')
  for (const dir of ['contracts', 'scripts', 'test', 'alephium.config.ts']) {
    fsExtra.copySync(path.join(packageRoot, 'templates/base', dir), path.join(projectRoot, dir))
  }
  console.log('✅ Done.')
  console.log(`
Please install the dependencies:
    @alephium/web3
    @alephium/web3-wallet

Dev dependencies:
    @alephium/web3-test

And add the following to your package.json scripts:
    "compile": "npx cli compile",
    "deploy": "npx cli deploy",
`)
}
