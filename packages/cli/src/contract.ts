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

import { WebCrypto } from '@alephium/web3'
import * as path from 'path'

const crypto = new WebCrypto()

export enum SourceKind {
  Contract = 0,
  Script = 1,
  AbstractContract = 2,
  Interface = 3,
  Struct = 4,
  Constants = 5
}

class TypedMatcher<T extends SourceKind> {
  matcher: RegExp
  type: T

  constructor(pattern: string, type: T) {
    this.matcher = new RegExp(pattern, 'mg')
    this.type = type
  }
}

function removeParentsPrefix(parts: string[]): string {
  let index = 0
  for (let i = 0; i < parts.length; i++) {
    if (parts[`${i}`] === '..') {
      index += 1
    } else {
      break
    }
  }
  return path.join(...parts.slice(index))
}

export class SourceInfo {
  type: SourceKind
  name: string
  contractRelativePath: string
  sourceCode: string
  sourceCodeHash: string
  isExternal: boolean

  getArtifactPath(artifactsRootDir: string): string {
    let fullPath: string
    if (this.isExternal) {
      const relativePath = removeParentsPrefix(this.contractRelativePath.split(path.sep))
      const externalPath = path.join('.external', relativePath)
      fullPath = path.join(artifactsRootDir, externalPath)
    } else {
      fullPath = path.join(artifactsRootDir, this.contractRelativePath)
    }
    return path.join(path.dirname(fullPath), `${this.name}.ral.json`)
  }

  constructor(
    type: SourceKind,
    name: string,
    sourceCode: string,
    sourceCodeHash: string,
    contractRelativePath: string,
    isExternal: boolean
  ) {
    this.type = type
    this.name = name
    this.sourceCode = sourceCode
    this.sourceCodeHash = sourceCodeHash
    this.contractRelativePath = contractRelativePath
    this.isExternal = isExternal
  }

  static async from(
    type: SourceKind,
    name: string,
    sourceCode: string,
    contractRelativePath: string,
    isExternal: boolean
  ): Promise<SourceInfo> {
    const sourceCodeHash = await crypto.subtle.digest('SHA-256', Buffer.from(sourceCode))
    const sourceCodeHashHex = Buffer.from(sourceCodeHash).toString('hex')
    return new SourceInfo(type, name, sourceCode, sourceCodeHashHex, contractRelativePath, isExternal)
  }
}

const abstractContractMatcher = new TypedMatcher<SourceKind>(
  '^Abstract Contract ([A-Z][a-zA-Z0-9]*)',
  SourceKind.AbstractContract
)
const contractMatcher = new TypedMatcher('^Contract ([A-Z][a-zA-Z0-9]*)', SourceKind.Contract)
const interfaceMatcher = new TypedMatcher('^Interface ([A-Z][a-zA-Z0-9]*)', SourceKind.Interface)
const scriptMatcher = new TypedMatcher('^TxScript ([A-Z][a-zA-Z0-9]*)', SourceKind.Script)
const structMatcher = new TypedMatcher('struct ([A-Z][a-zA-Z0-9]*)', SourceKind.Struct)
const matchers = [abstractContractMatcher, contractMatcher, interfaceMatcher, scriptMatcher, structMatcher]

export async function loadSourceInfos(
  relativePath: string,
  sourcePath: string,
  sourceCode: string,
  isExternal: boolean
): Promise<SourceInfo[]> {
  let isConstantsFile = true
  const sourceInfos: SourceInfo[] = []
  for (const matcher of matchers) {
    const results = Array.from(sourceCode.matchAll(matcher.matcher))
    if (isConstantsFile) isConstantsFile = results.length === 0
    for (const result of results) {
      const sourceInfo = await SourceInfo.from(matcher.type, result[1], sourceCode, relativePath, isExternal)
      sourceInfos.push(sourceInfo)
    }
  }
  if (isConstantsFile) {
    const name = path.basename(sourcePath, path.extname(sourcePath))
    sourceInfos.push(await SourceInfo.from(SourceKind.Constants, name, sourceCode, relativePath, false))
  }
  return sourceInfos
}
