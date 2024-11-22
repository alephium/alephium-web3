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
import { hexToBinUnsafe } from '../utils'
import { instrCodec } from './instr-codec'
import * as instr from './instr-codec'

describe('Encode & decode instrs', function () {
  it('should encode & decode instrs', function () {
    const instrs: [instr.Instr, string][] = [
      [instr.ConstTrue, '03'],
      [instr.ConstFalse, '04'],
      [instr.I256Const0, '05'],
      [instr.I256Const1, '06'],
      [instr.I256Const2, '07'],
      [instr.I256Const3, '08'],
      [instr.I256Const4, '09'],
      [instr.I256Const5, '0a'],
      [instr.I256ConstN1, '0b'],
      [instr.U256Const0, '0c'],
      [instr.U256Const1, '0d'],
      [instr.U256Const2, '0e'],
      [instr.U256Const3, '0f'],
      [instr.U256Const4, '10'],
      [instr.U256Const5, '11'],
      [
        instr.I256Const(-10481439859268419233264539884773323951517980772685648223450594165500329014021n),
        '12dce8d3b71c0f35ad349532d62cabedf1427525975229e6de683a55607da3f0ccfb'
      ],
      [
        instr.U256Const(97899266217450653744188863238495614586377595753556581226864473716511562253292n),
        '13dcd871056403f9f059261161beaf05d8a87983b684df75964f10f27b164ba7c3ec'
      ],
      [instr.BytesConst(new Uint8Array([])), '1400'],
      [
        instr.AddressConst({ kind: 'P2PKH', value: new Uint8Array(32) }),
        '15000000000000000000000000000000000000000000000000000000000000000000'
      ],
      [instr.LoadLocal(127), '167f'],
      [instr.StoreLocal(128), '1780'],
      [instr.Pop, '18'],
      [instr.BoolNot, '19'],
      [instr.BoolAnd, '1a'],
      [instr.BoolOr, '1b'],
      [instr.BoolEq, '1c'],
      [instr.BoolNeq, '1d'],
      [instr.BoolToByteVec, '1e'],
      [instr.I256Add, '1f'],
      [instr.I256Sub, '20'],
      [instr.I256Mul, '21'],
      [instr.I256Div, '22'],
      [instr.I256Mod, '23'],
      [instr.I256Eq, '24'],
      [instr.I256Neq, '25'],
      [instr.I256Lt, '26'],
      [instr.I256Le, '27'],
      [instr.I256Gt, '28'],
      [instr.I256Ge, '29'],
      [instr.U256Add, '2a'],
      [instr.U256Sub, '2b'],
      [instr.U256Mul, '2c'],
      [instr.U256Div, '2d'],
      [instr.U256Mod, '2e'],
      [instr.U256Eq, '2f'],
      [instr.U256Neq, '30'],
      [instr.U256Lt, '31'],
      [instr.U256Le, '32'],
      [instr.U256Gt, '33'],
      [instr.U256Ge, '34'],
      [instr.U256ModAdd, '35'],
      [instr.U256ModSub, '36'],
      [instr.U256ModMul, '37'],
      [instr.U256BitAnd, '38'],
      [instr.U256BitOr, '39'],
      [instr.U256Xor, '3a'],
      [instr.U256SHL, '3b'],
      [instr.U256SHR, '3c'],
      [instr.I256ToU256, '3d'],
      [instr.I256ToByteVec, '3e'],
      [instr.U256ToI256, '3f'],
      [instr.U256ToByteVec, '40'],
      [instr.ByteVecEq, '41'],
      [instr.ByteVecNeq, '42'],
      [instr.ByteVecSize, '43'],
      [instr.ByteVecConcat, '44'],
      [instr.AddressEq, '45'],
      [instr.AddressNeq, '46'],
      [instr.AddressToByteVec, '47'],
      [instr.IsAssetAddress, '48'],
      [instr.IsContractAddress, '49'],
      [instr.Jump(65536), '4a80010000'],
      [instr.IfTrue(-65536), '4bbfff0000'],
      [instr.IfFalse(-65536), '4cbfff0000'],
      [instr.CallLocal(255), '00ff'],
      [instr.Return, '02'],
      [instr.Assert, '4d'],
      [instr.Blake2b, '4e'],
      [instr.Keccak256, '4f'],
      [instr.Sha256, '50'],
      [instr.Sha3, '51'],
      [instr.VerifyTxSignature, '52'],
      [instr.VerifySecP256K1, '53'],
      [instr.VerifyED25519, '54'],
      [instr.NetworkId, '55'],
      [instr.BlockTimeStamp, '56'],
      [instr.BlockTarget, '57'],
      [instr.TxId, '58'],
      [instr.TxInputAddressAt, '59'],
      [instr.TxInputsSize, '5a'],
      [instr.VerifyAbsoluteLocktime, '5b'],
      [instr.VerifyRelativeLocktime, '5c'],
      [instr.Log1, '5d'],
      [instr.Log2, '5e'],
      [instr.Log3, '5f'],
      [instr.Log4, '60'],
      [instr.Log5, '61'],
      [instr.ByteVecSlice, '62'],
      [instr.ByteVecToAddress, '63'],
      [instr.Encode, '64'],
      [instr.Zeros, '65'],
      [instr.U256To1Byte, '66'],
      [instr.U256To2Byte, '67'],
      [instr.U256To4Byte, '68'],
      [instr.U256To8Byte, '69'],
      [instr.U256To16Byte, '6a'],
      [instr.U256To32Byte, '6b'],
      [instr.U256From1Byte, '6c'],
      [instr.U256From2Byte, '6d'],
      [instr.U256From4Byte, '6e'],
      [instr.U256From8Byte, '6f'],
      [instr.U256From16Byte, '70'],
      [instr.U256From32Byte, '71'],
      [instr.EthEcRecover, '72'],
      [instr.Log6, '73'],
      [instr.Log7, '74'],
      [instr.Log8, '75'],
      [instr.Log9, '76'],
      [instr.ContractIdToAddress, '77'],
      [instr.LoadLocalByIndex, '78'],
      [instr.StoreLocalByIndex, '79'],
      [instr.Dup, '7a'],
      [instr.AssertWithErrorCode, '7b'],
      [instr.Swap, '7c'],
      [instr.BlockHash, '7d'],
      [instr.DEBUG([]), '7e00'],
      [instr.TxGasPrice, '7f'],
      [instr.TxGasAmount, '80'],
      [instr.TxGasFee, '81'],
      [instr.I256Exp, '82'],
      [instr.U256Exp, '83'],
      [instr.U256ModExp, '84'],
      [instr.VerifyBIP340Schnorr, '85'],
      [instr.GetSegregatedSignature, '86'],
      [instr.MulModN, '87'],
      [instr.AddModN, '88'],
      [instr.U256ToString, '89'],
      [instr.I256ToString, '8a'],
      [instr.BoolToString, '8b'],
      [instr.GroupOfAddress, '8c'],
      [instr.LoadMutField(128), 'a080'],
      [instr.StoreMutField(255), 'a1ff'],
      [instr.CallExternal(128), '0180'],
      [instr.ApproveAlph, 'a2'],
      [instr.ApproveToken, 'a3'],
      [instr.AlphRemaining, 'a4'],
      [instr.TokenRemaining, 'a5'],
      [instr.IsPaying, 'a6'],
      [instr.TransferAlph, 'a7'],
      [instr.TransferAlphFromSelf, 'a8'],
      [instr.TransferAlphToSelf, 'a9'],
      [instr.TransferToken, 'aa'],
      [instr.TransferTokenFromSelf, 'ab'],
      [instr.TransferTokenToSelf, 'ac'],
      [instr.CreateContract, 'ad'],
      [instr.CreateContractWithToken, 'ae'],
      [instr.CopyCreateContract, 'af'],
      [instr.DestroySelf, 'b0'],
      [instr.SelfContractId, 'b1'],
      [instr.SelfAddress, 'b2'],
      [instr.CallerContractId, 'b3'],
      [instr.CallerAddress, 'b4'],
      [instr.IsCalledFromTxScript, 'b5'],
      [instr.CallerInitialStateHash, 'b6'],
      [instr.CallerCodeHash, 'b7'],
      [instr.ContractInitialStateHash, 'b8'],
      [instr.ContractCodeHash, 'b9'],
      [instr.MigrateSimple, 'ba'],
      [instr.MigrateWithFields, 'bb'],
      [instr.CopyCreateContractWithToken, 'bc'],
      [instr.BurnToken, 'bd'],
      [instr.LockApprovedAssets, 'be'],
      [instr.CreateSubContract, 'bf'],
      [instr.CreateSubContractWithToken, 'c0'],
      [instr.CopyCreateSubContract, 'c1'],
      [instr.CopyCreateSubContractWithToken, 'c2'],
      [instr.LoadMutFieldByIndex, 'c3'],
      [instr.StoreMutFieldByIndex, 'c4'],
      [instr.ContractExists, 'c5'],
      [instr.CreateContractAndTransferToken, 'c6'],
      [instr.CopyCreateContractAndTransferToken, 'c7'],
      [instr.CreateSubContractAndTransferToken, 'c8'],
      [instr.CopyCreateSubContractAndTransferToken, 'c9'],
      [instr.NullContractAddress, 'ca'],
      [instr.SubContractId, 'cb'],
      [instr.SubContractIdOf, 'cc'],
      [instr.ALPHTokenId, 'cd'],
      [instr.LoadImmField(0), 'ce00'],
      [instr.LoadImmFieldByIndex, 'cf'],
      [instr.PayGasFee, 'd0'],
      [instr.MinimalContractDeposit, 'd1'],
      [instr.CreateMapEntry(127, 0), 'd27f00'],
      [instr.MethodSelector(0), 'd300000000'],
      [instr.CallExternalBySelector(0), 'd400000000']
    ]

    instrs.forEach(([instr, hex]) => {
      const encoded = hexToBinUnsafe(hex)
      expect(instrCodec.encode(instr)).toEqual(encoded)
      expect(instrCodec.decode(encoded)).toEqual(instr)
    })
  })

  it('should check the numeric bounds', () => {
    expect(() => instr.toU256(0n)).not.toThrow()
    expect(() => instr.toU256(1n)).not.toThrow()
    expect(() => instr.toU256((1n << 256n) - 1n)).not.toThrow()
    expect(() => instr.toU256(-1n)).toThrow('Invalid u256')
    expect(() => instr.toU256(1n << 256n)).toThrow('Invalid u256')

    expect(() => instr.toI256(0n)).not.toThrow()
    expect(() => instr.toI256(-1n)).not.toThrow()
    expect(() => instr.toI256(1n)).not.toThrow()
    expect(() => instr.toI256(-(1n << 255n))).not.toThrow()
    expect(() => instr.toI256((1n << 255n) - 1n)).not.toThrow()
    expect(() => instr.toI256(1n << 255n)).toThrow('Invalid i256')
    expect(() => instr.toI256(-(1n << 255n) - 1n)).toThrow('Invalid i256')
  })
})
