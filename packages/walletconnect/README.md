# `@alephium/walletconnect-provider`

Alephium provider for the WalletConnect protocol.

## Build

This package uses a tsc dual-build to produce dual CJS/ESM output with proper type declarations. See the [monorepo README](../../README.md#build-system) for details on the build system, flags, and exports configuration.

```
pnpm build    # Build CJS + ESM + types
pnpm check    # Run publint + attw packaging checks
pnpm test     # Run unit tests (requires WalletConnect relay — see below)
```

## Testing

Start the required services (Alephium node, Redis, WalletConnect relay) from the monorepo root:

```
cd docker && docker-compose up -d
```

Then run:

```
pnpm test
```
