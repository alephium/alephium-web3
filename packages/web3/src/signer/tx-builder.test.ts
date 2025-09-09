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

import { getGroupFromTxScript, updateBytecodeWithGroup } from './tx-builder'
import { DestroyAdd } from '../../../../artifacts/ts/scripts'
import { randomBytes } from 'crypto'
import { binToHex } from '../utils'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'
import { groupOfAddress } from '../address'

describe('tx-builder', () => {
  function randomContractId(groupIndex: number): string {
    const bytes = new Uint8Array([...randomBytes(31), groupIndex])
    return binToHex(bytes)
  }

  it('should get group from tx script', () => {
    const caller = '15EM5rGtt7dPRZScE4Z9oL2EDfj84JnoSgq3NNgdcGFyu'

    for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group += 1) {
      const contractId = randomContractId(group)
      const bytecode = DestroyAdd.script.buildByteCodeToDeploy({
        add: contractId,
        caller
      })
      expect(getGroupFromTxScript(bytecode)).toBe(group)
    }
  })

  it('should update bytecode with group', () => {
    const caller = '3cUs6NYx4yS3n3t4ukgDcvHxvoer4i1tag2sJvEaadUjRottEiujx'
    const defaultGroup = groupOfAddress(caller)
    expect(defaultGroup).toBe(1)

    for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group += 1) {
      const contractId = randomContractId(group)
      if (group === defaultGroup) {
        const bytecode = DestroyAdd.script.buildByteCodeToDeploy({
          add: contractId,
          caller
        })
        expect(updateBytecodeWithGroup(bytecode, group)).toBe(bytecode)
        continue
      }

      const bytecode = DestroyAdd.script.buildByteCodeToDeploy({
        add: contractId,
        caller
      })
      expect(updateBytecodeWithGroup(bytecode, group)).not.toBe(bytecode)
    }
  })
})
