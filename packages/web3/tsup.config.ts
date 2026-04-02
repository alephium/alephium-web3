import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/fixtures/*'],
  format: ['cjs', 'esm'],
  // CJS uses .js (Node's require() doesn't resolve .cjs for directory imports).
  // ESM uses .mjs for unambiguous module type.
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs'
    }
  },
  // Don't bundle — preserve the module structure so consumers' bundlers
  // can tree-shake individual modules. Dependencies stay external.
  bundle: false,
  dts: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2020'
})
