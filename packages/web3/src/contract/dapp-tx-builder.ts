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

import { contractIdFromAddress, isContractAddress } from '../address'
import { Val } from '../api'
import {
  AddressConst,
  ApproveAlph,
  ApproveToken,
  BytesConst,
  CallExternal,
  ConstFalse,
  ConstTrue,
  Dup,
  Instr,
  Pop,
  toI256,
  toU256,
  U256Const,
  Method
} from '../codec'
import { LockupScript, lockupScriptCodec } from '../codec/lockup-script-codec'
import { scriptCodec } from '../codec/script-codec'
import { ALPH_TOKEN_ID } from '../constants'
import { TraceableError } from '../error'
import { SignExecuteScriptTxParams } from '../signer'
import { base58ToBytes, binToHex, HexString, hexToBinUnsafe, isBase58, isHexString } from '../utils'

export class DappTransactionBuilder {
  private callerLockupScript: LockupScript
  private approvedAssets: Map<HexString, bigint>
  private instrs: Instr[]

  constructor(public readonly callerAddress: string) {
    try {
      this.callerLockupScript = lockupScriptCodec.decode(base58ToBytes(this.callerAddress))
      if (this.callerLockupScript.kind !== 'P2PKH' && this.callerLockupScript.kind !== 'P2SH') {
        throw new Error(`Expected a P2PKH address or P2SH address`)
      }
    } catch (error) {
      throw new TraceableError(`Invalid caller address: ${callerAddress}`, error)
    }
    this.approvedAssets = new Map<HexString, bigint>()
    this.instrs = []
  }

  callContract(params: {
    contractAddress: string
    methodIndex: number
    args: Val[]
    attoAlphAmount?: bigint
    tokens?: { id: HexString; amount: bigint }[]
    retLength?: number
  }) {
    if (!isBase58(params.contractAddress)) {
      throw new Error(`Invalid contract address: ${params.contractAddress}, expected a base58 string`)
    }
    if (!isContractAddress(params.contractAddress)) {
      throw new Error(`Invalid contract address: ${params.contractAddress}, expected a P2C address`)
    }

    if (params.methodIndex < 0) {
      throw new Error(`Invalid method index: ${params.methodIndex}`)
    }

    const allTokens = (params.tokens ?? []).concat([{ id: ALPH_TOKEN_ID, amount: params.attoAlphAmount ?? 0n }])
    const instrs = [
      ...genApproveAssets(this.callerLockupScript, this.approveTokens(allTokens)),
      ...genContractCall(params.contractAddress, params.methodIndex, params.args, params.retLength ?? 0)
    ]
    this.instrs.push(...instrs)
    return this
  }

  getResult(): SignExecuteScriptTxParams {
    const method: Method = {
      isPublic: true,
      usePreapprovedAssets: this.approvedAssets.size > 0,
      useContractAssets: false,
      usePayToContractOnly: false,
      argsLength: 0,
      localsLength: 0,
      returnLength: 0,
      instrs: this.instrs
    }
    const script = { methods: [method] }
    const bytecode = scriptCodec.encode(script)
    const tokens = Array.from(this.approvedAssets.entries()).map(([id, amount]) => ({ id, amount }))
    this.approvedAssets.clear()
    this.instrs = []
    return {
      signerAddress: this.callerAddress,
      signerKeyType: this.callerLockupScript.kind === 'P2PKH' ? 'default' : 'bip340-schnorr',
      bytecode: binToHex(bytecode),
      attoAlphAmount: tokens.find((t) => t.id === ALPH_TOKEN_ID)?.amount,
      tokens: tokens.filter((t) => t.id !== ALPH_TOKEN_ID)
    }
  }

  private addTokenToMap(tokenId: HexString, amount: bigint, map: Map<HexString, bigint>) {
    const current = map.get(tokenId)
    if (current !== undefined) {
      map.set(tokenId, current + amount)
    } else if (amount > 0n) {
      map.set(tokenId, amount)
    }
  }

  private approveTokens(tokens: { id: HexString; amount: bigint }[]): { id: HexString; amount: bigint }[] {
    const tokenAmounts = new Map<HexString, bigint>()
    tokens.forEach((token) => {
      if (!(isHexString(token.id) && token.id.length === 64)) {
        throw new Error(`Invalid token id: ${token.id}`)
      }
      if (token.amount < 0n) {
        throw new Error(`Invalid token amount: ${token.amount}`)
      }
      this.addTokenToMap(token.id, token.amount, tokenAmounts)
      this.addTokenToMap(token.id, token.amount, this.approvedAssets)
    })
    return Array.from(tokenAmounts.entries()).map(([id, amount]) => ({ id, amount }))
  }
}

function genApproveAssets(callerLockupScript: LockupScript, tokens: { id: HexString; amount: bigint }[]): Instr[] {
  if (tokens.length === 0) {
    return []
  }
  const approveInstrs = tokens.flatMap((token) => {
    if (token.id === ALPH_TOKEN_ID) {
      return [U256Const(token.amount), ApproveAlph]
    } else {
      const tokenId = BytesConst(hexToBinUnsafe(token.id))
      return [tokenId, U256Const(token.amount), ApproveToken]
    }
  })
  return [
    AddressConst(callerLockupScript),
    ...Array.from(Array(tokens.length - 1).keys()).map(() => Dup),
    ...approveInstrs
  ]
}

function bigintToNumeric(value: bigint): Instr {
  return value >= 0 ? toU256(value) : toI256(value)
}

function strToNumeric(str: string): Instr {
  const regex = /^-?\d+[ui]?$/
  if (regex.test(str)) {
    if (str.endsWith('i')) return toI256(BigInt(str.slice(0, str.length - 1)))
    if (str.endsWith('u')) return toU256(BigInt(str.slice(0, str.length - 1)))
    return bigintToNumeric(BigInt(str))
  }
  throw new Error(`Invalid number: ${str}`)
}

function toAddressOpt(str: string): LockupScript | undefined {
  if (!isBase58(str)) return undefined
  try {
    return lockupScriptCodec.decode(base58ToBytes(str))
  } catch (_) {
    return undefined
  }
}

export function genArgs(args: Val[]): Instr[] {
  return args.flatMap((arg) => {
    if (typeof arg === 'boolean') return arg ? [ConstTrue] : [ConstFalse]
    if (typeof arg === 'bigint') return bigintToNumeric(arg)
    if (typeof arg === 'string') {
      if (isHexString(arg)) return [BytesConst(hexToBinUnsafe(arg))]
      const addressOpt = toAddressOpt(arg)
      if (addressOpt !== undefined) return AddressConst(addressOpt)
      return strToNumeric(arg)
    }
    if (Array.isArray(arg)) return genArgs(arg)
    if (arg instanceof Map) throw new Error(`Map cannot be used as a function argument`)
    if (typeof arg === 'object') return genArgs(Object.values(arg))
    throw new Error(`Unknown argument type: ${typeof arg}, arg: ${arg}`)
  })
}

function genContractCall(contractAddress: string, methodIndex: number, args: Val[], retLength: number): Instr[] {
  const argInstrs = genArgs(args)
  return [
    ...argInstrs,
    toU256(BigInt(argInstrs.length)),
    toU256(BigInt(retLength)),
    BytesConst(contractIdFromAddress(contractAddress)),
    CallExternal(methodIndex),
    ...Array.from(Array(retLength).keys()).map(() => Pop)
  ]
}
