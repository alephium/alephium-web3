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
import { ArrayCodec } from './array-codec'
import { i256Codec, u256Codec, i32Codec } from './compact-int-codec'
import { ByteString, byteStringCodec } from './bytestring-codec'
import { LockupScript, lockupScriptCodec } from './lockup-script-codec'
import { Codec } from './codec'
import { intAs4BytesCodec } from './int-as-4bytes-codec'
import { Reader } from './reader'

const byteStringArrayCodec = new ArrayCodec(byteStringCodec)

// eslint-disable-next-line
export interface InstrValue { }
export interface InstrValueWithIndex extends InstrValue {
  index: number
}
export interface InstrValueWithBigInt extends InstrValue {
  value: bigint
}
export interface InstrValueWithI32 extends InstrValue {
  value: number
}

export interface ByteStringConst extends InstrValue {
  value: ByteString
}
export interface AddressConst extends InstrValue {
  value: LockupScript
}
export interface Debug extends InstrValue {
  stringParts: ByteString[]
}
export interface CreateMapEntryValue extends InstrValue {
  immFields: number
  mutFields: number
}
export interface Instr {
  code: number
  value: InstrValue
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
export const I256Const = (value: bigint): Instr => ({ code: 0x12, value: { value } })
export const U256Const = (value: bigint): Instr => ({ code: 0x13, value: { value } })
export const ByteConst = (value: ByteString): Instr => ({ code: 0x14, value: { value } })
export const AddressConst = (value: LockupScript): Instr => ({ code: 0x15, value: { value } })
export const LoadLocal = (index: number): Instr => ({ code: 0x16, value: { index } })
export const StoreLocal = (index: number): Instr => ({ code: 0x17, value: { index } })
export const Pop: Instr = { code: 0x18, value: {} }
export const BoolNot: Instr = { code: 0x19, value: {} }
export const BoolAnd: Instr = { code: 0x1a, value: {} }
export const BoolOr: Instr = { code: 0x1b, value: {} }
export const BoolEq: Instr = { code: 0x1c, value: {} }
export const BoolNeq: Instr = { code: 0x1d, value: {} }
export const BoolToByteVec: Instr = { code: 0x1e, value: {} }
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
export const Jump = (value: number): Instr => ({ code: 0x4a, value: { value } })
export const IfTrue = (value: number): Instr => ({ code: 0x4b, value: { value } })
export const IfFalse = (value: number): Instr => ({ code: 0x4c, value: { value } })
export const Assert: Instr = { code: 0x4d, value: {} }
export const Blake2b: Instr = { code: 0x4e, value: {} }
export const Keccak256: Instr = { code: 0x4f, value: {} }
export const Sha256: Instr = { code: 0x50, value: {} }
export const Sha3: Instr = { code: 0x51, value: {} }
export const VerifyTxSignature: Instr = { code: 0x52, value: {} }
export const VerifySecP256K1: Instr = { code: 0x53, value: {} }
export const VerifyED25519: Instr = { code: 0x54, value: {} }
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
export const U256To2Byte: Instr = { code: 0x67, value: {} }
export const U256To4Byte: Instr = { code: 0x68, value: {} }
export const U256To8Byte: Instr = { code: 0x69, value: {} }
export const U256To16Byte: Instr = { code: 0x6a, value: {} }
export const U256To32Byte: Instr = { code: 0x6b, value: {} }
export const U256From1Byte: Instr = { code: 0x6c, value: {} }
export const U256From2Byte: Instr = { code: 0x6d, value: {} }
export const U256From4Byte: Instr = { code: 0x6e, value: {} }
export const U256From8Byte: Instr = { code: 0x6f, value: {} }
export const U256From16Byte: Instr = { code: 0x70, value: {} }
export const U256From32Byte: Instr = { code: 0x71, value: {} }
export const EthEcRecover: Instr = { code: 0x72, value: {} }
export const Log6: Instr = { code: 0x73, value: {} }
export const Log7: Instr = { code: 0x74, value: {} }
export const Log8: Instr = { code: 0x75, value: {} }
export const Log9: Instr = { code: 0x76, value: {} }
export const ContractIdToAddress: Instr = { code: 0x77, value: {} }
export const LoadLocalByIndex: Instr = { code: 0x78, value: {} }
export const StoreLocalByIndex: Instr = { code: 0x79, value: {} }
export const Dup: Instr = { code: 0x7a, value: {} }
export const AssertWithErrorCode: Instr = { code: 0x7b, value: {} }
export const Swap: Instr = { code: 0x7c, value: {} }
export const BlockHash: Instr = { code: 0x7d, value: {} }
export const DEBUG = (stringParts: ByteString[]): Instr => ({ code: 0x7e, value: { stringParts } })
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
export const GroupOfAddress: Instr = { code: 0x8c, value: {} }
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
export const CallerCodeHash: Instr = { code: 0xb7, value: {} }
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
export const SubContractIdOf: Instr = { code: 0xcc, value: {} }
export const AlphTokenId: Instr = { code: 0xcd, value: {} }
export const LoadImmField = (index: number): Instr => ({ code: 0xce, value: { index } })
export const LoadImmFieldByIndex: Instr = { code: 0xcf, value: {} }
export const PayGasFee: Instr = { code: 0xd0, value: {} }
export const MinimalContractDeposit: Instr = { code: 0xd1, value: {} }
export const CreateMapEntry: (immFields: number, mutFields: number) => Instr = (
  immFields: number,
  mutFields: number
) => ({ code: 0xd2, value: { immFields, mutFields } })
export const MethodSelector: (selector: number) => Instr = (selector: number) => {
  return { code: 0xd3, value: { index: selector } }
}
export const CallExternalBySelector: (selector: number) => Instr = (selector: number) => {
  return { code: 0xd4, value: { index: selector } }
}

export class InstrCodec extends Codec<Instr> {
  private checkCode(code: number) {
    if ((code >= 0x00 && code <= 0x8c) || (code >= 0xa0 && code <= 0xd4)) {
      return
    }
    throw new Error(`Unsupported instr: ${code}`)
  }

  encode(instr: Instr): Uint8Array {
    this.checkCode(instr.code)
    const instrValue = instr.value
    const result = [instr.code]
    const instrsWithIndex = [0x00, 0x01, 0x16, 0x17, 0xa0, 0xa1, 0xce]
    const controlInstrs = [0x4a, 0x4b, 0x4c]
    if (instr.code === 0x14) {
      result.push(...byteStringCodec.encode((instrValue as ByteStringConst).value))
    } else if (instr.code === 0x15) {
      result.push(...lockupScriptCodec.encode((instrValue as AddressConst).value))
    } else if (instr.code === 0x7e) {
      result.push(...byteStringArrayCodec.encode((instrValue as Debug).stringParts))
    } else if (instr.code === 0x12) {
      result.push(...i256Codec.encode((instrValue as InstrValueWithBigInt).value))
    } else if (instr.code === 0x13) {
      result.push(...u256Codec.encode((instrValue as InstrValueWithBigInt).value))
    } else if (controlInstrs.includes(instr.code)) {
      result.push(...i32Codec.encode((instrValue as InstrValueWithI32).value))
    } else if (instrsWithIndex.includes(instr.code)) {
      result.push((instrValue as InstrValueWithIndex).index)
    } else if (instr.code === 0xd2) {
      const value = instrValue as CreateMapEntryValue
      result.push(value.immFields, value.mutFields)
    } else if (instr.code === 0xd3 || instr.code === 0xd4) {
      result.push(...intAs4BytesCodec.encode((instrValue as InstrValueWithIndex).index))
    }

    return new Uint8Array(result)
  }

  _decode(input: Reader): Instr {
    const code = input.consumeByte()
    this.checkCode(code)
    switch (code) {
      case 0x00: // CallLocal
        return CallLocal(input.consumeByte())
      case 0x01: // CallExternal
        return CallExternal(input.consumeByte())
      case 0x12: // I256Const
        return I256Const(i256Codec._decode(input))
      case 0x13: // U256Const
        return U256Const(u256Codec._decode(input))
      case 0x14: // ByteConst
        return ByteConst(byteStringCodec._decode(input))
      case 0x15: // AddressConst
        return AddressConst(lockupScriptCodec._decode(input))
      case 0x16: // LoadLocal
        return LoadLocal(input.consumeByte())
      case 0x17: // StoreLocal
        return StoreLocal(input.consumeByte())
      case 0x4a: // Jump
        return Jump(i32Codec._decode(input))
      case 0x4b: // IfTrue
        return IfTrue(i32Codec._decode(input))
      case 0x4c: // IfFalse
        return IfFalse(i32Codec._decode(input))
      case 0x7e: // DEBUG
        return DEBUG(byteStringArrayCodec._decode(input))
      case 0xa0: // LoadMutField
        return LoadMutField(input.consumeByte())
      case 0xa1: // StoreMutField
        return StoreMutField(input.consumeByte())
      case 0xce: // LoadImmField
        return LoadImmField(input.consumeByte())
      case 0xd2: // CreateMapEntry
        return CreateMapEntry(input.consumeByte(), input.consumeByte())
      case 0xd3: // MethodSelector
        return MethodSelector(intAs4BytesCodec._decode(input))
      case 0xd4: // CallExternalBySelector
        return CallExternalBySelector(intAs4BytesCodec._decode(input))
      default:
        return { code, value: {} }
    }
  }
}

export const instrCodec = new InstrCodec()
export const instrsCodec = new ArrayCodec<Instr>(instrCodec)
