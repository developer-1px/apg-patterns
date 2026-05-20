# Contributing

## Local Setup

Use the npm version pinned by `packageManager`.

```bash
npm ci
```

## Development Checks

Run the full local gate before submitting changes:

```bash
npm run check
npm run check:source-safety
```

For public export changes, rebuild and refresh the API reference:

```bash
npm run build
npm run update:api
```

For release readiness, run the complete publish preflight:

```bash
npm run release:check
npm run check:external
npm run check:release-artifacts
```

The publish workflow enforces `VERIFY_RELEASE_TAG=true`; run it from the `v<package.version>` git tag.

Release preflight includes `npm run check:signatures` to verify installed dependency registry signatures and available attestations.

The external check verifies that `origin` matches package repository metadata, the public GitHub repository is reachable, and the npm registry can still accept the current version.

Both release workflows verify and upload `release-artifacts/` with the `npm pack` tarball and `npm-pack.json` for review.

## Public Surface

Keep runtime dependencies small and declared in `package.json`. The root entry and `@interactive-os/apg-patterns/core` must stay React-free; React-only APIs belong under `@interactive-os/apg-patterns/react`.

Package contents are controlled by the `files` whitelist in `package.json` and verified by `npm run check:publish`.

## Documentation

Update `README.md` for user-facing behavior, `API.md` for generated public exports, `CHANGELOG.md` for release-visible changes, `RELEASE.md` for publish procedure changes, and `SECURITY.md` for vulnerability reporting policy changes.
