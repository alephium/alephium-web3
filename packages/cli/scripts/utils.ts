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
import { Configuration } from '../types'

let tsOutputDir: string | undefined

function getTsOutputDir(): string {
  if (tsOutputDir !== undefined) {
    return tsOutputDir
  }
  const projectRoot = path.resolve(process.cwd())
  const tsConfig = path.join(projectRoot, 'tsconfig.json')
  if (!fs.existsSync(tsConfig)) {
    throw new Error('typescript config file does not exist')
  }
  const content = fs.readFileSync(tsConfig).toString()
  const json = JSON.parse(content)
  if (json.compilerOptions.outDir === undefined) {
    throw new Error('please specify `outDir` in tsconfig.json')
  }
  const outDir = JSON.parse(content).compilerOptions.outDir as string
  tsOutputDir = path.join(projectRoot, outDir)
  return tsOutputDir
}

export function getOutputPath(filename: string): string {
  if (filename.endsWith('.ts')) {
    const projectRootPath = path.resolve(process.cwd())
    const fileFullpath = path.resolve(filename)
    const relativePath = path.relative(projectRootPath, fileFullpath)
    const jsFileRelativePath = relativePath.slice(0, -2) + 'js'
    const outputPath = path.join(getTsOutputDir(), jsFileRelativePath)
    if (!fs.existsSync(outputPath)) {
      throw new Error(`${outputPath} does not exist, please compile to javascript first`)
    }
    return outputPath
  } else if (filename.endsWith('.js')) {
    return path.resolve(filename)
  } else {
    throw new Error(`invalid config file ${filename}, expect typescript or javascript file`)
  }
}

export async function loadConfig<Settings = unknown>(filename: string): Promise<Configuration<Settings>> {
  const configPath = getOutputPath(filename)
  if (!fs.existsSync(configPath)) {
    throw new Error(`${configPath} does not exist`)
  }
  /* eslint-disable @typescript-eslint/no-var-requires */
  const content = require(path.resolve(configPath))
  /* eslint-enable @typescript-eslint/no-var-requires */
  if (!content.default) {
    throw new Error(`config file ${filename} have no default export`)
  }
  return content.default as Configuration<Settings>
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
