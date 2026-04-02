import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/fixtures/*'],
  format: ['cjs', 'esm'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs'
    }
  },
  bundle: false,
  dts: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2020'
})
