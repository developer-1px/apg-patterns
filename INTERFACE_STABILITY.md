# @interactive-os/aria Interface Stability

This file defines the interface surface that the package treats as stable.
Use it as the cleanup filter: keep code that is necessary to preserve these
contracts, the current published API surface, or the release gates. Remove or
merge code that exists only as demo explanation, unused scaffolding, duplicate
abstraction, or private implementation detail.

This document does not freeze every current export. It separates package
identity from implementation shape.

## Permanent Contract

### Package Identity

- The package name is `@interactive-os/aria`.
- The public entrypoints are `@interactive-os/aria`,
  `@interactive-os/aria/core`, `@interactive-os/aria/react`, and
  `@interactive-os/aria/package.json`.
- The root entry and `@interactive-os/aria/core` are React-free.
- The root entry and `@interactive-os/aria/core` expose the same public
  surface.
- `@interactive-os/aria/react` is additive over core and is the only
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

## Public Surface Taxonomy

Every public export must fit one of these buckets. `npm run check:api` enforces
this taxonomy so accidental exports fail before release.

### Root And Core

- `apg-pattern-definition`: pattern definition constants such as
  `treeviewDefinition` and `tabsDefinition`.
- `core-contract-type`: stable data, event, definition, runtime, option, and
  vocabulary types such as `PatternData`, `PatternEvent`,
  `PatternDefinition`, and `PatternRuntime`.
- `schema-validator`: Zod schemas that validate the serializable contract.
- `runtime-boundary`: runtime functions that callers use to create or reduce
  APG pattern behavior, such as `createPatternRuntime` and
  `reducePatternData`.
- `runtime-resolver`: runtime functions that resolve registered extension
  vocabulary into concrete behavior.
- `core-data-helper`: narrow data reducers, diagnostics, and structural helpers
  that encode reusable APG behavior without owning app state.
- `extension-vocabulary`: explicit extension registration and discovery
  helpers, such as `defineNavigationTarget` and `isRegisteredPredicate`.
- `extension-resolver-type`: resolver callback types used by the extension
  vocabulary.

### React

- `react-pattern-hook`: `useXPattern(data, onEvent, options?)` hooks.
- `react-preset-component`: descriptor-backed preset components.
- `react-preset-props`: preset component prop types.
- `react-data-helper`: app-owned `PatternData` helper factories and related
  command-surface option/item types.
- `react-owner-adapter`: focus-retaining owner/composite adapters such as
  autocomplete listbox ownership helpers.
- `react-state-helper`: controlled state, reducer, and open-change bridge
  helpers that keep app state outside the package runtime.
- `react-runtime-type`: hook return/runtime types.
- `react-render-surface-type`: render item, row, cell, option, and related
  JSX mapping surface types.

## Public Surface Bucket Policy

This table is machine-enforced by `npm run check:api`. A bucket may only appear
in the listed public manifest section, and every manifest row carries the same
tier label.

| Bucket | Entrypoint | Tier |
| --- | --- | --- |
| `apg-pattern-definition` | root/core | permanent-catalog |
| `core-contract-type` | root/core | permanent-core |
| `schema-validator` | root/core | permanent-validation |
| `runtime-boundary` | root/core | permanent-runtime |
| `runtime-resolver` | root/core | stable-extension |
| `core-data-helper` | root/core | narrow-core-helper |
| `extension-vocabulary` | root/core | stable-extension |
| `extension-resolver-type` | root/core | stable-extension |
| `react-pattern-hook` | react-only | framework-adapter |
| `react-preset-component` | react-only | framework-adapter |
| `react-preset-props` | react-only | framework-adapter |
| `react-data-helper` | react-only | narrow-react-helper |
| `react-owner-adapter` | react-only | narrow-react-adapter |
| `react-state-helper` | react-only | narrow-react-helper |
| `react-runtime-type` | react-only | framework-adapter |
| `react-render-surface-type` | react-only | framework-adapter |

## Public Surface Readiness

This table is the public API design filter. It separates the constitutional
surface from useful but narrower helper surfaces.

| Surface | Tier | Good | Still Weak |
| --- | --- | --- | --- |
| `PatternData`, `PatternEvent`, `PatternDefinition`, `createPatternRuntime`, `reducePatternData` | Permanent core | App-owned state, serializable definitions, and data-in/events-out runtime keep the package independent of app effects | Any change to field meaning has broad blast radius and must be treated as major-version territory |
| Pattern definitions and schemas | Permanent catalog/validation | APG pattern names, roles, keyboard descriptors, and Zod validation are explicit and serializable | Every new schema export increases the named public surface; prefer generic schemas over pattern-specific schema names |
| Extension vocabulary and resolver types | Stable extension point | Unknown tokens fail loudly, and custom vocabularies are registered through explicit functions | Extension registries are global process state, so new extension categories need a strong reason |
| Pattern-specific core helpers and diagnostics | Narrow stable helper | Window splitter value reducers and tabs/window splitter diagnostics keep app-owned state outside the runtime | This bucket can sprawl; add helpers only when they encode APG semantics that otherwise repeat across apps |
| `@interactive-os/aria/react` hooks and runtimes | Framework adapter | Hooks preserve the `useXPattern(data, onEvent, options?)` shape and return named semantic props | Hook return shapes are more likely to grow than core data contracts |
| React preset components and props | Framework adapter | Presets provide behavior-complete APG DOM for straightforward cases | Presets are convenience surfaces, not the source of truth for app-specific DOM ownership |
| React data/state/owner helpers | Narrow adapter/helper | Command surface factories, controlled dialog hooks, and autocomplete listbox ownership bridge common app-owned workflows | These helpers should stay narrower than `PatternData`; avoid turning them into a second domain model |
| Root entry `@interactive-os/aria` | Compatibility aggregate | It mirrors `@interactive-os/aria/core` and remains React-free | New non-React code should prefer `@interactive-os/aria/core` so import intent stays explicit |

## Semantic Contract Fixtures

`scripts/fixtures/public-api-contract.json` is a durable public API fixture.
`npm run check:api` loads it through the built `@interactive-os/aria/core`
entrypoint and verifies these long-lived contracts:

- `PatternDefinitionSchema`, `PatternDataSchema`, and `PatternEventSchema`
  accept the canonical serializable descriptor, data, and event shapes.
- `createPatternRuntime` preserves visible order, semantic root/item props,
  item state projection, keyboard event emission, and pointer event emission.
- `reducePatternData` preserves the core data-in/events-out state transition
  meanings for focus, navigation, selection, expansion, check, press, value,
  and declarative transition events.
- Invalid top-level data fields, non-JSON extension values, unknown relation
  keys, and unknown event fields remain rejected.

The fixture is not exhaustive APG behavior coverage. It is the minimum semantic
compatibility anchor for the permanent core contract.

`scripts/fixtures/public-pattern-contracts.json` anchors selected high-risk APG
definitions through the same built core entrypoint:

- `treeviewDefinition`: visible depth-first order, roving treeitem props,
  expand/collapse keyboard semantics, child navigation, and pointer focus/select
  emission.
- `gridDefinition`: row/column visible order, grid and cell ARIA projections,
  multiple-selection keyboard semantics, navigation reduction, selection range
  reduction, and edit transition reduction.
- `menubarDefinition`: disabled-item navigation skipping, submenu owner ARIA,
  child menu navigation, expansion reduction, and active item click semantics.

Add a pattern to this fixture when its APG keyboard/focus behavior becomes part
of the package identity rather than just demo coverage.

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
- Makes the root entry or `@interactive-os/aria/core` depend on React.
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

- `npm run check:api` verifies `API.md` against declaration exports and the
  public semantic contract fixture.
- `npm run check:exports` verifies public entrypoint resolution.
- `npm run check:react-peer` verifies the optional React peer boundary.
- `npm run check:publish` verifies package metadata and packed contents.
- `npm run smoke:package` verifies tarball consumption.
- `npm run check:external` verifies public repository and npm registry state.
- `npm run release:check` is the full local release preflight before publish.
