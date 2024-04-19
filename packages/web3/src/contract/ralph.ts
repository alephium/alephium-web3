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

import { Buffer } from 'buffer/'
import { Val, decodeArrayType, toApiAddress, toApiBoolean, toApiByteVec, toApiNumber256, PrimitiveTypes } from '../api'
import { binToHex, bs58, hexToBinUnsafe, isHexString } from '../utils'
import { Fields, FieldsSig, Struct } from './contract'
import { compactSignedIntCodec, compactUnsignedIntCodec } from '../codec'
import { lockupScriptCodec } from '../codec/lockup-script-codec'

const bigIntZero = BigInt(0)

class UnSigned {
  static readonly oneByteBound = BigInt(0x40)
  static readonly twoByteBound = UnSigned.oneByteBound << BigInt(8)
  static readonly fourByteBound = UnSigned.oneByteBound << BigInt(8 * 3)
  static readonly u256UpperBound = BigInt(1) << BigInt(256)
}

class Signed {
  static readonly oneByteBound = BigInt(0x20)
  static readonly twoByteBound = Signed.oneByteBound << BigInt(8)
  static readonly fourByteBound = Signed.oneByteBound << BigInt(8 * 3)
  static readonly i256UpperBound = BigInt(1) << BigInt(255)
  static readonly i256LowerBound = -this.i256UpperBound
}

class CompactInt {
  static readonly oneBytePrefix = 0x00
  static readonly oneByteNegPrefix = 0xc0
  static readonly twoBytePrefix = 0x40
  static readonly twoByteNegPrefix = 0x80
  static readonly fourBytePrefix = 0x80
  static readonly fourByteNegPrefix = 0x40
  static readonly multiBytePrefix = 0xc0
}

export function encodeBool(bool: boolean): Uint8Array {
  return bool ? Uint8Array.from([1]) : Uint8Array.from([0])
}

export function decodeBool(bytes: Uint8Array): boolean {
  if (bytes.length !== 1) {
    throw new Error(`Expected one byte for encoded bool, got ${bytes.length}`)
  }
  return bytes[0] === 1 ? true : false
}

export function encodeI256(i256: bigint): Uint8Array {
  if (i256 >= bigIntZero) {
    return encodeI256Positive(i256)
  } else {
    return encodeI256Negative(i256)
  }
}

// n should be positive
function toByteArray(n: bigint, signed: boolean, notBit: boolean): Uint8Array {
  let hex = n.toString(16)
  if (hex.length % 2 === 1) {
    hex = '0' + hex
  } else if (signed && hex[0] >= '8') {
    hex = '00' + hex // add the byte for sign
  }

  const byteLength = hex.length / 2
  const bytes = new Uint8Array(byteLength + 1)
  for (let index = 0; index < byteLength; index++) {
    const offset = index * 2
    const byte = parseInt(hex.slice(offset, offset + 2), 16)
    bytes[`${index + 1}`] = notBit ? ~byte : byte
  }

  const header = byteLength - 4 + CompactInt.multiBytePrefix
  bytes[0] = header
  return bytes
}

function encodeI256Positive(i256: bigint): Uint8Array {
  if (i256 < Signed.oneByteBound) {
    return new Uint8Array([Number(i256) + CompactInt.oneBytePrefix])
  } else if (i256 < Signed.twoByteBound) {
    const num = Number(i256)
    return new Uint8Array([(num >> 8) + CompactInt.twoBytePrefix, num & 0xff])
  } else if (i256 < Signed.fourByteBound) {
    const num = Number(i256)
    return new Uint8Array([(num >> 24) + CompactInt.fourBytePrefix, (num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff])
  } else if (i256 < Signed.i256UpperBound) {
    return toByteArray(i256, true, false)
  } else {
    throw Error(`Too large number for i256: ${i256}`)
  }
}

function encodeI256Negative(i256: bigint): Uint8Array {
  if (i256 >= -Signed.oneByteBound) {
    const num = Number(i256)
    return new Uint8Array([(num ^ CompactInt.oneByteNegPrefix) & 0xff])
  } else if (i256 >= -Signed.twoByteBound) {
    const num = Number(i256)
    return new Uint8Array([((num >> 8) ^ CompactInt.twoByteNegPrefix) & 0xff, num & 0xff])
  } else if (i256 >= -Signed.fourByteBound) {
    const num = Number(i256)
    return new Uint8Array([
      ((num >> 24) ^ CompactInt.fourByteNegPrefix) & 0xff,
      (num >> 16) & 0xff,
      (num >> 8) & 0xff,
      num & 0xff
    ])
  } else if (i256 >= Signed.i256LowerBound) {
    return toByteArray(~i256, true, true)
  } else {
    throw Error(`Too small number for i256: ${i256}`)
  }
}

export function encodeU256(u256: bigint): Uint8Array {
  if (u256 < bigIntZero) {
    throw Error(`Negative number for U256: ${u256}`)
  } else if (u256 < UnSigned.oneByteBound) {
    return new Uint8Array([Number(u256) + CompactInt.oneBytePrefix])
  } else if (u256 < UnSigned.twoByteBound) {
    const num = Number(u256)
    return new Uint8Array([((num >> 8) & 0xff) + CompactInt.twoBytePrefix, num & 0xff])
  } else if (u256 < UnSigned.fourByteBound) {
    const num = Number(u256)
    return new Uint8Array([
      ((num >> 24) & 0xff) + CompactInt.fourBytePrefix,
      (num >> 16) & 0xff,
      (num >> 8) & 0xff,
      num & 0xff
    ])
  } else if (u256 < UnSigned.u256UpperBound) {
    return toByteArray(u256, false, false)
  } else {
    throw Error(`Too large number for U256: ${u256}`)
  }
}

export function encodeByteVec(bytes: string): Uint8Array {
  if (!isHexString(bytes)) {
    throw Error(`Given value ${bytes} is not a valid hex string`)
  }

  const buffer0 = Buffer.from(bytes, 'hex')
  const buffer1 = Buffer.from(encodeI256(BigInt(buffer0.length)))
  return Buffer.concat([buffer1, buffer0])
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
  return Buffer.concat([encodeU256(BigInt(VmValType.Bool)), encodeBool(bool)])
}

export function encodeVmI256(i256: bigint): Uint8Array {
  return Buffer.concat([encodeU256(BigInt(VmValType.I256)), encodeI256(i256)])
}

export function encodeVmU256(u256: bigint): Uint8Array {
  return Buffer.concat([encodeU256(BigInt(VmValType.U256)), encodeU256(u256)])
}

export function encodeVmByteVec(bytes: string): Uint8Array {
  return Buffer.concat([encodeU256(BigInt(VmValType.ByteVec)), encodeByteVec(bytes)])
}

export function encodeVmAddress(address: string): Uint8Array {
  return Buffer.concat([encodeU256(BigInt(VmValType.Address)), encodeAddress(address)])
}

function invalidScriptField(tpe: string, value: Val): Error {
  return Error(`Invalid script field ${value} for type ${tpe}`)
}

enum Instruction {
  trueConst = 3,
  falseConst = 4,
  i256Const0 = 5,
  i256Const1 = 6,
  i256Const2 = 7,
  i256Const3 = 8,
  i256Const4 = 9,
  i256Const5 = 10,
  i256ConstN1 = 11,
  u256Const0 = 12,
  u256Const1 = 13,
  u256Const2 = 14,
  u256Const3 = 15,
  u256Const4 = 16,
  u256Const5 = 17,
  i256Const = 18,
  u256Const = 19,
  bytesConst = 20,
  addressConst = 21
}

// TODO: optimize
function encodeScriptFieldI256(value: bigint): Uint8Array {
  return new Uint8Array([Instruction.i256Const, ...encodeI256(value)])
}

// TODO: optimize
function encodeScriptFieldU256(value: bigint): Uint8Array {
  return new Uint8Array([Instruction.u256Const, ...encodeU256(value)])
}

export function encodeScriptFieldAsString(tpe: string, value: Val): string {
  return Buffer.from(encodeScriptField(tpe, value)).toString('hex')
}

export function encodeScriptField(tpe: string, value: Val): Uint8Array {
  switch (tpe) {
    case 'Bool':
      const byte = toApiBoolean(value) ? Instruction.trueConst : Instruction.falseConst
      return new Uint8Array([byte])
    case 'I256':
      const i256 = toApiNumber256(value)
      return encodeScriptFieldI256(BigInt(i256))
    case 'U256':
      const u256 = toApiNumber256(value)
      return encodeScriptFieldU256(BigInt(u256))
    case 'Address':
      const address = toApiAddress(value)
      return new Uint8Array([Instruction.addressConst, ...encodeAddress(address)])
    default: // ByteVec or Contract
      const hexStr = toApiByteVec(value)
      return new Uint8Array([Instruction.bytesConst, ...encodeByteVec(hexStr)])
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
  const prefix = '5f5f6d61705f5f' // __map__
  const parts = message.split(',')
  if (!message.startsWith(prefix) || parts.length !== 2) return undefined
  if (parts[1] !== 'true' && parts[1] !== 'false') return undefined

  if (!isHexString(parts[0])) return undefined
  const remain = parts[0].slice(prefix.length)
  const suffixIndex = remain.indexOf('5f5f') // __
  if (suffixIndex === -1) return undefined

  const encodedMapIndex = remain.slice(0, suffixIndex)
  const mapIndex = parseInt(fromAscii(encodedMapIndex))
  const encodedKey = hexToBinUnsafe(remain.slice(suffixIndex + 4))
  const isInsert = parts[1] === 'true' ? true : false
  return { path: parts[0], mapIndex, encodedKey, isInsert }
}

export function decodePrimitive(value: Uint8Array, type: string): Val {
  switch (type) {
    case 'Bool':
      return decodeBool(value)
    case 'I256':
      return compactSignedIntCodec.decodeI256(Buffer.from(value))
    case 'U256':
      return compactUnsignedIntCodec.decodeU256(Buffer.from(value))
    case 'ByteVec':
      return binToHex(value)
    case 'Address':
      return bs58.encode(value)
    default:
      throw Error(`Expected primitive type, got ${type}`)
  }
}

export function primitiveToByteVec(value: Val, type: string): Uint8Array {
  switch (type) {
    case 'Bool':
      const byte = toApiBoolean(value) ? 1 : 0
      return new Uint8Array([byte])
    case 'I256':
      const i256 = toApiNumber256(value)
      return encodeI256(BigInt(i256))
    case 'U256':
      const u256 = toApiNumber256(value)
      return encodeU256(BigInt(u256))
    case 'ByteVec':
      const hexStr = toApiByteVec(value)
      return encodeByteVec(hexStr)
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
    if (error instanceof Error) {
      throw new Error(`Invalid ${fieldName}, error: ${error.message} `)
    }
    throw error
  }
}

function encodeFields(fields: { name: string; type: string; value: Val }[]): string {
  const prefix = binToHex(encodeI256(BigInt(fields.length)))
  const encoded = fields
    .map((field) => binToHex(_encodeField(field.name, () => encodeContractField(field.type, field.value))))
    .join('')
  return prefix + encoded
}

export function buildContractByteCode(
  bytecode: string,
  fields: Fields,
  fieldsSig: FieldsSig,
  structs: Struct[]
): string {
  const allFields = flattenFields(fields, fieldsSig.names, fieldsSig.types, fieldsSig.isMutable, structs)
  const encodedImmFields = encodeFields(allFields.filter((f) => !f.isMutable))
  const encodedMutFields = encodeFields(allFields.filter((f) => f.isMutable))
  return bytecode + encodedImmFields + encodedMutFields
}

enum ApiValType {
  Bool = 0,
  I256 = 1,
  U256 = 2,
  ByteVec = 3,
  Address = 4
}

function encodeContractFieldI256(value: bigint): Uint8Array {
  return new Uint8Array([ApiValType.I256, ...encodeI256(value)])
}

function encodeContractFieldU256(value: bigint): Uint8Array {
  return new Uint8Array([ApiValType.U256, ...encodeU256(value)])
}

export function encodeContractField(tpe: string, value: Val): Uint8Array {
  switch (tpe) {
    case 'Bool':
      const byte = toApiBoolean(value) ? 1 : 0
      return new Uint8Array([ApiValType.Bool, byte])
    case 'I256':
      const i256 = toApiNumber256(value)
      return encodeContractFieldI256(BigInt(i256))
    case 'U256':
      const u256 = toApiNumber256(value)
      return encodeContractFieldU256(BigInt(u256))
    case 'ByteVec':
      const hexStr = toApiByteVec(value)
      return new Uint8Array([ApiValType.ByteVec, ...encodeByteVec(hexStr)])
    case 'Address':
      const address = toApiAddress(value)
      return new Uint8Array([ApiValType.Address, ...encodeAddress(address)])
    default:
      throw Error(`Expected primitive type, got ${tpe} `)
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
