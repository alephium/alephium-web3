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

import { Api as NodeApi } from './api-alephium'
import { Api as ExplorerApi } from './api-explorer'

export class NodeProvider extends NodeApi<null> {
  constructor(baseUrl: string) {
    super({ baseUrl: baseUrl })
  }
}

export class ExplorerProvider extends ExplorerApi<null> {
  constructor(baseUrl: string) {
    super({ baseUrl: baseUrl })
  }
}

export * as node from './api-alephium'
export * as explorer from './api-explorer'
