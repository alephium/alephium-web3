# Migrating from v2 to v3

## Breaking Changes

### Node.js >= 20 required

The minimum Node.js version is now 20 (was 14). Node 18 is EOL since April 2025.

### Deep imports removed

Internal `dist/` paths are no longer accessible. Use the new sub-path exports:

```ts
// ❌ v2
import { FungibleTokenMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { Transaction } from '@alephium/web3/dist/src/api/api-alephium'

// ✅ v3
import { FungibleTokenMetadata } from '@alephium/web3/api/explorer'
import { Transaction } from '@alephium/web3/api/node'
```

All types and functions from the main entry point (`import { ... } from '@alephium/web3'`) continue to work unchanged.

### `BigInt.prototype.toJSON` monkey-patch removed

v2 globally mutated `BigInt.prototype.toJSON` on import, so `JSON.stringify` could handle BigInt values. v3 removes this side effect.

If your code relies on `JSON.stringify` working with BigInt values, use the `stringify` utility exported from the SDK:

```ts
// ❌ v2 — worked because of the global monkey-patch
JSON.stringify({ amount: 1000n })

// ✅ v3 — use the stringify utility
import { stringify } from '@alephium/web3'
stringify({ amount: 1000n })
```

`stringify` is a drop-in replacement for `JSON.stringify` that converts BigInt values to strings via a replacer function.

### `password-crypto` removed from `@alephium/web3-wallet`

The `encrypt` and `decrypt` functions have been removed. If you were using them, you can implement equivalent functionality using the Web Crypto API or a library like `@metamask/browser-passworder`.

### `publicKeyFromPrivateKey` accepts `Uint8Array`

The function now accepts `string | Uint8Array` for the private key parameter. This is backward compatible — existing string-based code continues to work. Passing `Uint8Array` allows secure memory cleanup after use.

### ESM output structure changed

The package now emits dual CJS/ESM output:
- CJS: `dist/_cjs/` (with `{"type": "commonjs"}`)
- ESM: `dist/_esm/` (with `{"type": "module"}`)

If you were referencing `dist/src/` paths directly, update to use the `exports` entry points or the new sub-path exports.

---

## Dependencies Removed

These dependencies are no longer shipped with `@alephium/web3`. If your project depended on them being available transitively, you may need to install them directly:

| Removed | Replaced by |
|---|---|
| `elliptic` | `@noble/secp256k1`, `@noble/curves` |
| `bn.js` | Native `BigInt` |
| `blakejs` | `@noble/hashes/blake2b` |
| `crypto-browserify` | `globalThis.crypto` (native in Node 20+, browsers) |
| `stream-browserify` | Removed (not needed) |
| `path-browserify` | Removed (not needed) |
| `cross-fetch` | Native `fetch` (Node 20+, browsers) |

For `@alephium/web3-wallet`:

| Removed | Replaced by |
|---|---|
| `elliptic` | `@noble/secp256k1` |
| `bip32` | `@scure/bip32` |
| `bip39` | `@scure/bip39` |
| `buffer` | Not needed (Uint8Array throughout) |
| `fs-extra` | Removed (unused) |

---

## Polyfill Plugins No Longer Needed

If your project uses `vite-plugin-node-polyfills`, `rollup-plugin-node-polyfills`, or similar plugins solely for `@alephium/web3`, you can remove them. The SDK no longer requires Node.js polyfills in browser environments.

```diff
  // vite.config.ts
- import { nodePolyfills } from 'vite-plugin-node-polyfills'

  export default defineConfig({
-   plugins: [nodePolyfills()],
  })
```

---

## React Native / Expo

### Simplified setup

v2 required up to 12 workarounds for React Native. v3 requires only 2 (plus pnpm-specific config):

**1. `react-native-get-random-values`**

Install and load before any `@alephium/web3` import:

```ts
// Entry point (index.ts)
require('react-native-get-random-values')
```

**2. Empty `fs` shim**

`contract.ts` contains a dynamic `import('fs')` that Metro resolves statically. Create an empty shim:

```js
// shims/fs.js
module.exports = {}
```

Add to `metro.config.js`:

```js
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  fs: path.resolve(__dirname, 'shims/fs.js')
}
```

**pnpm users:** Add `node-linker=hoisted` to `.npmrc` (Metro is incompatible with pnpm's strict symlink layout).

### What you can remove

The following are no longer needed for `@alephium/web3` (they may still be needed by other dependencies):

- `buffer` / `Buffer` polyfill
- `crypto-browserify` / `react-native-quick-crypto` (for web3 — may still be needed by WalletConnect)
- `stream-browserify` / `readable-stream`
- `path-browserify`
- `events`
- `process`
- Custom Metro resolver for UMD bundle
- `expo-dev-client` (if only needed for `react-native-quick-crypto`)

**v3 works with Expo Go** — no dev build required for the Alephium SDK itself.

---

## TypeScript

The SDK is now built with TypeScript 5.9 and uses `moduleResolution: "bundler"` internally. Consumers using `moduleResolution: "node"` (the default) are supported via the `typesVersions` field — no changes needed on your side.

If you upgrade your own project to `moduleResolution: "bundler"`, the `exports` field in `package.json` will be used for type resolution, which is more accurate.
