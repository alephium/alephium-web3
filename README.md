# Alephium Web3

[![Github CI][test-badge]][test-link]
[![NPM][npm-badge]][npm-link]
[![code style: prettier][prettier-badge]][prettier-link]

A Typescript library for building decentralized applications on Alephium.

## Getting started

You could run the following command to scaffold a skeleton project for smart contract development:

```
npx @alephium/cli init <project-dir> [-t (base | react | nextjs)]
```

Please read the [documentation](https://docs.alephium.org/sdk/getting-started/) for more.

## Packages

There are a few packages in this repository:

1. `@alephium/cli` is the CLI tool for dApp development.
2. `@alephium/web3` is the core and base package for all dApp development.
3. `@alephium/web3-wallet` contains wallet related functions.
4. `@alephium/web3-test` contains test related functions.
5. `@alephium/web3-react` contains react components to help authenticate and interact with the Alephium blockchain
6. `@alephium/get-extension-wallet` contains functions to get the extension wallet object
6. `@alephium/walletconnect` contains Alephium's WalletConnect implementation

## Development

### Build System

The modernized packages (`@alephium/web3`, `@alephium/web3-wallet`, `@alephium/walletconnect-provider`) use a **tsc dual-build** approach (same pattern as [viem](https://github.com/wevm/viem)):

```
pnpm build
```

Each package runs two `tsc` passes that output to separate directories:

| Output | Directory | Description |
|---|---|---|
| CJS + types | `dist/_cjs/` | CommonJS for Node.js `require()` consumers |
| ESM + types | `dist/_esm/` | ES Modules for bundlers and modern Node.js `import` consumers |

Each output directory contains a nested `package.json` that tells Node.js how to interpret the `.js` files:
- `dist/_cjs/package.json` → `{"type": "commonjs"}`
- `dist/_esm/package.json` → `{"type": "module", "sideEffects": false}`

This approach avoids the need for `.cjs`/`.mjs` extensions while keeping CJS and ESM unambiguous.

#### Build flags explained

**`build:cjs`**: `tsc --module commonjs --moduleResolution node --declaration --verbatimModuleSyntax false`
- `--module commonjs` — overrides the root tsconfig's `es2020` to emit `require()`/`module.exports`. The `"type": "commonjs"` in the root `package.json` only affects Node.js runtime, not tsc.
- `--moduleResolution node` — overrides the root's `bundler` to use Node's CJS resolution algorithm.
- `--declaration` — emits `.d.ts` type declarations alongside `.js` files, so CJS consumers get CJS-flavored types.
- `--verbatimModuleSyntax false` — allows tsc to transform `import`/`export` to `require()`/`module.exports`.

**`build:esm`**: `tsc --declaration && tsc-alias --resolve-full-paths`
- Inherits `--module es2020` and `--moduleResolution bundler` from root tsconfig.
- `--declaration` — emits `.d.ts` type declarations alongside `.js` files, so ESM consumers get ESM-flavored types.
- The `"sideEffects": false` in the nested `package.json` enables tree-shaking for bundlers that check the nearest `package.json` to the resolved file.
- **`tsc-alias --resolve-full-paths`** — post-processes the ESM output to add `.js` extensions to all relative import paths (e.g., `from './api'` becomes `from './api/index.js'`). This is necessary because strict ESM resolvers (Node.js with `"type": "module"`, Vitest) require explicit file extensions — bare directory imports like `'./api'` don't resolve in ESM. TypeScript deliberately does not rewrite import specifiers during compilation ([by design](https://github.com/microsoft/TypeScript/issues/16577)), so a post-processing step is needed. The CJS output does not need this because Node's `require()` handles directory resolution natively.

#### Package fields

```json
{
  "type": "commonjs",
  "sideEffects": false,
  "main": "dist/_cjs/index.js",
  "module": "dist/_esm/index.js",
  "types": "dist/_cjs/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/_esm/index.d.ts",
        "default": "./dist/_esm/index.js"
      },
      "require": {
        "types": "./dist/_cjs/index.d.ts",
        "default": "./dist/_cjs/index.js"
      }
    },
    "./api/explorer": { ... },
    "./api/node": { ... }
  }
}
```

**`"type": "commonjs"`** — declares the package's default module type. Without this, Node.js auto-detects the type on each file access, causing a small performance hit ([publint suggestion](https://publint.dev/)). We use `"commonjs"` (not `"module"`) because:
- The package root contains source files, config files, and scripts that are CJS
- The `dist/_esm/` directory overrides this with its own `{"type": "module"}` nested `package.json`
- Jest runs in CJS mode and loads files relative to the package root

**`"sideEffects": false`** — tells bundlers (webpack, Vite, Rollup) that all modules in this package are pure — importing a module without using its exports has no observable effect. This enables aggressive tree-shaking: if a consumer imports only `isValidAddress`, the bundler can safely drop all other modules.

**`"main"`** — entry point for Node.js `require('@alephium/web3')` and legacy bundlers that don't understand `exports`. Points to the CJS output.

**`"module"`** — entry point for legacy bundlers (webpack 4, older Rollup) that look for ESM via this non-standard field. Modern bundlers use `exports` instead, but `module` provides a fallback.

**`"types"`** — entry point for TypeScript when `moduleResolution` is `"node"` (node10). Points to the CJS type declarations since `"type": "commonjs"` packages default to CJS resolution.

**`"exports"`** — the modern entry point map. Runtimes and bundlers that support it use `exports` over `main`/`module`/`types`. Each condition (`import`/`require`) has its own `types` entry pointing to the type declarations in the corresponding output directory. This ensures CJS consumers get CJS-flavored type declarations and ESM consumers get ESM-flavored type declarations, avoiding [FalseCJS](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md) and [FalseESM](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseESM.md) type issues.

#### Sub-path exports

`@alephium/web3` exposes the generated API types via sub-path exports:

```ts
// Node API types (generated from the Alephium full node OpenAPI spec)
import { Balance, Transaction } from '@alephium/web3/api/node'

// Explorer API types (generated from the explorer backend OpenAPI spec)
import { FungibleTokenMetadata, MempoolTransaction } from '@alephium/web3/api/explorer'
```

These replace the old deep imports into the package's internal directory structure:

```ts
// ❌ Old (v2) — reaches into internal dist structure
import { FungibleTokenMetadata } from '@alephium/web3/dist/src/api/api-explorer'

// ✅ New (v3) — stable public sub-path
import { FungibleTokenMetadata } from '@alephium/web3/api/explorer'
```

The `typesVersions` field provides fallback resolution for TypeScript consumers using `moduleResolution: "node"` (which doesn't support `exports`).

### Package Quality Checks

```
pnpm check
```

Runs [publint](https://publint.dev/) and [@arethetypeswrong/cli](https://arethetypeswrong.github.io/) on the modernized packages.

- **publint** validates that `package.json` fields, `exports`, and file references are correct.
- **attw** checks that TypeScript types resolve correctly for consumers using different module resolution strategies (`node10`, `node16`, `bundler`).

The `internal-resolution-error` rule is ignored in attw because the `node16 (from ESM)` resolution mode requires `.js` extensions in all import paths within type declaration files. Since tsc does not rewrite import paths in emitted `.d.ts` files, bare specifiers like `'./api'` fail strict ESM resolution. This is a [known limitation](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/InternalResolutionError.md) affecting most dual CJS/ESM packages, including viem. The `node10`, `node16 (from CJS)`, and `bundler` resolution modes all resolve correctly.

### React Native / Expo

When using `@alephium/web3` in a React Native environment (Expo or bare), two workarounds are needed:

**1. `react-native-get-random-values`** — `@noble/secp256k1` requires `crypto.getRandomValues`, which is not available in React Native by default. Install the package and load it before any `@alephium/web3` import:

```ts
// index.ts (entry point)
require('react-native-get-random-values')
// ... then load your app
```

**2. Empty `fs` shim** — `@alephium/web3`'s `contract.ts` contains a dynamic `import('fs')` for file-based contract loading (a Node-only feature). Metro resolves all imports statically during bundling, even dynamic ones, so it will fail without a shim. The code path is never actually called in React Native.

Create `shims/fs.js`:
```js
module.exports = {}
```

Add it to your `metro.config.js`:
```js
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  fs: path.resolve(__dirname, 'shims/fs.js')
}
```

> **Note:** If using pnpm, add `node-linker=hoisted` to `.npmrc` — Metro is incompatible with pnpm's strict symlink layout.

### Testing

```
pnpm test
```

Runs Jest across all packages. The root `jest-config.json` overrides ts-jest to use `--module commonjs` so that tests run in CJS mode (Jest does not support ESM natively). The `transformIgnorePatterns` setting allows Jest to transform `@noble` and `@scure` packages.


[test-badge]: https://github.com/alephium/alephium-web3/actions/workflows/test.yml/badge.svg
[test-link]: https://github.com/alephium/alephium-web3/actions/workflows/test.yml
[npm-badge]: https://img.shields.io/npm/v/@alephium/web3.svg
[npm-link]: https://www.npmjs.org/package/@alephium/web3
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-link]: https://github.com/prettier/prettier
[release-notes]: https://github.com/alephium/alephium-web3/releases
