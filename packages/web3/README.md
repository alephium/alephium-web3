# `@alephium/web3`

The core package for building decentralized applications on Alephium.

## Build

This package uses a tsc dual-build to produce dual CJS/ESM output with proper type declarations. See the [monorepo README](../../README.md#build-system) for details on the build system, flags, and exports configuration.

```
pnpm build    # Build CJS + ESM + types
pnpm check    # Run publint + attw packaging checks
pnpm test     # Run unit tests
```
