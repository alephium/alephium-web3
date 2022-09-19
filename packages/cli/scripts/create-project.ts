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

function copy(packageRoot: string, projectRoot: string, dir: string, files: string[]) {
  const packageDevDir = path.join(packageRoot, dir)
  const projectDevDir = path.join(projectRoot, dir)
  if (!fsExtra.existsSync(projectDevDir)) {
    fsExtra.mkdirSync(projectDevDir)
  }
  for (const file of files) {
    fsExtra.copyFileSync(path.join(packageDevDir, file), path.join(projectDevDir, file))
  }
}

function prepareShared(packageRoot: string, projectRoot: string) {
  console.log('Copying files')
  console.log(`  from ${packageRoot}`)
  console.log(`  to ${projectRoot}`)
  console.log('...')

  fsExtra.copySync(path.join(packageRoot, 'templates/shared'), projectRoot)
  copy(packageRoot, projectRoot, '', ['.editorconfig', '.eslintignore', '.gitattributes', '.npmignore'])
  if (fsExtra.existsSync(path.join(packageRoot, 'gitignore'))) {
    fsExtra.copySync(path.join(packageRoot, 'gitignore'), path.join(projectRoot, '.gitignore'))
  } else {
    fsExtra.copySync(path.join(packageRoot, '.gitignore'), path.join(projectRoot, '.gitignore'))
  }

  console.log()
}

function prepareBase(packageRoot: string, projectRoot: string) {
  prepareShared(packageRoot, projectRoot)
  copy(packageRoot, projectRoot, 'contracts', ['greeter_main.ral'])
  copy(packageRoot, projectRoot, 'contracts/greeter', ['greeter.ral', 'greeter_interface.ral'])
  fsExtra.copySync(path.join(packageRoot, 'templates/base'), projectRoot)
}

function prepareReact(packageRoot: string, projectRoot: string) {
  console.log('Creating the React app')
  execSync(`npx create-react-app ${projectRoot} --template typescript`)

  prepareShared(packageRoot, projectRoot)
  fsExtra.copySync(path.join(packageRoot, 'templates/react'), projectRoot)

  console.log('Initialize the project')
  execSync(
    'npm install --save-dev react-app-rewired crypto-browserify stream-browserify buffer process eslint-config-prettier eslint-plugin-header eslint-plugin-prettier eslint-plugin-react',
    { cwd: projectRoot }
  )
  execSync('npm install && npm run prettier', { cwd: projectRoot })
  console.log()
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
      prepareBase(packageRoot, projectRoot)
      break
    case 'react':
      prepareReact(packageRoot, projectRoot)
      break
  }

  console.log('✅ Done.')
  console.log()
  console.log('✨ Project is initialized!')
  console.log()
  console.log(`Next step: checkout the readme under <${projectRoot}>`)
  console.log()
}
