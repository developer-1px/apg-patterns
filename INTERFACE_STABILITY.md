# @interactive-os/apg-patterns Interface Stability

This file defines the interface surface that the package treats as stable.
Use it as the cleanup filter: keep code that is necessary to preserve these
contracts, the current published API surface, or the release gates. Remove or
merge code that exists only as demo explanation, unused scaffolding, duplicate
abstraction, or private implementation detail.

This document does not freeze every current export. It separates package
identity from implementation shape.

## Permanent Contract

### Package Identity

- The package name is `@interactive-os/apg-patterns`.
- The public entrypoints are `@interactive-os/apg-patterns`,
  `@interactive-os/apg-patterns/core`, `@interactive-os/apg-patterns/react`, and
  `@interactive-os/apg-patterns/package.json`.
- The root entry and `@interactive-os/apg-patterns/core` are React-free.
- The root entry and `@interactive-os/apg-patterns/core` expose the same public
  surface.
- `@interactive-os/apg-patterns/react` is additive over core and is the only
  entrypoint that may require the React peer.
- Published builds provide ESM, CommonJS, and TypeScript declarations for every
  public runtime entrypoint.

### Runtime Boundary

- Core runtime behavior is data in, events out.
- Consumers own `PatternData`; package runtimes emit `PatternEvent` and do not
  mutate caller-owned data directly.
- `createPatternRuntime(input)` validates `definition`, `data`, and `options`
  at the runtime boundary and returns semantic prop, state, keyboard, id, and
  event helpers.
- The runtime dependency surface for root and core is limited to `zod`.
- React is an optional peer dependency used by the React entrypoint.

### Data Contract

- `PatternData` has the top-level shape `{ items, relations?, state?, refs? }`.
- `items` is keyed by stable item keys.
- `PatternItem` keeps the common fields `label`, `labelledBy`, `textValue`,
  `itemValue`, and `kind`.
- Pattern-specific item extensions remain JSON-compatible.
- `relations` names structural links such as `rootKeys`, `childrenByKey`,
  `ownerByKey`, `controlsByKey`, `rowKeys`, `columnKeys`, and `cells`.
- `refs` carries external references such as labels, initial focus, domain ids,
  and pointer ids.

### Event Contract

- `PatternEvent` is the state-change boundary emitted by runtimes.
- Existing event `type` meanings and required fields remain compatible.
- New event types or optional fields may be added when they do not change the
  meaning of existing events.
- Event `meta.reason` remains advisory context; consumers must not depend on it
  as the only source of correctness.

### Definition Contract

- `PatternDefinition` is a serializable descriptor for APG behavior.
- Existing descriptor field meanings for `apgPattern`, `rootRole`, `parts`,
  `navigation`, `keyboard`, `transitions`, `effects`, and `react` remain
  compatible.
- Descriptor schemas may gain additive fields.
- Pattern definition exports keep their APG-oriented names.

### React Contract

- React hooks follow `useXPattern(data, onEvent, options?)`.
- Pattern hooks return named semantic props, state, actions, id helpers, and
  render item surfaces where applicable.
- Preset components accept `data`, optional `onEvent` when interactive,
  `options`, and documented render overrides where available.
- React surfaces do not own app visual styling.
- Generated props are behavior and semantics first; app code owns classes,
  styles, layout, and theme.

### Release Contract

- The npm package is published from the explicit `files` whitelist.
- Published package contents include this file, `README.md`, `API.md`,
  `CHANGELOG.md`, `CONTRIBUTING.md`, `RELEASE.md`, `SECURITY.md`, `LICENSE`,
  proposal notes, and built `dist` artifacts.
- The package has no install lifecycle scripts.
- Public release uses npm provenance and the configured public registry.

## Not A Stability Contract

These details may change without being treated as package identity:

- Internal file layout under `src/`.
- Private helper function names.
- Generated `dist` chunk names.
- Demo layout, copy, routing, screenshots, decorative assets, and controls.
- The exact number of exported names.
- Internal runtime object construction details beyond the public semantic
  prop, state, event, keyboard, and id boundary.
- Validation implementation internals.
- Build tool internals, as long as the published ESM, CommonJS, and declaration
  contract remains compatible.

## Breaking Change Rule

A change requires a major version when it does any of the following:

- Removes or renames a public entrypoint.
- Makes the root entry or `@interactive-os/apg-patterns/core` depend on React.
- Changes the meaning or required fields of an existing `PatternEvent`.
- Changes the accepted compatible top-level `PatternData` shape.
- Mutates caller-owned `PatternData` directly.
- Removes `createPatternRuntime` or changes its data in, events out boundary.
- Removes the React hook call convention `useXPattern(data, onEvent, options?)`.
- Adds install lifecycle scripts to the published package.
- Removes ESM, CommonJS, or TypeScript declaration output for public entries.

Additive descriptor fields, optional event fields, new pattern definitions, new
helpers, and stricter rejection of invalid input are non-breaking when existing
valid consumer data remains valid.

## Cleanup Rule

Keep an item when it is required by at least one of these reasons:

- It is part of the permanent contract above.
- It is a currently published export documented in `API.md`.
- It is needed to preserve compatible behavior for a current published export.
- It is needed by release, package, source-safety, API, export, peer, consumer,
  or demo verification.
- It protects package independence, provenance, public repository safety, or
  trusted publishing.

Remove, merge, or redesign an item when all of these are true:

- It is not part of the permanent contract.
- It is not needed by a current published export.
- It is not needed by a verification gate.
- Its original reason is no longer valid.
- Removing it does not move the same complexity into another place.

Demo code gets the narrowest standard: keep behavior previews, fixtures,
reproducers, and smoke-test paths; remove explanatory copy, decorative chrome,
and controls that do not improve APG behavior inspection.

## Validation Gates

Run the smallest gate that covers the change, then widen when the change touches
published behavior or package metadata.

- `npm run check:api` verifies `API.md` against declaration exports.
- `npm run check:exports` verifies public entrypoint resolution.
- `npm run check:react-peer` verifies the optional React peer boundary.
- `npm run check:publish` verifies package metadata and packed contents.
- `npm run smoke:package` verifies tarball consumption.
- `npm run check:external` verifies public repository and npm registry state.
- `npm run release:check` is the full local release preflight before publish.
