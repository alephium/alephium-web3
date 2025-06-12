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

import EC from 'elliptic'
import assert from 'assert'

import * as utils from './utils'

describe('utils', function () {
  it('should throw an error when decoding invalid signature', () => {
    const ec = new EC.ec('secp256k1')
    const signature = 'signature-with-wrong-length'

    expect(() => utils.signatureDecode(ec, signature)).toThrowError('Invalid signature length')
  })

  it('should compress signature', () => {
    const vectors = [
      [
        'Satoshi Nakamoto',
        '0000000000000000000000000000000000000000000000000000000000000001',
        '934b1ea10a4b3c1757e2b0c017d0b6143ce3c9a7e6a4a49860d7a6ab210ee3d82442ce9d2b916064108014783e923ec36b49743e2ffa1c4496f01a512aafd9e5'
      ],
      [
        'Everything should be made as simple as possible, but not simpler.',
        '0000000000000000000000000000000000000000000000000000000000000001',
        '33a69cd2065432a30f3d1ce4eb0d59b8ab58c74f27c41a7fdb5696ad4e6108c96f807982866f785d3f6418d24163ddae117b7db4d5fdf0071de069fa54342262'
      ],
      [
        'All those moments will be lost in time, like tears in rain. Time to die...',
        '0000000000000000000000000000000000000000000000000000000000000001',
        '8600dbd41e348fe5c9465ab92d23e3db8b98b873beecd930736488696438cb6b547fe64427496db33bf66019dacbf0039c04199abb0122918601db38a72cfc21'
      ],
      [
        'Satoshi Nakamoto',
        'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
        'fd567d121db66e382991534ada77a6bd3106f0a1098c231e47993447cd6af2d06b39cd0eb1bc8603e159ef5c20a5c8ad685a45b06ce9bebed3f153d10d93bed5'
      ],
      [
        'Alan Turing',
        'f8b8af8ce3c7cca5e300d33939540c10d45ce001b8f252bfbc57ba0342904181',
        '7063ae83e7f62bbb171798131b4a0564b956930092b33b07b395615d9ec7e15c58dfcc1e00a35e1572f366ffe34ba0fc47db1e7189759b9fb233c5b05ab388ea'
      ],
      [
        "There is a computer disease that anybody who works with computers knows about. It's a very serious disease and it interferes completely with the work. The trouble with computers is that you 'play' with them!",
        'e91671c46231f833a6406ccbea0e3e392c76c167bac1cb013f6f1013980455c2',
        'b552edd27580141f3b2a5463048cb7cd3e047b97c9f98076c32dbdf85a68718b279fa72dd19bfae05577e06c7c0c1900c371fcd5893f7e1d56a37d30174671f6'
      ]
    ]

    const ec = new EC.ec('secp256k1')

    vectors.forEach((vector) => {
      const privateKey = vector[1]
      const signatureExpected = vector[2]
      const keyPair = ec.keyFromPrivate(privateKey)

      const message = vector[0]
      const sha256 = ec.hash().update(message).digest()
      const typedSig = keyPair.sign(sha256)
      const signature = utils.encodeSignature(typedSig)
      assert.deepStrictEqual(signature, signatureExpected)

      const anotherSig = utils.encodeHexSignature(typedSig.r.toString('hex'), typedSig.s.toString('hex'))
      expect(anotherSig).toBe(signature)
    })
  })

  it('should convert from string to hex and back', () => {
    expect(utils.stringToHex('Hello Alephium!')).toBe('48656c6c6f20416c65706869756d21')
    expect(utils.hexToString('48656c6c6f20416c65706869756d21')).toBe('Hello Alephium!')

    expect(() => utils.hexToString('zzzz')).toThrow('Invalid hex string: zzzz')
  })

  it('should check hex string', () => {
    expect(utils.isHexString('')).toBe(true)
    expect(utils.isHexString('0011aaAAbbBBccCCddDDeeEEffFF')).toBe(true)

    expect(utils.isHexString('0011aaAAbbBBccCCddDDeeEEffFFgg')).toBe(false)
    expect(utils.isHexString('001')).toBe(false)
    expect(utils.isHexString('0x1111')).toBe(false)
    expect(utils.isHexString('1111xxzz')).toBe(false)
  })

  it('should get chain index for blocks', () => {
    const check = (input: string, fromGroup: number, toGroup: number) => {
      expect(utils.blockChainIndex(input)).toEqual({ fromGroup, toGroup })
    }
    check('00000000000276fa4d4831363b890d6b608a0480be590fad464545f6ee94d8ad', 3, 1)
    check('0000000000078d1de32359ffd4239e010c886d7659a10bb8c440b7befbc87d6f', 3, 3)
    check('00000000000a11fc7e30525ff1c2d783de3344b85a9c76abdd207ad8e1401566', 1, 2)
    check('00000000000d09d9f9cf3c3619ca18b84c44437d61cdf0b423831e23e1847e20', 0, 0)
  })

  it('should convert between target and difficulty', () => {
    const maxBigInt = 1n << 256n
    for (let num = 1; num < 256; num += 1) {
      const targetValue = 1n << BigInt(num)
      const diff = maxBigInt / targetValue
      const compactedTarget = utils.difficultyToTarget(diff)
      expect(utils.targetToDifficulty(compactedTarget)).toEqual(diff)
    }

    expect(utils.targetToDifficulty('03010101')).toEqual(
      1759945423332515547604927348026201994942774834186624170344224826469580800n
    )
    expect(
      utils.difficultyToTarget(1759945423332515547604927348026201994942774834186624170344224826469580800n)
    ).toEqual('03010101')
    expect(utils.targetToDifficulty('10010000')).toEqual(87112285931760246646623899502532662132736n)
    expect(utils.difficultyToTarget(87112285931760246646623899502532662132736n)).toEqual('10010000')
    expect(utils.targetToDifficulty('12ffffff')).toEqual(5192297168019855896620738275246080n)
    expect(utils.difficultyToTarget(5192297168019855896620738275246080n)).toEqual('12ffffff')
    expect(utils.targetToDifficulty('20ffffff')).toEqual(1n)
    expect(utils.difficultyToTarget(1n)).toEqual('20ffffff')
    expect(utils.targetToDifficulty('1b01ae98')).toEqual(167344728152528n)
    expect(utils.difficultyToTarget(167344728152528n)).toEqual('1b01ae98')

    expect(() => utils.targetToDifficulty('1b01ae9')).toThrow(
      'Invalid target 1b01ae9, expected a hex string of length 8'
    )
    expect(() => utils.targetToDifficulty('1b01ae988')).toThrow(
      'Invalid target 1b01ae988, expected a hex string of length 8'
    )
    expect(() => utils.targetToDifficulty('1b01ae9z')).toThrow(
      'Invalid target 1b01ae9z, expected a hex string of length 8'
    )
  })
})