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

import { getParents, loadSourceInfos, buildDependencies } from './contract'

describe('contract', () => {
  it('should get parents', async () => {
    async function test(source: string) {
      const sourceInfos = await loadSourceInfos('', '', source, false)
      return getParents(sourceInfos)
    }

    expect(await test('Contract A() {}')).toEqual(new Map([['A', []]]))
    expect(await test('Contract A() extends B() {}')).toEqual(new Map([['A', ['B']]]))
    expect(await test('Contract A() extends B(), C() {}')).toEqual(new Map([['A', ['B', 'C']]]))
    expect(await test('Contract A() extends B(), C() implements D, E {}')).toEqual(
      new Map([['A', ['B', 'C', 'D', 'E']]])
    )
    expect(await test('Abstract Contract A() {}')).toEqual(new Map([['A', []]]))
    expect(await test('Abstract Contract A() extends B() {}')).toEqual(new Map([['A', ['B']]]))
    expect(await test('Abstract Contract A() extends B(), C() {}')).toEqual(new Map([['A', ['B', 'C']]]))
    expect(await test('Abstract Contract A() extends B(), C() implements D, E {}')).toEqual(
      new Map([['A', ['B', 'C', 'D', 'E']]])
    )
    expect(await test('Interface A extends B {}')).toEqual(new Map([['A', ['B']]]))
    expect(await test('Interface A extends B, C {}')).toEqual(new Map([['A', ['B', 'C']]]))
    const defs = [
      'Interface A {}',
      'Interface B implements A {}',
      'Abstract Contract C() {}',
      'Abstract Contract D(mut a: U256) extends C() {}',
      'Contract E(@unused mut a: U256, b: [U256; 2]) extends D(a) {}'
    ]
    expect(await test(defs.join('\n'))).toEqual(
      new Map([
        ['A', []],
        ['B', ['A']],
        ['C', []],
        ['D', ['C']],
        ['E', ['D']]
      ])
    )
  })

  it('should build dependencies', async () => {
    async function test(source: string) {
      const sourceInfos = await loadSourceInfos('', '', source, false)
      return buildDependencies(sourceInfos)
    }
    const defs0 = [
      'Interface A {}',
      'Interface B implements A {}',
      'Abstract Contract C() implements B {}',
      'Abstract Contract D(mut a: U256) extends C() {}',
      'Contract E(@unused mut a: U256, b: [U256; 2]) extends D(a) {}'
    ]
    expect(await test(defs0.join('\n'))).toEqual(
      new Map([
        ['A', []],
        ['B', ['A']],
        ['C', ['B', 'A']],
        ['D', ['C', 'B', 'A']],
        ['E', ['D', 'C', 'B', 'A']]
      ])
    )

    const defs1 = ['Interface A implements B {}', 'Interface B implements A {}']
    await expect(test(defs1.join('\n'))).rejects.toThrow('Circular dependency detected: A')
  })
})
