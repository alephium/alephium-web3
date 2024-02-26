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

import { web3 } from '@alephium/web3'
import { Method } from './method-codec'
import { contractCodec } from './contract-codec'
import {
  ApproveAlph,
  AssertWithErrorCode,
  BoolAnd,
  ByteVecConcat,
  ByteVecNeq,
  CallLocal,
  CopyCreateSubContractWithToken,
  Encode,
  I256Const0,
  IfFalse,
  LoadImmField,
  LoadLocal,
  LoadMutField,
  Log5,
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
  U256SHL
} from './instr-codec'

describe('Encode & decode contract', function () {
  beforeAll(() => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  it('should encode and decode contracts', async () => {
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
          assetModifier: 0,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [LoadImmField(3), Return]
        },
        {
          isPublic: true,
          assetModifier: 0,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [LoadImmField(0), Return]
        },
        {
          isPublic: false,
          assetModifier: 0,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [LoadImmField(1), Return]
        },
        {
          isPublic: true,
          assetModifier: 0,
          argsLength: 0,
          localsLength: 0,
          returnLength: 1,
          instrs: [LoadImmField(2), Return]
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
          assetModifier: 0,
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
            IfFalse({ mode: 3, rest: Buffer.from([]) }),
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
          assetModifier: 3,
          argsLength: 4,
          localsLength: 9,
          returnLength: 0,
          instrs: [
            LoadLocal(0),
            LoadLocal(2),
            TokenRemaining,
            U256Const0,
            U256Gt,
            LoadLocal(0),
            LoadLocal(3),
            TokenRemaining,
            U256Const0,
            U256Gt,
            BoolAnd,
            U256Const({ mode: 15, rest: Buffer.from([]) }),
            AssertWithErrorCode,
            LoadLocal(2),
            LoadLocal(3),
            ByteVecNeq,
            U256Const({ mode: 11, rest: Buffer.from([]) }),
            AssertWithErrorCode,
            LoadLocal(2),
            LoadLocal(3),
            CallLocal(0),
            StoreLocal(5),
            StoreLocal(4),
            LoadLocal(4),
            LoadLocal(5),
            U256Const({ mode: 2, rest: Buffer.from([]) }),
            Encode,
            StoreLocal(6),
            U256Const0,
            U256Const0,
            U256Const0,
            U256Const0,
            U256Const0,
            U256Const0,
            U256Const({ mode: 6, rest: Buffer.from([]) }),
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
            U256Const({ mode: 64, rest: Buffer.from([255]) }),
            U256SHL,
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

  async function testContractCode(contractCode: string, methods: Method[]) {
    const nodeProvider = web3.getCurrentNodeProvider()
    const compileContractResult = await nodeProvider.contracts.postContractsCompileContract({ code: contractCode })
    const contractBytecode = compileContractResult.bytecode
    const decoded = contractCodec.decode(Buffer.from(contractBytecode, 'hex'))
    const encoded = contractCodec.encode(decoded)

    const decodedContract = contractCodec.decodeContract(Buffer.from(contractBytecode, 'hex'))
    expect(decodedContract.fieldLength).toEqual(methods.length)
    decodedContract.methods.map((decodedMethod, index) => {
      expect(decodedMethod.isPublic).toEqual(methods[index].isPublic)
      expect(decodedMethod.assetModifier).toEqual(methods[index].assetModifier)
      expect(decodedMethod.argsLength).toEqual(methods[index].argsLength)
      expect(decodedMethod.localsLength).toEqual(methods[index].localsLength)
      expect(decodedMethod.returnLength).toEqual(methods[index].returnLength)
      expect(decodedMethod.instrs).toEqual(methods[index].instrs)
    })
    expect(contractBytecode).toEqual(encoded.toString('hex'))
  }
})
