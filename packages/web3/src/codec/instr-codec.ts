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
// auto-generated, do not edit
import { ArrayCodec } from './array-codec'
import { i256Codec, u256Codec, i32Codec } from './compact-int-codec'
import { ByteString, byteStringCodec, byteStringsCodec } from './bytestring-codec'
import { LockupScript, lockupScriptCodec } from './lockup-script-codec'
import { assert, byteCodec, Codec } from './codec'
import { intAs4BytesCodec } from './int-as-4bytes-codec'
import { Reader } from './reader'
export type Instr =
  | { name: 'CallLocal'; code: 0x00; index: number }
  | { name: 'CallExternal'; code: 0x01; index: number }
  | { name: 'Return'; code: 0x02 }
  | { name: 'ConstTrue'; code: 0x03 }
  | { name: 'ConstFalse'; code: 0x04 }
  | { name: 'I256Const0'; code: 0x05 }
  | { name: 'I256Const1'; code: 0x06 }
  | { name: 'I256Const2'; code: 0x07 }
  | { name: 'I256Const3'; code: 0x08 }
  | { name: 'I256Const4'; code: 0x09 }
  | { name: 'I256Const5'; code: 0x0a }
  | { name: 'I256ConstN1'; code: 0x0b }
  | { name: 'U256Const0'; code: 0x0c }
  | { name: 'U256Const1'; code: 0x0d }
  | { name: 'U256Const2'; code: 0x0e }
  | { name: 'U256Const3'; code: 0x0f }
  | { name: 'U256Const4'; code: 0x10 }
  | { name: 'U256Const5'; code: 0x11 }
  | { name: 'I256Const'; code: 0x12; value: bigint }
  | { name: 'U256Const'; code: 0x13; value: bigint }
  | { name: 'BytesConst'; code: 0x14; value: ByteString }
  | { name: 'AddressConst'; code: 0x15; value: LockupScript }
  | { name: 'LoadLocal'; code: 0x16; index: number }
  | { name: 'StoreLocal'; code: 0x17; index: number }
  | { name: 'Pop'; code: 0x18 }
  | { name: 'BoolNot'; code: 0x19 }
  | { name: 'BoolAnd'; code: 0x1a }
  | { name: 'BoolOr'; code: 0x1b }
  | { name: 'BoolEq'; code: 0x1c }
  | { name: 'BoolNeq'; code: 0x1d }
  | { name: 'BoolToByteVec'; code: 0x1e }
  | { name: 'I256Add'; code: 0x1f }
  | { name: 'I256Sub'; code: 0x20 }
  | { name: 'I256Mul'; code: 0x21 }
  | { name: 'I256Div'; code: 0x22 }
  | { name: 'I256Mod'; code: 0x23 }
  | { name: 'I256Eq'; code: 0x24 }
  | { name: 'I256Neq'; code: 0x25 }
  | { name: 'I256Lt'; code: 0x26 }
  | { name: 'I256Le'; code: 0x27 }
  | { name: 'I256Gt'; code: 0x28 }
  | { name: 'I256Ge'; code: 0x29 }
  | { name: 'U256Add'; code: 0x2a }
  | { name: 'U256Sub'; code: 0x2b }
  | { name: 'U256Mul'; code: 0x2c }
  | { name: 'U256Div'; code: 0x2d }
  | { name: 'U256Mod'; code: 0x2e }
  | { name: 'U256Eq'; code: 0x2f }
  | { name: 'U256Neq'; code: 0x30 }
  | { name: 'U256Lt'; code: 0x31 }
  | { name: 'U256Le'; code: 0x32 }
  | { name: 'U256Gt'; code: 0x33 }
  | { name: 'U256Ge'; code: 0x34 }
  | { name: 'U256ModAdd'; code: 0x35 }
  | { name: 'U256ModSub'; code: 0x36 }
  | { name: 'U256ModMul'; code: 0x37 }
  | { name: 'U256BitAnd'; code: 0x38 }
  | { name: 'U256BitOr'; code: 0x39 }
  | { name: 'U256Xor'; code: 0x3a }
  | { name: 'U256SHL'; code: 0x3b }
  | { name: 'U256SHR'; code: 0x3c }
  | { name: 'I256ToU256'; code: 0x3d }
  | { name: 'I256ToByteVec'; code: 0x3e }
  | { name: 'U256ToI256'; code: 0x3f }
  | { name: 'U256ToByteVec'; code: 0x40 }
  | { name: 'ByteVecEq'; code: 0x41 }
  | { name: 'ByteVecNeq'; code: 0x42 }
  | { name: 'ByteVecSize'; code: 0x43 }
  | { name: 'ByteVecConcat'; code: 0x44 }
  | { name: 'AddressEq'; code: 0x45 }
  | { name: 'AddressNeq'; code: 0x46 }
  | { name: 'AddressToByteVec'; code: 0x47 }
  | { name: 'IsAssetAddress'; code: 0x48 }
  | { name: 'IsContractAddress'; code: 0x49 }
  | { name: 'Jump'; code: 0x4a; offset: number }
  | { name: 'IfTrue'; code: 0x4b; offset: number }
  | { name: 'IfFalse'; code: 0x4c; offset: number }
  | { name: 'Assert'; code: 0x4d }
  | { name: 'Blake2b'; code: 0x4e }
  | { name: 'Keccak256'; code: 0x4f }
  | { name: 'Sha256'; code: 0x50 }
  | { name: 'Sha3'; code: 0x51 }
  | { name: 'VerifyTxSignature'; code: 0x52 }
  | { name: 'VerifySecP256K1'; code: 0x53 }
  | { name: 'VerifyED25519'; code: 0x54 }
  | { name: 'NetworkId'; code: 0x55 }
  | { name: 'BlockTimeStamp'; code: 0x56 }
  | { name: 'BlockTarget'; code: 0x57 }
  | { name: 'TxId'; code: 0x58 }
  | { name: 'TxInputAddressAt'; code: 0x59 }
  | { name: 'TxInputsSize'; code: 0x5a }
  | { name: 'VerifyAbsoluteLocktime'; code: 0x5b }
  | { name: 'VerifyRelativeLocktime'; code: 0x5c }
  | { name: 'Log1'; code: 0x5d }
  | { name: 'Log2'; code: 0x5e }
  | { name: 'Log3'; code: 0x5f }
  | { name: 'Log4'; code: 0x60 }
  | { name: 'Log5'; code: 0x61 }
  | { name: 'ByteVecSlice'; code: 0x62 }
  | { name: 'ByteVecToAddress'; code: 0x63 }
  | { name: 'Encode'; code: 0x64 }
  | { name: 'Zeros'; code: 0x65 }
  | { name: 'U256To1Byte'; code: 0x66 }
  | { name: 'U256To2Byte'; code: 0x67 }
  | { name: 'U256To4Byte'; code: 0x68 }
  | { name: 'U256To8Byte'; code: 0x69 }
  | { name: 'U256To16Byte'; code: 0x6a }
  | { name: 'U256To32Byte'; code: 0x6b }
  | { name: 'U256From1Byte'; code: 0x6c }
  | { name: 'U256From2Byte'; code: 0x6d }
  | { name: 'U256From4Byte'; code: 0x6e }
  | { name: 'U256From8Byte'; code: 0x6f }
  | { name: 'U256From16Byte'; code: 0x70 }
  | { name: 'U256From32Byte'; code: 0x71 }
  | { name: 'EthEcRecover'; code: 0x72 }
  | { name: 'Log6'; code: 0x73 }
  | { name: 'Log7'; code: 0x74 }
  | { name: 'Log8'; code: 0x75 }
  | { name: 'Log9'; code: 0x76 }
  | { name: 'ContractIdToAddress'; code: 0x77 }
  | { name: 'LoadLocalByIndex'; code: 0x78 }
  | { name: 'StoreLocalByIndex'; code: 0x79 }
  | { name: 'Dup'; code: 0x7a }
  | { name: 'AssertWithErrorCode'; code: 0x7b }
  | { name: 'Swap'; code: 0x7c }
  | { name: 'BlockHash'; code: 0x7d }
  | { name: 'DEBUG'; code: 0x7e; stringParts: ByteString[] }
  | { name: 'TxGasPrice'; code: 0x7f }
  | { name: 'TxGasAmount'; code: 0x80 }
  | { name: 'TxGasFee'; code: 0x81 }
  | { name: 'I256Exp'; code: 0x82 }
  | { name: 'U256Exp'; code: 0x83 }
  | { name: 'U256ModExp'; code: 0x84 }
  | { name: 'VerifyBIP340Schnorr'; code: 0x85 }
  | { name: 'GetSegregatedSignature'; code: 0x86 }
  | { name: 'MulModN'; code: 0x87 }
  | { name: 'AddModN'; code: 0x88 }
  | { name: 'U256ToString'; code: 0x89 }
  | { name: 'I256ToString'; code: 0x8a }
  | { name: 'BoolToString'; code: 0x8b }
  | { name: 'GroupOfAddress'; code: 0x8c }
  | { name: 'LoadMutField'; code: 0xa0; index: number }
  | { name: 'StoreMutField'; code: 0xa1; index: number }
  | { name: 'ApproveAlph'; code: 0xa2 }
  | { name: 'ApproveToken'; code: 0xa3 }
  | { name: 'AlphRemaining'; code: 0xa4 }
  | { name: 'TokenRemaining'; code: 0xa5 }
  | { name: 'IsPaying'; code: 0xa6 }
  | { name: 'TransferAlph'; code: 0xa7 }
  | { name: 'TransferAlphFromSelf'; code: 0xa8 }
  | { name: 'TransferAlphToSelf'; code: 0xa9 }
  | { name: 'TransferToken'; code: 0xaa }
  | { name: 'TransferTokenFromSelf'; code: 0xab }
  | { name: 'TransferTokenToSelf'; code: 0xac }
  | { name: 'CreateContract'; code: 0xad }
  | { name: 'CreateContractWithToken'; code: 0xae }
  | { name: 'CopyCreateContract'; code: 0xaf }
  | { name: 'DestroySelf'; code: 0xb0 }
  | { name: 'SelfContractId'; code: 0xb1 }
  | { name: 'SelfAddress'; code: 0xb2 }
  | { name: 'CallerContractId'; code: 0xb3 }
  | { name: 'CallerAddress'; code: 0xb4 }
  | { name: 'IsCalledFromTxScript'; code: 0xb5 }
  | { name: 'CallerInitialStateHash'; code: 0xb6 }
  | { name: 'CallerCodeHash'; code: 0xb7 }
  | { name: 'ContractInitialStateHash'; code: 0xb8 }
  | { name: 'ContractCodeHash'; code: 0xb9 }
  | { name: 'MigrateSimple'; code: 0xba }
  | { name: 'MigrateWithFields'; code: 0xbb }
  | { name: 'CopyCreateContractWithToken'; code: 0xbc }
  | { name: 'BurnToken'; code: 0xbd }
  | { name: 'LockApprovedAssets'; code: 0xbe }
  | { name: 'CreateSubContract'; code: 0xbf }
  | { name: 'CreateSubContractWithToken'; code: 0xc0 }
  | { name: 'CopyCreateSubContract'; code: 0xc1 }
  | { name: 'CopyCreateSubContractWithToken'; code: 0xc2 }
  | { name: 'LoadMutFieldByIndex'; code: 0xc3 }
  | { name: 'StoreMutFieldByIndex'; code: 0xc4 }
  | { name: 'ContractExists'; code: 0xc5 }
  | { name: 'CreateContractAndTransferToken'; code: 0xc6 }
  | { name: 'CopyCreateContractAndTransferToken'; code: 0xc7 }
  | { name: 'CreateSubContractAndTransferToken'; code: 0xc8 }
  | { name: 'CopyCreateSubContractAndTransferToken'; code: 0xc9 }
  | { name: 'NullContractAddress'; code: 0xca }
  | { name: 'SubContractId'; code: 0xcb }
  | { name: 'SubContractIdOf'; code: 0xcc }
  | { name: 'ALPHTokenId'; code: 0xcd }
  | { name: 'LoadImmField'; code: 0xce; index: number }
  | { name: 'LoadImmFieldByIndex'; code: 0xcf }
  | { name: 'PayGasFee'; code: 0xd0 }
  | { name: 'MinimalContractDeposit'; code: 0xd1 }
  | { name: 'CreateMapEntry'; code: 0xd2; immFieldsNum: number; mutFieldsNum: number }
  | { name: 'MethodSelector'; code: 0xd3; selector: number }
  | { name: 'CallExternalBySelector'; code: 0xd4; selector: number }
export const CallLocalCode = 0x00
export const CallExternalCode = 0x01
export const I256ConstCode = 0x12
export const U256ConstCode = 0x13
export const BytesConstCode = 0x14
export const AddressConstCode = 0x15
export const LoadLocalCode = 0x16
export const StoreLocalCode = 0x17
export const JumpCode = 0x4a
export const IfTrueCode = 0x4b
export const IfFalseCode = 0x4c
export const DEBUGCode = 0x7e
export const LoadMutFieldCode = 0xa0
export const StoreMutFieldCode = 0xa1
export const LoadImmFieldCode = 0xce
export const CreateMapEntryCode = 0xd2
export const MethodSelectorCode = 0xd3
export const CallExternalBySelectorCode = 0xd4
export const CallLocal: (index: number) => Instr = (index: number) => {
  return { name: 'CallLocal', code: 0x00, index }
}
export const CallExternal: (index: number) => Instr = (index: number) => {
  return { name: 'CallExternal', code: 0x01, index }
}
export const Return: Instr = { name: 'Return', code: 0x02 }
export const ConstTrue: Instr = { name: 'ConstTrue', code: 0x03 }
export const ConstFalse: Instr = { name: 'ConstFalse', code: 0x04 }
export const I256Const0: Instr = { name: 'I256Const0', code: 0x05 }
export const I256Const1: Instr = { name: 'I256Const1', code: 0x06 }
export const I256Const2: Instr = { name: 'I256Const2', code: 0x07 }
export const I256Const3: Instr = { name: 'I256Const3', code: 0x08 }
export const I256Const4: Instr = { name: 'I256Const4', code: 0x09 }
export const I256Const5: Instr = { name: 'I256Const5', code: 0x0a }
export const I256ConstN1: Instr = { name: 'I256ConstN1', code: 0x0b }
export const U256Const0: Instr = { name: 'U256Const0', code: 0x0c }
export const U256Const1: Instr = { name: 'U256Const1', code: 0x0d }
export const U256Const2: Instr = { name: 'U256Const2', code: 0x0e }
export const U256Const3: Instr = { name: 'U256Const3', code: 0x0f }
export const U256Const4: Instr = { name: 'U256Const4', code: 0x10 }
export const U256Const5: Instr = { name: 'U256Const5', code: 0x11 }
export const I256Const: (value: bigint) => Instr = (value: bigint) => {
  return { name: 'I256Const', code: 0x12, value }
}
export const U256Const: (value: bigint) => Instr = (value: bigint) => {
  return { name: 'U256Const', code: 0x13, value }
}
export const BytesConst: (value: ByteString) => Instr = (value: ByteString) => {
  return { name: 'BytesConst', code: 0x14, value }
}
export const AddressConst: (value: LockupScript) => Instr = (value: LockupScript) => {
  return { name: 'AddressConst', code: 0x15, value }
}
export const LoadLocal: (index: number) => Instr = (index: number) => {
  return { name: 'LoadLocal', code: 0x16, index }
}
export const StoreLocal: (index: number) => Instr = (index: number) => {
  return { name: 'StoreLocal', code: 0x17, index }
}
export const Pop: Instr = { name: 'Pop', code: 0x18 }
export const BoolNot: Instr = { name: 'BoolNot', code: 0x19 }
export const BoolAnd: Instr = { name: 'BoolAnd', code: 0x1a }
export const BoolOr: Instr = { name: 'BoolOr', code: 0x1b }
export const BoolEq: Instr = { name: 'BoolEq', code: 0x1c }
export const BoolNeq: Instr = { name: 'BoolNeq', code: 0x1d }
export const BoolToByteVec: Instr = { name: 'BoolToByteVec', code: 0x1e }
export const I256Add: Instr = { name: 'I256Add', code: 0x1f }
export const I256Sub: Instr = { name: 'I256Sub', code: 0x20 }
export const I256Mul: Instr = { name: 'I256Mul', code: 0x21 }
export const I256Div: Instr = { name: 'I256Div', code: 0x22 }
export const I256Mod: Instr = { name: 'I256Mod', code: 0x23 }
export const I256Eq: Instr = { name: 'I256Eq', code: 0x24 }
export const I256Neq: Instr = { name: 'I256Neq', code: 0x25 }
export const I256Lt: Instr = { name: 'I256Lt', code: 0x26 }
export const I256Le: Instr = { name: 'I256Le', code: 0x27 }
export const I256Gt: Instr = { name: 'I256Gt', code: 0x28 }
export const I256Ge: Instr = { name: 'I256Ge', code: 0x29 }
export const U256Add: Instr = { name: 'U256Add', code: 0x2a }
export const U256Sub: Instr = { name: 'U256Sub', code: 0x2b }
export const U256Mul: Instr = { name: 'U256Mul', code: 0x2c }
export const U256Div: Instr = { name: 'U256Div', code: 0x2d }
export const U256Mod: Instr = { name: 'U256Mod', code: 0x2e }
export const U256Eq: Instr = { name: 'U256Eq', code: 0x2f }
export const U256Neq: Instr = { name: 'U256Neq', code: 0x30 }
export const U256Lt: Instr = { name: 'U256Lt', code: 0x31 }
export const U256Le: Instr = { name: 'U256Le', code: 0x32 }
export const U256Gt: Instr = { name: 'U256Gt', code: 0x33 }
export const U256Ge: Instr = { name: 'U256Ge', code: 0x34 }
export const U256ModAdd: Instr = { name: 'U256ModAdd', code: 0x35 }
export const U256ModSub: Instr = { name: 'U256ModSub', code: 0x36 }
export const U256ModMul: Instr = { name: 'U256ModMul', code: 0x37 }
export const U256BitAnd: Instr = { name: 'U256BitAnd', code: 0x38 }
export const U256BitOr: Instr = { name: 'U256BitOr', code: 0x39 }
export const U256Xor: Instr = { name: 'U256Xor', code: 0x3a }
export const U256SHL: Instr = { name: 'U256SHL', code: 0x3b }
export const U256SHR: Instr = { name: 'U256SHR', code: 0x3c }
export const I256ToU256: Instr = { name: 'I256ToU256', code: 0x3d }
export const I256ToByteVec: Instr = { name: 'I256ToByteVec', code: 0x3e }
export const U256ToI256: Instr = { name: 'U256ToI256', code: 0x3f }
export const U256ToByteVec: Instr = { name: 'U256ToByteVec', code: 0x40 }
export const ByteVecEq: Instr = { name: 'ByteVecEq', code: 0x41 }
export const ByteVecNeq: Instr = { name: 'ByteVecNeq', code: 0x42 }
export const ByteVecSize: Instr = { name: 'ByteVecSize', code: 0x43 }
export const ByteVecConcat: Instr = { name: 'ByteVecConcat', code: 0x44 }
export const AddressEq: Instr = { name: 'AddressEq', code: 0x45 }
export const AddressNeq: Instr = { name: 'AddressNeq', code: 0x46 }
export const AddressToByteVec: Instr = { name: 'AddressToByteVec', code: 0x47 }
export const IsAssetAddress: Instr = { name: 'IsAssetAddress', code: 0x48 }
export const IsContractAddress: Instr = { name: 'IsContractAddress', code: 0x49 }
export const Jump: (offset: number) => Instr = (offset: number) => {
  return { name: 'Jump', code: 0x4a, offset }
}
export const IfTrue: (offset: number) => Instr = (offset: number) => {
  return { name: 'IfTrue', code: 0x4b, offset }
}
export const IfFalse: (offset: number) => Instr = (offset: number) => {
  return { name: 'IfFalse', code: 0x4c, offset }
}
export const Assert: Instr = { name: 'Assert', code: 0x4d }
export const Blake2b: Instr = { name: 'Blake2b', code: 0x4e }
export const Keccak256: Instr = { name: 'Keccak256', code: 0x4f }
export const Sha256: Instr = { name: 'Sha256', code: 0x50 }
export const Sha3: Instr = { name: 'Sha3', code: 0x51 }
export const VerifyTxSignature: Instr = { name: 'VerifyTxSignature', code: 0x52 }
export const VerifySecP256K1: Instr = { name: 'VerifySecP256K1', code: 0x53 }
export const VerifyED25519: Instr = { name: 'VerifyED25519', code: 0x54 }
export const NetworkId: Instr = { name: 'NetworkId', code: 0x55 }
export const BlockTimeStamp: Instr = { name: 'BlockTimeStamp', code: 0x56 }
export const BlockTarget: Instr = { name: 'BlockTarget', code: 0x57 }
export const TxId: Instr = { name: 'TxId', code: 0x58 }
export const TxInputAddressAt: Instr = { name: 'TxInputAddressAt', code: 0x59 }
export const TxInputsSize: Instr = { name: 'TxInputsSize', code: 0x5a }
export const VerifyAbsoluteLocktime: Instr = { name: 'VerifyAbsoluteLocktime', code: 0x5b }
export const VerifyRelativeLocktime: Instr = { name: 'VerifyRelativeLocktime', code: 0x5c }
export const Log1: Instr = { name: 'Log1', code: 0x5d }
export const Log2: Instr = { name: 'Log2', code: 0x5e }
export const Log3: Instr = { name: 'Log3', code: 0x5f }
export const Log4: Instr = { name: 'Log4', code: 0x60 }
export const Log5: Instr = { name: 'Log5', code: 0x61 }
export const ByteVecSlice: Instr = { name: 'ByteVecSlice', code: 0x62 }
export const ByteVecToAddress: Instr = { name: 'ByteVecToAddress', code: 0x63 }
export const Encode: Instr = { name: 'Encode', code: 0x64 }
export const Zeros: Instr = { name: 'Zeros', code: 0x65 }
export const U256To1Byte: Instr = { name: 'U256To1Byte', code: 0x66 }
export const U256To2Byte: Instr = { name: 'U256To2Byte', code: 0x67 }
export const U256To4Byte: Instr = { name: 'U256To4Byte', code: 0x68 }
export const U256To8Byte: Instr = { name: 'U256To8Byte', code: 0x69 }
export const U256To16Byte: Instr = { name: 'U256To16Byte', code: 0x6a }
export const U256To32Byte: Instr = { name: 'U256To32Byte', code: 0x6b }
export const U256From1Byte: Instr = { name: 'U256From1Byte', code: 0x6c }
export const U256From2Byte: Instr = { name: 'U256From2Byte', code: 0x6d }
export const U256From4Byte: Instr = { name: 'U256From4Byte', code: 0x6e }
export const U256From8Byte: Instr = { name: 'U256From8Byte', code: 0x6f }
export const U256From16Byte: Instr = { name: 'U256From16Byte', code: 0x70 }
export const U256From32Byte: Instr = { name: 'U256From32Byte', code: 0x71 }
export const EthEcRecover: Instr = { name: 'EthEcRecover', code: 0x72 }
export const Log6: Instr = { name: 'Log6', code: 0x73 }
export const Log7: Instr = { name: 'Log7', code: 0x74 }
export const Log8: Instr = { name: 'Log8', code: 0x75 }
export const Log9: Instr = { name: 'Log9', code: 0x76 }
export const ContractIdToAddress: Instr = { name: 'ContractIdToAddress', code: 0x77 }
export const LoadLocalByIndex: Instr = { name: 'LoadLocalByIndex', code: 0x78 }
export const StoreLocalByIndex: Instr = { name: 'StoreLocalByIndex', code: 0x79 }
export const Dup: Instr = { name: 'Dup', code: 0x7a }
export const AssertWithErrorCode: Instr = { name: 'AssertWithErrorCode', code: 0x7b }
export const Swap: Instr = { name: 'Swap', code: 0x7c }
export const BlockHash: Instr = { name: 'BlockHash', code: 0x7d }
export const DEBUG: (stringParts: ByteString[]) => Instr = (stringParts: ByteString[]) => {
  return { name: 'DEBUG', code: 0x7e, stringParts }
}
export const TxGasPrice: Instr = { name: 'TxGasPrice', code: 0x7f }
export const TxGasAmount: Instr = { name: 'TxGasAmount', code: 0x80 }
export const TxGasFee: Instr = { name: 'TxGasFee', code: 0x81 }
export const I256Exp: Instr = { name: 'I256Exp', code: 0x82 }
export const U256Exp: Instr = { name: 'U256Exp', code: 0x83 }
export const U256ModExp: Instr = { name: 'U256ModExp', code: 0x84 }
export const VerifyBIP340Schnorr: Instr = { name: 'VerifyBIP340Schnorr', code: 0x85 }
export const GetSegregatedSignature: Instr = { name: 'GetSegregatedSignature', code: 0x86 }
export const MulModN: Instr = { name: 'MulModN', code: 0x87 }
export const AddModN: Instr = { name: 'AddModN', code: 0x88 }
export const U256ToString: Instr = { name: 'U256ToString', code: 0x89 }
export const I256ToString: Instr = { name: 'I256ToString', code: 0x8a }
export const BoolToString: Instr = { name: 'BoolToString', code: 0x8b }
export const GroupOfAddress: Instr = { name: 'GroupOfAddress', code: 0x8c }
export const LoadMutField: (index: number) => Instr = (index: number) => {
  return { name: 'LoadMutField', code: 0xa0, index }
}
export const StoreMutField: (index: number) => Instr = (index: number) => {
  return { name: 'StoreMutField', code: 0xa1, index }
}
export const ApproveAlph: Instr = { name: 'ApproveAlph', code: 0xa2 }
export const ApproveToken: Instr = { name: 'ApproveToken', code: 0xa3 }
export const AlphRemaining: Instr = { name: 'AlphRemaining', code: 0xa4 }
export const TokenRemaining: Instr = { name: 'TokenRemaining', code: 0xa5 }
export const IsPaying: Instr = { name: 'IsPaying', code: 0xa6 }
export const TransferAlph: Instr = { name: 'TransferAlph', code: 0xa7 }
export const TransferAlphFromSelf: Instr = { name: 'TransferAlphFromSelf', code: 0xa8 }
export const TransferAlphToSelf: Instr = { name: 'TransferAlphToSelf', code: 0xa9 }
export const TransferToken: Instr = { name: 'TransferToken', code: 0xaa }
export const TransferTokenFromSelf: Instr = { name: 'TransferTokenFromSelf', code: 0xab }
export const TransferTokenToSelf: Instr = { name: 'TransferTokenToSelf', code: 0xac }
export const CreateContract: Instr = { name: 'CreateContract', code: 0xad }
export const CreateContractWithToken: Instr = { name: 'CreateContractWithToken', code: 0xae }
export const CopyCreateContract: Instr = { name: 'CopyCreateContract', code: 0xaf }
export const DestroySelf: Instr = { name: 'DestroySelf', code: 0xb0 }
export const SelfContractId: Instr = { name: 'SelfContractId', code: 0xb1 }
export const SelfAddress: Instr = { name: 'SelfAddress', code: 0xb2 }
export const CallerContractId: Instr = { name: 'CallerContractId', code: 0xb3 }
export const CallerAddress: Instr = { name: 'CallerAddress', code: 0xb4 }
export const IsCalledFromTxScript: Instr = { name: 'IsCalledFromTxScript', code: 0xb5 }
export const CallerInitialStateHash: Instr = { name: 'CallerInitialStateHash', code: 0xb6 }
export const CallerCodeHash: Instr = { name: 'CallerCodeHash', code: 0xb7 }
export const ContractInitialStateHash: Instr = { name: 'ContractInitialStateHash', code: 0xb8 }
export const ContractCodeHash: Instr = { name: 'ContractCodeHash', code: 0xb9 }
export const MigrateSimple: Instr = { name: 'MigrateSimple', code: 0xba }
export const MigrateWithFields: Instr = { name: 'MigrateWithFields', code: 0xbb }
export const CopyCreateContractWithToken: Instr = { name: 'CopyCreateContractWithToken', code: 0xbc }
export const BurnToken: Instr = { name: 'BurnToken', code: 0xbd }
export const LockApprovedAssets: Instr = { name: 'LockApprovedAssets', code: 0xbe }
export const CreateSubContract: Instr = { name: 'CreateSubContract', code: 0xbf }
export const CreateSubContractWithToken: Instr = { name: 'CreateSubContractWithToken', code: 0xc0 }
export const CopyCreateSubContract: Instr = { name: 'CopyCreateSubContract', code: 0xc1 }
export const CopyCreateSubContractWithToken: Instr = { name: 'CopyCreateSubContractWithToken', code: 0xc2 }
export const LoadMutFieldByIndex: Instr = { name: 'LoadMutFieldByIndex', code: 0xc3 }
export const StoreMutFieldByIndex: Instr = { name: 'StoreMutFieldByIndex', code: 0xc4 }
export const ContractExists: Instr = { name: 'ContractExists', code: 0xc5 }
export const CreateContractAndTransferToken: Instr = { name: 'CreateContractAndTransferToken', code: 0xc6 }
export const CopyCreateContractAndTransferToken: Instr = { name: 'CopyCreateContractAndTransferToken', code: 0xc7 }
export const CreateSubContractAndTransferToken: Instr = { name: 'CreateSubContractAndTransferToken', code: 0xc8 }
export const CopyCreateSubContractAndTransferToken: Instr = {
  name: 'CopyCreateSubContractAndTransferToken',
  code: 0xc9
}
export const NullContractAddress: Instr = { name: 'NullContractAddress', code: 0xca }
export const SubContractId: Instr = { name: 'SubContractId', code: 0xcb }
export const SubContractIdOf: Instr = { name: 'SubContractIdOf', code: 0xcc }
export const ALPHTokenId: Instr = { name: 'ALPHTokenId', code: 0xcd }
export const LoadImmField: (index: number) => Instr = (index: number) => {
  return { name: 'LoadImmField', code: 0xce, index }
}
export const LoadImmFieldByIndex: Instr = { name: 'LoadImmFieldByIndex', code: 0xcf }
export const PayGasFee: Instr = { name: 'PayGasFee', code: 0xd0 }
export const MinimalContractDeposit: Instr = { name: 'MinimalContractDeposit', code: 0xd1 }
export const CreateMapEntry: (immFieldsNum: number, mutFieldsNum: number) => Instr = (
  immFieldsNum: number,
  mutFieldsNum: number
) => {
  return { name: 'CreateMapEntry', code: 0xd2, immFieldsNum, mutFieldsNum }
}
export const MethodSelector: (selector: number) => Instr = (selector: number) => {
  return { name: 'MethodSelector', code: 0xd3, selector }
}
export const CallExternalBySelector: (selector: number) => Instr = (selector: number) => {
  return { name: 'CallExternalBySelector', code: 0xd4, selector }
}
export class InstrCodec extends Codec<Instr> {
  encode(instr: Instr): Uint8Array {
    switch (instr.name) {
      case 'CallLocal':
        return new Uint8Array([0x00, ...byteCodec.encode(instr.index)])
      case 'CallExternal':
        return new Uint8Array([0x01, ...byteCodec.encode(instr.index)])
      case 'Return':
        return new Uint8Array([0x02])
      case 'ConstTrue':
        return new Uint8Array([0x03])
      case 'ConstFalse':
        return new Uint8Array([0x04])
      case 'I256Const0':
        return new Uint8Array([0x05])
      case 'I256Const1':
        return new Uint8Array([0x06])
      case 'I256Const2':
        return new Uint8Array([0x07])
      case 'I256Const3':
        return new Uint8Array([0x08])
      case 'I256Const4':
        return new Uint8Array([0x09])
      case 'I256Const5':
        return new Uint8Array([0x0a])
      case 'I256ConstN1':
        return new Uint8Array([0x0b])
      case 'U256Const0':
        return new Uint8Array([0x0c])
      case 'U256Const1':
        return new Uint8Array([0x0d])
      case 'U256Const2':
        return new Uint8Array([0x0e])
      case 'U256Const3':
        return new Uint8Array([0x0f])
      case 'U256Const4':
        return new Uint8Array([0x10])
      case 'U256Const5':
        return new Uint8Array([0x11])
      case 'I256Const':
        return new Uint8Array([0x12, ...i256Codec.encode(instr.value)])
      case 'U256Const':
        return new Uint8Array([0x13, ...u256Codec.encode(instr.value)])
      case 'BytesConst':
        return new Uint8Array([0x14, ...byteStringCodec.encode(instr.value)])
      case 'AddressConst':
        return new Uint8Array([0x15, ...lockupScriptCodec.encode(instr.value)])
      case 'LoadLocal':
        return new Uint8Array([0x16, ...byteCodec.encode(instr.index)])
      case 'StoreLocal':
        return new Uint8Array([0x17, ...byteCodec.encode(instr.index)])
      case 'Pop':
        return new Uint8Array([0x18])
      case 'BoolNot':
        return new Uint8Array([0x19])
      case 'BoolAnd':
        return new Uint8Array([0x1a])
      case 'BoolOr':
        return new Uint8Array([0x1b])
      case 'BoolEq':
        return new Uint8Array([0x1c])
      case 'BoolNeq':
        return new Uint8Array([0x1d])
      case 'BoolToByteVec':
        return new Uint8Array([0x1e])
      case 'I256Add':
        return new Uint8Array([0x1f])
      case 'I256Sub':
        return new Uint8Array([0x20])
      case 'I256Mul':
        return new Uint8Array([0x21])
      case 'I256Div':
        return new Uint8Array([0x22])
      case 'I256Mod':
        return new Uint8Array([0x23])
      case 'I256Eq':
        return new Uint8Array([0x24])
      case 'I256Neq':
        return new Uint8Array([0x25])
      case 'I256Lt':
        return new Uint8Array([0x26])
      case 'I256Le':
        return new Uint8Array([0x27])
      case 'I256Gt':
        return new Uint8Array([0x28])
      case 'I256Ge':
        return new Uint8Array([0x29])
      case 'U256Add':
        return new Uint8Array([0x2a])
      case 'U256Sub':
        return new Uint8Array([0x2b])
      case 'U256Mul':
        return new Uint8Array([0x2c])
      case 'U256Div':
        return new Uint8Array([0x2d])
      case 'U256Mod':
        return new Uint8Array([0x2e])
      case 'U256Eq':
        return new Uint8Array([0x2f])
      case 'U256Neq':
        return new Uint8Array([0x30])
      case 'U256Lt':
        return new Uint8Array([0x31])
      case 'U256Le':
        return new Uint8Array([0x32])
      case 'U256Gt':
        return new Uint8Array([0x33])
      case 'U256Ge':
        return new Uint8Array([0x34])
      case 'U256ModAdd':
        return new Uint8Array([0x35])
      case 'U256ModSub':
        return new Uint8Array([0x36])
      case 'U256ModMul':
        return new Uint8Array([0x37])
      case 'U256BitAnd':
        return new Uint8Array([0x38])
      case 'U256BitOr':
        return new Uint8Array([0x39])
      case 'U256Xor':
        return new Uint8Array([0x3a])
      case 'U256SHL':
        return new Uint8Array([0x3b])
      case 'U256SHR':
        return new Uint8Array([0x3c])
      case 'I256ToU256':
        return new Uint8Array([0x3d])
      case 'I256ToByteVec':
        return new Uint8Array([0x3e])
      case 'U256ToI256':
        return new Uint8Array([0x3f])
      case 'U256ToByteVec':
        return new Uint8Array([0x40])
      case 'ByteVecEq':
        return new Uint8Array([0x41])
      case 'ByteVecNeq':
        return new Uint8Array([0x42])
      case 'ByteVecSize':
        return new Uint8Array([0x43])
      case 'ByteVecConcat':
        return new Uint8Array([0x44])
      case 'AddressEq':
        return new Uint8Array([0x45])
      case 'AddressNeq':
        return new Uint8Array([0x46])
      case 'AddressToByteVec':
        return new Uint8Array([0x47])
      case 'IsAssetAddress':
        return new Uint8Array([0x48])
      case 'IsContractAddress':
        return new Uint8Array([0x49])
      case 'Jump':
        return new Uint8Array([0x4a, ...i32Codec.encode(instr.offset)])
      case 'IfTrue':
        return new Uint8Array([0x4b, ...i32Codec.encode(instr.offset)])
      case 'IfFalse':
        return new Uint8Array([0x4c, ...i32Codec.encode(instr.offset)])
      case 'Assert':
        return new Uint8Array([0x4d])
      case 'Blake2b':
        return new Uint8Array([0x4e])
      case 'Keccak256':
        return new Uint8Array([0x4f])
      case 'Sha256':
        return new Uint8Array([0x50])
      case 'Sha3':
        return new Uint8Array([0x51])
      case 'VerifyTxSignature':
        return new Uint8Array([0x52])
      case 'VerifySecP256K1':
        return new Uint8Array([0x53])
      case 'VerifyED25519':
        return new Uint8Array([0x54])
      case 'NetworkId':
        return new Uint8Array([0x55])
      case 'BlockTimeStamp':
        return new Uint8Array([0x56])
      case 'BlockTarget':
        return new Uint8Array([0x57])
      case 'TxId':
        return new Uint8Array([0x58])
      case 'TxInputAddressAt':
        return new Uint8Array([0x59])
      case 'TxInputsSize':
        return new Uint8Array([0x5a])
      case 'VerifyAbsoluteLocktime':
        return new Uint8Array([0x5b])
      case 'VerifyRelativeLocktime':
        return new Uint8Array([0x5c])
      case 'Log1':
        return new Uint8Array([0x5d])
      case 'Log2':
        return new Uint8Array([0x5e])
      case 'Log3':
        return new Uint8Array([0x5f])
      case 'Log4':
        return new Uint8Array([0x60])
      case 'Log5':
        return new Uint8Array([0x61])
      case 'ByteVecSlice':
        return new Uint8Array([0x62])
      case 'ByteVecToAddress':
        return new Uint8Array([0x63])
      case 'Encode':
        return new Uint8Array([0x64])
      case 'Zeros':
        return new Uint8Array([0x65])
      case 'U256To1Byte':
        return new Uint8Array([0x66])
      case 'U256To2Byte':
        return new Uint8Array([0x67])
      case 'U256To4Byte':
        return new Uint8Array([0x68])
      case 'U256To8Byte':
        return new Uint8Array([0x69])
      case 'U256To16Byte':
        return new Uint8Array([0x6a])
      case 'U256To32Byte':
        return new Uint8Array([0x6b])
      case 'U256From1Byte':
        return new Uint8Array([0x6c])
      case 'U256From2Byte':
        return new Uint8Array([0x6d])
      case 'U256From4Byte':
        return new Uint8Array([0x6e])
      case 'U256From8Byte':
        return new Uint8Array([0x6f])
      case 'U256From16Byte':
        return new Uint8Array([0x70])
      case 'U256From32Byte':
        return new Uint8Array([0x71])
      case 'EthEcRecover':
        return new Uint8Array([0x72])
      case 'Log6':
        return new Uint8Array([0x73])
      case 'Log7':
        return new Uint8Array([0x74])
      case 'Log8':
        return new Uint8Array([0x75])
      case 'Log9':
        return new Uint8Array([0x76])
      case 'ContractIdToAddress':
        return new Uint8Array([0x77])
      case 'LoadLocalByIndex':
        return new Uint8Array([0x78])
      case 'StoreLocalByIndex':
        return new Uint8Array([0x79])
      case 'Dup':
        return new Uint8Array([0x7a])
      case 'AssertWithErrorCode':
        return new Uint8Array([0x7b])
      case 'Swap':
        return new Uint8Array([0x7c])
      case 'BlockHash':
        return new Uint8Array([0x7d])
      case 'DEBUG':
        return new Uint8Array([0x7e, ...byteStringsCodec.encode(instr.stringParts)])
      case 'TxGasPrice':
        return new Uint8Array([0x7f])
      case 'TxGasAmount':
        return new Uint8Array([0x80])
      case 'TxGasFee':
        return new Uint8Array([0x81])
      case 'I256Exp':
        return new Uint8Array([0x82])
      case 'U256Exp':
        return new Uint8Array([0x83])
      case 'U256ModExp':
        return new Uint8Array([0x84])
      case 'VerifyBIP340Schnorr':
        return new Uint8Array([0x85])
      case 'GetSegregatedSignature':
        return new Uint8Array([0x86])
      case 'MulModN':
        return new Uint8Array([0x87])
      case 'AddModN':
        return new Uint8Array([0x88])
      case 'U256ToString':
        return new Uint8Array([0x89])
      case 'I256ToString':
        return new Uint8Array([0x8a])
      case 'BoolToString':
        return new Uint8Array([0x8b])
      case 'GroupOfAddress':
        return new Uint8Array([0x8c])
      case 'LoadMutField':
        return new Uint8Array([0xa0, ...byteCodec.encode(instr.index)])
      case 'StoreMutField':
        return new Uint8Array([0xa1, ...byteCodec.encode(instr.index)])
      case 'ApproveAlph':
        return new Uint8Array([0xa2])
      case 'ApproveToken':
        return new Uint8Array([0xa3])
      case 'AlphRemaining':
        return new Uint8Array([0xa4])
      case 'TokenRemaining':
        return new Uint8Array([0xa5])
      case 'IsPaying':
        return new Uint8Array([0xa6])
      case 'TransferAlph':
        return new Uint8Array([0xa7])
      case 'TransferAlphFromSelf':
        return new Uint8Array([0xa8])
      case 'TransferAlphToSelf':
        return new Uint8Array([0xa9])
      case 'TransferToken':
        return new Uint8Array([0xaa])
      case 'TransferTokenFromSelf':
        return new Uint8Array([0xab])
      case 'TransferTokenToSelf':
        return new Uint8Array([0xac])
      case 'CreateContract':
        return new Uint8Array([0xad])
      case 'CreateContractWithToken':
        return new Uint8Array([0xae])
      case 'CopyCreateContract':
        return new Uint8Array([0xaf])
      case 'DestroySelf':
        return new Uint8Array([0xb0])
      case 'SelfContractId':
        return new Uint8Array([0xb1])
      case 'SelfAddress':
        return new Uint8Array([0xb2])
      case 'CallerContractId':
        return new Uint8Array([0xb3])
      case 'CallerAddress':
        return new Uint8Array([0xb4])
      case 'IsCalledFromTxScript':
        return new Uint8Array([0xb5])
      case 'CallerInitialStateHash':
        return new Uint8Array([0xb6])
      case 'CallerCodeHash':
        return new Uint8Array([0xb7])
      case 'ContractInitialStateHash':
        return new Uint8Array([0xb8])
      case 'ContractCodeHash':
        return new Uint8Array([0xb9])
      case 'MigrateSimple':
        return new Uint8Array([0xba])
      case 'MigrateWithFields':
        return new Uint8Array([0xbb])
      case 'CopyCreateContractWithToken':
        return new Uint8Array([0xbc])
      case 'BurnToken':
        return new Uint8Array([0xbd])
      case 'LockApprovedAssets':
        return new Uint8Array([0xbe])
      case 'CreateSubContract':
        return new Uint8Array([0xbf])
      case 'CreateSubContractWithToken':
        return new Uint8Array([0xc0])
      case 'CopyCreateSubContract':
        return new Uint8Array([0xc1])
      case 'CopyCreateSubContractWithToken':
        return new Uint8Array([0xc2])
      case 'LoadMutFieldByIndex':
        return new Uint8Array([0xc3])
      case 'StoreMutFieldByIndex':
        return new Uint8Array([0xc4])
      case 'ContractExists':
        return new Uint8Array([0xc5])
      case 'CreateContractAndTransferToken':
        return new Uint8Array([0xc6])
      case 'CopyCreateContractAndTransferToken':
        return new Uint8Array([0xc7])
      case 'CreateSubContractAndTransferToken':
        return new Uint8Array([0xc8])
      case 'CopyCreateSubContractAndTransferToken':
        return new Uint8Array([0xc9])
      case 'NullContractAddress':
        return new Uint8Array([0xca])
      case 'SubContractId':
        return new Uint8Array([0xcb])
      case 'SubContractIdOf':
        return new Uint8Array([0xcc])
      case 'ALPHTokenId':
        return new Uint8Array([0xcd])
      case 'LoadImmField':
        return new Uint8Array([0xce, ...byteCodec.encode(instr.index)])
      case 'LoadImmFieldByIndex':
        return new Uint8Array([0xcf])
      case 'PayGasFee':
        return new Uint8Array([0xd0])
      case 'MinimalContractDeposit':
        return new Uint8Array([0xd1])
      case 'CreateMapEntry':
        return new Uint8Array([0xd2, ...byteCodec.encode(instr.immFieldsNum), ...byteCodec.encode(instr.mutFieldsNum)])
      case 'MethodSelector':
        return new Uint8Array([0xd3, ...intAs4BytesCodec.encode(instr.selector)])
      case 'CallExternalBySelector':
        return new Uint8Array([0xd4, ...intAs4BytesCodec.encode(instr.selector)])
    }
  }
  _decode(input: Reader): Instr {
    const code = input.consumeByte()
    switch (code) {
      case 0x00:
        return CallLocal(byteCodec._decode(input))
      case 0x01:
        return CallExternal(byteCodec._decode(input))
      case 0x02:
        return Return
      case 0x03:
        return ConstTrue
      case 0x04:
        return ConstFalse
      case 0x05:
        return I256Const0
      case 0x06:
        return I256Const1
      case 0x07:
        return I256Const2
      case 0x08:
        return I256Const3
      case 0x09:
        return I256Const4
      case 0x0a:
        return I256Const5
      case 0x0b:
        return I256ConstN1
      case 0x0c:
        return U256Const0
      case 0x0d:
        return U256Const1
      case 0x0e:
        return U256Const2
      case 0x0f:
        return U256Const3
      case 0x10:
        return U256Const4
      case 0x11:
        return U256Const5
      case 0x12:
        return I256Const(i256Codec._decode(input))
      case 0x13:
        return U256Const(u256Codec._decode(input))
      case 0x14:
        return BytesConst(byteStringCodec._decode(input))
      case 0x15:
        return AddressConst(lockupScriptCodec._decode(input))
      case 0x16:
        return LoadLocal(byteCodec._decode(input))
      case 0x17:
        return StoreLocal(byteCodec._decode(input))
      case 0x18:
        return Pop
      case 0x19:
        return BoolNot
      case 0x1a:
        return BoolAnd
      case 0x1b:
        return BoolOr
      case 0x1c:
        return BoolEq
      case 0x1d:
        return BoolNeq
      case 0x1e:
        return BoolToByteVec
      case 0x1f:
        return I256Add
      case 0x20:
        return I256Sub
      case 0x21:
        return I256Mul
      case 0x22:
        return I256Div
      case 0x23:
        return I256Mod
      case 0x24:
        return I256Eq
      case 0x25:
        return I256Neq
      case 0x26:
        return I256Lt
      case 0x27:
        return I256Le
      case 0x28:
        return I256Gt
      case 0x29:
        return I256Ge
      case 0x2a:
        return U256Add
      case 0x2b:
        return U256Sub
      case 0x2c:
        return U256Mul
      case 0x2d:
        return U256Div
      case 0x2e:
        return U256Mod
      case 0x2f:
        return U256Eq
      case 0x30:
        return U256Neq
      case 0x31:
        return U256Lt
      case 0x32:
        return U256Le
      case 0x33:
        return U256Gt
      case 0x34:
        return U256Ge
      case 0x35:
        return U256ModAdd
      case 0x36:
        return U256ModSub
      case 0x37:
        return U256ModMul
      case 0x38:
        return U256BitAnd
      case 0x39:
        return U256BitOr
      case 0x3a:
        return U256Xor
      case 0x3b:
        return U256SHL
      case 0x3c:
        return U256SHR
      case 0x3d:
        return I256ToU256
      case 0x3e:
        return I256ToByteVec
      case 0x3f:
        return U256ToI256
      case 0x40:
        return U256ToByteVec
      case 0x41:
        return ByteVecEq
      case 0x42:
        return ByteVecNeq
      case 0x43:
        return ByteVecSize
      case 0x44:
        return ByteVecConcat
      case 0x45:
        return AddressEq
      case 0x46:
        return AddressNeq
      case 0x47:
        return AddressToByteVec
      case 0x48:
        return IsAssetAddress
      case 0x49:
        return IsContractAddress
      case 0x4a:
        return Jump(i32Codec._decode(input))
      case 0x4b:
        return IfTrue(i32Codec._decode(input))
      case 0x4c:
        return IfFalse(i32Codec._decode(input))
      case 0x4d:
        return Assert
      case 0x4e:
        return Blake2b
      case 0x4f:
        return Keccak256
      case 0x50:
        return Sha256
      case 0x51:
        return Sha3
      case 0x52:
        return VerifyTxSignature
      case 0x53:
        return VerifySecP256K1
      case 0x54:
        return VerifyED25519
      case 0x55:
        return NetworkId
      case 0x56:
        return BlockTimeStamp
      case 0x57:
        return BlockTarget
      case 0x58:
        return TxId
      case 0x59:
        return TxInputAddressAt
      case 0x5a:
        return TxInputsSize
      case 0x5b:
        return VerifyAbsoluteLocktime
      case 0x5c:
        return VerifyRelativeLocktime
      case 0x5d:
        return Log1
      case 0x5e:
        return Log2
      case 0x5f:
        return Log3
      case 0x60:
        return Log4
      case 0x61:
        return Log5
      case 0x62:
        return ByteVecSlice
      case 0x63:
        return ByteVecToAddress
      case 0x64:
        return Encode
      case 0x65:
        return Zeros
      case 0x66:
        return U256To1Byte
      case 0x67:
        return U256To2Byte
      case 0x68:
        return U256To4Byte
      case 0x69:
        return U256To8Byte
      case 0x6a:
        return U256To16Byte
      case 0x6b:
        return U256To32Byte
      case 0x6c:
        return U256From1Byte
      case 0x6d:
        return U256From2Byte
      case 0x6e:
        return U256From4Byte
      case 0x6f:
        return U256From8Byte
      case 0x70:
        return U256From16Byte
      case 0x71:
        return U256From32Byte
      case 0x72:
        return EthEcRecover
      case 0x73:
        return Log6
      case 0x74:
        return Log7
      case 0x75:
        return Log8
      case 0x76:
        return Log9
      case 0x77:
        return ContractIdToAddress
      case 0x78:
        return LoadLocalByIndex
      case 0x79:
        return StoreLocalByIndex
      case 0x7a:
        return Dup
      case 0x7b:
        return AssertWithErrorCode
      case 0x7c:
        return Swap
      case 0x7d:
        return BlockHash
      case 0x7e:
        return DEBUG(byteStringsCodec._decode(input))
      case 0x7f:
        return TxGasPrice
      case 0x80:
        return TxGasAmount
      case 0x81:
        return TxGasFee
      case 0x82:
        return I256Exp
      case 0x83:
        return U256Exp
      case 0x84:
        return U256ModExp
      case 0x85:
        return VerifyBIP340Schnorr
      case 0x86:
        return GetSegregatedSignature
      case 0x87:
        return MulModN
      case 0x88:
        return AddModN
      case 0x89:
        return U256ToString
      case 0x8a:
        return I256ToString
      case 0x8b:
        return BoolToString
      case 0x8c:
        return GroupOfAddress
      case 0xa0:
        return LoadMutField(byteCodec._decode(input))
      case 0xa1:
        return StoreMutField(byteCodec._decode(input))
      case 0xa2:
        return ApproveAlph
      case 0xa3:
        return ApproveToken
      case 0xa4:
        return AlphRemaining
      case 0xa5:
        return TokenRemaining
      case 0xa6:
        return IsPaying
      case 0xa7:
        return TransferAlph
      case 0xa8:
        return TransferAlphFromSelf
      case 0xa9:
        return TransferAlphToSelf
      case 0xaa:
        return TransferToken
      case 0xab:
        return TransferTokenFromSelf
      case 0xac:
        return TransferTokenToSelf
      case 0xad:
        return CreateContract
      case 0xae:
        return CreateContractWithToken
      case 0xaf:
        return CopyCreateContract
      case 0xb0:
        return DestroySelf
      case 0xb1:
        return SelfContractId
      case 0xb2:
        return SelfAddress
      case 0xb3:
        return CallerContractId
      case 0xb4:
        return CallerAddress
      case 0xb5:
        return IsCalledFromTxScript
      case 0xb6:
        return CallerInitialStateHash
      case 0xb7:
        return CallerCodeHash
      case 0xb8:
        return ContractInitialStateHash
      case 0xb9:
        return ContractCodeHash
      case 0xba:
        return MigrateSimple
      case 0xbb:
        return MigrateWithFields
      case 0xbc:
        return CopyCreateContractWithToken
      case 0xbd:
        return BurnToken
      case 0xbe:
        return LockApprovedAssets
      case 0xbf:
        return CreateSubContract
      case 0xc0:
        return CreateSubContractWithToken
      case 0xc1:
        return CopyCreateSubContract
      case 0xc2:
        return CopyCreateSubContractWithToken
      case 0xc3:
        return LoadMutFieldByIndex
      case 0xc4:
        return StoreMutFieldByIndex
      case 0xc5:
        return ContractExists
      case 0xc6:
        return CreateContractAndTransferToken
      case 0xc7:
        return CopyCreateContractAndTransferToken
      case 0xc8:
        return CreateSubContractAndTransferToken
      case 0xc9:
        return CopyCreateSubContractAndTransferToken
      case 0xca:
        return NullContractAddress
      case 0xcb:
        return SubContractId
      case 0xcc:
        return SubContractIdOf
      case 0xcd:
        return ALPHTokenId
      case 0xce:
        return LoadImmField(byteCodec._decode(input))
      case 0xcf:
        return LoadImmFieldByIndex
      case 0xd0:
        return PayGasFee
      case 0xd1:
        return MinimalContractDeposit
      case 0xd2:
        return CreateMapEntry(byteCodec._decode(input), byteCodec._decode(input))
      case 0xd3:
        return MethodSelector(intAs4BytesCodec._decode(input))
      case 0xd4:
        return CallExternalBySelector(intAs4BytesCodec._decode(input))
      default:
        throw new Error(`Unknown instr code: ${code}`)
    }
  }
}
export const instrCodec = new InstrCodec()
export const instrsCodec = new ArrayCodec<Instr>(instrCodec)

function checkU256(number: bigint) {
  if (number < 0n || number >= 2n ** 256n) {
    throw new Error(`Invalid u256 number: ${number}`)
  }
}

export function toU256(number: bigint) {
  checkU256(number)
  switch (number) {
    case 0n:
      return U256Const0
    case 1n:
      return U256Const1
    case 2n:
      return U256Const2
    case 3n:
      return U256Const3
    case 4n:
      return U256Const4
    case 5n:
      return U256Const5
    default:
      return U256Const(number)
  }
}

function checkI256(number: bigint) {
  const upperBound = 2n ** 255n
  if (number < -upperBound || number >= upperBound) {
    throw new Error(`Invalid i256 number: ${number}`)
  }
}

export function toI256(number: bigint) {
  checkI256(number)
  switch (number) {
    case 0n:
      return I256Const0
    case 1n:
      return I256Const1
    case 2n:
      return I256Const2
    case 3n:
      return I256Const3
    case 4n:
      return I256Const4
    case 5n:
      return I256Const5
    case -1n:
      return I256ConstN1
    default:
      return I256Const(number)
  }
}
