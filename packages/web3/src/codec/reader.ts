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

export class Reader {
  private index: number
  private bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    this.index = 0
    this.bytes = bytes
  }

  consumeByte(): number {
    if (this.index >= this.bytes.length) {
      throw new Error(
        `Index out of range: unable to consume byte at index ${this.index}, data length: ${this.bytes.length}`
      )
    }

    const byte = this.bytes[`${this.index}`]
    this.index += 1
    return byte
  }

  consumeBytes(num: number): Uint8Array {
    const from = this.index
    const to = this.index + num
    if (from > to || to > this.bytes.length) {
      throw new Error(
        `Index out of range: unable to consume bytes from index ${from} to ${to}, data length: ${this.bytes.length}`
      )
    }
    const bytes = this.bytes.slice(from, to)
    this.index = to
    return bytes
  }

  consumeAll(): Uint8Array {
    return this.consumeBytes(this.bytes.length - this.index)
  }
}
