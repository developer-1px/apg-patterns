# Changelog

## 0.1.0

- Initial publish-ready package surface for APG pattern definitions, runtime helpers, and React adapters.
- Root and `./core` entries are React-free; React hooks and preset components are exposed from `./react`.
- React is an optional peer for React 18 and React 19 consumers.
- Published package includes a checked and regenerable API reference for root, `./core`, and `./react` exports.
- README documents the source, demo, and release-script code structure for external consumers and contributors.
- Release preflight can verify that the current package version is still unpublished on the public npm registry.
- `release:check` runs the full local gate and the npm registry preflight before publishing.
- GitHub Actions includes SHA-pinned release and manual trusted-publishing workflows that run the full release preflight and publish with npm provenance.
- Package verification covers repository hygiene, package independence, React peer compatibility, conditional ESM/CJS declaration and runtime exports, packed files, actual npm pack tarball integrity, published docs, npm provenance publish dry-run metadata, documented public provenance publish command, side effects, ESM/CJS runtime imports, README Quick Start type checks, npm tarball installation, Vite bundling, TypeScript consumer imports, and demo smoke tests.
