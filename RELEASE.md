# Release Checklist

## External Setup

- Configure `origin` with the public GitHub repository before publishing.
- Verify it with `git remote get-url origin`.
- Keep `package.json` `repository`, `bugs`, and `homepage` aligned with the public GitHub repository.
- Configure the npm trusted publisher for the GitHub `Publish Package` workflow.
- Keep the GitHub environment `npm` required for the publish job.
- Keep publish workflow concurrency grouped by git ref so duplicate manual runs for the same tag cannot publish in parallel.
- Do not add static npm token authentication such as `NPM_TOKEN`, `NODE_AUTH_TOKEN`, or `_authToken`.

## Preflight

Run the full release gate from the release commit:

```bash
npm run release:check
npm run check:external
npm run check:release-artifacts
```

The release gate includes `npm run check:signatures`, package smoke tests, registry availability checks, and release git-ref validation.

The external check verifies that local `origin` matches the package repository metadata, the GitHub repository is public and reachable, and the npm registry can still accept the current version.

The publish workflow runs the external check before packing or publishing.

## Publish

Create and push the `v<package.version>` git tag after the preflight passes. Run the manual GitHub Actions `Publish Package` workflow from that tag.

Review verified `release-artifacts/`, including the `npm pack` tarball and `npm-pack.json`, before relying on the published package.

The publish command must stay public, provenance-backed, and targeted at the public npm registry:

```bash
npm publish --access public --provenance --registry https://registry.npmjs.org/
```
