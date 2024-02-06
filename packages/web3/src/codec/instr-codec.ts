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
import { ArrayCodec, DecodedArray } from './array-codec'
import { compactUnsignedIntCodec, compactSignedIntCodec, DecodedCompactInt } from './compact-int-codec'
import { ByteString, byteStringCodec } from './bytestring-codec'
import { LockupScript, lockupScriptCodec } from './lockup-script-codec'
import { Codec } from './codec'

const byteStringArrayCodec = new ArrayCodec(byteStringCodec)

// eslint-disable-next-line
export interface InstrValue { }
export interface InstrValueWithIndex extends InstrValue {
  index: number
}
export interface InstrValueWithCompactInt extends InstrValue {
  value: DecodedCompactInt
}

export interface ByteStringConst extends InstrValue {
  value: ByteString
}
export interface AddressConst extends InstrValue {
  value: LockupScript
}
export interface Debug extends InstrValue {
  stringParts: DecodedArray<ByteString>
}
export interface Instr {
  code: number
  value?: InstrValue
}

export const CallLocal = (index: number): Instr => ({ code: 0x00, value: { index } })
export const CallExternal = (index: number): Instr => ({ code: 0x01, value: { index } })
export const Return: Instr = { code: 0x02, value: {} }
export const ConstTrue: Instr = { code: 0x03, value: {} }
export const ConstFalse: Instr = { code: 0x04, value: {} }
export const I256Const0: Instr = { code: 0x05, value: {} }
export const I256Const1: Instr = { code: 0x06, value: {} }
export const I256Const2: Instr = { code: 0x07, value: {} }
export const I256Const3: Instr = { code: 0x08, value: {} }
export const I256Const4: Instr = { code: 0x09, value: {} }
export const I256Const5: Instr = { code: 0x0a, value: {} }
export const I256ConstN1: Instr = { code: 0x0b, value: {} }
export const U256Const0: Instr = { code: 0x0c, value: {} }
export const U256Const1: Instr = { code: 0x0d, value: {} }
export const U256Const2: Instr = { code: 0x0e, value: {} }
export const U256Const3: Instr = { code: 0x0f, value: {} }
export const U256Const4: Instr = { code: 0x10, value: {} }
export const U256Const5: Instr = { code: 0x11, value: {} }
export const I256Const = (value: DecodedCompactInt): Instr => ({ code: 0x12, value })
export const U256Const = (value: DecodedCompactInt): Instr => ({ code: 0x13, value })
export const ByteConst = (value: ByteString): Instr => ({ code: 0x14, value })
export const AddressConst = (value: LockupScript): Instr => ({ code: 0x15, value })
export const LoadLocal = (index: number): Instr => ({ code: 0x16, value: { index } })
export const StoreLocal = (index: number): Instr => ({ code: 0x17, value: { index } })
export const Pop: Instr = { code: 0x18, value: {} }
export const BoolNot: Instr = { code: 0x19, value: {} }
export const BoolAnd: Instr = { code: 0x1a, value: {} }
export const BoolOr: Instr = { code: 0x1b, value: {} }
export const BoolEq: Instr = { code: 0x1c, value: {} }
export const BoolNeq: Instr = { code: 0x1d, value: {} }
export const BoolToByte: Instr = { code: 0x1e, value: {} }
export const I256Add: Instr = { code: 0x1f, value: {} }
export const I256Sub: Instr = { code: 0x20, value: {} }
export const I256Mul: Instr = { code: 0x21, value: {} }
export const I256Div: Instr = { code: 0x22, value: {} }
export const I256Mod: Instr = { code: 0x23, value: {} }
export const I256Eq: Instr = { code: 0x24, value: {} }
export const I256Neq: Instr = { code: 0x25, value: {} }
export const I256Lt: Instr = { code: 0x26, value: {} }
export const I256Le: Instr = { code: 0x27, value: {} }
export const I256Gt: Instr = { code: 0x28, value: {} }
export const I256Ge: Instr = { code: 0x29, value: {} }
export const U256Add: Instr = { code: 0x2a, value: {} }
export const U256Sub: Instr = { code: 0x2b, value: {} }
export const U256Mul: Instr = { code: 0x2c, value: {} }
export const U256Div: Instr = { code: 0x2d, value: {} }
export const U256Mod: Instr = { code: 0x2e, value: {} }
export const U256Eq: Instr = { code: 0x2f, value: {} }
export const U256Neq: Instr = { code: 0x30, value: {} }
export const U256Lt: Instr = { code: 0x31, value: {} }
export const U256Le: Instr = { code: 0x32, value: {} }
export const U256Gt: Instr = { code: 0x33, value: {} }
export const U256Ge: Instr = { code: 0x34, value: {} }
export const U256ModAdd: Instr = { code: 0x35, value: {} }
export const U256ModSub: Instr = { code: 0x36, value: {} }
export const U256ModMul: Instr = { code: 0x37, value: {} }
export const U256BitAnd: Instr = { code: 0x38, value: {} }
export const U256BitOr: Instr = { code: 0x39, value: {} }
export const U256Xor: Instr = { code: 0x3a, value: {} }
export const U256SHL: Instr = { code: 0x3b, value: {} }
export const U256SHR: Instr = { code: 0x3c, value: {} }
export const I256ToU256: Instr = { code: 0x3d, value: {} }
export const I256ToByteVec: Instr = { code: 0x3e, value: {} }
export const U256ToI256: Instr = { code: 0x3f, value: {} }
export const U256ToByteVec: Instr = { code: 0x40, value: {} }
export const ByteVecEq: Instr = { code: 0x41, value: {} }
export const ByteVecNeq: Instr = { code: 0x42, value: {} }
export const ByteVecSize: Instr = { code: 0x43, value: {} }
export const ByteVecConcat: Instr = { code: 0x44, value: {} }
export const AddressEq: Instr = { code: 0x45, value: {} }
export const AddressNeq: Instr = { code: 0x46, value: {} }
export const AddressToByteVec: Instr = { code: 0x47, value: {} }
export const IsAssetAddress: Instr = { code: 0x48, value: {} }
export const IsContractAddress: Instr = { code: 0x49, value: {} }
export const Jump = (value: DecodedCompactInt): Instr => ({ code: 0x4a, value })
export const IfTrue = (value: DecodedCompactInt): Instr => ({ code: 0x4b, value })
export const IfFalse = (value: DecodedCompactInt): Instr => ({ code: 0x4c, value })
export const Assert: Instr = { code: 0x4d, value: {} }
export const Blake2b: Instr = { code: 0x4e, value: {} }
export const Keccak256: Instr = { code: 0x4f, value: {} }
export const Sha256: Instr = { code: 0x50, value: {} }
export const Sha3: Instr = { code: 0x51, value: {} }
export const VerifyTxSignature: Instr = { code: 0x52, value: {} }
export const VerifySecP256K1: Instr = { code: 0x53, value: {} }
export const VerifyEd25519: Instr = { code: 0x54, value: {} }
export const NetworkId: Instr = { code: 0x55, value: {} }
export const BlockTimeStamp: Instr = { code: 0x56, value: {} }
export const BlockTarget: Instr = { code: 0x57, value: {} }
export const TxId: Instr = { code: 0x58, value: {} }
export const TxInputAddressAt: Instr = { code: 0x59, value: {} }
export const TxInputsSize: Instr = { code: 0x5a, value: {} }
export const VerifyAbsoluteLocktime: Instr = { code: 0x5b, value: {} }
export const VerifyRelativeLocktime: Instr = { code: 0x5c, value: {} }
export const Log1: Instr = { code: 0x5d, value: {} }
export const Log2: Instr = { code: 0x5e, value: {} }
export const Log3: Instr = { code: 0x5f, value: {} }
export const Log4: Instr = { code: 0x60, value: {} }
export const Log5: Instr = { code: 0x61, value: {} }
export const ByteVecSlice: Instr = { code: 0x62, value: {} }
export const ByteVecToAddress: Instr = { code: 0x63, value: {} }
export const Encode: Instr = { code: 0x64, value: {} }
export const Zeros: Instr = { code: 0x65, value: {} }
export const U256To1Byte: Instr = { code: 0x66, value: {} }
export const U256To2Bytes: Instr = { code: 0x67, value: {} }
export const U256To4Bytes: Instr = { code: 0x68, value: {} }
export const U256To8Bytes: Instr = { code: 0x69, value: {} }
export const U256To16Bytes: Instr = { code: 0x6a, value: {} }
export const U256To32Bytes: Instr = { code: 0x6b, value: {} }
export const U256From1Byte: Instr = { code: 0x6c, value: {} }
export const U256From2Bytes: Instr = { code: 0x6d, value: {} }
export const U256From4Bytes: Instr = { code: 0x6e, value: {} }
export const U256From8Bytes: Instr = { code: 0x6f, value: {} }
export const U256From16Bytes: Instr = { code: 0x70, value: {} }
export const U256From32Bytes: Instr = { code: 0x71, value: {} }
export const EthEcRecover: Instr = { code: 0x72, value: {} }
export const Log6: Instr = { code: 0x73, value: {} }
export const Log7: Instr = { code: 0x74, value: {} }
export const Log8: Instr = { code: 0x75, value: {} }
export const Log9: Instr = { code: 0x76, value: {} }
export const ContractIdToAddress: Instr = { code: 0x77, value: {} }
export const LoadLocalByIndex: Instr = { code: 0x78, value: {} }
export const StoreLocalByIndex: Instr = { code: 0x79, value: {} }
export const Dup: Instr = { code: 0x7a, value: {} }
export const AssertWithMsg: Instr = { code: 0x7b, value: {} }
export const Swap: Instr = { code: 0x7c, value: {} }
export const BlockHash: Instr = { code: 0x7d, value: {} }
export const DEBUG = (stringParts: DecodedArray<ByteString>): Instr => ({ code: 0x7e, value: { stringParts } })
export const TxGasPrice: Instr = { code: 0x7f, value: {} }
export const TxGasAmount: Instr = { code: 0x80, value: {} }
export const TxGasFee: Instr = { code: 0x81, value: {} }
export const I256Exp: Instr = { code: 0x82, value: {} }
export const U256Exp: Instr = { code: 0x83, value: {} }
export const U256ModExp: Instr = { code: 0x84, value: {} }
export const VerifyBIP340Schnorr: Instr = { code: 0x85, value: {} }
export const GetSegragatedSignature: Instr = { code: 0x86, value: {} }
export const MulModN: Instr = { code: 0x87, value: {} }
export const AddModN: Instr = { code: 0x88, value: {} }
export const U256ToString: Instr = { code: 0x89, value: {} }
export const I256ToString: Instr = { code: 0x8a, value: {} }
export const BoolToString: Instr = { code: 0x8b, value: {} }
export const LoadMutField = (index: number): Instr => ({ code: 0xa0, value: { index } })
export const StoreMutField = (index: number): Instr => ({ code: 0xa1, value: { index } })
export const ApproveAlph: Instr = { code: 0xa2, value: {} }
export const ApproveToken: Instr = { code: 0xa3, value: {} }
export const AlphRemaining: Instr = { code: 0xa4, value: {} }
export const TokenRemaining: Instr = { code: 0xa5, value: {} }
export const IsPaying: Instr = { code: 0xa6, value: {} }
export const TransferAlph: Instr = { code: 0xa7, value: {} }
export const TransferAlphFromSelf: Instr = { code: 0xa8, value: {} }
export const TransferAlphToSelf: Instr = { code: 0xa9, value: {} }
export const TransferToken: Instr = { code: 0xaa, value: {} }
export const TransferTokenFromSelf: Instr = { code: 0xab, value: {} }
export const TransferTokenToSelf: Instr = { code: 0xac, value: {} }
export const CreateContract: Instr = { code: 0xad, value: {} }
export const CreateContractWithToken: Instr = { code: 0xae, value: {} }
export const CopyCreateContract: Instr = { code: 0xaf, value: {} }
export const DestroySelf: Instr = { code: 0xb0, value: {} }
export const SelfContractId: Instr = { code: 0xb1, value: {} }
export const SelfAddress: Instr = { code: 0xb2, value: {} }
export const CallerContractId: Instr = { code: 0xb3, value: {} }
export const CallerAddress: Instr = { code: 0xb4, value: {} }
export const IsCallerFromTxScript: Instr = { code: 0xb5, value: {} }
export const CallerInitialStateHash: Instr = { code: 0xb6, value: {} }
export const CallCodeHash: Instr = { code: 0xb7, value: {} }
export const ContractInitialStateHash: Instr = { code: 0xb8, value: {} }
export const ContractInitialCodeHash: Instr = { code: 0xb9, value: {} }
export const MigrateSimple: Instr = { code: 0xba, value: {} }
export const MigrateWithFields: Instr = { code: 0xbb, value: {} }
export const CopyCreateContractWithToken: Instr = { code: 0xbc, value: {} }
export const BurnToken: Instr = { code: 0xbd, value: {} }
export const LockApprovedAssets: Instr = { code: 0xbe, value: {} }
export const CreateSubContract: Instr = { code: 0xbf, value: {} }
export const CreateSubContractWithToken: Instr = { code: 0xc0, value: {} }
export const CopyCreateSubContract: Instr = { code: 0xc1, value: {} }
export const CopyCreateSubContractWithToken: Instr = { code: 0xc2, value: {} }
export const LoadMutFieldByIndex: Instr = { code: 0xc3, value: {} }
export const StoreMutFieldByIndex: Instr = { code: 0xc4, value: {} }
export const ContractExists: Instr = { code: 0xc5, value: {} }
export const CreateContractAndTransferToken: Instr = { code: 0xc6, value: {} }
export const CopyCreateContractAndTransferToken: Instr = { code: 0xc7, value: {} }
export const CreateSubContractAndTransferToken: Instr = { code: 0xc8, value: {} }
export const CopyCreateSubContractAndTransferToken: Instr = { code: 0xc9, value: {} }
export const NullContractAddress: Instr = { code: 0xca, value: {} }
export const SubContractId: Instr = { code: 0xcb, value: {} }
export const SubContractOf: Instr = { code: 0xcc, value: {} }
export const AlphTokenId: Instr = { code: 0xcd, value: {} }
export const LoadImmField = (index: number): Instr => ({ code: 0xce, value: { index } })
export const LoadImmFieldByIndex: Instr = { code: 0xcf, value: {} }

export class InstrCodec implements Codec<Instr> {
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
        0x12: Parser.start().nest('value', { type: compactSignedIntCodec.parser }), // I256Const
        0x13: Parser.start().nest('value', { type: compactUnsignedIntCodec.parser }), // U256Const
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
        0x4a: Parser.start().nest('value', { type: compactUnsignedIntCodec.parser }), // Jump
        0x4b: Parser.start().nest('value', { type: compactUnsignedIntCodec.parser }), // IfTrue
        0x4c: Parser.start().nest('value', { type: compactUnsignedIntCodec.parser }), // IfFalse
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
        0x7e: Parser.start().nest('stringParts', { type: byteStringArrayCodec.parser }), // DEBUG
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

  encode(instr: Instr): Buffer {
    const instrValue = instr.value
    const result = [instr.code]
    const instrsWithIndex = [0x00, 0x01, 0x16, 0x17, 0xa0, 0xa1, 0xce]
    const instrsWithCompactInt = [0x12, 0x13, 0x4a, 0x4b, 0x4c]
    if (instr.code === 0x14) {
      result.push(...byteStringCodec.encode((instrValue as ByteStringConst).value))
    } else if (instr.code === 0x15) {
      result.push(...lockupScriptCodec.encode((instrValue as AddressConst).value))
    } else if (instr.code === 0x7e) {
      result.push(...byteStringArrayCodec.encode((instrValue as Debug).stringParts.value))
    } else if (instrsWithCompactInt.includes(instr.code)) {
      result.push(...compactUnsignedIntCodec.encode((instrValue as InstrValueWithCompactInt).value))
    } else if (instrsWithIndex.includes(instr.code)) {
      result.push((instrValue as InstrValueWithIndex).index)
    }

    return Buffer.from(result)
  }

  decode(input: Buffer): Instr {
    return this.parser.parse(input)
  }
}

export const instrCodec = new InstrCodec()
export const instrsCodec = new ArrayCodec<Instr>(instrCodec)
