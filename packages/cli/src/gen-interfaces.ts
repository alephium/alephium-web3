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
import { Contract, decodeArrayType, PrimitiveTypes, Struct } from '@alephium/web3'
import { Project } from './project'
import { promises as fsPromises } from 'fs'

export async function genInterfaces(artifactDir: string, outDir: string) {
  const structs = await Project.loadStructs(artifactDir)
  const contracts = await loadContracts(artifactDir, structs)
  const structNames = structs.map((s) => s.name)
  const contractNames = contracts.map((c) => c.name)
  const interfaceDefs = contracts.map((c) => genInterface(c, structNames, contractNames))

  const outPath = path.resolve(outDir)
  await fsPromises.rm(outPath, { recursive: true, force: true })
  await fsPromises.mkdir(outPath, { recursive: true })
  for (const i of interfaceDefs) {
    const filePath = path.join(outPath, `${i.name}.ral`)
    await saveToFile(filePath, i.def)
  }
  if (structs.length > 0) {
    const structDefs = genStructs(structs, structNames, contractNames)
    await saveToFile(path.join(outPath, 'structs.ral'), structDefs)
  }
}

async function saveToFile(filePath: string, content: string) {
  await fsPromises.writeFile(filePath, content, 'utf-8')
}

function genInterface(contract: Contract, structNames: string[], contractNames: string[]) {
  const interfaceName = `I${contract.name}`
  const functions: string[] = []
  let publicFuncIndex = 0
  contract.functions.forEach((funcSig, index) => {
    const method = contract.decodedContract.methods[`${index}`]
    if (!method.isPublic) return
    const usingAnnotations: string[] = []
    if (publicFuncIndex !== index) usingAnnotations.push(`methodIndex = ${index}`)
    if (method.useContractAssets) usingAnnotations.push('assetsInContract = true')
    if (method.usePreapprovedAssets) usingAnnotations.push('preapprovedAssets = true')
    if (method.usePayToContractOnly) usingAnnotations.push('payToContractOnly = true')
    const annotation = usingAnnotations.length === 0 ? '' : `@using(${usingAnnotations.join(', ')})`

    const params = funcSig.paramNames.map((paramName, index) => {
      const type = getType(funcSig.paramTypes[`${index}`], structNames, contractNames)
      const isMutable = funcSig.paramIsMutable[`${index}`]
      return isMutable ? `mut ${paramName}: ${type}` : `${paramName}: ${type}`
    })
    const rets = funcSig.returnTypes.map((type) => getType(type, structNames, contractNames))
    const result = `
      ${annotation}
      pub fn ${funcSig.name}(${params.join(', ')}) -> (${rets.join(', ')})
    `
    functions.push(result.trim())
    publicFuncIndex += 1
  })
  const interfaceDef = format(
    `@using(methodSelector = false)
    Interface ${interfaceName} {
      ${functions.join('\n\n')}
    }`,
    3
  )
  return { name: interfaceName, def: interfaceDef }
}

function getType(typeName: string, structNames: string[], contractNames: string[]): string {
  if (PrimitiveTypes.includes(typeName)) return typeName
  if (typeName.startsWith('[')) {
    const [baseType, size] = decodeArrayType(typeName)
    return `[${getType(baseType, structNames, contractNames)}; ${size}]`
  }
  if (structNames.includes(typeName)) return typeName
  if (contractNames.includes(typeName)) return `I${typeName}`
  // We currently do not generate artifacts for interface types, so when a function
  // param/ret is of an interface type, we use `ByteVec` as the param/ret type
  return 'ByteVec'
}

function genStructs(structs: Struct[], structNames: string[], contractNames: string[]) {
  const structDefs = structs.map((s) => {
    const fields = s.fieldNames.map((fieldName, index) => {
      const fieldType = getType(s.fieldTypes[`${index}`], structNames, contractNames)
      const isMutable = s.isMutable[`${index}`]
      return isMutable ? `mut ${fieldName}: ${fieldType}` : `${fieldName}: ${fieldType}`
    })
    return format(
      `struct ${s.name} {
        ${fields.join(',\n')}
      }`,
      2
    )
  })
  return structDefs.join('\n\n')
}

function format(str: string, lineToIndentFrom: number): string {
  const padding = '  ' // 2 spaces
  const lines = str.trim().split('\n')
  return lines
    .map((line, index) => {
      const newLine = line.trim()
      if (index < lineToIndentFrom - 1 || index === lines.length - 1) {
        return newLine
      } else if (newLine.length === 0) {
        return line
      } else {
        return padding + newLine
      }
    })
    .join('\n')
}

async function loadContracts(artifactDir: string, structs: Struct[]) {
  const contracts: Contract[] = []
  const load = async function (dirPath: string): Promise<void> {
    const dirents = await fsPromises.readdir(dirPath, { withFileTypes: true })
    for (const dirent of dirents) {
      if (dirent.isFile()) {
        const artifactPath = path.join(dirPath, dirent.name)
        const contract = await getContractFromArtifact(artifactPath, structs)
        if (contract !== undefined) contracts.push(contract)
      } else {
        const newPath = path.join(dirPath, dirent.name)
        await load(newPath)
      }
    }
  }
  await load(artifactDir)
  return contracts
}

async function getContractFromArtifact(filePath: string, structs: Struct[]): Promise<Contract | undefined> {
  if (!filePath.endsWith('.ral.json')) return undefined
  if (filePath.endsWith(Project.structArtifactFileName) || filePath.endsWith(Project.constantArtifactFileName)) {
    return undefined
  }
  const content = await fsPromises.readFile(filePath)
  const artifact = JSON.parse(content.toString())
  if ('bytecodeTemplate' in artifact) return undefined
  try {
    return Contract.fromJson(artifact, '', '', structs)
  } catch (error) {
    console.error(`Failed to load contract from artifact ${filePath}: `, error)
    return undefined
  }
}
