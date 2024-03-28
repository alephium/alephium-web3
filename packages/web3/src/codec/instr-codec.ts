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
export const I256Const = (value: DecodedCompactInt): Instr => ({ code: 0x12, value: { value } })
export const U256Const = (value: DecodedCompactInt): Instr => ({ code: 0x13, value: { value } })
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
export const Jump = (value: DecodedCompactInt): Instr => ({ code: 0x4a, value })
export const IfTrue = (value: DecodedCompactInt): Instr => ({ code: 0x4b, value })
export const IfFalse = (value: DecodedCompactInt): Instr => ({ code: 0x4c, value: { value } })
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

export class InstrCodec implements Codec<Instr> {
  parser = Parser.start()
    .uint8('code')
    .choice('value', {
      tag: 'code',
      choices: {
        0x00: Parser.start().uint8('index'), // CallLocal
        0x01: Parser.start().uint8('index'), // CallExternal
        [Return.code]: Parser.start(),
        [ConstTrue.code]: Parser.start(),
        [ConstFalse.code]: Parser.start(),
        [I256Const0.code]: Parser.start(),
        [I256Const1.code]: Parser.start(),
        [I256Const2.code]: Parser.start(),
        [I256Const3.code]: Parser.start(),
        [I256Const4.code]: Parser.start(),
        [I256Const5.code]: Parser.start(),
        [I256ConstN1.code]: Parser.start(),
        [U256Const0.code]: Parser.start(),
        [U256Const1.code]: Parser.start(),
        [U256Const2.code]: Parser.start(),
        [U256Const3.code]: Parser.start(),
        [U256Const4.code]: Parser.start(),
        [U256Const5.code]: Parser.start(),
        0x12: Parser.start().nest('value', { type: compactSignedIntCodec.parser }),
        0x13: Parser.start().nest('value', { type: compactUnsignedIntCodec.parser }),
        0x14: Parser.start().nest('value', { type: byteStringCodec.parser }),
        0x15: Parser.start().nest('value', { type: lockupScriptCodec.parser }),
        0x16: Parser.start().uint8('index'),
        0x17: Parser.start().uint8('index'),
        [Pop.code]: Parser.start(),
        [BoolNot.code]: Parser.start(),
        [BoolAnd.code]: Parser.start(),
        [BoolOr.code]: Parser.start(),
        [BoolEq.code]: Parser.start(),
        [BoolNeq.code]: Parser.start(),
        [BoolToByteVec.code]: Parser.start(),
        [I256Add.code]: Parser.start(),
        [I256Sub.code]: Parser.start(),
        [I256Mul.code]: Parser.start(),
        [I256Div.code]: Parser.start(),
        [I256Mod.code]: Parser.start(),
        [I256Eq.code]: Parser.start(),
        [I256Neq.code]: Parser.start(),
        [I256Lt.code]: Parser.start(),
        [I256Le.code]: Parser.start(),
        [I256Gt.code]: Parser.start(),
        [I256Ge.code]: Parser.start(),
        [U256Add.code]: Parser.start(),
        [U256Sub.code]: Parser.start(),
        [U256Mul.code]: Parser.start(),
        [U256Div.code]: Parser.start(),
        [U256Mod.code]: Parser.start(),
        [U256Eq.code]: Parser.start(),
        [U256Neq.code]: Parser.start(),
        [U256Lt.code]: Parser.start(),
        [U256Le.code]: Parser.start(),
        [U256Gt.code]: Parser.start(),
        [U256Ge.code]: Parser.start(),
        [U256ModAdd.code]: Parser.start(),
        [U256ModSub.code]: Parser.start(),
        [U256ModMul.code]: Parser.start(),
        [U256BitAnd.code]: Parser.start(),
        [U256BitOr.code]: Parser.start(),
        [U256Xor.code]: Parser.start(),
        [U256SHL.code]: Parser.start(),
        [U256SHR.code]: Parser.start(),
        [I256ToU256.code]: Parser.start(),
        [I256ToByteVec.code]: Parser.start(),
        [U256ToI256.code]: Parser.start(),
        [U256ToByteVec.code]: Parser.start(),
        [ByteVecEq.code]: Parser.start(),
        [ByteVecNeq.code]: Parser.start(),
        [ByteVecSize.code]: Parser.start(),
        [ByteVecConcat.code]: Parser.start(),
        [AddressEq.code]: Parser.start(),
        [AddressNeq.code]: Parser.start(),
        [AddressToByteVec.code]: Parser.start(),
        [IsAssetAddress.code]: Parser.start(),
        [IsContractAddress.code]: Parser.start(),
        0x4a: Parser.start().nest('value', { type: compactUnsignedIntCodec.parser }), // Jump
        0x4b: Parser.start().nest('value', { type: compactUnsignedIntCodec.parser }), // IfTrue
        0x4c: Parser.start().nest('value', { type: compactUnsignedIntCodec.parser }), // IfFalse
        [Assert.code]: Parser.start(),
        [Blake2b.code]: Parser.start(),
        [Keccak256.code]: Parser.start(),
        [Sha256.code]: Parser.start(),
        [Sha3.code]: Parser.start(),
        [VerifyTxSignature.code]: Parser.start(),
        [VerifySecP256K1.code]: Parser.start(),
        [VerifyED25519.code]: Parser.start(),
        [NetworkId.code]: Parser.start(),
        [BlockTimeStamp.code]: Parser.start(),
        [BlockTarget.code]: Parser.start(),
        [TxId.code]: Parser.start(),
        [TxInputAddressAt.code]: Parser.start(),
        [TxInputsSize.code]: Parser.start(),
        [VerifyAbsoluteLocktime.code]: Parser.start(),
        [VerifyRelativeLocktime.code]: Parser.start(),
        [Log1.code]: Parser.start(),
        [Log2.code]: Parser.start(),
        [Log3.code]: Parser.start(),
        [Log4.code]: Parser.start(),
        [Log5.code]: Parser.start(),
        [ByteVecSlice.code]: Parser.start(),
        [ByteVecToAddress.code]: Parser.start(),
        [Encode.code]: Parser.start(),
        [Zeros.code]: Parser.start(),
        [U256To1Byte.code]: Parser.start(),
        [U256To2Byte.code]: Parser.start(),
        [U256To4Byte.code]: Parser.start(),
        [U256To8Byte.code]: Parser.start(),
        [U256To16Byte.code]: Parser.start(),
        [U256To32Byte.code]: Parser.start(),
        [U256From1Byte.code]: Parser.start(),
        [U256From2Byte.code]: Parser.start(),
        [U256From4Byte.code]: Parser.start(),
        [U256From8Byte.code]: Parser.start(),
        [U256From16Byte.code]: Parser.start(),
        [U256From32Byte.code]: Parser.start(),
        [EthEcRecover.code]: Parser.start(),
        [Log6.code]: Parser.start(),
        [Log7.code]: Parser.start(),
        [Log8.code]: Parser.start(),
        [Log9.code]: Parser.start(),
        [ContractIdToAddress.code]: Parser.start(),
        [LoadLocalByIndex.code]: Parser.start(),
        [StoreLocalByIndex.code]: Parser.start(),
        [Dup.code]: Parser.start(),
        [AssertWithErrorCode.code]: Parser.start(),
        [Swap.code]: Parser.start(),
        [BlockHash.code]: Parser.start(),
        0x7e: Parser.start().nest('stringParts', { type: byteStringArrayCodec.parser }), // DEBUG
        [TxGasPrice.code]: Parser.start(),
        [TxGasAmount.code]: Parser.start(),
        [TxGasFee.code]: Parser.start(),
        [I256Exp.code]: Parser.start(),
        [U256Exp.code]: Parser.start(),
        [U256ModExp.code]: Parser.start(),
        [VerifyBIP340Schnorr.code]: Parser.start(),
        [GetSegragatedSignature.code]: Parser.start(),
        [MulModN.code]: Parser.start(),
        [AddModN.code]: Parser.start(),
        [U256ToString.code]: Parser.start(),
        [I256ToString.code]: Parser.start(),
        [BoolToString.code]: Parser.start(),
        0xa0: Parser.start().uint8('index'),
        0xa1: Parser.start().uint8('index'),
        [ApproveAlph.code]: Parser.start(),
        [ApproveToken.code]: Parser.start(),
        [AlphRemaining.code]: Parser.start(),
        [TokenRemaining.code]: Parser.start(),
        [IsPaying.code]: Parser.start(),
        [TransferAlph.code]: Parser.start(),
        [TransferAlphFromSelf.code]: Parser.start(),
        [TransferAlphToSelf.code]: Parser.start(),
        [TransferToken.code]: Parser.start(),
        [TransferTokenFromSelf.code]: Parser.start(),
        [TransferTokenToSelf.code]: Parser.start(),
        [CreateContract.code]: Parser.start(),
        [CreateContractWithToken.code]: Parser.start(),
        [CopyCreateContract.code]: Parser.start(),
        [DestroySelf.code]: Parser.start(),
        [SelfContractId.code]: Parser.start(),
        [SelfAddress.code]: Parser.start(),
        [CallerContractId.code]: Parser.start(),
        [CallerAddress.code]: Parser.start(),
        [IsCallerFromTxScript.code]: Parser.start(),
        [CallerInitialStateHash.code]: Parser.start(),
        [CallerCodeHash.code]: Parser.start(),
        [ContractInitialStateHash.code]: Parser.start(),
        [ContractInitialCodeHash.code]: Parser.start(),
        [MigrateSimple.code]: Parser.start(),
        [MigrateWithFields.code]: Parser.start(),
        [CopyCreateContractWithToken.code]: Parser.start(),
        [BurnToken.code]: Parser.start(),
        [LockApprovedAssets.code]: Parser.start(),
        [CreateSubContract.code]: Parser.start(),
        [CreateSubContractWithToken.code]: Parser.start(),
        [CopyCreateSubContract.code]: Parser.start(),
        [CopyCreateSubContractWithToken.code]: Parser.start(),
        [LoadMutFieldByIndex.code]: Parser.start(),
        [StoreMutFieldByIndex.code]: Parser.start(),
        [ContractExists.code]: Parser.start(),
        [CreateContractAndTransferToken.code]: Parser.start(),
        [CopyCreateContractAndTransferToken.code]: Parser.start(),
        [CreateSubContractAndTransferToken.code]: Parser.start(),
        [CopyCreateSubContractAndTransferToken.code]: Parser.start(),
        [NullContractAddress.code]: Parser.start(),
        [SubContractId.code]: Parser.start(),
        [SubContractIdOf.code]: Parser.start(),
        [AlphTokenId.code]: Parser.start(),
        0xce: Parser.start().uint8('index'),
        [LoadImmFieldByIndex.code]: Parser.start(),
        [PayGasFee.code]: Parser.start(),
        [MinimalContractDeposit.code]: Parser.start(),
        0xd2: Parser.start().uint8('immFields').uint8('mutFields')
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
    } else if (instr.code === 0xd2) {
      const value = instrValue as CreateMapEntryValue
      result.push(value.immFields, value.mutFields)
    }

    return Buffer.from(result)
  }

  decode(input: Buffer): Instr {
    return this.parser.parse(input)
  }
}

export const instrCodec = new InstrCodec()
export const instrsCodec = new ArrayCodec<Instr>(instrCodec)
