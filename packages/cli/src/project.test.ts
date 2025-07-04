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

import { DEFAULT_NODE_COMPILER_OPTIONS } from '@alephium/web3'
import { CodeInfo, ProjectArtifact } from './project'
import { SourceInfo } from './contract'

describe('project', () => {
  function newCodeInfo(hash: string): CodeInfo {
    return {
      sourceFile: '',
      sourceCodeHash: hash,
      bytecodeDebugPatch: '',
      codeHashDebug: ''
    }
  }

  function newSourceInfo(name: string, hash: string): SourceInfo {
    return new SourceInfo(0, name, undefined, '', hash, '', false)
  }

  it('should get changed sources', () => {
    const codes: Map<string, CodeInfo> = new Map([
      ['Foo', newCodeInfo('Foo')],
      ['Bar', newCodeInfo('Bar')],
      ['Baz', newCodeInfo('Baz')]
    ])
    const preArtifacts = new ProjectArtifact('', DEFAULT_NODE_COMPILER_OPTIONS, codes)
    const sources = [newSourceInfo('Foo', 'Foo1'), newSourceInfo('Bar', 'Bar1'), newSourceInfo('Baz', 'Baz')]
    expect(preArtifacts.getChangedSources(sources)).toEqual(['Foo', 'Bar'])
  })

  it('should get new added sources', () => {
    const codes: Map<string, CodeInfo> = new Map([['Foo', newCodeInfo('Foo')]])
    const preArtifacts = new ProjectArtifact('', DEFAULT_NODE_COMPILER_OPTIONS, codes)
    const sources = [newSourceInfo('Foo', 'Foo'), newSourceInfo('Bar', 'Bar'), newSourceInfo('Baz', 'Baz')]
    expect(preArtifacts.getChangedSources(sources)).toEqual(['Bar', 'Baz'])
  })

  it('should get removed sources', () => {
    const codes: Map<string, CodeInfo> = new Map([
      ['Foo', newCodeInfo('Foo')],
      ['Bar', newCodeInfo('Bar')],
      ['Baz', newCodeInfo('Baz')]
    ])
    const preArtifacts = new ProjectArtifact('', DEFAULT_NODE_COMPILER_OPTIONS, codes)
    const sources = [newSourceInfo('Bar', 'Bar')]
    expect(preArtifacts.getChangedSources(sources)).toEqual(['Foo', 'Baz'])
  })
})
