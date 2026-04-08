import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/*/{src,test}/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/templates/**'],
    globals: true,
    fileParallelism: false,
    coverage: {
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/web3-react/src/**/*.ts']
    },
    sequence: {
      concurrent: false
    },
    testTimeout: 10_000
  }
})
