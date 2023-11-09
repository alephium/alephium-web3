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
export class BigIntCodec {
  static encode(value: bigint): Buffer {
    // Special case for zero.
    if (value === 0n) {
      return Buffer.from([0])
    }

    const isNegative = value < 0n
    let absValue = isNegative ? -value : value
    const bytes: number[] = []

    // Extract bytes from absolute value.
    while (absValue > 0n) {
      bytes.push(Number(absValue & 0xffn))
      absValue >>= 8n
    }

    // If the bigint is positive and the most significant byte has its high bit set,
    // prefix the byte array with a zero byte to signify positive value.
    if (!isNegative && (bytes[bytes.length - 1] & 0x80) !== 0) {
      bytes.push(0)
    }

    // If the bigint is negative, compute the two's complement of the byte array.
    if (isNegative) {
      let carry = true
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = ~bytes[i] & 0xff // Invert the bits of the byte.
        if (carry) {
          if (bytes[i] === 0xff) {
            bytes[i] = 0
          } else {
            bytes[i] += 1
            carry = false
          }
        }
      }

      // If there's still a carry, and the most significant byte is not 0xFF (to store the negative sign bit),
      // or if no bytes were set (which means the value was -1), append a 0xFF byte to hold the carry.
      if (carry || bytes.length === 0 || (bytes[bytes.length - 1] & 0x80) === 0) {
        bytes.push(0xff)
      }
    }

    // The byte array needs to be reversed since we've constructed it in little-endian order.
    return Buffer.from(new Uint8Array(bytes.reverse()))
  }

  static decode(encoded: Buffer, signed: boolean): bigint {
    // Special case for zero.
    if (encoded.length === 1 && encoded[0] === 0) {
      return 0n
    }

    // Determine if the number is negative by checking the most significant byte (MSB)
    const isNegative = signed ? encoded[0] === 0xff : signed

    // Convert the byte array to a bigint
    let value = 0n
    for (const byte of encoded) {
      value = (value << 8n) | BigInt(byte)
    }

    // If the number is negative, convert from two's complement
    if (isNegative) {
      // Create a mask for the value's bit length
      const mask = (1n << (8n * BigInt(encoded.length))) - 1n
      value = -(~value & mask) - 1n
    }

    return value
  }
}
