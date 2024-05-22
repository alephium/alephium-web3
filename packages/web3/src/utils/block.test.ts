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

import { BlockSubscribeOptions, BlockSubscriptionBase, ReorgCallback } from './block'
import * as node from '../api/api-alephium'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'
import { randomInt } from 'crypto'

describe('block subscription', function () {
  let fromGroup: number
  let toGroup: number
  let orphanHashes: string[] = []
  let newHashes: string[] = []
  let options: BlockSubscribeOptions

  beforeEach(() => {
    fromGroup = randomInt(0, TOTAL_NUMBER_OF_GROUPS)
    toGroup = randomInt(0, TOTAL_NUMBER_OF_GROUPS)
    orphanHashes = []
    newHashes = []
    options = {
      pollingInterval: 0,
      messageCallback: () => {
        return
      },
      errorCallback: () => {
        return
      },
      reorgCallback: (orphans, newBlocks) => {
        orphanHashes.push(...orphans.map((b) => b.hash))
        newHashes.push(...newBlocks.map((b) => b.hash))
      }
    }
  })

  it('should handle reorg(1 orphan block)', async () => {
    const chains = [
      ['common', 'main-0'],
      ['common', 'fork-0']
    ]
    const blockSubscription = new BlockSubscriptionTest(options, fromGroup, toGroup, chains)
    await blockSubscription.handleReorgForTest('fork-0', 1)
    expect(orphanHashes).toEqual(['fork-0'])
    expect(newHashes).toEqual(['main-0'])
  })

  it('should handle reorg(multiple orphan blocks)', async () => {
    const chains = [
      ['common', 'main-0', 'main-1', 'main-2', 'main-3'],
      ['common', 'fork-0', 'fork-1', 'fork-2']
    ]
    const blockSubscription = new BlockSubscriptionTest(options, fromGroup, toGroup, chains)
    await blockSubscription.handleReorgForTest('fork-2', 3)
    expect(orphanHashes).toEqual(['fork-0', 'fork-1', 'fork-2'])
    expect(newHashes).toEqual(['main-0', 'main-1', 'main-2'])
  })

  function buildHashesByHeightMap(chains: string[][]) {
    const hashesByHeight: Map<number, string[]> = new Map()
    const sortedChains = chains.sort((a, b) => {
      if (a.length === b.length) {
        return b[b.length - 1] > a[a.length - 1] ? 1 : -1
      }
      return b.length - a.length
    })
    const maxHeight = sortedChains[0].length
    for (let currentHeight = 0; currentHeight < maxHeight; currentHeight += 1) {
      const hashes = hashesByHeight.get(currentHeight) ?? []
      sortedChains
        .filter((c) => c.length > currentHeight)
        .forEach((c) => {
          if (!hashes.includes(c[currentHeight])) {
            hashes.push(c[currentHeight])
          }
          hashesByHeight.set(currentHeight, hashes)
        })
    }
    return hashesByHeight
  }

  function buildBlockByHashMap(chains: string[][], fromGroup: number, toGroup: number) {
    const blockByHash: Map<string, node.BlockEntry> = new Map()
    for (const chain of chains) {
      for (let index = 0; index < chain.length; index += 1) {
        const hash = chain[index]
        const parentHash = index === 0 ? 'undefined' : chain[index - 1]
        const depsLength = TOTAL_NUMBER_OF_GROUPS * 2 - 1
        const deps = Array.from(Array(depsLength).keys()).map(() => '')
        const parentIndex = Math.floor(depsLength / 2) + toGroup
        deps[parentIndex] = parentHash
        const blockEntry: node.BlockEntry = {
          hash: hash,
          timestamp: 0,
          chainFrom: fromGroup,
          chainTo: toGroup,
          height: index,
          deps,
          transactions: [],
          nonce: '',
          version: 0,
          depStateHash: '',
          txsHash: '',
          target: ''
        }
        blockByHash.set(hash, blockEntry)
      }
    }
    return blockByHash
  }

  class BlockSubscriptionTest extends BlockSubscriptionBase {
    readonly fromGroup: number
    readonly toGroup: number
    readonly onReorgCallback?: ReorgCallback
    readonly hashesByHeight: Map<number, string[]>
    readonly blockByHash: Map<string, node.BlockEntry>

    override getHashesAtHeight(height: number): Promise<string[]> {
      return Promise.resolve(this.hashesByHeight.get(height)!)
    }

    override getBlockByHash(hash: string): Promise<node.BlockEntry> {
      return Promise.resolve(this.blockByHash.get(hash)!)
    }

    override polling(): Promise<void> {
      return Promise.resolve()
    }

    async handleReorgForTest(fromHash: string, fromHeight: number) {
      await this.handleReorg(fromHash, fromHeight)
    }

    constructor(options: BlockSubscribeOptions, fromGroup: number, toGroup: number, chains: string[][]) {
      super(options)
      this.fromGroup = fromGroup
      this.toGroup = toGroup
      this.onReorgCallback = options.reorgCallback
      this.hashesByHeight = buildHashesByHeightMap(chains)
      this.blockByHash = buildBlockByHashMap(chains, fromGroup, toGroup)
    }
  }
})
