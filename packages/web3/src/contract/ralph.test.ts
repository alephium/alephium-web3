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

import * as ralph from './ralph'
import * as utils from '../utils'
import { Fields, FieldsSig, Struct, fromApiArray, fromApiEventFields, fromApiFields, getDefaultValue } from './contract'
import { node } from '..'

describe('contract', function () {
  it('should encode I256', () => {
    function test(i256: bigint, expected: string) {
      expect(utils.binToHex(ralph.encodeI256(i256))).toEqual(expected)
    }
    test(BigInt('0'), '00')
    test(BigInt('1'), '01')
    test(BigInt('2'), '02')
    test(BigInt('-1'), '3f')
    test(BigInt('-2'), '3e')
    test(BigInt('32'), '4020')
    test(BigInt('33'), '4021')
    test(BigInt('34'), '4022')
    test(BigInt('31'), '1f')
    test(BigInt('30'), '1e')
    test(BigInt('8192'), '80002000')
    test(BigInt('8193'), '80002001')
    test(BigInt('8194'), '80002002')
    test(BigInt('8191'), '5fff')
    test(BigInt('8190'), '5ffe')
    test(BigInt('536870912'), 'c020000000')
    test(BigInt('536870913'), 'c020000001')
    test(BigInt('536870914'), 'c020000002')
    test(BigInt('536870911'), '9fffffff')
    test(BigInt('536870910'), '9ffffffe')
    test(
      BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819967'),
      'dc7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
    test(
      BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819966'),
      'dc7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe'
    )
    test(
      BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819965'),
      'dc7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd'
    )
    test(
      BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819968'),
      'dc8000000000000000000000000000000000000000000000000000000000000000'
    )
    test(
      BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819967'),
      'dc8000000000000000000000000000000000000000000000000000000000000001'
    )
    test(
      BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819966'),
      'dc8000000000000000000000000000000000000000000000000000000000000002'
    )

    function fail(n: bigint) {
      expect(() => ralph.encodeI256(n)).toThrow()
    }
    fail(BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819968'))
    fail(BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819969'))
    fail(BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819969'))
    fail(BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819970'))
  })

  it('should encode U256', () => {
    function test(u256: bigint, expected: string) {
      expect(utils.binToHex(ralph.encodeU256(u256))).toEqual(expected)
    }
    test(BigInt('0'), '00')
    test(BigInt('1'), '01')
    test(BigInt('2'), '02')
    fail(BigInt('-1'))
    fail(BigInt('-2'))
    test(BigInt('64'), '4040')
    test(BigInt('65'), '4041')
    test(BigInt('66'), '4042')
    test(BigInt('63'), '3f')
    test(BigInt('62'), '3e')
    test(BigInt('16384'), '80004000')
    test(BigInt('16385'), '80004001')
    test(BigInt('16386'), '80004002')
    test(BigInt('16383'), '7fff')
    test(BigInt('16382'), '7ffe')
    test(BigInt('1073741824'), 'c040000000')
    test(BigInt('1073741825'), 'c040000001')
    test(BigInt('1073741826'), 'c040000002')
    test(BigInt('1073741823'), 'bfffffff')
    test(BigInt('1073741822'), 'bffffffe')
    test(
      BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'),
      'dcffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
    test(
      BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639934'),
      'dcfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe'
    )
    test(
      BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639933'),
      'dcfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd'
    )

    function fail(n: bigint) {
      expect(() => ralph.encodeU256(n)).toThrow()
    }
    fail(BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639936'))
    fail(BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639937'))
  })

  it('should encode ByteVec', () => {
    const bytes = 'b382fc88aa31d63f4c2f3f8a03715ba2a629552e85431fb1c1d909bab46d1aae'
    const bytecode = ralph.encodeScriptFieldAsString('ByteVec', bytes)
    expect(bytecode).toEqual('144020b382fc88aa31d63f4c2f3f8a03715ba2a629552e85431fb1c1d909bab46d1aae')
  })

  it('should encode Contract Type', () => {
    const bytes = 'b382fc88aa31d63f4c2f3f8a03715ba2a629552e85431fb1c1d909bab46d1aae'
    const bytecode = ralph.encodeScriptFieldAsString('TestToken', bytes)
    expect(bytecode).toEqual('144020b382fc88aa31d63f4c2f3f8a03715ba2a629552e85431fb1c1d909bab46d1aae')
  })

  it('should flatten script fields', () => {
    const fields: Fields = {
      numbers0: [
        [0n, 1n],
        [2n, 3n]
      ],
      numbers1: [0n, 1n, 2n],
      address: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3',
      bytes: '0011'
    }
    const fieldsSig: FieldsSig = {
      names: ['address', 'numbers0', 'bytes', 'numbers1'],
      types: ['Address', '[[U256;2];2]', 'ByteVec', '[U256;3]'],
      isMutable: [false, false, false, false]
    }
    const result = ralph.flattenFields(fields, fieldsSig.names, fieldsSig.types, fieldsSig.isMutable, [])
    expect(result).toEqual([
      {
        isMutable: false,
        name: 'address',
        type: 'Address',
        value: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3'
      },
      { isMutable: false, name: 'numbers0[0][0]', type: 'U256', value: 0n },
      { isMutable: false, name: 'numbers0[0][1]', type: 'U256', value: 1n },
      { isMutable: false, name: 'numbers0[1][0]', type: 'U256', value: 2n },
      { isMutable: false, name: 'numbers0[1][1]', type: 'U256', value: 3n },
      { isMutable: false, name: 'bytes', type: 'ByteVec', value: '0011' },
      { isMutable: false, name: 'numbers1[0]', type: 'U256', value: 0n },
      { isMutable: false, name: 'numbers1[1]', type: 'U256', value: 1n },
      { isMutable: false, name: 'numbers1[2]', type: 'U256', value: 2n }
    ])

    const invalidFields0 = { ...fields, numbers0: [0n, 1n] }
    expect(() =>
      ralph.flattenFields(invalidFields0, fieldsSig.names, fieldsSig.types, fieldsSig.isMutable, [])
    ).toThrow('Invalid value 0 for numbers0[0], expected a value of type [U256;2]')
    const invalidFields1 = { ...fields, numbers1: [[0n], [1n], [2n]] }
    expect(() =>
      ralph.flattenFields(invalidFields1, fieldsSig.names, fieldsSig.types, fieldsSig.isMutable, [])
    ).toThrow('Invalid value 0 for numbers1[0], expected a value of type U256')
  })

  class StructFixture {
    static foo = new Struct('Foo', ['a', 'b'], ['U256', 'U256'], [false, true])
    static bar = new Struct('Bar', ['x', 'y'], ['U256', '[Foo;3]'], [true, true])
    static structs = [StructFixture.foo, StructFixture.bar]
    static fieldsSig: FieldsSig = {
      names: ['id', 'bar', 'name'],
      types: ['ByteVec', 'Bar', 'ByteVec'],
      isMutable: [false, true, false]
    }
    static fields: Fields = {
      bar: {
        x: 0n,
        y: [
          { a: 1n, b: 2n },
          { a: 2n, b: 3n },
          { a: 3n, b: 4n }
        ]
      },
      id: '0011',
      name: '0022'
    }
  }
  it('should flatten nested structs', () => {
    const { names, types, isMutable } = StructFixture.fieldsSig
    const result = ralph.flattenFields(StructFixture.fields, names, types, isMutable, StructFixture.structs)
    expect(result).toEqual([
      { name: 'id', type: 'ByteVec', value: '0011', isMutable: false },
      { name: 'bar.x', type: 'U256', value: 0n, isMutable: true },
      { name: 'bar.y[0].a', type: 'U256', value: 1n, isMutable: false },
      { name: 'bar.y[0].b', type: 'U256', value: 2n, isMutable: true },
      { name: 'bar.y[1].a', type: 'U256', value: 2n, isMutable: false },
      { name: 'bar.y[1].b', type: 'U256', value: 3n, isMutable: true },
      { name: 'bar.y[2].a', type: 'U256', value: 3n, isMutable: false },
      { name: 'bar.y[2].b', type: 'U256', value: 4n, isMutable: true },
      { name: 'name', type: 'ByteVec', value: '0022', isMutable: false }
    ])
  })

  it('should decode contract fields', () => {
    const immFields: node.Val[] = [
      { value: '0011', type: 'ByteVec' },
      { value: '1', type: 'U256' },
      { value: '2', type: 'U256' },
      { value: '3', type: 'U256' },
      { value: '0022', type: 'ByteVec' }
    ]
    const mutFields: node.Val[] = [
      { value: '0', type: 'U256' },
      { value: '2', type: 'U256' },
      { value: '3', type: 'U256' },
      { value: '4', type: 'U256' }
    ]
    const result = fromApiFields(immFields, mutFields, StructFixture.fieldsSig, StructFixture.structs)
    expect(result).toEqual(StructFixture.fields)
  })

  it('should get default value by fields signature', () => {
    const result = getDefaultValue(StructFixture.fieldsSig, StructFixture.structs)
    expect(result).toEqual({
      id: '',
      bar: {
        x: 0n,
        y: [
          { a: 0n, b: 0n },
          { a: 0n, b: 0n },
          { a: 0n, b: 0n }
        ]
      },
      name: ''
    })
  })

  it('should decode function returns', () => {
    const types = ['U256', StructFixture.bar.name]
    const values: node.Val[] = Array.from(Array(8).keys()).map((_, index) => ({ value: `${index}`, type: 'U256' }))
    const result = fromApiArray(values, types, StructFixture.structs)
    expect(result).toEqual([
      0n,
      {
        x: 1n,
        y: [
          { a: 2n, b: 3n },
          { a: 4n, b: 5n },
          { a: 6n, b: 7n }
        ]
      }
    ])
  })

  it('should decode events', () => {
    // currently events does not support array and struct
    const eventSig: node.EventSig = {
      name: 'Foo',
      fieldTypes: ['U256', 'ByteVec', 'Bool', 'Address'],
      fieldNames: ['number', 'id', 'flag', 'address']
    }
    const values: node.Val[] = [
      { type: 'U256', value: '1' },
      { type: 'ByteVec', value: '0022' },
      { type: 'Bool', value: true },
      { type: 'Address', value: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3' }
    ]
    const result = fromApiEventFields(values, eventSig)
    expect(result).toEqual({
      number: 1n,
      id: '0022',
      flag: true,
      address: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3'
    })
  })

  it('should filter out map fields', () => {
    const fieldsSig0: node.FieldsSig = {
      names: ['foo', 'number', 'map'],
      types: ['Foo', 'U256', 'Map[U256, Foo]'],
      isMutable: [false, true, true]
    }
    expect(ralph.splitFields(fieldsSig0)).toEqual([
      {
        names: ['map'],
        types: ['Map[U256, Foo]'],
        isMutable: [true]
      },
      {
        names: ['foo', 'number'],
        types: ['Foo', 'U256'],
        isMutable: [false, true]
      }
    ])
    const fieldsSig1: node.FieldsSig = {
      names: ['foo', 'number'],
      types: ['Foo', 'U256'],
      isMutable: [false, true]
    }
    expect(ralph.splitFields(fieldsSig1)).toEqual([
      {
        names: [],
        types: [],
        isMutable: []
      },
      {
        names: ['foo', 'number'],
        types: ['Foo', 'U256'],
        isMutable: [false, true]
      }
    ])
    const fieldsSig2: node.FieldsSig = {
      names: ['map'],
      types: ['Map[U256, Foo]'],
      isMutable: [true]
    }
    expect(ralph.splitFields(fieldsSig2)).toEqual([
      {
        names: ['map'],
        types: ['Map[U256, Foo]'],
        isMutable: [true]
      },
      {
        names: [],
        types: [],
        isMutable: []
      }
    ])
  })

  it('should parse map type', () => {
    expect(ralph.parseMapType('Map[U256,U256]')).toEqual(['U256', 'U256'])
    expect(ralph.parseMapType('Map[ByteVec,Foo]')).toEqual(['ByteVec', 'Foo'])
    expect(() => ralph.parseMapType('[Foo;2]')).toThrow()
    expect(() => ralph.parseMapType('U256')).toThrow()
  })

  it('should decode map debug message', () => {
    expect(ralph.tryDecodeMapDebugLog('5f5f6d61705f5f')).toEqual(undefined)
    expect(ralph.tryDecodeMapDebugLog('5f5f6d61705f5f,false')).toEqual(undefined)
    expect(ralph.tryDecodeMapDebugLog('5f5f6d6170,false')).toEqual(undefined)
    const result0 = ralph.tryDecodeMapDebugLog(
      '5f5f6d61705f5f305f5f00066fb0c875e171612b2da9135756faed416696b184d06d93a32f894e84f9e28a,true'
    )
    expect(result0).toEqual({
      path: '5f5f6d61705f5f305f5f00066fb0c875e171612b2da9135756faed416696b184d06d93a32f894e84f9e28a',
      mapIndex: 0,
      encodedKey: utils.hexToBinUnsafe('00066fb0c875e171612b2da9135756faed416696b184d06d93a32f894e84f9e28a'),
      isInsert: true
    })
    const result1 = ralph.tryDecodeMapDebugLog('5f5f6d61705f5f315f5f00ec3d,false')
    expect(result1).toEqual({
      path: '5f5f6d61705f5f315f5f00ec3d',
      mapIndex: 1,
      encodedKey: utils.hexToBinUnsafe('00ec3d'),
      isInsert: false
    })
  })

  it('should test buildScriptByteCode', () => {
    const variables = { x: true, y: 0x05n, z: 'ff', a: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3' }
    const fieldsSig: FieldsSig = {
      names: ['x', 'y', 'z', 'a'],
      types: ['Bool', 'U256', 'ByteVec', 'Address'],
      isMutable: [false, false, false, false]
    }
    const bytecode = ralph.buildScriptByteCode('-{0}-{1}-{2}-{3}-', variables, fieldsSig, [])
    expect(bytecode).toEqual('-03-1305-1401ff-1500a3cd757be03c7dac8d48bf79e2a7d6e735e018a9c054b99138c7b29738c437ec-')
  })

  it('should test buildContractByteCode', () => {
    const fields: Fields = {
      a: -1n,
      b: 1n,
      c: '23',
      d: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3',
      e: [false, true]
    }
    const fieldsSig: FieldsSig = {
      names: ['a', 'b', 'c', 'd', 'e'],
      types: ['I256', 'U256', 'ByteVec', 'Address', '[Bool;2]'],
      isMutable: [false, true, false, true, false]
    }
    const encoded = ralph.buildContractByteCode('ff', fields, fieldsSig, [])
    expect(encoded).toEqual(
      'ff04013f030123000000010202010400a3cd757be03c7dac8d48bf79e2a7d6e735e018a9c054b99138c7b29738c437ec'
    )
  })

  it('should test buildDebugBytecode', () => {
    const bytecode = '0701402901010707061005a000a001a003a00461b413c40de0b6b3a7640000a916011602160316041605160602'
    const patch = '=7-1+e=11-1+1=20+7e01027878=50'
    const debugBytecode = ralph.buildDebugBytecode(bytecode, patch)
    expect(debugBytecode).toEqual(
      '0701402e01010707061105a000a001a003a004617e01027878b413c40de0b6b3a7640000a916011602160316041605160602'
    )
  })

  it('should encode VM values', () => {
    const bool = ralph.encodeVmBool(true)
    expect(utils.binToHex(bool)).toEqual('0001')

    const i256 = ralph.encodeVmI256(1n)
    expect(utils.binToHex(i256)).toEqual('0101')

    const u256 = ralph.encodeVmU256(1n)
    expect(utils.binToHex(u256)).toEqual('0201')

    const byteVec = ralph.encodeVmByteVec('ff')
    expect(utils.binToHex(byteVec)).toEqual('0301ff')

    const address = ralph.encodeVmAddress('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH')
    expect(utils.binToHex(address)).toEqual('0400bee85f379545a2ed9f6cceb331288842f378cf0f04012ad4ac8824aae7d6f80a')
  })

  // it('should test buildByteCode', async () => {
  //   const compiled = {
  //     type: 'TemplateContractByteCode',
  //     filedLength: 1,
  //     methodsByteCode: [
  //       '01000203021205160016015f{subContractId:ByteVec}1702a00016002a16012aa100a000160016011602010002',
  //       '00000202020416001601000002'
  //     ]
  //   }
  //   const variables = { subContractId: '55834baf25f40fe5a8d6ac83c5f2b76a1677ed3ddbd6a79c4dea274992982e2b' }
  //   const bytecode = ralph.buildContractByteCode(compiled, variables)
  //   expect(bytecode).toEqual(
  //     '01024046405301000203021205160016015f14402055834baf25f40fe5a8d6ac83c5f2b76a1677ed3ddbd6a79c4dea274992982e2b1702a00016002a16012aa100a00016001601160201000200000202020416001601000002'
  //   )
  // })
})
