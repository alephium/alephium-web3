import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import esbuild from 'rollup-plugin-esbuild'
import generateDeclarations from 'rollup-plugin-generate-declarations'
import { terser } from 'rollup-plugin-terser'

const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      dir: 'dist/',
      sourcemap: !production
    }
  ],
  plugins: [

    commonjs(),
    json(),

    typescript(),

    production &&
      terser({
        compress: {
          drop_console: true
        }
      }),

    esbuild({
      minify: production
    }),
    generateDeclarations()
  ],
  watch: {
    clearScreen: false
  }
}
