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

import { Subscription, SubscribeOptions } from './subscription'
import * as node from '../api/api-alephium'
import { NodeProvider } from '../api'
import * as web3 from '../global'

export type ReorgCallback = (orphanBlocks: node.BlockEntry[], newBlocks: node.BlockEntry[]) => Promise<void> | void

export interface BlockSubscribeOptions extends SubscribeOptions<node.BlockEntry> {
  reorgCallback?: ReorgCallback
}

export abstract class BlockSubscriptionBase extends Subscription<node.BlockEntry> {
  abstract readonly reorgCallback?: ReorgCallback
  abstract readonly fromGroup: number
  abstract readonly toGroup: number

  abstract getHashesAtHeight(height: number): Promise<string[]>
  abstract getBlockByHash(hash: string): Promise<node.BlockEntry>

  protected getParentHash(block: node.BlockEntry): string {
    const index = Math.floor(block.deps.length / 2) + this.toGroup
    return block.deps[index]
  }

  protected async handleReorg(blockHash: string, blockHeight: number) {
    console.log(`reorg occur, hash: ${blockHash}, height: ${blockHeight}`)
    if (this.reorgCallback === undefined) return

    const orphans: string[] = []
    const newHashes: string[] = []
    let fromHash = blockHash
    let fromHeight = blockHeight
    while (true) {
      const hashes = await this.getHashesAtHeight(fromHeight)
      const canonicalHash = hashes[0]
      if (canonicalHash !== fromHash) {
        orphans.push(fromHash)
        newHashes.push(canonicalHash)
        const block = await this.getBlockByHash(fromHash)
        fromHash = this.getParentHash(block)
        fromHeight -= 1
      } else {
        break
      }
    }

    const orphanBlocks: node.BlockEntry[] = []
    for (const hash of orphans.reverse()) {
      const block = await this.getBlockByHash(hash)
      orphanBlocks.push(block)
    }

    const newBlocks: node.BlockEntry[] = []
    for (const hash of newHashes.reverse()) {
      const block = await this.getBlockByHash(hash)
      newBlocks.push(block)
    }
    console.info(`orphan hashes: ${orphanBlocks.map((b) => b.hash)}, new hashes: ${newBlocks.map((b) => b.hash)}`)
    await this.reorgCallback(orphanBlocks, newBlocks)
  }
}

export class BlockSubscription extends BlockSubscriptionBase {
  readonly nodeProvider: NodeProvider
  readonly fromGroup: number
  readonly toGroup: number
  readonly reorgCallback?: ReorgCallback
  private currentBlockHeight: number
  private parentBlockHash: string | undefined

  constructor(
    options: BlockSubscribeOptions,
    fromGroup: number,
    toGroup: number,
    fromBlockHeight: number,
    nodeProvider: NodeProvider | undefined = undefined
  ) {
    super(options)
    this.nodeProvider = nodeProvider ?? web3.getCurrentNodeProvider()
    this.fromGroup = fromGroup
    this.toGroup = toGroup
    this.reorgCallback = options.reorgCallback
    this.currentBlockHeight = fromBlockHeight
    this.parentBlockHash = undefined

    this.startPolling()
  }

  override async getHashesAtHeight(height: number): Promise<string[]> {
    const result = await this.nodeProvider.blockflow.getBlockflowHashes({
      fromGroup: this.fromGroup,
      toGroup: this.toGroup,
      height
    })
    return result.headers
  }

  override async getBlockByHash(hash: string): Promise<node.BlockEntry> {
    return await this.nodeProvider.blockflow.getBlockflowBlocksBlockHash(hash)
  }

  override async polling(): Promise<void> {
    try {
      const chainInfo = await this.nodeProvider.blockflow.getBlockflowChainInfo({
        fromGroup: this.fromGroup,
        toGroup: this.toGroup
      })

      while (this.currentBlockHeight <= chainInfo.currentHeight) {
        const hashes = await this.getHashesAtHeight(this.currentBlockHeight)
        const block = await this.getBlockByHash(hashes[0])
        if (this.parentBlockHash !== undefined && this.getParentHash(block) !== this.parentBlockHash) {
          await this.handleReorg(this.parentBlockHash, this.currentBlockHeight - 1)
        }
        await this.messageCallback(block)
        this.currentBlockHeight += 1
        this.parentBlockHash = hashes[0]
      }
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }
}
