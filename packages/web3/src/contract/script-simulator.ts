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

import { addressFromContractId } from '../address'
import { boolCodec, Method, unsignedTxCodec } from '../codec'
import { LockupScript, lockupScriptCodec } from '../codec/lockup-script-codec'
import { Script } from '../codec/script-codec'
import { Val, ValAddress, ValBool, ValByteVec, ValI256, ValU256 } from '../codec/val'
import { binToHex, HexString, hexToBinUnsafe } from '../utils'

// TODO: support approved assets
export interface ContractCall {
  contractAddress: string
}

export class ScriptSimulator {
  // This function without errors is recommended for now as the simulator does not support all instructions
  static extractContractCalls(unsignedTx: HexString): ContractCall[] {
    try {
      return this.extractContractCallsWithErrors(unsignedTx)
    } catch (e) {
      console.debug('Error extracting contract calls from script', e)
      return []
    }
  }

  static extractContractCallsWithErrors(unsignedTx: HexString): ContractCall[] {
    const unsignedTxBytes = hexToBinUnsafe(unsignedTx)
    const decodedUnsignedTx = unsignedTxCodec.decode(unsignedTxBytes)
    const scriptOpt = decodedUnsignedTx.statefulScript
    switch (scriptOpt.kind) {
      case 'Some': {
        return this.extractContractCallsFromScript(scriptOpt.value)
      }
      case 'None': {
        return []
      }
    }
  }

  static extractContractCallsFromScript(script: Script): ContractCall[] {
    const methods = script.methods
    if (methods.length === 0) {
      return []
    }

    const mainMethod = methods[0]
    return this.extractContractCallsFromMainMethod(mainMethod)
  }

  static extractContractCallsFromMainMethod(mainMethod: Method): ContractCall[] {
    const operandStack = new Stack()
    const localVariables = new LocalVariables()
    const contractCalls: ContractCall[] = []
    const callerAddress: ValAddress = {
      kind: 'Address',
      value: { kind: 'P2PKH', value: random32Bytes() },
    }
    for (const instr of mainMethod.instrs) {
      switch (instr.name) {
        case 'ConstTrue':
          operandStack.push({ kind: 'Bool', value: true })
          break
        case 'ConstFalse':
          operandStack.push({ kind: 'Bool', value: false })
          break
        case 'I256Const0':
          operandStack.push({ kind: 'I256', value: 0n })
          break
        case 'I256Const1':
          operandStack.push({ kind: 'I256', value: 1n })
          break
        case 'I256Const2':
          operandStack.push({ kind: 'I256', value: 2n })
          break
        case 'I256Const3':
          operandStack.push({ kind: 'I256', value: 3n })
          break
        case 'I256Const4':
          operandStack.push({ kind: 'I256', value: 4n })
          break
        case 'I256Const5':
          operandStack.push({ kind: 'I256', value: 5n })
          break
        case 'I256ConstN1':
          operandStack.push({ kind: 'I256', value: -1n })
          break
        case 'I256Const':
          operandStack.push({ kind: 'I256', value: instr.value })
          break
        case 'U256Const0':
          operandStack.push({ kind: 'U256', value: 0n })
          break
        case 'U256Const1':
          operandStack.push({ kind: 'U256', value: 1n })
          break
        case 'U256Const2':
          operandStack.push({ kind: 'U256', value: 2n })
          break
        case 'U256Const3':
          operandStack.push({ kind: 'U256', value: 3n })
          break
        case 'U256Const4':
          operandStack.push({ kind: 'U256', value: 4n })
          break
        case 'U256Const5':
          operandStack.push({ kind: 'U256', value: 5n })
          break
        case 'U256Const':
          operandStack.push({ kind: 'U256', value: instr.value })
          break
        case 'BytesConst':
          operandStack.push({ kind: 'ByteVec', value: instr.value })
          break
        case 'AddressConst':
          operandStack.push({ kind: 'Address', value: instr.value })
          break
        case 'LoadLocal':
          operandStack.push(localVariables.get(instr.index))
          break
        case 'StoreLocal':
          localVariables.set(instr.index, operandStack.pop())
          break
        case 'Pop':
          operandStack.pop()
          break
        case 'Dup':
          const val = operandStack.pop()
          operandStack.push(val)
          break
        case 'Swap':
          const val1 = operandStack.pop()
          const val2 = operandStack.pop()
          operandStack.push(val1)
          operandStack.push(val2)
          break
        case 'BoolNot':
          const bool = operandStack.popBool()
          const result = unaryOp<'Bool', boolean>(bool, (x) => !x)
          operandStack.push(result)
        case 'BoolAnd': {
          const bool1 = operandStack.popBool()
          const bool2 = operandStack.popBool()
          binaryOp<'Bool', boolean>(bool1, bool2, (x, y) => x && y, operandStack.push)
          break
        }
        case 'BoolOr': {
          const bool1 = operandStack.popBool()
          const bool2 = operandStack.popBool()
          binaryOp<'Bool', boolean>(bool1, bool2, (x, y) => x || y, operandStack.push)
          break
        }
        case 'BoolEq': {
          const bool1 = operandStack.popBool()
          const bool2 = operandStack.popBool()
          binaryOp<'Bool', boolean>(bool1, bool2, (x, y) => x === y, operandStack.push)
          break
        }
        case 'BoolNeq': {
          const bool1 = operandStack.popBool()
          const bool2 = operandStack.popBool()
          binaryOp<'Bool', boolean>(bool1, bool2, (x, y) => x !== y, operandStack.push)
          break
        }
        case 'BoolToByteVec': {
          const bool = operandStack.popBool()
          if (bool.kind === 'Symbol-Bool') {
            operandStack.push(bool)
          } else {
            operandStack.push({ kind: 'ByteVec', value: boolCodec.encode(bool.value) })
          }
          break
        }
        case 'I256Add': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          binaryOp<'I256', bigint>(i256_1, i256_2, (x, y) => x + y, operandStack.push)
          break
        }
        case 'I256Sub': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          binaryOp<'I256', bigint>(i256_1, i256_2, (x, y) => x - y, operandStack.push)
          break
        }
        case 'I256Mul': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          binaryOp<'I256', bigint>(i256_1, i256_2, (x, y) => x * y, operandStack.push)
          break
        }
        case 'I256Div': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          binaryOp<'I256', bigint>(i256_1, i256_2, (x, y) => x / y, operandStack.push)
          break
        }
        case 'I256Eq': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          comparisonOp<'I256', bigint>(i256_1, i256_2, (x, y) => x === y, operandStack.push)
          break
        }
        case 'I256Neq': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          comparisonOp<'I256', bigint>(i256_1, i256_2, (x, y) => x !== y, operandStack.push)
          break
        }
        case 'I256Lt': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          comparisonOp<'I256', bigint>(i256_1, i256_2, (x, y) => x < y, operandStack.push)
          break
        }
        case 'I256Le': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          comparisonOp<'I256', bigint>(i256_1, i256_2, (x, y) => x <= y, operandStack.push)
          break
        }
        case 'I256Gt': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          comparisonOp<'I256', bigint>(i256_1, i256_2, (x, y) => x > y, operandStack.push)
          break
        }
        case 'I256Ge': {
          // unsafe
          const i256_2 = operandStack.popI256()
          const i256_1 = operandStack.popI256()
          comparisonOp<'I256', bigint>(i256_1, i256_2, (x, y) => x >= y, operandStack.push)
          break
        }
        case 'U256Add': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          binaryOp<'U256', bigint>(u256_1, u256_2, (x, y) => x + y, operandStack.push)
          break
        }
        case 'U256Sub': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          binaryOp<'U256', bigint>(u256_1, u256_2, (x, y) => x - y, operandStack.push)
          break
        }
        case 'U256Mul': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          binaryOp<'U256', bigint>(u256_1, u256_2, (x, y) => x * y, operandStack.push)
          break
        }
        case 'U256Div': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          binaryOp<'U256', bigint>(u256_1, u256_2, (x, y) => x / y, operandStack.push)
          break
        }
        case 'U256Eq': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          comparisonOp<'U256', bigint>(u256_1, u256_2, (x, y) => x === y, operandStack.push)
          break
        }
        case 'U256Neq': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          comparisonOp<'U256', bigint>(u256_1, u256_2, (x, y) => x !== y, operandStack.push)
          break
        }
        case 'U256Lt': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          comparisonOp<'U256', bigint>(u256_1, u256_2, (x, y) => x < y, operandStack.push)
          break
        }
        case 'U256Le': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          comparisonOp<'U256', bigint>(u256_1, u256_2, (x, y) => x <= y, operandStack.push)
          break
        }
        case 'U256Gt': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          comparisonOp<'U256', bigint>(u256_1, u256_2, (x, y) => x > y, operandStack.push)
          break
        }
        case 'U256Ge': {
          // unsafe
          const u256_2 = operandStack.popU256()
          const u256_1 = operandStack.popU256()
          comparisonOp<'U256', bigint>(u256_1, u256_2, (x, y) => x >= y, operandStack.push)
          break
        }
        case 'ByteVecEq': {
          const byteVec1 = operandStack.popByteVec()
          const byteVec2 = operandStack.popByteVec()
          comparisonOp<'ByteVec', Uint8Array>(
            byteVec1,
            byteVec2,
            (x, y) => arrayEquals(x, y),
            operandStack.push
          )
          break
        }
        case 'ByteVecNeq': {
          const byteVec1 = operandStack.popByteVec()
          const byteVec2 = operandStack.popByteVec()
          comparisonOp<'ByteVec', Uint8Array>(
            byteVec1,
            byteVec2,
            (x, y) => !arrayEquals(x, y),
            operandStack.push
          )
          break
        }
        case 'ByteVecSize': {
          const byteVec = operandStack.popByteVec()
          if (byteVec.kind === 'Symbol-ByteVec') {
            operandStack.push({ kind: 'Symbol-U256', value: undefined })
          } else {
            operandStack.push({ kind: 'U256', value: BigInt(byteVec.value.length) })
          }
          break
        }
        case 'ByteVecConcat': {
          const byteVec2 = operandStack.popByteVec()
          const byteVec1 = operandStack.popByteVec()
          binaryOp<'ByteVec', Uint8Array>(
            byteVec1,
            byteVec2,
            (x, y) => new Uint8Array([...x, ...y]),
            operandStack.push
          )
          break
        }
        case 'ByteVecSlice': {
          const end = operandStack.popU256()
          const start = operandStack.popU256()
          const byteVec = operandStack.popByteVec()
          if (
            byteVec.kind === 'Symbol-ByteVec' ||
            start.kind === 'Symbol-U256' ||
            end.kind === 'Symbol-U256'
          ) {
            operandStack.push({ kind: 'Symbol-ByteVec', value: undefined })
          } else {
            operandStack.push({
              kind: 'ByteVec',
              value: byteVec.value.slice(Number(start.value), Number(end.value)),
            })
          }
          break
        }
        case 'AddressEq': {
          const address1 = operandStack.popAddress()
          const address2 = operandStack.popAddress()
          comparisonOp<'Address', LockupScript>(
            address1,
            address2,
            (x, y) => arrayEquals(lockupScriptCodec.encode(x), lockupScriptCodec.encode(y)),
            operandStack.push
          )
          break
        }
        case 'AddressNeq': {
          const address1 = operandStack.popAddress()
          const address2 = operandStack.popAddress()
          comparisonOp<'Address', LockupScript>(
            address1,
            address2,
            (x, y) => !arrayEquals(lockupScriptCodec.encode(x), lockupScriptCodec.encode(y)),
            operandStack.push
          )
          break
        }
        case 'AddressToByteVec': {
          const address = operandStack.popAddress()
          if (address.kind === 'Symbol-Address') {
            operandStack.push({ kind: 'Symbol-ByteVec', value: undefined })
          } else {
            operandStack.push({ kind: 'ByteVec', value: lockupScriptCodec.encode(address.value) })
          }
          break
        }
        case 'Assert': {
          const bool = operandStack.popBool()
          if (!bool) {
            throw new Error('Assertion failed')
          }
          break
        }
        case 'Blake2b':
        case 'Sha256':
        case 'Sha3':
        case 'Keccak256': {
          dummyImplementation(instr.name)
          operandStack.popByteVec()
          operandStack.push({ kind: 'ByteVec', value: new Uint8Array(32) })
          break
        }
        case 'ByteVecToAddress': {
          const byteVec = operandStack.popByteVec()
          if (byteVec.kind === 'Symbol-ByteVec') {
            operandStack.push({ kind: 'Symbol-Address', value: undefined })
          } else {
            operandStack.push({ kind: 'Address', value: lockupScriptCodec.decode(byteVec.value) })
          }
          break
        }
        case 'Zeros': {
          const size = operandStack.popU256()
          if (size.kind === 'Symbol-U256') {
            operandStack.push({ kind: 'Symbol-ByteVec', value: undefined })
          } else {
            if (size.value > 4096) {
              throw new Error('Zeros size is too large')
            }
            operandStack.push({ kind: 'ByteVec', value: new Uint8Array(Number(size.value)) })
          }
          break
        }
        case 'U256To1Byte':
        case 'U256To2Byte':
        case 'U256To4Byte':
        case 'U256To8Byte':
        case 'U256To16Byte':
        case 'U256To32Byte': {
          dummyImplementation(instr.name)
          operandStack.popU256()
          operandStack.push({ kind: 'Symbol-ByteVec', value: undefined })
          break
        }
        case 'U256From1Byte':
        case 'U256From2Byte':
        case 'U256From4Byte':
        case 'U256From8Byte':
        case 'U256From16Byte':
        case 'U256From32Byte': {
          dummyImplementation(instr.name)
          operandStack.popByteVec()
          operandStack.push({ kind: 'Symbol-U256', value: undefined })
          break
        }
        case 'CallExternal':
        case 'CallExternalBySelector': {
          const contractId = operandStack.popByteVec()
          const returnLength = operandStack.popU256() // method return length
          operandStack.popU256() // method args length
          if (contractId.kind !== 'Symbol-ByteVec') {
            contractCalls.push({
              contractAddress: addressFromContractId(binToHex(contractId.value)),
            })
          }
          if (returnLength.kind !== 'Symbol-U256') {
            for (let i = 0; i < returnLength.value; i++) {
              operandStack.push({ kind: 'Symbol-Any', value: undefined })
            }
          }
          break
        }
        case 'ContractIdToAddress': {
          const contractId = operandStack.popByteVec()
          if (contractId.kind === 'Symbol-ByteVec') {
            operandStack.push({ kind: 'Symbol-Address', value: undefined })
          } else {
            operandStack.push({ kind: 'Address', value: { kind: 'P2C', value: contractId.value } })
          }
          break
        }
        case 'LoadLocalByIndex': {
          const index = operandStack.popU256()
          if (index.kind === 'Symbol-U256') {
            throw new Error('LoadLocalByIndex index is a symbol')
          } else {
            operandStack.push(localVariables.get(Number(index.value)))
          }
          break
        }
        case 'StoreLocalByIndex': {
          const index = operandStack.popU256()
          if (index.kind === 'Symbol-U256') {
            throw new Error('StoreLocalByIndex index is a symbol')
          } else {
            localVariables.set(Number(index.value), operandStack.pop())
          }
          break
        }
        case 'CallerAddress': {
          operandStack.push(callerAddress)
          break
        }
        case 'ApproveAlph': {
          operandStack.popU256() // amount
          operandStack.popAddress() // spender
          break
        }
        case 'ApproveToken': {
          operandStack.popU256() // amount
          operandStack.popByteVec() // token
          operandStack.popAddress() // spender
          break
        }
        default:
          unimplemented(instr.name)
          break
      }
    }
    return contractCalls
  }
}

type SymbolBool = { kind: 'Symbol-Bool'; value: undefined }
type SymbolI256 = { kind: 'Symbol-I256'; value: undefined }
type SymbolU256 = { kind: 'Symbol-U256'; value: undefined }
type SymbolByteVec = { kind: 'Symbol-ByteVec'; value: undefined }
type SymbolAddress = { kind: 'Symbol-Address'; value: undefined }
type SymbolAny = { kind: 'Symbol-Any'; value: undefined }
type SimulatorVal = Val | SymbolBool | SymbolI256 | SymbolU256 | SymbolByteVec | SymbolAddress | SymbolAny
type SimulatorVar<K extends string, V> = { kind: K; value: V } | { kind: `Symbol-${K}`; value: undefined }

function unaryOp<K extends string, V>(x: SimulatorVar<K, V>, op: (x: V) => V): SimulatorVar<K, V> {
  if (x.kind.startsWith('symbol')) {
    return x
  } else {
    return { kind: x.kind as K, value: op(x.value as V) }
  }
}

function binaryOp<K extends string, V>(
  x: SimulatorVar<K, V>,
  y: SimulatorVar<K, V>,
  op: (x: V, y: V) => V,
  push: (z: SimulatorVar<K, V>) => void
): void {
  const result = x.kind.startsWith('symbol')
    ? x
    : y.kind.startsWith('symbol')
    ? y
    : { kind: x.kind as K, value: op(x.value as V, y.value as V) }
  push(result)
}

function comparisonOp<K extends string, V>(
  x: SimulatorVar<K, V>,
  y: SimulatorVar<K, V>,
  op: (x: V, y: V) => boolean,
  push: (z: SimulatorVar<'Bool', boolean>) => void
): void {
  const result: SimulatorVar<'Bool', boolean> =
    x.kind.startsWith('symbol') || y.kind.startsWith('symbol')
      ? { kind: 'Symbol-Bool', value: undefined }
      : { kind: 'Bool', value: op(x.value as V, y.value as V) }
  push(result)
}

// implement arrayEquals
function arrayEquals(x: Uint8Array, y: Uint8Array): boolean {
  return x.length === y.length && x.every((value, index) => value === y[`${index}`])
}

// generate 32 bytes array with random numbers
function random32Bytes(): Uint8Array {
  const result = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    result[`${i}`] = Math.floor(Math.random() * 256)
  }
  return result
}

class Stack {
  private stack: SimulatorVal[] = []

  constructor() {
    // TODO
  }

  push = (val: SimulatorVal) => {
    this.stack.push(val)
  }

  pop(): SimulatorVal {
    const result = this.stack.pop()
    if (result === undefined) {
      throw new Error('Stack is empty')
    }
    return result
  }

  size(): number {
    return this.stack.length
  }

  checkedResult(result: SimulatorVal, expected: string): SimulatorVal {
    if (result.kind.startsWith('symbol')) {
      if (result.kind !== `Symbol-${expected}`) {
        throw new Error(`Expected a ${expected} value on the stack`)
      }
      return result
    }
    if (result.kind !== expected) {
      throw new Error(`Expected a ${expected} value on the stack`)
    }
    return result
  }

  popBool(): ValBool | SymbolBool {
    const result = this.pop()
    return this.checkedResult(result, 'Bool') as ValBool | SymbolBool
  }

  popI256(): ValI256 | SymbolI256 {
    const result = this.pop()
    return this.checkedResult(result, 'I256') as ValI256 | SymbolI256
  }

  popU256(): ValU256 | SymbolU256 {
    const result = this.pop()
    return this.checkedResult(result, 'U256') as ValU256 | SymbolU256
  }

  popByteVec(): ValByteVec | SymbolByteVec {
    const result = this.pop()
    return this.checkedResult(result, 'ByteVec') as ValByteVec | SymbolByteVec
  }

  popAddress(): ValAddress | SymbolAddress {
    const result = this.pop()
    return this.checkedResult(result, 'Address') as ValAddress | SymbolAddress
  }
}

class LocalVariables {
  private locals: SimulatorVal | undefined[] = []

  constructor() {
    // TODO
  }

  get(index: number): SimulatorVal {
    const result = this.locals[`${index}`]
    if (result === undefined) {
      throw new Error(`Local variable at index ${index} is not set`)
    }
    return result
  }

  set(index: number, val: SimulatorVal): void {
    this.locals[`${index}`] = val
  }

  private checkedResult(result: SimulatorVal, index: number, expected: string): SimulatorVal {
    if (result.kind.startsWith('symbol')) {
      if (result.kind !== `Symbol-${expected}`) {
        throw new Error(`Local variable at index ${index} is not a ${expected}`)
      }
      return result
    }
    if (result.kind !== expected) {
      throw new Error(`Local variable at index ${index} is not a ${expected}`)
    }
    return result
  }

  getBool(index: number): ValBool | SymbolBool {
    const result = this.get(index)
    return this.checkedResult(result, index, 'Bool') as ValBool | SymbolBool
  }

  getI256(index: number): ValI256 | SymbolI256 {
    const result = this.get(index)
    return this.checkedResult(result, index, 'I256') as ValI256 | SymbolI256
  }

  getU256(index: number): ValU256 | SymbolU256 {
    const result = this.get(index)
    return this.checkedResult(result, index, 'U256') as ValU256 | SymbolU256
  }

  getByteVec(index: number): ValByteVec | SymbolByteVec {
    const result = this.get(index)
    return this.checkedResult(result, index, 'ByteVec') as ValByteVec | SymbolByteVec
  }

  getAddress(index: number): ValAddress | SymbolAddress {
    const result = this.get(index)
    return this.checkedResult(result, index, 'Address') as ValAddress | SymbolAddress
  }
}

function unimplemented(instrName: string): never {
  throw new Error(`Unimplemented instruction: ${instrName}`)
}

function dummyImplementation(instrName: string): void {
  console.debug(`Dummy implementation for instruction: ${instrName}`)
}
