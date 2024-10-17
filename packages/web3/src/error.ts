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

export class TraceableError extends Error {
  trace: any | undefined

  constructor(message?: string, innerError?: any) {
    const innerErrorMessage =
      innerError === undefined ? undefined : innerError instanceof Error ? innerError.message : `${innerError}`
    super(innerErrorMessage ? `${message}, error: ${innerErrorMessage}` : message)
    this.trace = innerError

    const actualProto = new.target.prototype

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto)
    } else {
      const object = this as any
      object.__proto__ = actualProto
    }
  }
}
