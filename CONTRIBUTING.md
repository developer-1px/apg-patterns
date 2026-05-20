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
```

For public export changes, rebuild and refresh the API reference:

```bash
npm run build
npm run update:api
```

For release readiness, run the complete publish preflight:

```bash
npm run release:check
```

## Public Surface

Keep runtime dependencies small and declared in `package.json`. The root entry and `@interactive-os/apg-patterns/core` must stay React-free; React-only APIs belong under `@interactive-os/apg-patterns/react`.

Package contents are controlled by the `files` whitelist in `package.json` and verified by `npm run check:publish`.

## Documentation

Update `README.md` for user-facing behavior, `API.md` for generated public exports, `CHANGELOG.md` for release-visible changes, and `SECURITY.md` for vulnerability reporting policy changes.
