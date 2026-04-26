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

import { addressFromLockupScript, addressToBytes, groupFromHint, groupOfLockupScript } from '../address'
import { AssetOutput, AssetOutputCodec } from './asset-output-codec'
import { lockupScriptCodec } from './lockup-script-codec'

describe('AssetOutputCodec', () => {
  it('should convert p2pk asset outputs to fixed asset outputs', () => {
    const lockupScript = lockupScriptCodec.decode(addressToBytes('3cUrKAb5KWuf61XkPorWJyNBicXG5gYTf7ZHZDKYudB4nkpD9Uu9U:3'))
    if (lockupScript.kind !== 'P2PK') {
      throw new Error('Expected P2PK lockup script')
    }
    const assetOutput: AssetOutput = {
      amount: 1n,
      lockupScript,
      lockTime: 0n,
      tokens: [],
      additionalData: new Uint8Array([])
    }

    const fixedOutput = AssetOutputCodec.toFixedAssetOutput(new Uint8Array(32), assetOutput, 0)

    expect(fixedOutput.hint).toBe(-425372909)
    expect(fixedOutput.address).toBe(addressFromLockupScript(lockupScript))
    expect(fixedOutput.hint & 1).toBe(1)
    expect(groupFromHint(fixedOutput.hint)).toBe(groupOfLockupScript(lockupScript))
    expect(AssetOutputCodec.fromFixedAssetOutput(fixedOutput)).toEqual(assetOutput)
  })

  it('should convert p2hmpk asset outputs to fixed asset outputs', () => {
    const lockupScript = lockupScriptCodec.decode(addressToBytes('AysNhoEDMej7hyoTBnVb2zNSvJ5zSj6LXoB3LwnTv2NGaZ7ufh'))
    if (lockupScript.kind !== 'P2HMPK') {
      throw new Error('Expected P2HMPK lockup script')
    }
    const assetOutput: AssetOutput = {
      amount: 1n,
      lockupScript,
      lockTime: 0n,
      tokens: [],
      additionalData: new Uint8Array([])
    }

    const fixedOutput = AssetOutputCodec.toFixedAssetOutput(new Uint8Array(32), assetOutput, 0)

    expect(fixedOutput.hint).toBe(-88692251)
    expect(fixedOutput.address).toBe(addressFromLockupScript(lockupScript))
    expect(fixedOutput.hint & 1).toBe(1)
    expect(groupFromHint(fixedOutput.hint)).toBe(groupOfLockupScript(lockupScript))
    expect(AssetOutputCodec.fromFixedAssetOutput(fixedOutput)).toEqual(assetOutput)
  })
})
