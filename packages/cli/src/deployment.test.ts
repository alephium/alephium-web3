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

import { Deployments, DeploymentsPerAddress, recordEqual } from './deployment'

describe('deployments', () => {
  it('test record equal', () => {
    expect(recordEqual({ a: '10000' }, { a: '10000' })).toEqual(true)
    expect(recordEqual({ a: '10000', b: '20' }, { a: '10000', b: '20' })).toEqual(true)

    expect(recordEqual({ a: '10000' }, { b: '10000' })).toEqual(false)
    expect(recordEqual({ a: '10000', b: '20' }, { a: '10000' })).toEqual(false)
    expect(recordEqual({ a: '10000', b: '20' }, { a: '10000', b: '10' })).toEqual(false)
    expect(recordEqual({ a: '20000', b: '20' }, { a: '10000', b: '20' })).toEqual(false)
    expect(recordEqual({ a: '20000', b: '20' }, { a: '10000', b: '10' })).toEqual(false)
    expect(recordEqual({ a: '20000', b: '20' }, { c: '10000', d: '10' })).toEqual(false)
  })

  it('test if deployments is empty', () => {
    const deployments = Deployments.empty()
    expect(deployments.isEmpty()).toEqual(true)

    const deploymentsPerAddress0 = DeploymentsPerAddress.empty('Address0')
    expect(deploymentsPerAddress0.isEmpty()).toEqual(true)

    deployments.add(deploymentsPerAddress0)
    expect(deployments.isEmpty()).toEqual(true)

    deploymentsPerAddress0.contracts.set('Foo', undefined as any)
    expect(deploymentsPerAddress0.isEmpty()).toEqual(false)
    expect(deployments.isEmpty()).toEqual(false)

    deploymentsPerAddress0.contracts.clear()
    deploymentsPerAddress0.scripts.set('Foo', undefined as any)
    expect(deploymentsPerAddress0.isEmpty()).toEqual(false)
    expect(deployments.isEmpty()).toEqual(false)

    deploymentsPerAddress0.scripts.clear()
    deploymentsPerAddress0.migrations.set('Foo', 0)
    expect(deploymentsPerAddress0.isEmpty()).toEqual(false)
    expect(deployments.isEmpty()).toEqual(false)

    deployments.add(DeploymentsPerAddress.empty('Address1'))
    expect(deployments.isEmpty()).toEqual(false)
  })
})
