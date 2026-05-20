# Changelog

## 0.1.0

- Initial publish-ready package surface for APG pattern definitions, runtime helpers, and React adapters.
- Root and `./core` entries are React-free; React hooks and preset components are exposed from `./react`.
- Published package includes a checked and regenerable API reference for root, `./core`, and `./react` exports.
- Release preflight can verify that the current package version is still unpublished on the public npm registry.
- `release:check` runs the full local gate and the npm registry preflight before publishing.
- Package verification covers exports, packed files, actual npm pack tarball integrity, published docs, side effects, ESM/CJS runtime imports, README Quick Start type checks, npm tarball installation, Vite bundling, TypeScript consumer imports, and demo smoke tests.
