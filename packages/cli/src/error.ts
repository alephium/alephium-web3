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

class CompilationError {
  constructor(
    public lineStart: number,
    public column: number,
    public errorType: string,
    public line: number,
    public codeLine: string,
    public errorIndicator: string,
    public message: string,
    public additionalLine1?: string,
    public additionalLine2?: string
  ) {}

  reformat(line: number, file: string): string {
    const spaces = `${line}`.replace(/\d/g, ' ')
    const newError = `${file} (${line}:${this.column}): ${this.errorType}
${line} |${this.codeLine}
${spaces} |${this.errorIndicator}
${spaces} |${this.message}`

    if (this.additionalLine1 && this.additionalLine2) {
      return `${newError}\n${spaces} |${this.additionalLine1}\n${spaces} |${this.additionalLine2}`
    } else {
      return newError
    }
  }
}

const errorRegex = /error \((\d+):(\d+)\):\s*(.*)\n\s*(\d+)\s*\|(.*)\n.*\|(.*)\n\s*\|(.*)(?:\n\s*\|(.*)\n\s*\|(.*))?/

export function parseError(error: string): CompilationError | undefined {
  const match = error.match(errorRegex)

  if (match) {
    const lineStart = parseInt(match[1])
    const column = parseInt(match[2])
    const errorType = match[3]
    const line = parseInt(match[4])
    const codeLine = match[5]
    const errorIndicator = match[6]
    const message = match[7]
    const additionalLine1 = match[8]
    const additionalLine2 = match[9]

    return new CompilationError(
      lineStart,
      column,
      errorType,
      line,
      codeLine,
      errorIndicator,
      message,
      additionalLine1,
      additionalLine2
    )
  } else {
    undefined
  }
}
