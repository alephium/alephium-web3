# `@alephium/walletconnect-provider`

Alephium provider for the WalletConnect protocol.

## Build

This package uses a tsc dual-build to produce dual CJS/ESM output with proper type declarations. See the [monorepo README](../../README.md#build-system) for details on the build system, flags, and exports configuration.

```
pnpm build    # Build CJS + ESM + types
pnpm check    # Run publint + attw packaging checks
pnpm test     # Offline unit tests, plus opt-in live relay tests (see below)
```

## Testing

Run `pnpm test` in this package for offline parsing, relay-configuration and session-proposal tests.
Without `TEST_PROJECT_ID`, tests that initialize real WalletConnect clients or sign through the relay
are explicitly skipped with an explanatory message. No project ID is needed for the offline tests.

The live suites use the official Reown relay at `wss://relay.walletconnect.com`, matching production's
supported relay protocol. A compatible relay can be selected with `TEST_RELAY_URL`. The archived
self-hosted relay and its Redis container are no longer part of the development setup.

To enable live tests, supply an existing Reown project ID and start only the devnet node:

```sh
# From the monorepo root:
docker compose -f docker/docker-compose.yml up -d alephium
export TEST_PROJECT_ID='<Reown project ID>'
pnpm --filter @alephium/walletconnect-provider test
```

The suites use the repository's disposable devnet accounts and `http://127.0.0.1:22973`.
Do not substitute a real funded wallet or a mainnet node. Both peers receive the project ID,
in-memory storage, and unique storage prefixes for every run, suite and peer. Teardown closes
relay transports and stops client heartbeats, including after partially completed setup.
Signing checks wait for a confirmed balance decrease rather than launching unawaited polling.
A missing project ID skips live coverage; a configured but invalid ID must fail rather than skip.

The CI test step reads `secrets.TEST_PROJECT_ID`. Repository maintainers must provision this secret
through their normal process; this change does not create an account or populate a GitHub secret.
Fork pull requests normally cannot access repository secrets, so their live relay tests skip while
offline tests still run. A trusted CI run with that secret and the devnet node is required to verify
pairing, approval, API forwarding, transaction/message signing, account changes and disconnection.

The provider already sends `optionalNamespaces`, and the test wallet already prefers the optional
Alephium namespace with a legacy `requiredNamespaces` fallback. Regression tests preserve both paths.
