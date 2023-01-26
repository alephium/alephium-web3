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

import { Int } from './int'
import { I256 } from './i256'
import { U32 } from './u32'
import { U256 } from './u256'

describe('compact', function () {
  it('compact int', () => {
    // 1 byte
    expect(Buffer.from(Int.enc(0)).toString('hex')).toEqual('00')
    expect(Buffer.from(Int.enc(1)).toString('hex')).toEqual('01')
    expect(Buffer.from(Int.enc(-1)).toString('hex')).toEqual('3f')
    expect(Int.dec('0x3f')).toEqual(-1)
    expect(Int.dec('0x01')).toEqual(1)
    expect(Int.dec('0x00')).toEqual(0)

    //2 byte
    expect(Buffer.from(Int.enc(400)).toString('hex')).toEqual('4190')
    expect(Int.dec('4190')).toEqual(400)

    //2 byte
    expect(Buffer.from(Int.enc(-400)).toString('hex')).toEqual('7e70')
    expect(Int.dec('0x7e70')).toEqual(-400)

    // 4 byte
    expect(Buffer.from(Int.enc(123456789)).toString('hex')).toEqual('875bcd15')
    expect(Int.dec('0x875bcd15')).toEqual(123456789)

    expect(Buffer.from(Int.enc(-123456789)).toString('hex')).toEqual('b8a432eb')
    expect(Int.dec('b8a432eb')).toEqual(-123456789)

    // multi byte
    expect(Buffer.from(I256.enc(123456789123456789n)).toString('hex')).toEqual('c401b69b4bacd05f15')
    expect(I256.dec('c401b69b4bacd05f15')).toEqual(123456789123456789n)

    expect(Buffer.from(I256.enc(-123456789123456789n)).toString('hex')).toEqual('c4fe4964b4532fa0eb')
    expect((-123456789123456789n).toString(16)).toEqual('-1b69b4bacd05f15')
  })

  it('compact uint', () => {
    // 1 byte
    expect(Buffer.from(U32.enc(0)).toString('hex')).toEqual('00')
    expect(Buffer.from(U32.enc(1)).toString('hex')).toEqual('01')
    expect(U32.dec('0x01')).toEqual(1)
    expect(U32.dec('0x00')).toEqual(0)

    //2 byte
    expect(Buffer.from(U32.enc(400)).toString('hex')).toEqual('4190')
    expect(U32.dec('4190')).toEqual(400)

    // 4 byte
    expect(Buffer.from(U32.enc(123456789)).toString('hex')).toEqual('875bcd15')
    expect(U32.dec('0x875bcd15')).toEqual(123456789)

    // multi byte
    expect(Buffer.from(U256.enc(123456789123456789n)).toString('hex')).toEqual('c401b69b4bacd05f15')
    expect(U256.dec('c401b69b4bacd05f15')).toEqual(123456789123456789n)
  })
})
