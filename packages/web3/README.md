# `@alephium/web3`

The core package for building decentralized applications on Alephium.

## Migrating from v2

See [MIGRATION.md](MIGRATION.md) for a complete guide to upgrading from v2 to v3, including breaking changes, removed dependencies, and React Native setup.

## Build

This package uses a tsc dual-build to produce dual CJS/ESM output with proper type declarations. See the [monorepo README](../../README.md#build-system) for details on the build system, flags, and exports configuration.

```
pnpm build    # Build CJS + ESM + types
pnpm check    # Run publint + attw packaging checks
pnpm test     # Run unit tests
```
