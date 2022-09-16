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
import path from 'path'
import fs from 'fs'
import { Configuration, DEFAULT_CONFIGURATION_VALUES } from '../types'

export async function loadConfig<Settings = unknown>(filename: string): Promise<Configuration<Settings>> {
  const configPath = path.resolve(filename)
  if (!fs.existsSync(configPath)) {
    throw new Error(`${configPath} does not exist`)
  }
  /* eslint-disable @typescript-eslint/no-var-requires */
  const content = require(path.resolve(configPath))
  /* eslint-enable @typescript-eslint/no-var-requires */
  if (!content.default) {
    throw new Error(`config file ${filename} have no default export`)
  }
  const configurationInput = content.default as Configuration<Settings>
  return { ...DEFAULT_CONFIGURATION_VALUES, ...configurationInput }
}

export function getConfigFile(): string {
  const projectRootPath = path.resolve(process.cwd())
  const tsConfig = path.join(projectRootPath, 'alephium.config.ts')
  if (fs.existsSync(tsConfig)) {
    return tsConfig
  }
  const jsConfig = path.join(projectRootPath, 'alephium.config.js')
  if (fs.existsSync(jsConfig)) {
    return jsConfig
  }
  throw new Error('no config file found')
}
