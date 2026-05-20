# Changelog

## 0.1.0

- Initial publish-ready package surface for APG pattern definitions, runtime helpers, and React adapters.
- Root and `./core` entries are React-free; React hooks and preset components are exposed from `./react`.
- React is an optional peer for React 18 and React 19 consumers.
- Published package includes a checked and regenerable API reference for root, `./core`, and `./react` exports.
- README documents the source, demo, and release-script code structure for external consumers and contributors.
- Published package includes a contributing guide for local checks, API updates, release preflight, and public surface boundaries.
- Published package includes a release checklist for public repository metadata, trusted publishing, release tags, artifacts, and provenance-backed npm publishing.
- Published package includes a security reporting policy.
- Release preflight can verify that the current package version is still unpublished on the public npm registry and, for existing packages, is newer than the current `latest` dist-tag.
- `release:check` runs the full local gate, dependency signature audit, npm registry preflight, and release git-ref preflight before publishing.
- GitHub Actions includes SHA-pinned release and manual trusted-publishing workflows that run the full release preflight, upload the packed package artifact, avoid static npm token auth, and publish with npm provenance.
- Package verification covers repository hygiene, package independence, dependency registry signatures and attestations, React peer compatibility, public GitHub repository metadata and origin alignment, package-lock runtime dependency registry, integrity, and license metadata, conditional ESM/CJS declaration and runtime exports, packed files, actual npm pack tarball integrity, published docs, install-lifecycle-free package metadata, credential-material scans, packed Markdown links and deferred-placeholder scans, npm provenance publish dry-run metadata, documented public provenance publish command and registry, side effects, ESM/CJS runtime imports, README Quick Start type checks, npm tarball installation, Vite bundling, TypeScript consumer imports, and demo smoke tests.
