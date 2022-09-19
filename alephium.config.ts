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

import { Configuration } from '@alephium/cli/types'

const configuration: Configuration<null> = {
  compilerOptions: { errorOnWarnings: false },

  defaultNetwork: 'devnet',
  networks: {
    devnet: {
      nodeUrl: 'http://localhost:22973',
      mnemonic:
        'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava',
      settings: null
    },

    testnet: {
      nodeUrl: 'http://localhost:22973',
      mnemonic: process.env.MNEMONIC as string,
      settings: null
    },

    mainnet: {
      nodeUrl: 'http://localhost:22973',
      mnemonic: process.env.MNEMONIC as string,
      settings: null
    }
  }
}

export default configuration
