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

import { Val, decodeArrayType, toApiAddress, toApiBoolean, toApiByteVec, toApiNumber256, PrimitiveTypes } from '../api'
import { HexString, binToHex, bs58, hexToBinUnsafe, isHexString } from '../utils'
import { Fields, FieldsSig, Struct } from './contract'
import {
  AddressConstCode,
  BytesConstCode,
  byteStringCodec,
  ConstFalse,
  ConstTrue,
  i256Codec,
  i32Codec,
  instrCodec,
  u256Codec,
  toU256,
  toI256
} from '../codec'
import { boolCodec } from '../codec/codec'
import { TraceableError } from '../error'

export function encodeByteVec(hex: string): Uint8Array {
  if (!isHexString(hex)) {
    throw Error(`Given value ${hex} is not a valid hex string`)
  }

  const bytes = hexToBinUnsafe(hex)
  return byteStringCodec.encode(bytes)
}

export function encodeAddress(address: string): Uint8Array {
  return bs58.decode(address)
}

export enum VmValType {
  Bool = 0,
  I256 = 1,
  U256 = 2,
  ByteVec = 3,
  Address = 4
}

export function encodeVmBool(bool: boolean): Uint8Array {
  return new Uint8Array([VmValType.Bool, ...boolCodec.encode(bool)])
}

export function encodeVmI256(i256: bigint): Uint8Array {
  return new Uint8Array([VmValType.I256, ...i256Codec.encode(i256)])
}

export function encodeVmU256(u256: bigint): Uint8Array {
  return new Uint8Array([VmValType.U256, ...u256Codec.encode(u256)])
}

export function encodeVmByteVec(bytes: string): Uint8Array {
  return new Uint8Array([VmValType.ByteVec, ...encodeByteVec(bytes)])
}

export function encodeVmAddress(address: string): Uint8Array {
  return new Uint8Array([VmValType.Address, ...encodeAddress(address)])
}

export function boolVal(value: boolean): { type: 'Bool'; value: Val } {
  return { type: 'Bool', value }
}

export function i256Val(value: bigint | number): { type: 'I256'; value: Val } {
  return { type: 'I256', value: BigInt(value) }
}

export function u256Val(value: bigint | number): { type: 'U256'; value: Val } {
  return { type: 'U256', value: BigInt(value) }
}

export function byteVecVal(value: HexString): { type: 'ByteVec'; value: Val } {
  return { type: 'ByteVec', value }
}

export function addressVal(value: string): { type: 'Address'; value: Val } {
  return { type: 'Address', value }
}

export function encodePrimitiveValues(values: { type: string; value: Val }[]): Uint8Array {
  return encodeFields(values.map(({ type, value }) => ({ name: `${value}`, type, value })))
}

function invalidScriptField(tpe: string, value: Val): Error {
  return Error(`Invalid script field ${value} for type ${tpe}`)
}

function encodeScriptFieldI256(value: bigint): Uint8Array {
  return instrCodec.encode(toI256(value))
}

function encodeScriptFieldU256(value: bigint): Uint8Array {
  return instrCodec.encode(toU256(value))
}

export function encodeScriptFieldAsString(tpe: string, value: Val): string {
  return binToHex(encodeScriptField(tpe, value))
}

export function encodeScriptField(tpe: string, value: Val): Uint8Array {
  switch (tpe) {
    case 'Bool':
      const byte = toApiBoolean(value) ? ConstTrue.code : ConstFalse.code
      return new Uint8Array([byte])
    case 'I256':
      const i256 = toApiNumber256(value)
      return encodeScriptFieldI256(BigInt(i256))
    case 'U256':
      const u256 = toApiNumber256(value)
      return encodeScriptFieldU256(BigInt(u256))
    case 'Address':
      const address = toApiAddress(value)
      return new Uint8Array([AddressConstCode, ...encodeAddress(address)])
    default: // ByteVec or Contract
      const hexStr = toApiByteVec(value)
      return new Uint8Array([BytesConstCode, ...encodeByteVec(hexStr)])
  }

  throw invalidScriptField(tpe, value)
}

export function splitFields(fieldsSig: FieldsSig): [FieldsSig, FieldsSig] {
  return fieldsSig.types.reduce<[FieldsSig, FieldsSig]>(
    ([mapFields, fieldsExceptMaps], type, index) => {
      const fieldSig = type.startsWith('Map[') ? mapFields : fieldsExceptMaps
      fieldSig.names.push(fieldsSig.names[`${index}`])
      fieldSig.types.push(type)
      fieldSig.isMutable.push(fieldsSig.isMutable[`${index}`])
      return [mapFields, fieldsExceptMaps]
    },
    [
      { names: [], types: [], isMutable: [] },
      { names: [], types: [], isMutable: [] }
    ]
  )
}

export function parseMapType(type: string): [string, string] {
  if (!type.startsWith('Map[')) {
    throw new Error(`Expected map type, got ${type}`)
  }
  const keyStartIndex = type.indexOf('[')
  const keyEndIndex = type.indexOf(',')
  return [type.slice(keyStartIndex + 1, keyEndIndex), type.slice(keyEndIndex + 1, type.length - 1)]
}

export function encodeMapPrefix(mapIndex: number): Uint8Array {
  const str = `__map__${mapIndex}__`
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i += 1) {
    bytes[i] = str.charCodeAt(i)
  }
  return bytes
}

function fromAscii(str: string): string {
  let result = ''
  for (let i = 0; i < str.length; i += 2) {
    const ascii = parseInt(str.slice(i, i + 2), 16)
    result += String.fromCharCode(ascii)
  }
  return result
}

export function calcFieldSize(
  type: string,
  isMutable: boolean,
  structs: Struct[]
): { immFields: number; mutFields: number } {
  const struct = structs.find((s) => s.name === type)
  if (struct !== undefined) {
    return struct.fieldTypes.reduce(
      (acc, fieldType, index) => {
        const isFieldMutable = isMutable && struct.isMutable[`${index}`]
        const subFieldSize = calcFieldSize(fieldType, isFieldMutable, structs)
        return {
          immFields: acc.immFields + subFieldSize.immFields,
          mutFields: acc.mutFields + subFieldSize.mutFields
        }
      },
      { immFields: 0, mutFields: 0 }
    )
  }
  if (type.startsWith('[')) {
    const [baseType, size] = decodeArrayType(type)
    const base = calcFieldSize(baseType, isMutable, structs)
    return { immFields: base.immFields * size, mutFields: base.mutFields * size }
  }
  return isMutable ? { immFields: 0, mutFields: 1 } : { immFields: 1, mutFields: 0 }
}

export function tryDecodeMapDebugLog(
  message: string
): { path: string; mapIndex: number; encodedKey: Uint8Array; isInsert: boolean } | undefined {
  if (!message.startsWith('insert at map path: ') && !message.startsWith('remove at map path: ')) {
    return undefined
  }
  const parts = message.split(':')
  if (parts.length !== 2) return undefined
  const pathString = parts[1].slice(1)
  if (!isHexString(pathString)) return undefined

  const prefix = '5f5f6d61705f5f' // __map__
  const remain = pathString.slice(prefix.length)
  const suffix = '5f5f' // __
  const suffixIndex = remain.indexOf(suffix)
  if (suffixIndex === -1) return undefined

  const encodedMapIndex = remain.slice(0, suffixIndex)
  const mapIndex = parseInt(fromAscii(encodedMapIndex))
  const encodedKey = hexToBinUnsafe(remain.slice(suffixIndex + suffix.length))
  const isInsert = message.startsWith('insert')
  return { path: pathString, mapIndex, encodedKey, isInsert }
}

export function decodePrimitive(value: Uint8Array, type: string): Val {
  switch (type) {
    case 'Bool':
      return boolCodec.decode(value)
    case 'I256':
      return i256Codec.decode(value)
    case 'U256':
      return u256Codec.decode(value)
    case 'ByteVec':
      return binToHex(value)
    case 'Address':
      return bs58.encode(value)
    default:
      throw Error(`Expected primitive type, got ${type}`)
  }
}

export function encodeMapKey(value: Val, type: string): Uint8Array {
  switch (type) {
    case 'Bool':
      const byte = toApiBoolean(value) ? 1 : 0
      return new Uint8Array([byte])
    case 'I256':
      const i256 = toApiNumber256(value)
      return i256Codec.encode(BigInt(i256))
    case 'U256':
      const u256 = toApiNumber256(value)
      return u256Codec.encode(BigInt(u256))
    case 'ByteVec':
      const hexStr = toApiByteVec(value)
      return hexToBinUnsafe(hexStr)
    case 'Address':
      const address = toApiAddress(value)
      return encodeAddress(address)
    default:
      throw Error(`Expected primitive type, got ${type}`)
  }
}

export function typeLength(typ: string, structs: Struct[]): number {
  if (PrimitiveTypes.includes(typ)) {
    return 1
  }

  if (typ.startsWith('[')) {
    const [baseType, size] = decodeArrayType(typ)
    return size * typeLength(baseType, structs)
  }

  const struct = structs.find((s) => s.name === typ)
  if (struct !== undefined) {
    return struct.fieldTypes.reduce((acc, fieldType) => acc + typeLength(fieldType, structs), 0)
  }

  return 1
}

export function flattenFields(
  fields: Fields,
  names: string[],
  types: string[],
  isMutable: boolean[],
  structs: Struct[]
): { name: string; type: string; value: Val; isMutable: boolean }[] {
  return names.flatMap((name, index) => {
    if (!(name in fields)) {
      throw new Error(`The value of field ${name} is not provided`)
    }
    return flattenField(isMutable[`${index}`], name, types[`${index}`], fields[`${name}`], structs)
  })
}

function flattenField(
  isMutable: boolean,
  name: string,
  type: string,
  value: Val,
  structs: Struct[]
): { name: string; type: string; value: Val; isMutable: boolean }[] {
  if (Array.isArray(value) && type.startsWith('[')) {
    const [baseType, size] = decodeArrayType(type)
    if (value.length !== size) {
      throw Error(`Invalid array length, expected ${size}, got ${value.length}`)
    }
    return value.flatMap((item, index) => {
      return flattenField(isMutable, `${name}[${index}]`, baseType, item, structs)
    })
  }
  const struct = structs.find((s) => s.name === type)
  if (struct !== undefined) {
    if (typeof value !== 'object') {
      throw Error(`Expected an object, but got ${typeof value}`)
    }
    return struct.fieldNames.flatMap((fieldName, index) => {
      if (!(fieldName in value)) {
        throw new Error(`The value of field ${fieldName} is not provided`)
      }
      const isFieldMutable = struct.isMutable[`${index}`]
      const fieldType = struct.fieldTypes[`${index}`]
      const fieldValue = value[`${fieldName}`]
      return flattenField(isMutable && isFieldMutable, `${name}.${fieldName}`, fieldType, fieldValue, structs)
    })
  }
  const primitiveType = checkPrimitiveValue(name, type, value)
  return [{ name, type: primitiveType, value, isMutable }]
}

function checkPrimitiveValue(name: string, ralphType: string, value: Val): string {
  const tsType = typeof value
  if (ralphType === 'Bool' && tsType === 'boolean') {
    return ralphType
  }
  if (
    (ralphType === 'U256' || ralphType === 'I256') &&
    (tsType === 'string' || tsType === 'number' || tsType === 'bigint')
  ) {
    return ralphType
  }
  if ((ralphType === 'Address' || ralphType === 'ByteVec') && tsType === 'string') {
    return ralphType
  }
  if (!ralphType.startsWith('[') && tsType === 'string') {
    // contract type
    return 'ByteVec'
  }
  throw Error(`Invalid value ${value} for ${name}, expected a value of type ${ralphType}`)
}

const scriptFieldRegex = /\{([0-9]*)\}/g

export function buildScriptByteCode(
  bytecodeTemplate: string,
  fields: Fields,
  fieldsSig: FieldsSig,
  structs: Struct[]
): string {
  const allFields = flattenFields(fields, fieldsSig.names, fieldsSig.types, fieldsSig.isMutable, structs)
  return bytecodeTemplate.replace(scriptFieldRegex, (_, fieldIndex: string) => {
    const field = allFields[`${fieldIndex}`]
    return _encodeField(field.name, () => encodeScriptFieldAsString(field.type, field.value))
  })
}

function _encodeField<T>(fieldName: string, encodeFunc: () => T): T {
  try {
    return encodeFunc()
  } catch (error) {
    throw new TraceableError(`Failed to encode the field ${fieldName}`, error)
  }
}

function encodeFields(fields: { name: string; type: string; value: Val }[]): Uint8Array {
  const prefix = i32Codec.encode(fields.length)
  return fields.reduce((acc, field) => {
    const encoded = _encodeField(field.name, () => encodeContractField(field.type, field.value))
    const bytes = new Uint8Array(acc.byteLength + encoded.byteLength)
    bytes.set(acc, 0)
    bytes.set(encoded, acc.byteLength)
    return bytes
  }, prefix)
}

export function encodeContractFields(
  fields: Fields,
  fieldsSig: FieldsSig,
  structs: Struct[]
): { encodedImmFields: Uint8Array; encodedMutFields: Uint8Array } {
  const allFields = flattenFields(fields, fieldsSig.names, fieldsSig.types, fieldsSig.isMutable, structs)
  return {
    encodedImmFields: encodeFields(allFields.filter((f) => !f.isMutable)),
    encodedMutFields: encodeFields(allFields.filter((f) => f.isMutable))
  }
}

export function buildContractByteCode(
  bytecode: string,
  fields: Fields,
  fieldsSig: FieldsSig,
  structs: Struct[]
): string {
  const { encodedImmFields, encodedMutFields } = encodeContractFields(fields, fieldsSig, structs)
  return bytecode + binToHex(encodedImmFields) + binToHex(encodedMutFields)
}

export function encodeContractField(tpe: string, value: Val): Uint8Array {
  switch (tpe) {
    case 'Bool':
      return encodeVmBool(toApiBoolean(value))
    case 'I256':
      return encodeVmI256(BigInt(toApiNumber256(value)))
    case 'U256':
      return encodeVmU256(BigInt(toApiNumber256(value)))
    case 'ByteVec':
      return encodeVmByteVec(toApiByteVec(value))
    case 'Address':
      return encodeVmAddress(toApiAddress(value))
    default:
      throw Error(`Expected primitive type, got ${tpe}`)
  }
}

export function buildDebugBytecode(bytecode: string, bytecodePatch: string): string {
  if (bytecodePatch === '') {
    return bytecode
  }

  const pattern = /[=+-][0-9a-f]*/g
  let result = ''
  let index = 0
  for (const parts of bytecodePatch.matchAll(pattern)) {
    const part = parts[0]
    const diffType = part[0]
    if (diffType === '=') {
      const length = parseInt(part.substring(1))
      result = result + bytecode.slice(index, index + length)
      index = index + length
    } else if (diffType === '+') {
      result = result + part.substring(1)
    } else {
      const length = parseInt(part.substring(1))
      index = index + length
    }
  }
  return result
}

// export function buildContractByteCode(
//   compiled: node.TemplateContractByteCode,
//   templateVariables: TemplateVariables
// ): string {
//   const methodsBuilt = compiled.methodsByteCode.map((template) => buildByteCode(template, templateVariables))
//   let count = 0
//   const methodIndexes = methodsBuilt.map((hex) => {
//     count += hex.length / 2
//     return count
//   })
//   return (
//     binToHex(encodeI256(BigInt(compiled.filedLength))) +
//     binToHex(encodeI256(BigInt(methodIndexes.length))) +
//     methodIndexes.map((index) => binToHex(encodeI256(BigInt(index)))).join('') +
//     methodsBuilt.join('')
//   )
// }
