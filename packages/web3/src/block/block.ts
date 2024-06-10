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

import { Subscription, SubscribeOptions } from '../utils/subscription'
import * as node from '../api/api-alephium'
import { NodeProvider } from '../api'
import * as web3 from '../global'
import { TOTAL_NUMBER_OF_CHAINS } from '../constants'

const DEFAULT_INTERVAL = 60 * 1000 // 60 seconds

export type ReorgCallback = (
  fromGroup: number,
  toGroup: number,
  orphanBlocks: node.BlockEntry[],
  newBlocks: node.BlockEntry[]
) => Promise<void> | void

export interface BlockSubscribeOptions extends SubscribeOptions<node.BlockEntry[]> {
  reorgCallback?: ReorgCallback
}

export abstract class BlockSubscriptionBase extends Subscription<node.BlockEntry[]> {
  abstract readonly reorgCallback?: ReorgCallback

  abstract getHashesAtHeight(fromGroup: number, toGroup: number, height: number): Promise<string[]>
  abstract getBlockByHash(hash: string): Promise<node.BlockEntry>

  protected getParentHash(block: node.BlockEntry): string {
    const index = Math.floor(block.deps.length / 2) + block.chainTo
    return block.deps[index]
  }

  protected async handleReorg(fromGroup: number, toGroup: number, orphanBlockHash: string, newBlockHash: string) {
    console.info(
      `reorg occur in chain ${fromGroup} -> ${toGroup}, orphan hash: ${orphanBlockHash}, new hash: ${newBlockHash}`
    )
    if (this.reorgCallback === undefined) return

    const orphanBlocks: node.BlockEntry[] = []
    let fromHash = orphanBlockHash
    let canonicalHash: string | undefined = undefined
    while (true) {
      const orphanBlock = await this.getBlockByHash(fromHash)
      orphanBlocks.push(orphanBlock)
      const hashes = await this.getHashesAtHeight(fromGroup, toGroup, orphanBlock.height - 1)
      const parentHash = this.getParentHash(orphanBlock)
      if (hashes[0] === parentHash) {
        canonicalHash = hashes[0]
        break
      }
      fromHash = parentHash
    }

    const newBlocks: node.BlockEntry[] = []
    fromHash = newBlockHash
    while (fromHash !== canonicalHash) {
      const newBlock = await this.getBlockByHash(fromHash)
      newBlocks.push(newBlock)
      fromHash = this.getParentHash(newBlock)
    }
    const orphans = orphanBlocks.reverse()
    const news = newBlocks.reverse()
    console.info(`orphan hashes: ${orphans.map((b) => b.hash)}, new hashes: ${news.map((b) => b.hash)}`)
    await this.reorgCallback(fromGroup, toGroup, orphans, news)
  }
}

export class BlockSubscription extends BlockSubscriptionBase {
  readonly nodeProvider: NodeProvider
  readonly reorgCallback?: ReorgCallback
  private fromTimeStamp: number
  private parents: ({ hash: string; height: number } | undefined)[]

  constructor(
    options: BlockSubscribeOptions,
    fromTimeStamp: number,
    nodeProvider: NodeProvider | undefined = undefined
  ) {
    super(options)
    this.nodeProvider = nodeProvider ?? web3.getCurrentNodeProvider()
    this.reorgCallback = options.reorgCallback
    this.fromTimeStamp = fromTimeStamp
    this.parents = new Array(TOTAL_NUMBER_OF_CHAINS).fill(undefined)
  }

  override async getHashesAtHeight(fromGroup: number, toGroup: number, height: number): Promise<string[]> {
    const result = await this.nodeProvider.blockflow.getBlockflowHashes({ fromGroup, toGroup, height })
    return result.headers
  }

  override async getBlockByHash(hash: string): Promise<node.BlockEntry> {
    return await this.nodeProvider.blockflow.getBlockflowBlocksBlockHash(hash)
  }

  private async getMissingBlocksAndHandleReorg(fromHash: string, fromHeight: number, toBlock: node.BlockEntry) {
    const blocks: node.BlockEntry[] = []
    let lastBlock = toBlock
    while (lastBlock.height - 1 > fromHeight) {
      const parentHash = this.getParentHash(lastBlock)
      const block = await this.getBlockByHash(parentHash)
      blocks.push(block)
      lastBlock = block
    }
    const parentHash = this.getParentHash(lastBlock)
    if (parentHash !== fromHash) {
      await this.handleReorg(toBlock.chainFrom, toBlock.chainTo, fromHash, parentHash)
    }
    return blocks.reverse()
  }

  private async handleBlocks(blocks: node.BlockEntry[][]) {
    const allBlocks: node.BlockEntry[] = []
    for (let index = 0; index < blocks.length; index += 1) {
      const blocksPerChain = blocks[index]
      if (blocksPerChain.length === 0) continue

      allBlocks.push(...blocksPerChain)
      const parent = this.parents[index]
      if (parent !== undefined) {
        const missingBlocks = await this.getMissingBlocksAndHandleReorg(parent.hash, parent.height, blocksPerChain[0])
        allBlocks.push(...missingBlocks)
      }
      const latestBlock = blocksPerChain[blocksPerChain.length - 1]
      this.parents[index] = { hash: latestBlock.hash, height: latestBlock.height }
    }

    const sortedBlocks = allBlocks.sort((a, b) => a.timestamp - b.timestamp)
    await this.messageCallback(sortedBlocks)
  }

  override async polling(): Promise<void> {
    try {
      const now = Date.now()
      if (this.fromTimeStamp >= now) return

      while (this.fromTimeStamp < now) {
        if (this.isCancelled()) return
        const toTs = Math.min(this.fromTimeStamp + DEFAULT_INTERVAL, now)
        const result = await this.nodeProvider.blockflow.getBlockflowBlocks({ fromTs: this.fromTimeStamp, toTs })
        const isEmpty = result.blocks.every((blocksPerChain) => blocksPerChain.length === 0)
        if (!isEmpty) {
          this.fromTimeStamp = toTs + 1
          await this.handleBlocks(result.blocks)
          continue
        }
        // there are no blocks within the time range [fromTimeStamp, fromTimeStamp + DEFAULT_INTERVAL]
        // update the `fromTimeStamp` to avoid infinite loop
        if (toTs !== now) this.fromTimeStamp += DEFAULT_INTERVAL
        return
      }
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }
}
