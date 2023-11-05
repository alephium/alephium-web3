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
import { Parser } from 'binary-parser'
import { ArrayCodec } from './array-codec'
import { compactIntCodec } from './compact-int-codec'
import { byteStringCodec } from './bytestring-codec'
import { lockupScriptCodec } from './lockup-script-codec'
import { Codec } from './codec'

export class InstrCodec implements Codec<any> {
  parser = Parser.start()
    .uint8('code')
    .choice('value', {
      tag: 'code',
      choices: {
        0x00: Parser.start().uint8('index'), // CallLocal
        0x01: Parser.start().uint8('index'), // CallExternal
        0x02: Parser.start(), // Return
        0x03: Parser.start(), // ConstTrue
        0x04: Parser.start(), // ConstFalse
        0x05: Parser.start(), // I256Const0
        0x06: Parser.start(), // I256Const1
        0x07: Parser.start(), // I256Const2
        0x08: Parser.start(), // I256Const3
        0x09: Parser.start(), // I256Const4
        0x0a: Parser.start(), // I256Const5
        0x0b: Parser.start(), // I256ConstN1
        0x0c: Parser.start(), // U256Const0
        0x0d: Parser.start(), // U256Const1
        0x0e: Parser.start(), // U256Const2
        0x0f: Parser.start(), // U256Const3
        0x10: Parser.start(), // U256Const4
        0x11: Parser.start(), // U256Const5
        0x12: Parser.start().nest('value', { type: compactIntCodec.parser }), // I256Const    FIXME: parse signed int
        0x13: Parser.start().nest('value', { type: compactIntCodec.parser }), // U256Const
        0x14: Parser.start().nest('value', { type: byteStringCodec.parser }), // ByteConst
        0x15: Parser.start().nest('value', { type: lockupScriptCodec.parser }), // AddressConst
        0x16: Parser.start().uint8('index'), // LoadLocal
        0x17: Parser.start().uint8('index'), // StoreLocal
        0x18: Parser.start(), // Pop
        0x19: Parser.start(), // BoolNot
        0x1a: Parser.start(), // BoolAnd
        0x1b: Parser.start(), // BoolOr
        0x1c: Parser.start(), // BoolEq
        0x1d: Parser.start(), // BoolNeq
        0x1e: Parser.start(), // BoolToByteVec
        0x1f: Parser.start(), // I256Add
        0x20: Parser.start(), // I256Sub
        0x21: Parser.start(), // I256Mul
        0x22: Parser.start(), // I256Div
        0x23: Parser.start(), // I256Mod
        0x24: Parser.start(), // I256Eq
        0x25: Parser.start(), // I256Neq
        0x26: Parser.start(), // I256Lt
        0x27: Parser.start(), // I256Le
        0x28: Parser.start(), // I256Gt
        0x29: Parser.start(), // I256Ge
        0x2a: Parser.start(), // U256Add
        0x2b: Parser.start(), // U256Sub
        0x2c: Parser.start(), // U256Mul
        0x2d: Parser.start(), // U256Div
        0x2e: Parser.start(), // U256Mod
        0x2f: Parser.start(), // U256Eq
        0x30: Parser.start(), // U256Neq
        0x31: Parser.start(), // U256Lt
        0x32: Parser.start(), // U256Le
        0x33: Parser.start(), // U256Gt
        0x34: Parser.start(), // U256Ge
        0x35: Parser.start(), // U256ModAdd
        0x36: Parser.start(), // U256ModSub
        0x37: Parser.start(), // U256ModMul
        0x38: Parser.start(), // U256BitAnd
        0x39: Parser.start(), // U256BitOr
        0x3a: Parser.start(), // U256Xor
        0x3b: Parser.start(), // U256SHL
        0x3c: Parser.start(), // U256SHR
        0x3d: Parser.start(), // I256ToU256
        0x3e: Parser.start(), // I256ToByteVec
        0x3f: Parser.start(), // U256ToI256
        0x40: Parser.start(), // U256ToByteVec
        0x41: Parser.start(), // ByteVecEq
        0x42: Parser.start(), // ByteVecNeq
        0x43: Parser.start(), // ByteVecSize
        0x44: Parser.start(), // ByteVecConcat
        0x45: Parser.start(), // AddressEq
        0x46: Parser.start(), // AddressNeq
        0x47: Parser.start(), // AddressToByteVec
        0x48: Parser.start(), // IsAssetAddress
        0x49: Parser.start(), // IsContractAddress
        0x4a: Parser.start().nest('offset', { type: compactIntCodec.parser }), // Jump
        0x4b: Parser.start(), // IfTrue
        0x4c: Parser.start(), // IfFalse
        0x4d: Parser.start(), // Assert
        0x4e: Parser.start(), // Blake2b
        0x4f: Parser.start(), // Keccak256
        0x50: Parser.start(), // Sha256
        0x51: Parser.start(), // Sha3
        0x52: Parser.start(), // VerifyTxSignature
        0x53: Parser.start(), // VerifySecP256K1
        0x54: Parser.start(), // VerifyED25519
        0x55: Parser.start(), // NetworkId
        0x56: Parser.start(), // BlockTimeStamp
        0x57: Parser.start(), // BlockTarget
        0x58: Parser.start(), // TxId
        0x59: Parser.start(), // TxInputAddressAt
        0x5a: Parser.start(), // TxInputsSize
        0x5b: Parser.start(), // VerifyAbsoluteLocktime
        0x5c: Parser.start(), // VerifyRelativeLocktime
        0x5d: Parser.start(), // Log1
        0x5e: Parser.start(), // Log2
        0x5f: Parser.start(), // Log3
        0x60: Parser.start(), // Log4
        0x61: Parser.start(), // Log5
        0x62: Parser.start(), // ByteVecSlice
        0x63: Parser.start(), // ByteVecToAddress
        0x64: Parser.start(), // Encode
        0x65: Parser.start(), // Zeros
        0x66: Parser.start(), // U256To1Byte
        0x67: Parser.start(), // U256To2Byte
        0x68: Parser.start(), // U256To4Byte
        0x69: Parser.start(), // U256To8Byte
        0x6a: Parser.start(), // U256To16Byte
        0x6b: Parser.start(), // U256To32Byte
        0x6c: Parser.start(), // U256From1Byte
        0x6d: Parser.start(), // U256From2Byte
        0x6e: Parser.start(), // U256From4Byte
        0x6f: Parser.start(), // U256From8Byte
        0x70: Parser.start(), // U256From16Byte
        0x71: Parser.start(), // U256From32Byte
        0x72: Parser.start(), // EthEcRecover
        0x73: Parser.start(), // Log6
        0x74: Parser.start(), // Log7
        0x75: Parser.start(), // Log8
        0x76: Parser.start(), // Log9
        0x77: Parser.start(), // ContractIdToAddress
        0x78: Parser.start(), // LoadLocalByIndex
        0x79: Parser.start(), // StoreLocalByIndex
        0x7a: Parser.start(), // Dup
        0x7b: Parser.start(), // AssertWithErrorCode
        0x7c: Parser.start(), // Swap
        0x7d: Parser.start(), // BlockHash
        0x7e: Parser.start().nest('stringParts', { type: new ArrayCodec(byteStringCodec).parser }), // DEBUG
        0x7f: Parser.start(), // TxGasPrice
        0x80: Parser.start(), // TxGasAmount
        0x81: Parser.start(), // TxGasFee
        0x82: Parser.start(), // I256Exp
        0x83: Parser.start(), // U256Exp
        0x84: Parser.start(), // U256ModExp
        0x85: Parser.start(), // VerifyBIP340Schnorr
        0x86: Parser.start(), // GetSegragatedSignature
        0x87: Parser.start(), // MulModN
        0x88: Parser.start(), // AddModN
        0x89: Parser.start(), // U256ToString
        0x8a: Parser.start(), // I256ToString
        0x8b: Parser.start(), // BoolToString
        0x8c: Parser.start(), // BoolToString
        0xa0: Parser.start().uint8('index'), // LoadMutField
        0xa1: Parser.start().uint8('index'), // StoreMutField
        0xa2: Parser.start(), // ApproveAlph
        0xa3: Parser.start(), // ApproveToken
        0xa4: Parser.start(), // AlphRemaining
        0xa5: Parser.start(), // TokenRemaining
        0xa6: Parser.start(), // IsPaying
        0xa7: Parser.start(), // TransferAlph
        0xa8: Parser.start(), // TransferAlphFromSelf
        0xa9: Parser.start(), // TransferAlphToSelf
        0xaa: Parser.start(), // TransferToken
        0xab: Parser.start(), // TransferTokenFromSelf
        0xac: Parser.start(), // TransferTokenToSelf
        0xad: Parser.start(), // CreateContract
        0xae: Parser.start(), // CreateContractWithToken
        0xaf: Parser.start(), // CopyCreateContract
        0xb0: Parser.start(), // DestroySelf
        0xb1: Parser.start(), // SelfContractId
        0xb2: Parser.start(), // SelfAddress
        0xb3: Parser.start(), // CallerContractId
        0xb4: Parser.start(), // CallerAddress
        0xb5: Parser.start(), // IsCallerFromTxScript
        0xb6: Parser.start(), // CallerInitialStateHash
        0xb7: Parser.start(), // CallerCodeHash
        0xb8: Parser.start(), // ContractInitialStateHash
        0xb9: Parser.start(), // ContractInitialCodeHash
        0xba: Parser.start(), // MigrateSimple
        0xbb: Parser.start(), // MigrateWithFields
        0xbc: Parser.start(), // CopyCreateContractWithToken
        0xbd: Parser.start(), // BurnToken
        0xbe: Parser.start(), // LockApprovedAssets
        0xbf: Parser.start(), // CreateSubContract
        0xc0: Parser.start(), // CreateSubContractWithToken
        0xc1: Parser.start(), // CopyCreateSubContract
        0xc2: Parser.start(), // CopyCreateSubContractWithToken
        0xc3: Parser.start(), // LoadMutFieldByIndex
        0xc4: Parser.start(), // StoreMutFieldByIndex
        0xc5: Parser.start(), // ContractExists
        0xc6: Parser.start(), // CreateContractAndTransferToken
        0xc7: Parser.start(), // CopyCreateContractAndTransferToken
        0xc8: Parser.start(), // CreateSubContractAndTransferToken
        0xc9: Parser.start(), // CopyCreateSubContractAndTransferToken
        0xca: Parser.start(), // NullContractAddress
        0xcb: Parser.start(), // SubContractId
        0xcc: Parser.start(), // SubContractIdOf
        0xcd: Parser.start(), // AlphTokenId
        0xce: Parser.start().uint8('index'), // LoadImmField
        0xcf: Parser.start() // LoadImmFieldByIndex
      }
    })

  encode(instr: any): Buffer {
    const instrValue = instr.value
    const result = [instr.code]
    const instrsWithIndex = [0x00, 0x01, 0x16, 0x17, 0xa0, 0xa1, 0xce]
    if (instr.code === 0x12 || instr.code === 0x13) {
      result.push(...compactIntCodec.encode(instrValue.value))
    } else if (instr.code === 0x4a) {
      result.push(...compactIntCodec.encode(instrValue.offset))
    } else if (instr.code === 0x14) {
      result.push(...byteStringCodec.encode(instrValue.value))
    } else if (instr.code === 0x15) {
      result.push(...lockupScriptCodec.encode(instrValue))
    } else if (instr.code === 0x7e) {
      result.push(...compactIntCodec.encode(instrValue.stringParts.length))
      for (const stringPart of instrValue.stringParts.value) {
        result.push(...byteStringCodec.encode(stringPart.value))
      }
    } else if (instrsWithIndex.includes(instr.code)) {
      result.push(instrValue.index)
    }

    return Buffer.from(result)
  }

  decode(input: Buffer): any {
    return this.parser.parse(input)
  }
}

export const instrCodec = new InstrCodec()
