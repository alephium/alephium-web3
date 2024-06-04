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

import { webcrypto, randomFillSync } from 'crypto'

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

export class WebCrypto {
  subtle = isBrowser ? globalThis.crypto.subtle : webcrypto ? webcrypto.subtle : crypto.subtle

  public getRandomValues<T extends ArrayBufferView | null>(array: T): T {
    if (!ArrayBuffer.isView(array)) {
      throw new TypeError(
        "Failed to execute 'getRandomValues' on 'Crypto': parameter 1 is not of type 'ArrayBufferView'"
      )
    }
    const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength)

    if (isBrowser) {
      globalThis.crypto.getRandomValues(bytes)
    } else {
      randomFillSync(bytes)
    }
    return array
  }
}
