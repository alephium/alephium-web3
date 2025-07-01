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

import { Contract, web3, decodeArrayType, hexToBinUnsafe, binToHex, decodeTupleType } from '@alephium/web3'
import { Method } from './method-codec'
import { contractCodec } from './contract-codec'
import {
  ApproveAlph,
  AssertWithErrorCode,
  ByteVecConcat,
  ByteVecNeq,
  CallLocal,
  CopyCreateSubContractWithToken,
  Dup,
  Encode,
  I256Const0,
  IfFalse,
  LoadImmField,
  LoadLocal,
  LoadMutField,
  Log5,
  MethodSelector,
  Pop,
  Return,
  StoreLocal,
  StoreMutField,
  TokenRemaining,
  U256Add,
  U256Const,
  U256Const0,
  U256Const1,
  U256From32Byte,
  U256Gt,
  U256Lt,
  NumericSHL
} from './instr-codec'
import {
  Assert,
  Debug,
  MapTest,
  MetaData,
  NFTTest,
  OwnerOnly,
  TokenTest,
  UserAccount,
  Warnings
} from '../../../../artifacts/ts'

describe('Encode & decode contract', function () {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should encode and decode contract from source code', async () => {
    await testContractCode(
      `
        Contract ShinyToken(
          symbol: ByteVec,
          name: ByteVec,
          decimals: U256,
          totalSupply: U256
        ) {
          pub fn getTotalSupply() -> U256 {
              return totalSupply
          }

          pub fn getSymbol() -> ByteVec {
              return symbol
          }

          fn getName() -> ByteVec {
              return name
          }

          pub fn getDecimals() -> U256 {
              return decimals
          }
        }
      `,
      [
        {
          isPublic: true,
          usePreapprovedAssets: false,
          useContractAssets: false,
          usePayToContractOnly: false,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [MethodSelector(-1137803467), LoadImmField(3), Return]
        },
        {
          isPublic: true,
          usePreapprovedAssets: false,
          useContractAssets: false,
          usePayToContractOnly: false,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [MethodSelector(167928762), LoadImmField(0), Return]
        },
        {
          isPublic: false,
          usePreapprovedAssets: false,
          useContractAssets: false,
          usePayToContractOnly: false,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [LoadImmField(1), Return]
        },
        {
          isPublic: true,
          usePreapprovedAssets: false,
          useContractAssets: false,
          usePayToContractOnly: false,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [MethodSelector(1051502534), LoadImmField(2), Return]
        }
      ]
    )

    await testContractCode(
      `
      Contract TokenPairFactory(
        pairTemplateId: ByteVec,
        mut pairSize: U256
      ) {
        event PairCreated(token0: ByteVec, token1: ByteVec, pair: ByteVec, currentPairSize: U256)

        enum ErrorCodes {
          ReserveOverflow             = 0
          InsufficientInitLiquidity   = 1
          InsufficientLiquidityMinted = 2
          InsufficientLiquidityBurned = 3
          InvalidToAddress            = 4
          InsufficientLiquidity       = 5
          InvalidTokenInId            = 6
          InvalidCalleeId             = 7
          InvalidK                    = 8
          InsufficientOutputAmount    = 9
          InsufficientInputAmount     = 10
          IdenticalTokenIds           = 11
          Expired                     = 12
          InsufficientToken0Amount    = 13
          InsufficientToken1Amount    = 14
          TokenNotExist               = 15
        }

        fn sortTokens(tokenA: ByteVec, tokenB: ByteVec) -> (ByteVec, ByteVec) {
          let left = u256From32Byte!(tokenA)
          let right = u256From32Byte!(tokenB)
          if (left < right) {
            return tokenA, tokenB
          }
          return tokenB, tokenA
        }

        @using(preapprovedAssets = true, updateFields = true)
        pub fn createPair(
          payer: Address,
          alphAmount: U256,
          tokenAId: ByteVec,
          tokenBId: ByteVec
        ) -> () {
          assert!(
            tokenRemaining!(payer, tokenAId) > 0 &&
            tokenRemaining!(payer, tokenBId) > 0,
            ErrorCodes.TokenNotExist
          )
          assert!(tokenAId != tokenBId, ErrorCodes.IdenticalTokenIds)
          let (token0Id, token1Id) = sortTokens(tokenAId, tokenBId)
          let encodedImmutableFields = encodeToByteVec!(token0Id, token1Id)
          let encodedMutableFields = encodeToByteVec!(
            0, // reserve0
            0, // reserve1
            0, // blockTimeStampLast
            0, // price0CumulativeLast
            0, // price1CumulativeLast
            0  // totalSupply
          )
          let pairId = copyCreateSubContractWithToken!{payer -> ALPH: alphAmount}(
            token0Id ++ token1Id,
            pairTemplateId,
            encodedImmutableFields,
            encodedMutableFields,
            1 << 255
          )

          emit PairCreated(token0Id, token1Id, pairId, pairSize)

          pairSize = pairSize + 1
        }
      }
      `,
      [
        {
          isPublic: false,
          usePreapprovedAssets: false,
          useContractAssets: false,
          usePayToContractOnly: false,
          argsLength: 2,
          localsLength: 4,
          returnLength: 2,
          instrs: [
            LoadLocal(0),
            U256From32Byte,
            StoreLocal(2),
            LoadLocal(1),
            U256From32Byte,
            StoreLocal(3),
            LoadLocal(2),
            LoadLocal(3),
            U256Lt,
            IfFalse(3),
            LoadLocal(0),
            LoadLocal(1),
            Return,
            LoadLocal(1),
            LoadLocal(0),
            Return
          ]
        },
        {
          isPublic: true,
          usePreapprovedAssets: true,
          useContractAssets: false,
          usePayToContractOnly: false,
          argsLength: 4,
          localsLength: 9,
          returnLength: 0,
          instrs: [
            MethodSelector(-50171758),
            LoadLocal(0),
            LoadLocal(2),
            TokenRemaining,
            U256Const0,
            U256Gt,
            Dup,
            IfFalse(6),
            Pop,
            LoadLocal(0),
            LoadLocal(3),
            TokenRemaining,
            U256Const0,
            U256Gt,
            U256Const(15n),
            AssertWithErrorCode,
            LoadLocal(2),
            LoadLocal(3),
            ByteVecNeq,
            U256Const(11n),
            AssertWithErrorCode,
            LoadLocal(2),
            LoadLocal(3),
            CallLocal(0),
            StoreLocal(5),
            StoreLocal(4),
            LoadLocal(4),
            LoadLocal(5),
            U256Const(2n),
            Encode,
            StoreLocal(6),
            U256Const0,
            U256Const0,
            U256Const0,
            U256Const0,
            U256Const0,
            U256Const0,
            U256Const(6n),
            Encode,
            StoreLocal(7),
            LoadLocal(0),
            LoadLocal(1),
            ApproveAlph,
            LoadLocal(4),
            LoadLocal(5),
            ByteVecConcat,
            LoadImmField(0),
            LoadLocal(6),
            LoadLocal(7),
            U256Const1,
            U256Const(255n),
            NumericSHL,
            CopyCreateSubContractWithToken,
            StoreLocal(8),
            I256Const0,
            LoadLocal(4),
            LoadLocal(5),
            LoadLocal(8),
            LoadMutField(0),
            Log5,
            LoadMutField(0),
            U256Const1,
            U256Add,
            StoreMutField(0)
          ]
        }
      ]
    )
  })

  it('should encode and decode contracts from project', () => {
    testContract(TokenTest.contract)
    testContract(OwnerOnly.contract)
    testContract(NFTTest.contract)
    testContract(Warnings.contract)
    testContract(MetaData.contract)
    testContract(Debug.contract)
    testContract(Assert.contract)
    testContract(UserAccount.contract)
    testContract(MapTest.contract)
  })

  async function testContractCode(contractCode: string, methods: Method[]) {
    const nodeProvider = web3.getCurrentNodeProvider()
    const compileContractResult = await nodeProvider.contracts.postContractsCompileContract({ code: contractCode })
    const contractBytecode = compileContractResult.bytecode
    const bytes = hexToBinUnsafe(contractBytecode)
    const decoded = contractCodec.decode(bytes)
    const encoded = contractCodec.encode(decoded)

    const decodedContract = contractCodec.decodeContract(bytes)
    expect(contractCodec.encodeContract(decodedContract)).toEqual(bytes)
    expect(decodedContract.methods.length).toEqual(methods.length)
    decodedContract.methods.map((decodedMethod, index) => {
      expect(decodedMethod.isPublic).toEqual(methods[index].isPublic)
      expect(decodedMethod.usePreapprovedAssets).toEqual(methods[index].usePreapprovedAssets)
      expect(decodedMethod.useContractAssets).toEqual(methods[index].useContractAssets)
      expect(decodedMethod.usePayToContractOnly).toEqual(methods[index].usePayToContractOnly)
      expect(decodedMethod.argsLength).toEqual(methods[index].argsLength)
      expect(decodedMethod.localsLength).toEqual(methods[index].localsLength)
      expect(decodedMethod.returnLength).toEqual(methods[index].returnLength)
      expect(decodedMethod.instrs).toEqual(methods[index].instrs)
    })
    expect(contractBytecode).toEqual(binToHex(encoded))
  }

  function getTypeLength(type: string): number {
    const structs = MapTest.contract.structs
    const struct = structs.find((s) => s.name === type)
    if (struct !== undefined) {
      return struct.fieldTypes.reduce((acc, fieldType) => acc + getTypeLength(fieldType), 0)
    }
    if (type.startsWith('[')) {
      const [baseType, size] = decodeArrayType(type)
      return size * getTypeLength(baseType)
    }
    if (type.startsWith('(')) {
      const tuple = decodeTupleType(type)
      return tuple.reduce((acc, fieldType) => acc + getTypeLength(fieldType), 0)
    }
    return 1
  }

  function getTypesLength(types: string[]): number {
    return types.reduce((acc, type) => acc + getTypeLength(type), 0)
  }

  function testContract(contract: Contract) {
    const bytes = hexToBinUnsafe(contract.bytecode)
    const decoded = contractCodec.decode(bytes)
    const encoded = contractCodec.encode(decoded)

    const decodedContract = contractCodec.decodeContract(bytes)
    expect(contractCodec.encodeContract(decodedContract)).toEqual(bytes)

    expect(decodedContract.fieldLength).toEqual(getTypesLength(contract.fieldsSig.types))
    decodedContract.methods.map((decodedMethod, index) => {
      const decoded = contract.getDecodedMethod(index)
      const functionSig = contract.functions[index]
      expect(decodedMethod.isPublic).toEqual(decoded.isPublic)
      expect(decodedMethod.usePreapprovedAssets).toEqual(decoded.usePreapprovedAssets)
      expect(decodedMethod.useContractAssets).toEqual(decoded.useContractAssets)
      expect(decodedMethod.argsLength).toEqual(getTypesLength(functionSig.paramTypes))
      expect(decodedMethod.returnLength).toEqual(getTypesLength(functionSig.returnTypes))
    })

    expect(contract.bytecode).toEqual(binToHex(encoded))
  }
})
