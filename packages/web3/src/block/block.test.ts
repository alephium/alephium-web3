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

import { BlockSubscribeOptions, BlockSubscriptionBase, ReorgCallback, waitForBlockFromGroupAndRetry } from './block'
import * as node from '../api/api-alephium'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'

describe('block subscription', function () {
  let orphanHashes: string[] = []
  let newHashes: string[] = []
  let options: BlockSubscribeOptions

  beforeEach(() => {
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
      reorgCallback: (fromGroup, toGroup, orphans, newBlocks) => {
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
    const blockSubscription = new BlockSubscriptionTest(options, chains)
    await blockSubscription.handleReorgForTest('fork-0', 'main-0')
    expect(orphanHashes).toEqual(['fork-0'])
    expect(newHashes).toEqual(['main-0'])
  })

  it('should handle reorg(multiple orphan blocks)', async () => {
    const chains = [
      ['common', 'main-0', 'main-1', 'main-2', 'main-3'],
      ['common', 'fork-0', 'fork-1', 'fork-2']
    ]
    const blockSubscription = new BlockSubscriptionTest(options, chains)
    await blockSubscription.handleReorgForTest('fork-2', 'main-2')
    expect(orphanHashes).toEqual(['fork-0', 'fork-1', 'fork-2'])
    expect(newHashes).toEqual(['main-0', 'main-1', 'main-2'])
  })

  it('should handle reorg to short chain', async () => {
    const chains = [
      ['common', 'main-0', 'main-1'],
      ['common', 'fork-0', 'fork-1', 'fork-2']
    ]
    const blockSubscription = new BlockSubscriptionTest(options, chains)
    await blockSubscription.handleReorgForTest('fork-2', 'main-1')
    expect(orphanHashes).toEqual(['fork-0', 'fork-1', 'fork-2'])
    expect(newHashes).toEqual(['main-0', 'main-1'])

    orphanHashes = []
    newHashes = []
    await blockSubscription.handleReorgForTest('fork-2', 'common')
    expect(orphanHashes).toEqual(['fork-0', 'fork-1', 'fork-2'])
    expect(newHashes).toEqual([])
  })

  function buildHashesByHeightMap(chains: string[][]) {
    const hashesByHeight: Map<number, string[]> = new Map()
    let currentHeight = 0
    while (true) {
      const hashes = hashesByHeight.get(currentHeight) ?? []
      chains
        .filter((c) => c.length > currentHeight)
        .forEach((c) => {
          if (!hashes.includes(c[currentHeight])) {
            hashes.push(c[currentHeight])
          }
        })
      if (hashes.length === 0) {
        break
      }
      hashesByHeight.set(currentHeight, hashes)
      currentHeight += 1
    }
    return hashesByHeight
  }

  function buildBlockByHashMap(chains: string[][]) {
    const blockByHash: Map<string, node.BlockEntry> = new Map()
    for (const chain of chains) {
      for (let index = 0; index < chain.length; index += 1) {
        const hash = chain[index]
        const parentHash = index === 0 ? 'undefined' : chain[index - 1]
        const depsLength = TOTAL_NUMBER_OF_GROUPS * 2 - 1
        const deps = Array.from(Array(depsLength).keys()).map(() => '')
        const parentIndex = Math.floor(depsLength / 2) + 0
        deps[parentIndex] = parentHash
        const blockEntry: node.BlockEntry = {
          hash: hash,
          timestamp: 0,
          chainFrom: 0,
          chainTo: 0,
          height: index,
          deps,
          transactions: [],
          nonce: '',
          version: 0,
          depStateHash: '',
          txsHash: '',
          target: '',
          ghostUncles: []
        }
        blockByHash.set(hash, blockEntry)
      }
    }
    return blockByHash
  }

  class BlockSubscriptionTest extends BlockSubscriptionBase {
    readonly reorgCallback?: ReorgCallback
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

    async handleReorgForTest(orphanBlockHash: string, newBlockHash: string) {
      await this.handleReorg(0, 0, orphanBlockHash, newBlockHash)
    }

    constructor(options: BlockSubscribeOptions, chains: string[][]) {
      super(options)
      this.reorgCallback = options.reorgCallback
      this.hashesByHeight = buildHashesByHeightMap(chains)
      this.blockByHash = buildBlockByHashMap(chains)
    }
  }
})

describe('waitForBlockFromGroupAndRetry', function () {
  it('should wait for block from target group and execute action when found', async () => {
    let callCount = 0
    const block1 = {
      hash: 'test-block-1',
      timestamp: Date.now(),
      chainFrom: 1, // Different group
      chainTo: 1,
      height: 1,
      deps: [],
      transactions: [],
      nonce: '',
      version: 0,
      depStateHash: '',
      txsHash: '',
      target: '',
      ghostUncles: []
    }
    const block2 = {
      ...block1,
      hash: 'test-block-2',
      chainFrom: 2, // Target group
      chainTo: 2
    }
    const mockNodeProvider = {
      blockflow: {
        getBlockflowBlocks: jest.fn().mockImplementation(() => {
          callCount++
          if (callCount <= 2) {
            return Promise.resolve({
              blocks: [[block1]]
            })
          } else {
            return Promise.resolve({
              blocks: [[block1, block2]]
            })
          }
        })
      }
    } as any

    const action = jest.fn().mockResolvedValue('success')
    const result = await waitForBlockFromGroupAndRetry(2, action, mockNodeProvider, 100)
    expect(result).toBe('success')
    expect(action).toHaveBeenCalledTimes(1)
    expect(callCount).toBeGreaterThan(2)
  })

  it('should handle action errors', async () => {
    const mockNodeProvider = {
      blockflow: {
        getBlockflowBlocks: jest.fn().mockResolvedValue({
          blocks: [
            [
              {
                hash: 'test-block',
                timestamp: Date.now(),
                chainFrom: 1,
                chainTo: 1,
                height: 1,
                deps: [],
                transactions: [],
                nonce: '',
                version: 0,
                depStateHash: '',
                txsHash: '',
                target: '',
                ghostUncles: []
              }
            ]
          ]
        })
      }
    } as any

    const action = jest.fn().mockRejectedValue(new Error('Action failed'))
    await expect(waitForBlockFromGroupAndRetry(1, action, mockNodeProvider, 500)).rejects.toThrow('Action failed')
    expect(action).toHaveBeenCalledTimes(1)
  })
})
