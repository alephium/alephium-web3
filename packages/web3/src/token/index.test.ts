/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// eslint-disable-next-line header/header
import * as IndexExports from './index'
import * as NFTModule from './nft'

describe('index.ts exports', () => {
  it('should re-export everything from nft module', () => {
    // Check that all named exports from the nft module are re-exported in index
    Object.keys(NFTModule).forEach((key) => {
      expect(IndexExports).toHaveProperty(key)
      expect(IndexExports[key]).toBe(NFTModule[key])
    })
  })

  it('should not export any unexpected properties', () => {
    // Ensure no extra exports are present in the index
    const validKeys = Object.keys(NFTModule)
    const indexKeys = Object.keys(IndexExports)
    indexKeys.forEach((key) => {
      expect(validKeys).toContain(key)
    })
  })
})
