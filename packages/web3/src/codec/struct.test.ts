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

import { Struct } from './struct'
import { Int } from './int'
import { U32 } from './u32'
import { String } from './string'
import { I256 } from './i256'
import { Vector } from './vector'
import { Bool } from './bool'
import { Option } from './option'

interface Point {
  x: number
  y: number
}

const Point = Struct({
  x: Int,
  y: Int
})

interface Student {
  age: number
  name: string

  sex: boolean
  money: bigint

  address: Array<string>

  books: number | undefined
}

const Student = Struct({
  age: U32,
  name: String,
  sex: Bool,
  money: I256,
  address: Vector<string>(String),
  books: Option<number>(Int)
})

describe('struct', function () {
  it('struct Point', () => {
    const point = <Point>{
      x: 12,
      y: 12000
    }
    const encData = Point.enc(point)
    expect(point.x).toEqual(Point.dec(encData).x)
    expect(point.y).toEqual(Point.dec(encData).y)
  })

  it('struct Student', () => {
    const student = <Student>{
      age: 12,
      name: 'lili',
      sex: true,
      money: 1200000000n,
      address: ['address1', 'address2'],
      books: 10
    }
    const encData = Student.enc(student)
    const actual = Student.dec(encData)
    expect(actual).toEqual(student)
    expect(actual.name).toEqual(student.name)
    expect(actual.age).toEqual(student.age)
    expect(actual.sex).toEqual(student.sex)
    expect(actual.address).toEqual(student.address)
    expect(actual.books).toEqual(student.books)
  })
})
