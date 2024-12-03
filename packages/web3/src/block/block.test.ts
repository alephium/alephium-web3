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

import { BlockSubscribeOptions, BlockSubscriptionBase, BlockSubscription, ReorgCallback } from './block'
import * as node from '../api/api-alephium'
import { TOTAL_NUMBER_OF_GROUPS } from '../constants'
import { NodeProvider } from '../api'

describe('block subscription', function () {
  let orphanHashes: string[] = []
  let newHashes: string[] = []
  let options: BlockSubscribeOptions

  const baseBlock: node.BlockEntry = {
    hash: '',
    timestamp: 0,
    chainFrom: 0,
    chainTo: 0,
    height: 0,
    deps: Array(TOTAL_NUMBER_OF_GROUPS * 2 - 1).fill(''),
    transactions: [],
    nonce: '',
    version: 0,
    depStateHash: '',
    txsHash: '',
    target: '',
    ghostUncles: []
  }

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
          ...baseBlock,
          hash: hash,
          height: index,
          deps
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

describe('BlockSubscription implementation', () => {
  let nodeProvider: NodeProvider
  let subscription: BlockSubscription

  const baseBlock: node.BlockEntry = {
    hash: '',
    timestamp: 0,
    chainFrom: 0,
    chainTo: 0,
    height: 0,
    deps: Array(TOTAL_NUMBER_OF_GROUPS * 2 - 1).fill(''),
    transactions: [],
    nonce: '',
    version: 0,
    depStateHash: '',
    txsHash: '',
    target: '',
    ghostUncles: []
  }
  
  beforeEach(() => {
    nodeProvider = {
      blockflow: {
        getBlockflowHashes: jest.fn(),
        getBlockflowBlocksBlockHash: jest.fn(),
        getBlockflowBlocks: jest.fn()
      }
    } as unknown as NodeProvider
    
    subscription = new BlockSubscription(
      {
        pollingInterval: 1000,
        messageCallback: jest.fn(),
        errorCallback: jest.fn()
      },
      Date.now(),
      nodeProvider
    )
  })

  it('should handle empty blocks response', async () => {
    const now = Date.now()
    nodeProvider.blockflow.getBlockflowBlocks = jest.fn().mockResolvedValue({ blocks: [] })
    
    await subscription.polling()
    expect(subscription['messageCallback']).not.toHaveBeenCalled()
  })

  it('should handle cache expiration correctly', async () => {
    const now = Date.now()
    const block: node.BlockEntry = {
      ...baseBlock,
      hash: 'test',
      timestamp: now - 30000,
      height: 1,
      deps: ['parent']
    }
    
    nodeProvider.blockflow.getBlockflowBlocks = jest.fn().mockResolvedValue({
      blocks: [[block]]
    })
    
    await subscription.polling()
    expect(subscription['cache'].has('test')).toBeFalsy()
  })

  it('should handle missing blocks correctly', async () => {
    const now = Date.now()

    const block1: node.BlockEntry = {
      ...baseBlock,
      hash: 'block1',
      timestamp: now - 2000,
      height: 2,
      deps: ['parent1']
    }

    const block2: node.BlockEntry = {
      ...baseBlock,
      hash: 'block2',
      timestamp: now - 1000,
      height: 3,
      deps: ['block1']
    }
    
    nodeProvider.blockflow.getBlockflowBlocksBlockHash = jest.fn()
      .mockResolvedValueOnce(block1)
      .mockResolvedValueOnce(block2)
    
    nodeProvider.blockflow.getBlockflowBlocks = jest.fn().mockResolvedValue({
      blocks: [[block2]]
    })
    
    subscription['parents'][0] = { hash: 'parent1', height: 1 }
    
    await subscription.polling()
    expect(subscription['messageCallback']).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ hash: 'block1' }),
        expect.objectContaining({ hash: 'block2' })
      ])
    )
  })
})

describe('BlockSubscriptionBase edge cases', () => {
  class TestBlockSubscription extends BlockSubscriptionBase {
    reorgCallback?: ReorgCallback
    constructor(options: BlockSubscribeOptions) {
      super(options)
      this.reorgCallback = options.reorgCallback
    }
    
    getHashesAtHeight(): Promise<string[]> {
      return Promise.resolve([])
    }
    
    getBlockByHash(): Promise<node.BlockEntry> {
      return Promise.resolve({} as node.BlockEntry)
    }
    
    polling(): Promise<void> {
      return Promise.resolve()
    }
  }

  it('should handle undefined reorgCallback', async () => {
    const subscription = new TestBlockSubscription({
      pollingInterval: 1000,
      messageCallback: jest.fn(),
      errorCallback: jest.fn()
    })
    
    // Should not throw error when reorgCallback is undefined
    await (subscription as any).handleReorg(0, 1, 'orphan', 'new')
  })

  it('should handle empty deps array', () => {
    const subscription = new TestBlockSubscription({
      pollingInterval: 1000,
      messageCallback: jest.fn(),
      errorCallback: jest.fn()
    })
    
    const block: node.BlockEntry = {
      hash: 'test',
      timestamp: Date.now(),
      chainFrom: 0,
      chainTo: 0,
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
    
    expect(() => subscription['getParentHash'](block)).toThrow()
  })
})