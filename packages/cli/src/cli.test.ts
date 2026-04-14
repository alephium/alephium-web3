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

import { execFileSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

const cliPath = path.resolve(__dirname, '..', 'cli.js')

function runCli(args: string[]): string {
  return execFileSync('node', [cliPath, ...args], {
    encoding: 'utf-8',
    timeout: 30_000
  })
}

describe('cli entry point', () => {
  it('loads without import errors and shows help', () => {
    const output = runCli(['--help'])
    expect(output).toContain('init')
    expect(output).toContain('compile')
    expect(output).toContain('test')
    expect(output).toContain('deploy')
  })

  it('shows help for each command without import errors', () => {
    const commands = ['init', 'compile', 'test', 'deploy', 'gen-interfaces', 'gen-ralph']
    for (const cmd of commands) {
      const output = runCli([cmd, '--help'])
      expect(output).toContain(cmd)
    }
  })

  it('init creates a project', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alph-cli-test-'))
    const projectDir = path.join(tmpDir, 'test-project')

    try {
      runCli(['init', projectDir])
      expect(fs.existsSync(projectDir)).toBe(true)
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
